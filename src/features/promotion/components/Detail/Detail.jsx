import { faEdit } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useMemo, useState } from 'react';
import { Modal } from '../../../../components/Modal/Modal';
import { CreatePromotion } from '../CreatePromotion/CreatePromotion';
import { Product } from '../Product/Product';
import styles from './Detail.module.css';

const DISCOUNT_TYPE_LABELS = {
    percentage: "Porcentaje",
    fixed_amount: "Monto fijo",
    second_unit_percentage: "2da unidad %",
};

export function Detail({ promotion, onRefresh }) {

    const [showFormModal, setShowFormModal] = useState(false);
    const [editingPromotion, setEditingPromotion] = useState(null);

    const openCreateModal = () => {
        setEditingPromotion(promotion);
        setShowFormModal(true);
    };

    const closeFormModal = (refresh = false) => {
        if (refresh) onRefresh();
        setShowFormModal(false);
        setEditingPromotion(null);
    };

    const progressData = useMemo(() => {
        const now = new Date();
        const start = new Date(promotion.starts_at);
        const end = new Date(promotion.ends_at);

        const total = end - start;
        const elapsed = now - start;
        const percentage = Math.min(Math.max((elapsed / total) * 100, 0), 100);

        const diffTime = end - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        let timeLabel = "";
        if (now > end) {
            timeLabel = "Finalizada";
        } else if (now < start) {
            const daysToStart = Math.ceil((start - now) / (1000 * 60 * 60 * 24));
            timeLabel = `Inicia en ${daysToStart} ${daysToStart === 1 ? 'día' : 'días'}`;
        } else {
            timeLabel = `Faltan ${diffDays} ${diffDays === 1 ? 'día' : 'días'}`;
        }

        return {
            percentage,
            timeLabel,
            startStr: start.toLocaleDateString(),
            endStr: end.toLocaleDateString(),
            isExpired: now > end
        };
    }, [promotion.starts_at, promotion.ends_at]);

    return (
        <>
            <div className={styles.detail}>

                {/* Card: Info general */}
                <div className={styles.card_section}>
                    <div className={styles.section_header}>
                        <h3 className={styles.section_label}>Información general</h3>
                        <button className='btn btn_regular' onClick={openCreateModal}>
                            <FontAwesomeIcon icon={faEdit} />
                            Editar
                        </button>
                    </div>

                    <div className={styles.timelineContainer}>
                        <div className={styles.timelineLabels}>
                            <span>{progressData.startStr}</span>
                            <span>{progressData.timeLabel}</span>
                            <span>{progressData.endStr}</span>
                        </div>
                        <div className={styles.progressBar}>
                            <div
                                className={`${styles.progressFill} ${progressData.isExpired ? styles.expiredBar : ''}`}
                                style={{ width: `${progressData.percentage}%` }}
                            />
                        </div>
                    </div>

                    <div className={styles.row}>
                        <span className={styles.row_label}>Estado</span>
                        <p className={`${styles.status} ${promotion.is_active ? styles.active : styles.inactive}`}>
                            {promotion.is_active ? 'Activa' : 'Inactiva'}
                        </p>
                    </div>
                    <div className={styles.row}>
                        <span className={styles.row_label}>Listas de precio</span>
                        <div className={styles.tags}>
                            {promotion.price_lists.length === 0
                                ? <span className={styles.tag}>Todas las listas</span>
                                : promotion.price_lists.map(e =>
                                    <span key={e.id} className={styles.tag}>{e.name}</span>
                                )
                            }
                        </div>
                    </div>
                </div>

                {/* Card: Descuento */}
                <div className={styles.card_section}>
                    <div className={styles.section_header}>
                        <h3 className={styles.section_label}>Descuento</h3>
                    </div>
                    <div className={styles.row}>
                        <span className={styles.row_label}>Tipo</span>
                        <span className={styles.row_value}>{DISCOUNT_TYPE_LABELS[promotion.discount_type] || promotion.discount_type}</span>
                    </div>
                    <div className={styles.row}>
                        <span className={styles.row_label}>Valor del descuento</span>
                        <span className={styles.row_value}>
                            {promotion.discount_type === "percentage" || promotion.discount_type === "second_unit_percentage"
                                ? `${promotion.discount_value}%`
                                : `$ ${promotion.discount_value}`}
                        </span>
                    </div>
                    <div className={styles.row}>
                        <span className={styles.row_label}>Cantidad mínima de productos</span>
                        <span className={styles.row_value}>{promotion.min_quantity}</span>
                    </div>
                    <div className={styles.row}>
                        <span className={styles.row_label}>Tope de descuento</span>
                        <span className={styles.row_value}>{promotion.max_discount_amount ? `$ ${promotion.max_discount_amount}` : 'Sin tope'}</span>
                    </div>
                </div>

                {/* Card: Productos */}
                <div className={styles.card_section}>
                    <div className={styles.section_header}>
                        <h3 className={styles.section_label}>Productos ({promotion.products.length})</h3>
                    </div>
                    <div className={styles.product_list}>
                        {promotion.products.map(e =>
                            <Product
                                key={e.id}
                                data={e}
                                promotion={promotion}
                                onRefresh={onRefresh}
                            />
                        )}
                    </div>
                </div>

            </div>

            {showFormModal && (
                <Modal
                    onClose={() => closeFormModal()}
                    title={editingPromotion ? "Editar promoción" : "Nueva promoción"}
                >
                    <CreatePromotion
                        editingPromotion={editingPromotion}
                        onClose={() => closeFormModal(true)}
                    />
                </Modal>
            )}
        </>
    );
}
