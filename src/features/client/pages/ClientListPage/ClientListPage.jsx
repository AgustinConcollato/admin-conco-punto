import { useEffect, useMemo, useState } from "react";
import { normalizeStr } from '../../../../utils/normalizeStr';
import { toast } from "react-toastify";
import { faUsers, faBorderAll, faList } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ConfirmModal } from "../../../../components/ConfirmModal/ConfirmModal";
import { EmptyState } from "../../../../components/EmptyState/EmptyState";
import { Loading } from "../../../../components/Loading/Loading";
import { Modal } from "../../../../components/Modal/Modal";
import { ClientService } from "../../../../services/client/clientService";
import { ClientCard } from "../../components/ClientCard/ClientCard";
import { ClientTable } from "../../components/ClientTable/ClientTable";
import { EditClientForm } from "../../components/EditClientForm/EditClientForm";
import styles from './ClientListPage.module.css';

const SEGMENT_ORDER = { nuevo: 0, recurrente: 1, inactivo: 2, sin_pedidos: 3 };

function compareClients(a, b, key) {
    const sa = a.stats ?? {};
    const sb = b.stats ?? {};
    switch (key) {
        case 'name':
            return (a.name ?? '').localeCompare(b.name ?? '');
        case 'segment':
            return (SEGMENT_ORDER[sa.segment] ?? 9) - (SEGMENT_ORDER[sb.segment] ?? 9);
        case 'last_order_at': {
            const ta = sa.last_order_at ? new Date(sa.last_order_at).getTime() : -Infinity;
            const tb = sb.last_order_at ? new Date(sb.last_order_at).getTime() : -Infinity;
            return ta - tb;
        }
        default:
            return (Number(sa[key]) || 0) - (Number(sb[key]) || 0);
    }
}

export function ClientListPage() {
    const [clients, setClients] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingClient, setEditingClient] = useState(null);
    const [pendingDeleteId, setPendingDeleteId] = useState(null);
    const [viewMode, setViewMode] = useState(() => localStorage.getItem('clientsViewMode') ?? 'cards');
    const [sortConfig, setSortConfig] = useState({ key: 'name', dir: 'asc' });
    const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 768px)').matches);

    const clientService = useMemo(() => new ClientService(), []);

    useEffect(() => {
        localStorage.setItem('clientsViewMode', viewMode);
    }, [viewMode]);

    useEffect(() => {
        const mq = window.matchMedia('(max-width: 768px)');
        const handler = (e) => setIsMobile(e.matches);
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }, []);

    const getClients = async () => {
        setIsLoading(true);
        try {
            const data = await clientService.getAll();
            setClients(data);
        } catch (error) {
            console.error("Error al obtener clientes:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        getClients();
    }, []);

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const filteredClients = useMemo(() => {
        if (!searchTerm) return clients;
        const lowerCaseSearch = normalizeStr(searchTerm.trim());
        return clients.filter(client => {
            const name = normalizeStr(client.name);
            const email = normalizeStr(client.email);
            const phone = client.phone || '';
            return name.includes(lowerCaseSearch) || email.includes(lowerCaseSearch) || phone.includes(lowerCaseSearch);
        });
    }, [clients, searchTerm]);

    const sortedClients = useMemo(() => {
        const arr = [...filteredClients];
        arr.sort((a, b) => {
            const cmp = compareClients(a, b, sortConfig.key);
            return sortConfig.dir === 'asc' ? cmp : -cmp;
        });
        return arr;
    }, [filteredClients, sortConfig]);

    const handleSort = (key) => {
        setSortConfig(prev =>
            prev.key === key
                ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
                : { key, dir: 'asc' }
        );
    };

    const effectiveView = isMobile ? 'cards' : viewMode;

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
            setClients(prev => prev.filter(c => c.id !== pendingDeleteId));
            toast.success("Cliente eliminado");
        } catch (error) {
            toast.error("Hubo un error al intentar eliminar el cliente.");
        } finally {
            setPendingDeleteId(null);
        }
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

                <div className={styles.view_toggle}>
                    <button
                        className={`${styles.toggle_btn} ${viewMode === 'cards' ? styles.toggle_active : ''}`}
                        onClick={() => setViewMode('cards')}
                        aria-label="Ver como tarjetas"
                    >
                        <FontAwesomeIcon icon={faBorderAll} />
                    </button>
                    <button
                        className={`${styles.toggle_btn} ${viewMode === 'table' ? styles.toggle_active : ''}`}
                        onClick={() => setViewMode('table')}
                        aria-label="Ver como tabla"
                    >
                        <FontAwesomeIcon icon={faList} />
                    </button>
                </div>
            </div>

            {isLoading ? (
                <Loading />
            ) : filteredClients.length === 0 ? (
                <EmptyState
                    icon={faUsers}
                    message={searchTerm ? 'No se encontraron clientes con ese criterio.' : 'Todaví­a no hay clientes cargados.'}
                />
            ) : effectiveView === 'table' ? (
                <ClientTable
                    clients={sortedClients}
                    sortConfig={sortConfig}
                    onSort={handleSort}
                    onEdit={handleEdit}
                    onDelete={setPendingDeleteId}
                />
            ) : (
                <div className={styles.cards_grid}>
                    {sortedClients.map(client => (
                        <ClientCard
                            key={client.id}
                            client={client}
                            onEdit={handleEdit}
                            onDelete={setPendingDeleteId}
                        />
                    ))}
                </div>
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



