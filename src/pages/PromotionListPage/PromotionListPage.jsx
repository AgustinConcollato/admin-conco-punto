import { faEdit, faPlus, faTag, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { ConfirmModal } from "../../components/ConfirmModal/ConfirmModal";
import { EmptyState } from "../../components/EmptyState/EmptyState";
import { Modal } from "../../components/Modal/Modal";
import { Pagination } from "../../components/Pagination/Pagination";
import { TableSkeleton } from "../../components/TableSkeleton/TableSkeleton";
import { CreatePromotion } from "../../features/promotion/components/CreatePromotion/CreatePromotion";
import { PromotionService } from "../../services/promotion/promotionService";
import styles from "./PromotionListPage.module.css";

const DISCOUNT_TYPE_LABELS = {
    percentage: "Porcentaje",
    fixed_amount: "Monto fijo",
    second_unit_percentage: "2da unidad %",
};

function formatDate(dateString) {
    if (!dateString) return "-";
    const d = new Date(dateString);
    if (Number.isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString();
}

export function PromotionListPage() {
    const promotionService = useMemo(() => new PromotionService(), []);

    const [promotions, setPromotions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [pageLoading, setPageLoading] = useState(false);
    const [paginator, setPaginator] = useState(null);

    const [showFormModal, setShowFormModal] = useState(false);
    const [editingPromotion, setEditingPromotion] = useState(null);
    const [pendingDeleteId, setPendingDeleteId] = useState(null);

    const loadPromotions = async (page = 1) => {
        setPageLoading(true);
        try {
            const response = await promotionService.getAll({ page, per_page: 20 });
            setPromotions(response.data || []);
            setPaginator(response);
        } catch (error) {
            console.error("Error al cargar promociones:", error);
        } finally {
            setIsLoading(false);
            setPageLoading(false);
        }
    };

    useEffect(() => {
        loadPromotions();
    }, []);

    const openCreateModal = () => {
        setEditingPromotion(null);
        setShowFormModal(true);
    };

    const openEditModal = (promotion) => {
        setEditingPromotion(promotion);
        setShowFormModal(true);
    };

    const closeFormModal = (savedPromotion = null, isEdit = false) => {
        if (savedPromotion) {
            if (isEdit) {
                setPromotions(prev => prev.map(p => p.id === savedPromotion.id ? savedPromotion : p));
            } else {
                setPromotions(prev => [savedPromotion, ...prev].slice(0, 20));
                setPaginator(prev => prev ? { ...prev, total: (prev.total || 0) + 1 } : prev);
            }
        }
        setShowFormModal(false);
        setEditingPromotion(null);
    };

    const confirmDelete = async () => {
        if (!pendingDeleteId) return;
        try {
            await promotionService.delete(pendingDeleteId);
            setPromotions(prev => prev.filter(p => p.id !== pendingDeleteId));
            setPaginator(prev => prev ? { ...prev, total: Math.max(0, (prev.total || 1) - 1) } : prev);
            toast.success("Promoción eliminada");
        } catch (error) {
            console.error("Error al eliminar promoción:", error);
            toast.error("No se pudo eliminar la promoción.");
        } finally {
            setPendingDeleteId(null);
        }
    };

    const goToPage = async (page) => {
        if (!paginator || page === paginator.current_page || page < 1 || page > paginator.last_page) return;
        await loadPromotions(page);
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2 className={styles.title}>Promociones</h2>
                <button className="btn btn_primary" onClick={openCreateModal}>
                    <FontAwesomeIcon icon={faPlus} /> Nueva promoción
                </button>
            </div>

            {isLoading ? (
                <TableSkeleton rows={6} cols={8} />
            ) : promotions.length === 0 ? (
                <EmptyState icon={faTag} message="No hay promociones creadas." />
            ) : (
                <div className={styles.table_wrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Tipo</th>
                                <th>Valor</th>
                                <th>Tope</th>
                                <th>Mín. unidades</th>
                                <th>Vigencia</th>
                                <th>Activa</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        {pageLoading ? (
                            <tbody>
                                <tr>
                                    <td colSpan={8}>
                                        <TableSkeleton rows={4} cols={8} />
                                    </td>
                                </tr>
                            </tbody>
                        ) : (
                            <tbody>
                                {promotions.map((promo) => (
                                    <tr key={promo.id}>
                                        <td data-label="Nombre"><Link to={`/promociones/${promo.id}`}>{promo.name}</Link></td>
                                        <td data-label="Tipo"><Link to={`/promociones/${promo.id}`}>{DISCOUNT_TYPE_LABELS[promo.discount_type] || promo.discount_type}</Link></td>
                                        <td data-label="Valor">
                                            <Link to={`/promociones/${promo.id}`}>
                                                {promo.discount_type === "percentage" || promo.discount_type === "second_unit_percentage"
                                                    ? `${promo.discount_value}%`
                                                    : `$ ${promo.discount_value}`}
                                            </Link>
                                        </td>
                                        <td data-label="Tope"><Link to={`/promociones/${promo.id}`}>{promo.max_discount_amount ? `$ ${promo.max_discount_amount}` : "-"}</Link></td>
                                        <td data-label="Mín. uds."><Link to={`/promociones/${promo.id}`}>{promo.min_quantity}</Link></td>
                                        <td data-label="Vigencia"><Link to={`/promociones/${promo.id}`}>{formatDate(promo.starts_at)} – {formatDate(promo.ends_at)}</Link></td>
                                        <td data-label="Activa">
                                            <Link to={`/promociones/${promo.id}`}>
                                                <span className={promo.is_active ? styles.badge_active : styles.badge_inactive}>
                                                    {promo.is_active ? "Sí" : "No"}
                                                </span>
                                            </Link>
                                        </td>
                                        <td data-label="Acciones">
                                            <div className={styles.actions_cell}>
                                                <button className={styles.icon_btn} title="Editar" onClick={() => openEditModal(promo)}>
                                                    <FontAwesomeIcon icon={faEdit} />
                                                </button>
                                                <button className={styles.icon_btn_delete} title="Eliminar" onClick={() => setPendingDeleteId(promo.id)}>
                                                    <FontAwesomeIcon icon={faTrashAlt} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        )}
                    </table>
                </div>
            )}

            {
                !pageLoading && promotions.length !== 0 && (
                    <div className={styles.pagination}>
                        <Pagination
                            currentPage={paginator.current_page}
                            onPageChange={goToPage}
                            lastPage={paginator.last_page}
                        />
                    </div>
                )
            }

            {showFormModal && (
                <Modal
                    onClose={() => closeFormModal()}
                    title={editingPromotion ? "Editar promoción" : "Nueva promoción"}
                >
                    <CreatePromotion
                        editingPromotion={editingPromotion}
                        onClose={closeFormModal}
                    />
                </Modal>
            )}

            {pendingDeleteId && (
                <ConfirmModal
                    message="¿Seguro que deseas eliminar esta promoción? Esta acción no se puede deshacer."
                    onConfirm={confirmDelete}
                    onCancel={() => setPendingDeleteId(null)}
                />
            )}
        </div>
    );
}

