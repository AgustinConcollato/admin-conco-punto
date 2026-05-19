import { faImage } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';
import { Modal } from '../../../../components/Modal/Modal';
import { IMAGE_URL } from '../../../../config/api';
import { formatPrice } from '../../../../utils/formatPrice';
import { ProductPromotionControl } from '../ProductPromotionControl/ProductPromotionControl';
import styles from './Product.module.css';

export function Product({ data, onRefresh, promotion }) {

    const [selectedProduct, setSelectedProduct] = useState(null);

    const getApplicablePriceLists = (product) => {
        if (!product?.price_lists?.length) return [];
        if (!promotion.price_lists?.length) return product.price_lists;

        const promotionPriceListIds = new Set(promotion.price_lists.map((pl) => pl.id));
        return product.price_lists.filter((pl) => promotionPriceListIds.has(pl.id));
    };

    const getPromotionalPrice = (basePrice) => {
        if (!Number.isFinite(basePrice)) return null;

        const discountType = promotion.discount_type;
        const discountValue = Number(promotion.discount_value || 0);
        let discountAmount = 0;

        if (discountType === 'percentage' || discountType === 'second_unit_percentage') {
            discountAmount = basePrice * (discountValue / 100);
        } else if (discountType === 'fixed_amount') {
            discountAmount = discountValue;
        }

        if (promotion.max_discount_amount !== null && promotion.max_discount_amount !== undefined) {
            discountAmount = Math.min(discountAmount, Number(promotion.max_discount_amount));
        }

        return Math.max(basePrice - discountAmount, 0);
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
