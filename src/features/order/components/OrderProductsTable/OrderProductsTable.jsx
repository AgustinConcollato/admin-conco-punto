import { IMAGE_URL } from "../../../../config/api";
import { formatPrice } from "../../../../utils/formatPrice";
import styles from './OrderProductsTable.module.css';

export function OrderProductsTable({ details }) {
    if (!details || details.length === 0) {
        return <p className={styles.empty}>Este pedido no tiene productos cargados.</p>;
    }

    return (
        <div className={styles.table_wrapper}>
            <div className={styles.table_header}>
                <span>Producto</span>
                <span></span>
                <span>Cantidad</span>
                <span>Precio unitario</span>
                <span>Subtotal</span>
            </div>
            <div className={styles.list}>
                {details.map((detail) => {
                    const sku = detail.variant_id ? (detail.variant?.sku ?? '') : detail.product?.sku;
                    const image = detail.variant?.images?.[0]?.thumbnail_path ?? detail.product?.images?.[0]?.thumbnail_path;

                    return (
                        <div key={detail.id} className={styles.row}>
                            <div className={styles.container_img}>
                                <img src={`${IMAGE_URL}/${image}`} alt={detail.product?.name} />
                            </div>
                            <div className={styles.product_name}>
                                <p>{detail.product?.name}</p>
                                <small>{sku}</small>
                            </div>

                            <div className={styles.mobile_row}>
                                <span className={styles.label}>Cant:</span>
                                <span>{detail.quantity}</span>
                            </div>
                            <div className={styles.mobile_row}>
                                <span className={styles.label}>Precio:</span>
                                <span>{formatPrice(detail.unit_price)}</span>
                            </div>
                            <div className={styles.mobile_row}>
                                <span className={styles.label}>Subtotal:</span>
                                <span className={styles.subtotal_value}>{formatPrice(detail.subtotal_with_discount)}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
