import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBuildingColumns, faCreditCard, faMoneyBillWave, faMoneyCheckDollar } from '@fortawesome/free-solid-svg-icons';
import { formatDate } from '../../../../utils/formatDate';
import { formatPrice } from '../../../../utils/formatPrice';
import { PaidBreakdown } from '../PaidBreakdown/PaidBreakdown';
import styles from './PaymentsList.module.css';

const METHODS = {
    cash: { label: 'Efectivo', icon: faMoneyBillWave, color: '#16a34a', bg: '#e7f7ee' },
    transfer: { label: 'Transferencia', icon: faBuildingColumns, color: '#2563eb', bg: '#e8f0fe' },
    credit_card: { label: 'Tarjeta', icon: faCreditCard, color: '#7c3aed', bg: '#f0eafd' },
    check: { label: 'Cheque', icon: faMoneyCheckDollar, color: '#d97706', bg: '#fdf0dc' },
};

export function PaymentsList({ payments, breakdown = null }) {
    const completed = (payments ?? []).filter(p => (p.status ?? 'completed') === 'completed');

    if (completed.length === 0) return null;

    return (
        <ul className={styles.list}>
            {completed.map((p, i) => {
                const m = METHODS[p.payment_method] || { label: p.payment_method, icon: faMoneyBillWave, color: '#64748b', bg: '#f1f5f9' };
                return (
                    <li key={p.id ?? i} className={styles.card}>
                        <div className={styles.header}>
                            <span className={styles.icon} style={{ background: m.bg, color: m.color }}>
                                <FontAwesomeIcon icon={m.icon} />
                            </span>
                            <div className={styles.info}>
                                <span className={styles.method}>{m.label}</span>
                                <span className={styles.date}>{formatDate(p.payment_date ?? p.created_at, 'short', true)}</span>
                            </div>
                            <span className={styles.amount}>{formatPrice(p.amount)}</span>
                        </div>
                        {breakdown && (
                            <PaidBreakdown
                                embedded
                                label="Este pago"
                                paidAmount={parseFloat(p.amount)}
                                total={breakdown.total}
                                cost={breakdown.cost}
                                shipping={breakdown.shipping}
                                profit={breakdown.profit}
                                savings={breakdown.savings}
                            />
                        )}
                    </li>
                );
            })}
        </ul>
    );
}
