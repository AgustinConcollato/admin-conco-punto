import { faCalendar, faCircleNotch } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Modal } from '../../../../components/Modal/Modal';
import { PromotionService } from '../../../../services/promotion/promotionService';
import styles from './ProductPromotionControl.module.css';

export function ProductPromotionControl({
    productId,
    promotions = [],
    onPromotionsChange,
    trigger = 'text',
    blockNavigation = false,
}) {

    const promotionService = useMemo(() => new PromotionService(), []);

    const [showModal, setShowModal] = useState(false);
    const [availablePromotions, setAvailablePromotions] = useState([]);
    const [selectedPromotionId, setSelectedPromotionId] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const currentPromotion = promotions?.[0] || null;

    const getErrorMessage = (error, fallback) => {
        if (Array.isArray(error) && error[0]) {
            const firstField = Object.values(error[0])[0];
            if (Array.isArray(firstField) && firstField[0]) return firstField[0];
        }
        if (error && typeof error === 'object') {
            if (error.message) return error.message;
            const firstField = Object.values(error)[0];
            if (Array.isArray(firstField) && firstField[0]) return firstField[0];
        }
        return fallback;
    };

    const loadPromotions = async () => {
        setLoading(true);
        try {
            const res = await promotionService.getAll({ is_active: 1, per_page: 100 });
            const items = Array.isArray(res?.data) ? res.data : [];
            setAvailablePromotions(items);
        } catch (error) {
            setAvailablePromotions([]);
            toast.error(getErrorMessage(error, 'No se pudieron cargar las promociones.'));
        } finally {
            setLoading(false);
        }
    };

    const openModal = async (e) => {
        if (blockNavigation && e) {
            e.preventDefault();
            e.stopPropagation();
        }
        setShowModal(true);
        setSelectedPromotionId('');
        await loadPromotions();
    };

    const closeModal = () => {
        if (submitting) return;
        setShowModal(false);
    };

    const handleAdd = async () => {
        if (!selectedPromotionId) return;
        setSubmitting(true);
        try {
            const selectedPromotion = availablePromotions.find((p) => String(p.id) === String(selectedPromotionId));
            const currentIds = Array.isArray(selectedPromotion?.products) ? selectedPromotion.products.map((p) => p.id) : [];
            const updatedIds = Array.from(new Set([...currentIds, productId]));
            const updatedPromotion = await promotionService.syncProducts(selectedPromotionId, updatedIds);
            onPromotionsChange?.(updatedPromotion ? [updatedPromotion] : []);
            closeModal();
        } catch (error) {
            toast.error(getErrorMessage(error, 'No se pudo agregar el producto a la promoción.'));
        } finally {
            setSubmitting(false);
        }
    };

    const handleRemove = async () => {
        if (!currentPromotion?.id) return;
        setSubmitting(true);
        try {
            const fullPromotion = await promotionService.getById(currentPromotion.id);
            const nextIds = (fullPromotion?.products || [])
                .map((p) => p.id)
                .filter((id) => String(id) !== String(productId));

            await promotionService.syncProducts(currentPromotion.id, nextIds);
            onPromotionsChange?.([]);
            closeModal();
        } catch (error) {
            toast.error(getErrorMessage(error, 'No se pudo quitar el producto de la promoción.'));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            {trigger === 'icon' &&
                <button
                    type="button"
                    className={`${styles.trigger_icon} ${currentPromotion ? styles.trigger_icon_active : ''}`}
                    onClick={openModal}
                    title={currentPromotion ? `Promoción: ${currentPromotion.name}` : 'Agregar a promoción'}
                >
                    <FontAwesomeIcon icon={faCalendar} />
                </button>
            }
            {trigger === 'text' &&
                <div className={styles.inline_container}>
                    <h3>Promocion</h3>

                    {!currentPromotion ? (
                        <button type="button" className={`btn btn_regular`} onClick={openModal}>
                            Agregar a una promo
                        </button>
                    ) : (
                        <>
                            <div className={styles.header}>
                                <p className={styles.promotion_name}>{currentPromotion.name}</p>
                                <Link to={`/promociones/${currentPromotion.id}`}>Ver promoción</Link>
                            </div>
                            <button type="button" className={`btn btn_error_regular`} onClick={handleRemove} disabled={submitting}>
                                {submitting ? <FontAwesomeIcon icon={faCircleNotch} spin /> : 'Quitar de la promo'}
                            </button>
                        </>
                    )}
                </div>
            }
            {trigger === 'button' &&
                <button type="button" className={`btn btn_error_regular`} onClick={handleRemove} disabled={submitting}>
                    {submitting ? <FontAwesomeIcon icon={faCircleNotch} spin /> : 'Quitar de la promo'}
                </button>
            }

            {showModal && (
                <Modal onClose={closeModal} title="Promoción del producto">
                    <div className={styles.modal_content}>
                        {loading ? (
                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                                <FontAwesomeIcon icon={faCircleNotch} spin />
                            </div>
                        ) : currentPromotion ? (
                            <>
                                <p>
                                    Este producto está en: <strong>{currentPromotion.name}</strong>
                                </p>
                                <button type="button" className="btn btn_error_regular" onClick={handleRemove} disabled={submitting}>
                                    {submitting ? <FontAwesomeIcon icon={faCircleNotch} spin /> : 'Quitar de la promo'}
                                </button>
                            </>
                        ) : availablePromotions.length === 0 ? (
                            <p>No hay promociones activas disponibles.</p>
                        ) : (
                            <>
                                <div className="input_group">
                                    <span>Seleccioná una promoción</span>
                                    <select
                                        className="input"
                                        value={selectedPromotionId}
                                        onChange={(e) => setSelectedPromotionId(e.target.value)}
                                    >
                                        <option value="">Elegir...</option>
                                        {availablePromotions.map((promotion) => (
                                            <option key={promotion.id} value={promotion.id}>
                                                {promotion.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <button
                                    type="button"
                                    className="btn btn_solid"
                                    onClick={handleAdd}
                                    disabled={!selectedPromotionId || submitting}
                                >
                                    {submitting ? <FontAwesomeIcon icon={faCircleNotch} spin /> : 'Agregar'}
                                </button>
                            </>
                        )}
                    </div>
                </Modal>
            )}
        </>
    );
}

