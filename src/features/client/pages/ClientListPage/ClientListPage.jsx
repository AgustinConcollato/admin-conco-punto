import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import { faUsers } from "@fortawesome/free-solid-svg-icons";
import { ConfirmModal } from "../../../../components/ConfirmModal/ConfirmModal";
import { EmptyState } from "../../../../components/EmptyState/EmptyState";
import { Modal } from "../../../../components/Modal/Modal";
import { Pagination } from "../../../../components/Pagination/Pagination";
import { ViewToggle } from "../../../../components/ViewToggle/ViewToggle";
import { useMediaQuery } from "../../../../hooks/useMediaQuery";
import { useViewMode } from "../../../../hooks/useViewMode";
import { ClientService } from "../../../../services/client/clientService";
import { ClientCard } from "../../components/ClientCard/ClientCard";
import { ClientTable } from "../../components/ClientTable/ClientTable";
import { EditClientForm } from "../../components/EditClientForm/EditClientForm";
import styles from './ClientListPage.module.css';

const DEBOUNCE_MS = 300;

export function ClientListPage() {
    const [clients, setClients] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [pagination, setPagination] = useState(null);
    const [page, setPage] = useState(1);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingClient, setEditingClient] = useState(null);
    const [pendingDeleteId, setPendingDeleteId] = useState(null);
    const [viewMode, setViewMode] = useViewMode('clientsViewMode');
    const [sortConfig, setSortConfig] = useState({ key: 'name', dir: 'asc' });
    const isMobile = useMediaQuery('(max-width: 768px)');

    const clientService = useMemo(() => new ClientService(), []);
    const debounceTimer = useRef(null);

    const effectiveView = isMobile ? 'cards' : viewMode;

    // Debounce búsqueda
    const handleSearchChange = (e) => {
        const val = e.target.value;
        setSearchTerm(val);
        clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => {
            setDebouncedSearch(val);
            setPage(1);
        }, DEBOUNCE_MS);
    };

    const handleSort = (key) => {
        setSortConfig(prev =>
            prev.key === key
                ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
                : { key, dir: 'asc' }
        );
        setPage(1);
    };

    const getClients = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await clientService.getAll({
                search: debouncedSearch,
                sort_by: sortConfig.key,
                sort_order: sortConfig.dir,
                per_page: 20,
                page,
            });
            setClients(data.data ?? []);
            setPagination({
                current_page: data.current_page ?? 1,
                last_page: data.last_page ?? 1,
                total: data.total ?? 0,
            });
        } catch (error) {
            console.error("Error al obtener clientes:", error);
        } finally {
            setIsLoading(false);
        }
    }, [clientService, debouncedSearch, sortConfig, page]);

    useEffect(() => {
        getClients();
    }, [getClients]);

    const handleEdit = (client) => {
        setEditingClient(client);
        setShowEditModal(true);
    };

    const closeEditModal = () => {
        setShowEditModal(false);
        setEditingClient(null);
    };

    const handleUpdate = async (updatedData) => {
        if (!editingClient) return;
        try {
            const updated = await clientService.update(editingClient.id, updatedData);
            const merged = (updated?.id) ? updated : { ...editingClient, ...updatedData };
            setClients(prev => prev.map(c => c.id === editingClient.id ? merged : c));
            setShowEditModal(false);
            setEditingClient(null);
            toast.success("Cliente actualizado");
        } catch (error) {
            toast.error("Hubo un error al intentar actualizar el cliente.");
        }
    };

    const confirmDelete = async () => {
        if (!pendingDeleteId) return;
        try {
            await clientService.delete(pendingDeleteId);
            getClients();
            toast.success("Cliente eliminado");
        } catch (error) {
            toast.error("Hubo un error al intentar eliminar el cliente.");
        } finally {
            setPendingDeleteId(null);
        }
    };

    const renderSkeleton = () => {
        if (effectiveView === 'table') {
            return (
                <div className={styles.skeleton_table}>
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className={styles.skeleton_table_row}>
                            <div className={styles.skeleton_line} style={{ flex: 2 }} />
                            <div className={styles.skeleton_line} style={{ flex: 1 }} />
                            <div className={styles.skeleton_line} style={{ flex: 1 }} />
                            <div className={styles.skeleton_line} style={{ flex: 1 }} />
                            <div className={styles.skeleton_line} style={{ flex: 1 }} />
                        </div>
                    ))}
                </div>
            );
        }
        return (
            <div className={styles.skeleton_grid}>
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className={styles.skeleton_card}>
                        <div className={styles.skeleton_line} style={{ width: '60%' }} />
                        <div className={styles.skeleton_line} style={{ width: '80%', marginTop: 10 }} />
                        <div className={styles.skeleton_line} style={{ width: '50%', marginTop: 8 }} />
                        <div className={styles.skeleton_line} style={{ width: '100%', marginTop: 12, height: 40 }} />
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className={styles.container}>
            <h2 className="title">Lista de Clientes</h2>

            <div className={styles.toolbar}>
                <div className={styles.search_container}>
                    <input
                        type="text"
                        placeholder="Buscar por nombre, email o teléfono..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className={styles.search_input}
                    />
                </div>

                {!isMobile && <ViewToggle value={viewMode} onChange={setViewMode} />}
            </div>

            {isLoading ? (
                renderSkeleton()
            ) : clients.length === 0 ? (
                <EmptyState
                    icon={faUsers}
                    message={debouncedSearch ? 'No se encontraron clientes con ese criterio.' : 'Todavía no hay clientes cargados.'}
                />
            ) : effectiveView === 'table' ? (
                <ClientTable
                    clients={clients}
                    sortConfig={sortConfig}
                    onSort={handleSort}
                    onEdit={handleEdit}
                    onDelete={setPendingDeleteId}
                />
            ) : (
                <div className={styles.cards_grid}>
                    {clients.map(client => (
                        <ClientCard
                            key={client.id}
                            client={client}
                            onEdit={handleEdit}
                            onDelete={setPendingDeleteId}
                        />
                    ))}
                </div>
            )}

            {!isLoading && pagination && pagination.last_page > 1 && (
                <Pagination
                    currentPage={pagination.current_page}
                    lastPage={pagination.last_page}
                    onPageChange={(p) => setPage(p)}
                />
            )}

            {showEditModal && editingClient && (
                <Modal onClose={closeEditModal} title={`Editar Cliente: ${editingClient.name}`}>
                    <EditClientForm
                        client={editingClient}
                        onSave={handleUpdate}
                        onCancel={closeEditModal}
                    />
                </Modal>
            )}

            {pendingDeleteId && (
                <ConfirmModal
                    message="¿Estás seguro de que quieres eliminar este cliente? Esta acción no se puede deshacer."
                    onConfirm={confirmDelete}
                    onCancel={() => setPendingDeleteId(null)}
                />
            )}
        </div>
    );
}
