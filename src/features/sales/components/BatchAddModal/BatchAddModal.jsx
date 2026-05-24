import { faCircleNotch, faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { IMAGE_URL } from '../../../../config/api';
import { formatPrice } from '../../../../utils/formatPrice';
import styles from './BatchAddModal.module.css';

export function BatchAddModal({ product, order, addProduct, onClose }) {
    const unitPrice = parseFloat(product.price_lists[0]?.pivot?.price ?? 0);
    const supplierItem = product.suppliers[0] ?? null;
    const purchasePrice = supplierItem
        ? parseFloat(supplierItem.pivot?.purchase_price)
        : unitPrice - (unitPrice * (order.price_list_id === 1 ? 0.3 : 0.45));

    const rows = [
        ...(product.stock > 0 ? [
            {
                key: `p-${product.product_id}`,
                product_id: product.product_id,
                variant_id: null,
                label: product.attribute_values?.map(av => `${av.category_attribute?.name ?? ''}: ${av.value}`).join(' · ') || product.sku || `#${product.id}`,
                attrs: [], sku: product.sku, stock: product.stock, image: product.image

            }
        ] :
            []),
        ...product.variants
            .filter(v => v.stock > 0)
            .map(v => ({
                key: `v-${v.id}`,
                product_id: product.product_id,
                variant_id: v.id,
                label: v.attribute_values?.map(av => `${av.category_attribute?.name ?? ''}: ${av.value}`).join(' · ') || v.sku || `#${v.id}`,
                attrs: v.attribute_values ?? [],
                sku: v.sku,
                stock: v.stock,
                image: v.images?.[0]?.thumbnail_path ?? product.image,
            })),
    ];

    const [quantities, setQuantities] = useState(() =>
        Object.fromEntries(rows.map(r => [r.key, 0]))
    );
    const [saving, setSaving] = useState(false);

    const setQty = (key, val, max) => {
        const n = Math.max(0, Math.min(max, parseInt(val) || 0));
        setQuantities(prev => ({ ...prev, [key]: n }));
    };

    const totalItems = Object.values(quantities).filter(q => q > 0).length;

    const handleConfirm = async () => {
        const toAdd = rows.filter(r => quantities[r.key] > 0);
        if (!toAdd.length) return;
        setSaving(true);
        let successCount = 0;
        for (const row of toAdd) {
            try {
                await addProduct({
                    product_id: row.product_id,
                    ...(row.variant_id && { variant_id: row.variant_id }),
                    quantity: quantities[row.key],
                    unit_price: unitPrice,
                    purchase_price: purchasePrice,
                });
                successCount++;
            } catch {
                toast.error(`Error al agregar: ${row.label}`);
            }
        }
        setSaving(false);
        if (successCount > 0) onClose();
    };

    return (
        <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <div className={styles.header_info}>
                        <h3 className={styles.title}>{product.name}</h3>
                        <span className={styles.price}>{formatPrice(unitPrice)}</span>
                    </div>
                </div>

                <div className={styles.rows}>
                    {rows.length === 0 && (
                        <p className={styles.empty}>Sin stock disponible.</p>
                    )}
                    {rows.map(row => (
                        <div key={row.key} className={styles.row}>
                            <div className={styles.row_info}>
                                {row.image
                                    ? <img src={`${IMAGE_URL}/${row.image}`} className={styles.thumb} alt="" />
                                    : <div className={styles.thumb_placeholder} />
                                }
                                <div className={styles.row_text}>
                                    <span className={styles.row_label}>{row.label}</span>
                                    {row.sku && <span className={styles.row_sku}>{row.sku}</span>}
                                    <span className={styles.row_stock}>{row.stock} en stock</span>
                                </div>
                            </div>
                            <div className={styles.stepper}>
                                <button
                                    type="button"
                                    className={styles.step_btn}
                                    onClick={() => setQty(row.key, quantities[row.key] - 1, row.stock)}
                                    disabled={quantities[row.key] === 0}
                                >
                                    <FontAwesomeIcon icon={faMinus} />
                                </button>
                                <input
                                    type="number"
                                    className={styles.step_input}
                                    value={quantities[row.key]}
                                    min={0}
                                    max={row.stock}
                                    onChange={e => setQty(row.key, e.target.value, row.stock)}
                                />
                                <button
                                    type="button"
                                    className={styles.step_btn}
                                    onClick={() => setQty(row.key, quantities[row.key] + 1, row.stock)}
                                    disabled={quantities[row.key] >= row.stock}
                                >
                                    <FontAwesomeIcon icon={faPlus} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className={styles.footer}>
                    <button type="button" className="btn btn_regular" onClick={onClose}>
                        Cancelar
                    </button>
                    <button
                        type="button"
                        className="btn btn_solid"
                        onClick={handleConfirm}
                        disabled={saving || totalItems === 0}
                    >
                        {saving
                            ? <FontAwesomeIcon icon={faCircleNotch} spin />
                            : `Agregar${totalItems > 0 ? ` (${totalItems})` : ''}`
                        }
                    </button>
                </div>
            </div>
        </div>
    );
}
