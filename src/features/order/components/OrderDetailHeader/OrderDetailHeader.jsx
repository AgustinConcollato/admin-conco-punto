import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faCircleNotch, faDownload, faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import { downloadOrderPdf } from "../../../../utils/downloadOrderPdf";
import { formatDate } from "../../../../utils/formatDate";
import { OrderStatusAction } from "../OrderStatusAction/OrderStatusAction";
import styles from './OrderDetailHeader.module.css';

const STATUS_TRANSLATIONS = {
    pending: 'Pendiente',
    processing: 'Preparación',
    confirmed: 'Terminado',
    shipped: 'Enviado',
    delivered: 'Entregado',
    cancelled: 'Cancelado',
};

export function OrderDetailHeader({ order, onUpdated }) {
    const navigate = useNavigate();
    const [downloading, setDownloading] = useState(false);

    const canEdit = order.status !== 'cancelled' && order.status !== 'delivered';

    const handleDownload = async () => {
        setDownloading(true);
        try {
            await downloadOrderPdf(order.id, order.client?.name || 'pedido');
        } finally {
            setDownloading(false);
        }
    };

    return (
        <div className={styles.header}>
            <button className={styles.back_btn} onClick={() => navigate('/pedidos')} aria-label="Volver">
                <FontAwesomeIcon icon={faArrowLeft} />
            </button>

            <div className={styles.title_block}>
                <div className={styles.title_row}>
                    <h1 className={styles.title}>Pedido #{order.number}</h1>
                    <span className={`${styles.badge} ${styles['status_' + order.status]}`}>
                        {STATUS_TRANSLATIONS[order.status] ?? order.status}
                    </span>
                </div>
                <span className={styles.subtitle}>{formatDate(order.created_at, 'long', true)}</span>
            </div>

            <div className={styles.actions}>
                <button className="btn" onClick={handleDownload} disabled={downloading}>
                    {downloading ? <FontAwesomeIcon icon={faCircleNotch} spin /> : <FontAwesomeIcon icon={faDownload} />}
                    Descargar detalle
                </button>
                {canEdit && (
                    <Link to={`/ventas/${order.id}`} className="btn btn_regular">
                        <FontAwesomeIcon icon={faPenToSquare} /> Editar pedido
                    </Link>
                )}
                <OrderStatusAction order={order} onUpdated={onUpdated} />
            </div>
        </div>
    );
}
