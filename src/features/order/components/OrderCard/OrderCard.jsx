import { formatDate } from '../../../../utils/formatDate';
import { formatPrice } from '../../../../utils/formatPrice';
import { OrderDetails } from './OrderDetails';
import styles from './OrderCard.module.css';

const STATUS_TRANSLATIONS = {
    'pending': 'Pendiente',
    'processing': 'Preparación',
    'confirmed': 'Terminado',
    'shipped': 'Enviado',
    'delivered': 'Entregado',
    'cancelled': 'Cancelado',
};

export function OrderCard({ order, onRefresh }) {
    const clientName = order.client?.name || 'No asignado';
    const translatedStatus = STATUS_TRANSLATIONS[order.status] || order.status.toUpperCase();

    const getStatusClass = (status) => {
        // Esto buscará clases como .status_pending, .status_confirmed, etc.
        const statusClass = styles[`status_${status.toLowerCase()}`];
        return statusClass || styles.status_default;
    };

    return (
        <div className={styles.order_card}>
            {/* Cabecera con ID y Tags */}
            <div className={styles.header}>
                <h3 className={styles.order_id}>Pedido #{order.number}</h3>
                <div className={styles.tags}>
                    {/* Tag ejemplo extra como el de la imagen */}
                    <span className={styles.tag_blue}>
                        {order.price_list_id == 1 ? 'MAYORISTA' :
                            order.price_list_id == 2 ? 'MINORISTA' :
                                'VIAJE'
                        }
                    </span>
                    <span className={`${styles.status_tag} ${getStatusClass(order.status)}`}>
                        {translatedStatus.toUpperCase()}
                    </span>
                </div>
            </div>

            {/* Precio Principal */}
            <div className={styles.total_section}>
                <span className={styles.total_label}>Total</span>
                <h2 className={styles.main_price}>{formatPrice(order.final_total_amount)}</h2>
            </div>

            {/* Info Secundaria */}
            <div className={styles.sub_info}>
                <span>Cliente: {clientName}</span>
                <span className={styles.divider}>|</span>
                <span>Fecha: {formatDate(order.created_at, 'numeric', true)}</span>
            </div>

            <hr className={styles.separator} />

            {/* Cuerpo: análisis financiero, pagos, acciones y estado */}
            <OrderDetails order={order} onRefresh={onRefresh} />
        </div>
    );
}
