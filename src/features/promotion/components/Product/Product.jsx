import { faCircleNotch, faEdit, faImage } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { Modal } from '../../../../components/Modal/Modal';
import { IMAGE_URL } from '../../../../config/api';
import { PromotionService } from '../../../../services/promotion/promotionService';
import { formatPrice } from '../../../../utils/formatPrice';
import { buildProductsPayload } from '../../utils/promotionUtils';
import { ProductPromotionControl } from '../ProductPromotionControl/ProductPromotionControl';
import styles from './Product.module.css';

const DISCOUNT_TYPE_LABELS = {
    percentage: 'Porcentaje',
    fixed_amount: 'Monto fijo',
    second_unit_percentage: '2da unidad %',
};

const OVERRIDE_FIELDS = ['discount_type', 'discount_value', 'max_discount_amount', 'min_quantity'];

const EMPTY_OVERRIDES = {
    discount_type: '',
    discount_value: '',
    max_discount_amount: '',
    min_quantity: '',
};

export function Product({ data, onRefresh, promotion }) {

    const promotionService = useMemo(() => new PromotionService(), []);

    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showOverrideForm, setShowOverrideForm] = useState(false);
    const [overrideValues, setOverrideValues] = useState(EMPTY_OVERRIDES);
    const [savingOverrides, setSavingOverrides] = useState(false);

    // Condiciones efectivas: pivot del producto tiene prioridad sobre la promo
    const effectiveConditions = {
        discount_type:       data.pivot?.discount_type       ?? promotion.discount_type,
        discount_value:      data.pivot?.discount_value      ?? promotion.discount_value,
        max_discount_amount: data.pivot?.max_discount_amount ?? promotion.max_discount_amount,
        min_quantity:        data.pivot?.min_quantity        ?? promotion.min_quantity,
    };

    const hasOverrides = OVERRIDE_FIELDS.some(
        field => data.pivot?.[field] !== null && data.pivot?.[field] !== undefined
    );

    const getApplicablePriceLists = (product) => {
        if (!product?.price_lists?.length) return [];
        if (!promotion.price_lists?.length) return product.price_lists;
        const promotionPriceListIds = new Set(promotion.price_lists.map((pl) => pl.id));
        return product.price_lists.filter((pl) => promotionPriceListIds.has(pl.id));
    };

    const getPromotionalPrice = (basePrice) => {
        if (!Number.isFinite(basePrice)) return null;

        const { discount_type, discount_value, max_discount_amount } = effectiveConditions;
        const discountVal = Number(discount_value || 0);
        let discountAmount = 0;

        if (discount_type === 'percentage' || discount_type === 'second_unit_percentage') {
            discountAmount = basePrice * (discountVal / 100);
        } else if (discount_type === 'fixed_amount') {
            discountAmount = discountVal;
        }

        if (max_discount_amount !== null && max_discount_amount !== undefined) {
            discountAmount = Math.min(discountAmount, Number(max_discount_amount));
        }

        return Math.max(basePrice - discountAmount, 0);
    };

    const openOverrideForm = () => {
        setOverrideValues({
            discount_type:       data.pivot?.discount_type       ?? '',
            discount_value:      data.pivot?.discount_value      ?? '',
            max_discount_amount: data.pivot?.max_discount_amount ?? '',
            min_quantity:        data.pivot?.min_quantity        ?? '',
        });
        setShowOverrideForm(true);
    };

    const cancelOverrideForm = () => {
        setShowOverrideForm(false);
        setOverrideValues(EMPTY_OVERRIDES);
    };

    const handleSaveOverrides = async () => {
        setSavingOverrides(true);
        try {
            // Null = limpiar override (vuelve a heredar de la promo)
            const overrides = {
                discount_type:       overrideValues.discount_type       || null,
                discount_value:      overrideValues.discount_value !== '' ? Number(overrideValues.discount_value) : null,
                max_discount_amount: overrideValues.max_discount_amount !== '' ? Number(overrideValues.max_discount_amount) : null,
                min_quantity:        overrideValues.min_quantity !== '' ? Number(overrideValues.min_quantity) : null,
            };

            const fullPromotion = await promotionService.getById(promotion.id);
            const updatedProducts = buildProductsPayload(
                (fullPromotion.products || []).map(p =>
                    String(p.id) === String(data.id)
                        ? { ...p, pivot: { ...p.pivot, ...overrides } }
                        : p
                )
            );
            await promotionService.syncProducts(promotion.id, updatedProducts);
            setShowOverrideForm(false);
            onRefresh?.();
        } catch {
            toast.error('No se pudieron guardar las condiciones del producto.');
        } finally {
            setSavingOverrides(false);
        }
    };

    const priceLists = getApplicablePriceLists(data);

    return (
        <>
            <div className={styles.product_item}>
                <div className={styles.header}>
                    <div className={styles.image_wrap}>
                        {data.images.length > 0 ? (
                            <img
                                src={`${IMAGE_URL}/${data.images[0].thumbnail_path}`}
                                alt={data.name}
                                onClick={() => setSelectedProduct(data)}
                            />
                        ) : (
                            <FontAwesomeIcon icon={faImage} className={styles.placeholder_icon} />
                        )}
                    </div>
                    <div className={styles.meta}>
                        <p className={styles.name}>{data.name}</p>
                        {data.sku && <span className={styles.sku}>{data.sku}</span>}
                    </div>
                </div>

                {priceLists.length > 0 && (
                    <table className={styles.price_table}>
                        <thead>
                            <tr>
                                <th>Lista</th>
                                <th>Precio base</th>
                                <th>Con promoción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {priceLists.map((pl) => {
                                const base = Number(pl?.pivot?.price);
                                const promo = getPromotionalPrice(base);
                                return (
                                    <tr key={pl.id}>
                                        <td>{pl.name}</td>
                                        <td>{Number.isFinite(base) ? formatPrice(base) : '-'}</td>
                                        <td className={styles.promo_price}>{promo !== null ? formatPrice(promo) : '-'}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}

                {/* Sección de condiciones propias */}
                <div className={styles.overrides_section}>
                    <div className={styles.overrides_header}>
                        <div className={styles.overrides_title}>
                            <span className={styles.overrides_label}>Condiciones</span>
                            {hasOverrides
                                ? <span className={styles.badge_override}>Propias</span>
                                : <span className={styles.badge_inherited}>Heredadas de la promo</span>
                            }
                        </div>
                        <button
                            type="button"
                            className={`btn btn_regular ${styles.edit_btn}`}
                            onClick={showOverrideForm ? cancelOverrideForm : openOverrideForm}
                            disabled={savingOverrides}
                        >
                            {showOverrideForm ? 'Cancelar' : <><FontAwesomeIcon icon={faEdit} /> Editar</>}
                        </button>
                    </div>

                    {!showOverrideForm && hasOverrides && (
                        <div className={styles.overrides_summary}>
                            {data.pivot?.discount_type && (
                                <span className={styles.override_chip}>
                                    {DISCOUNT_TYPE_LABELS[data.pivot.discount_type]}
                                </span>
                            )}
                            {data.pivot?.discount_value != null && (
                                <span className={styles.override_chip}>
                                    {data.pivot.discount_type === 'percentage' || data.pivot.discount_type === 'second_unit_percentage'
                                        ? `${data.pivot.discount_value}%`
                                        : `$ ${data.pivot.discount_value}`
                                    }
                                </span>
                            )}
                            {data.pivot?.min_quantity != null && (
                                <span className={styles.override_chip}>Mín: {data.pivot.min_quantity} u.</span>
                            )}
                            {data.pivot?.max_discount_amount != null && (
                                <span className={styles.override_chip}>Tope: $ {data.pivot.max_discount_amount}</span>
                            )}
                        </div>
                    )}

                    {showOverrideForm && (
                        <div className={styles.override_form}>
                            <div className="input_group">
                                <span>Tipo de descuento</span>
                                <select
                                    className="input"
                                    value={overrideValues.discount_type}
                                    onChange={e => setOverrideValues(v => ({ ...v, discount_type: e.target.value }))}
                                >
                                    <option value="">Heredar de la promo ({DISCOUNT_TYPE_LABELS[promotion.discount_type]})</option>
                                    <option value="percentage">Porcentaje</option>
                                    <option value="fixed_amount">Monto fijo</option>
                                    <option value="second_unit_percentage">2da unidad %</option>
                                </select>
                            </div>
                            <div className="input_group">
                                <span>Valor del descuento</span>
                                <input
                                    type="number"
                                    className="input"
                                    min="0"
                                    step="any"
                                    placeholder={`Heredar (${promotion.discount_value})`}
                                    value={overrideValues.discount_value}
                                    onChange={e => setOverrideValues(v => ({ ...v, discount_value: e.target.value }))}
                                />
                            </div>
                            <div className="input_group">
                                <span>Cantidad mínima</span>
                                <input
                                    type="number"
                                    className="input"
                                    min="1"
                                    step="1"
                                    placeholder={`Heredar (${promotion.min_quantity})`}
                                    value={overrideValues.min_quantity}
                                    onChange={e => setOverrideValues(v => ({ ...v, min_quantity: e.target.value }))}
                                />
                            </div>
                            <div className="input_group">
                                <span>Tope de descuento</span>
                                <input
                                    type="number"
                                    className="input"
                                    min="0"
                                    step="any"
                                    placeholder={`Heredar (${promotion.max_discount_amount ?? 'sin tope'})`}
                                    value={overrideValues.max_discount_amount}
                                    onChange={e => setOverrideValues(v => ({ ...v, max_discount_amount: e.target.value }))}
                                />
                            </div>
                            <button
                                type="button"
                                className="btn btn_solid"
                                onClick={handleSaveOverrides}
                                disabled={savingOverrides}
                            >
                                {savingOverrides ? <FontAwesomeIcon icon={faCircleNotch} spin /> : 'Guardar condiciones'}
                            </button>
                        </div>
                    )}
                </div>

                <div className={styles.actions}>
                    <ProductPromotionControl
                        productId={data.id}
                        promotions={[promotion]}
                        onPromotionsChange={() => onRefresh?.()}
                        trigger="button"
                    />
                </div>
            </div>

            {selectedProduct && (
                <Modal onClose={() => setSelectedProduct(null)}>
                    <img
                        src={`${IMAGE_URL}/${selectedProduct.images[0].path}`}
                        alt={selectedProduct.name}
                        style={{ width: '100%' }}
                    />
                </Modal>
            )}
        </>
    );
}
