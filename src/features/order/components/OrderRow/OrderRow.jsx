import { useState } from 'react';
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

function getInitials(name) {
    if (!name || name === 'No asignado') return '—';
    const parts = name.trim().split(/\s+/);
    return (parts[0][0] + (parts[1] ? parts[1][0] : '')).toUpperCase();
}

export function OrderRow({ order, onRefresh }) {
    const [expanded, setExpanded] = useState(false);

    const clientName = order.client?.name || 'No asignado';
    const isNoClient = clientName === 'No asignado';
    const isPaid = order.balance_due <= 0;
    const status = order.status;
    const hasDebt = order.balance_due > 0 && status !== 'cancelled';
    const paidAmount = parseFloat(order.final_total_amount) - order.balance_due;
    const payPct = parseFloat(order.final_total_amount) > 0
        ? Math.round((paidAmount / parseFloat(order.final_total_amount)) * 100)
        : 0;

    return (
        <div className={`${styles.row_wrap} ${hasDebt && expanded ? styles.row_wrap_debt : ''}`}>
            <div className={styles.row} onClick={() => setExpanded(e => !e)}>
                <span className={styles.number}>#{order.number}</span>
                <span
                    className={`${styles.avatar} ${isNoClient ? styles.avatar_empty : ''}`}
                >
                    {getInitials(clientName)}
                </span>
                <span className={styles.info}>
                    <span className={`${styles.name} ${isNoClient ? styles.name_muted : ''}`}>
                        {clientName}
                    </span>
                    <span className={styles.sub}>
                        {formatDate(order.created_at, 'numeric', true)} · {STATUS_TRANSLATIONS[status] ?? status}
                    </span>
                </span>
                <span className={styles.total}>{formatPrice(order.final_total_amount)}</span>
                <span className={styles.pay_col}>
                    {status === 'cancelled' ? (
                        <span className={styles.pay_cancelled}>Cancelado</span>
                    ) : (
                        <>
                            <span className={`${styles.pay_badge} ${isPaid ? styles.pay_paid : styles.pay_due}`}>
                                {isPaid ? '✓ Pagado' : `● Debe ${formatPrice(order.balance_due)}`}
                            </span>
                            {hasDebt && (
                                <span className={styles.progress}>
                                    <span className={styles.progress_bar} style={{ width: `${payPct}%` }} />
                                </span>
                            )}
                        </>
                    )}
                </span>
                <span
                    className={styles.chevron}
                    style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
                >
                    ▾
                </span>
            </div>

            {expanded && (
                <div className={styles.detail}>
                    <OrderDetails order={order} onRefresh={onRefresh} variant="panel" />
                </div>
            )}
        </div>
    );
}
