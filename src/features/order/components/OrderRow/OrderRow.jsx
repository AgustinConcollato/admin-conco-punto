import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { formatPrice } from '../../../../utils/formatPrice';
import { formatDate } from '../../../../utils/formatDate';
import { OrderDetails } from '../OrderCard/OrderDetails';
import styles from './OrderRow.module.css';

const STATUS_TRANSLATIONS = {
    pending: 'Pendiente',
    processing: 'Preparación',
    confirmed: 'Terminado',
    shipped: 'Enviado',
    delivered: 'Entregado',
    cancelled: 'Cancelado',
};

export function OrderRow({ order, onRefresh }) {
    const [expanded, setExpanded] = useState(false);

    const clientName = order.client?.name || 'No asignado';
    const isPaid = order.balance_due <= 0;
    const status = order.status;
    const statusClass = styles[`status_${status}`] || styles.status_default;

    return (
        <div className={styles.row_wrap}>
            <div className={styles.row} onClick={() => setExpanded(e => !e)}>
                <span className={styles.number}>#{order.number}</span>
                <span className={styles.client} title={clientName}>{clientName}</span>
                <span className={styles.date}>{formatDate(order.created_at, 'numeric', true)}</span>
                <span className={styles.total}>{formatPrice(order.final_total_amount)}</span>
                <span className={`${styles.badge} ${statusClass}`}>
                    {STATUS_TRANSLATIONS[status] ?? status}
                </span>
                <span className={styles.debt}>
                    {status === 'cancelled'
                        ? <span className={styles.muted}>—</span>
                        : isPaid
                            ? <span className={styles.paid}>Pagado</span>
                            : <span className={styles.due}>Debe {formatPrice(order.balance_due)}</span>}
                </span>
                <span className={styles.action}>                    
                </span>
                <button
                    className={styles.expand_btn}
                    onClick={(e) => { e.stopPropagation(); setExpanded(x => !x); }}
                    aria-label={expanded ? 'Contraer' : 'Expandir'}
                >
                    <FontAwesomeIcon icon={expanded ? faChevronUp : faChevronDown} />
                </button>
            </div>

            {expanded && (
                <div className={styles.detail}>
                    <OrderDetails order={order} onRefresh={onRefresh} variant="panel" />
                </div>
            )}
        </div>
    );
}
