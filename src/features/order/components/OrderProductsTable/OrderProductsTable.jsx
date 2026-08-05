import { IMAGE_URL } from "../../../../config/api";
import { formatPrice } from "../../../../utils/formatPrice";
import styles from './OrderProductsTable.module.css';

function DetailRow({ detail }) {
    const sku = detail.variant_id ? (detail.variant?.sku ?? '') : detail.product?.sku;
    const image = detail.variant?.images?.[0]?.thumbnail_path ?? detail.product?.images?.[0]?.thumbnail_path;

    return (
        <div className={styles.row}>
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
}

function DetailGroup({ title, details }) {
    if (details.length === 0) return null;

    return (
        <div className={styles.table_wrapper}>
            {title && <h3 className={styles.group_title}>{title}</h3>}
            <div className={styles.table_header}>
                <span>Producto</span>
                <span></span>
                <span>Cantidad</span>
                <span>Precio unitario</span>
                <span>Subtotal</span>
            </div>
            <div className={styles.list}>
                {details.map((detail) => <DetailRow key={detail.id} detail={detail} />)}
            </div>
        </div>
    );
}

export function OrderProductsTable({ details }) {
    if (!details || details.length === 0) {
        return <p className={styles.empty}>Este pedido no tiene productos cargados.</p>;
    }

    const dropshipDetails = details.filter((d) => d.product?.is_dropshipping);
    const normalDetails = details.filter((d) => !d.product?.is_dropshipping);

    return (
        <div className={styles.groups}>
            <DetailGroup details={normalDetails} />
            <DetailGroup title="Productos dropshipping" details={dropshipDetails} />
        </div>
    );
}
