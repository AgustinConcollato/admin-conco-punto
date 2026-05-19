import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { faUsers } from "@fortawesome/free-solid-svg-icons";
import { ConfirmModal } from "../../components/ConfirmModal/ConfirmModal";
import { EmptyState } from "../../components/EmptyState/EmptyState";
import { Modal } from "../../components/Modal/Modal";
import { TableSkeleton } from "../../components/TableSkeleton/TableSkeleton";
import { ClientService } from "../../services/client/clientService";
import { EditClientForm } from "../../features/client/editClient/components/EditClientForm/EditClientForm";
import styles from './ClientListPage.module.css';

export function ClientListPage() {
    const [clients, setClients] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingClient, setEditingClient] = useState(null);
    const [pendingDeleteId, setPendingDeleteId] = useState(null);

    const clientService = useMemo(() => new ClientService(), []);

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
        const lowerCaseSearch = searchTerm.trim().toLowerCase();
        return clients.filter(client => {
            const name = client.name?.toLowerCase() || '';
            const email = client.email?.toLowerCase() || '';
            const phone = client.phone || '';
            return name.includes(lowerCaseSearch) || email.includes(lowerCaseSearch) || phone.includes(lowerCaseSearch);
        });
    }, [clients, searchTerm]);

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

            <div className={styles.search_container}>
                <input
                    type="text"
                    placeholder="Buscar por nombre, email o teléfono..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className={styles.search_input}
                />
            </div>

            {isLoading ? (
                <TableSkeleton rows={6} cols={5} />
            ) : filteredClients.length === 0 ? (
                <EmptyState
                    icon={faUsers}
                    message={searchTerm ? 'No se encontraron clientes con ese criterio.' : 'Todavía no hay clientes cargados.'}
                />
            ) : (
                <div className={styles.table_wrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Email</th>
                                <th>Teléfono</th>
                                <th>Lista</th>
                                <th>Opciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredClients.map(client => (
                                <tr key={client.id}>
                                    <td data-label="Nombre">{client.name}</td>
                                    <td data-label="Email">{client.email || 'Sin email'}</td>
                                    <td data-label="Teléfono">{client.phone || 'Sin teléfono'}</td>
                                    <td data-label="Lista">{client.price_list?.name || 'General'}</td>
                                    <td data-label="Opciones" className={styles.options_cell}>
                                        <button className="btn btn_regular" onClick={() => handleEdit(client)}>
                                            Editar
                                        </button>
                                        <button className="btn btn_error_regular" onClick={() => setPendingDeleteId(client.id)}>
                                            Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
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
