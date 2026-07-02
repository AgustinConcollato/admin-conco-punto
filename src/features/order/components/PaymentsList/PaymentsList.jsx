import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBuildingColumns, faChevronDown, faCreditCard, faMoneyBillWave, faMoneyCheckDollar } from '@fortawesome/free-solid-svg-icons';
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
    const [openIds, setOpenIds] = useState(() => new Set());

    if (completed.length === 0) return null;

    const toggle = (key) => {
        setOpenIds(prev => {
            const next = new Set(prev);
            next.has(key) ? next.delete(key) : next.add(key);
            return next;
        });
    };

    return (
        <ul className={styles.list}>
            {completed.map((p, i) => {
                const m = METHODS[p.payment_method] || { label: p.payment_method, icon: faMoneyBillWave, color: '#64748b', bg: '#f1f5f9' };
                const key = p.id ?? i;
                const isOpen = openIds.has(key);
                const canExpand = !!breakdown;

                return (
                    <li key={key} className={styles.card}>
                        <button
                            type="button"
                            className={`${styles.header} ${canExpand ? styles.clickable : ''}`}
                            onClick={canExpand ? () => toggle(key) : undefined}
                            aria-expanded={canExpand ? isOpen : undefined}
                        >
                            <span className={styles.icon} style={{ background: m.bg, color: m.color }}>
                                <FontAwesomeIcon icon={m.icon} />
                            </span>
                            <div className={styles.info}>
                                <span className={styles.method}>{m.label}</span>
                                <span className={styles.date}>{formatDate(p.payment_date ?? p.created_at, 'short', true)}</span>
                            </div>
                            <span className={styles.amount}>{formatPrice(p.amount)}</span>
                            {canExpand && (
                                <FontAwesomeIcon
                                    icon={faChevronDown}
                                    className={`${styles.chevron} ${isOpen ? styles.chevron_open : ''}`}
                                />
                            )}
                        </button>
                        {canExpand && isOpen && (
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
