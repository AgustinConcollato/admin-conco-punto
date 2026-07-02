import { formatPrice } from '../../../../utils/formatPrice';
import styles from './PaidBreakdown.module.css';

/**
 * Muestra cómo se compone el monto ya pagado, prorrateado proporcionalmente
 * sobre la estructura del pedido (fracción = pagado / total).
 */
export function PaidBreakdown({ paidAmount, total, cost, shipping, profit, savings, embedded = false, label = 'De lo pagado' }) {
    if (!(paidAmount > 0) || !(total > 0)) return null;

    const frac = Math.min(1, paidAmount / total);
    const costPaid = cost * frac;
    const shippingPaid = shipping * frac;
    const profitPaid = profit * frac;
    const savingsPaid = savings * frac;
    const toSplitPaid = profitPaid - savingsPaid;
    const pct = Math.round(frac * 100);

    return (
        <div className={embedded ? styles.embedded : styles.box}>
            <div className={styles.head}>
                <span>{label}</span>
                <span className={styles.pct}>{pct}% del total</span>
            </div>
            <div className={styles.rows}>
                <div className={styles.row}>
                    <span className={styles.key}>Costo</span>
                    <span className={`${styles.val} ${styles.red}`}>−{formatPrice(costPaid)}</span>
                </div>
                <div className={styles.row}>
                    <span className={styles.key}>Envío</span>
                    <span className={styles.val}>{formatPrice(shippingPaid)}</span>
                </div>
                <div className={`${styles.row} ${styles.sep}`}>
                    <span className={styles.key_bold}>Ganancia</span>
                    <span className={`${styles.val} ${styles.green}`}>{formatPrice(profitPaid)}</span>
                </div>
                <div className={styles.row}>
                    <span className={styles.key}>Reinversión (10%)</span>
                    <span className={styles.val}>{formatPrice(savingsPaid)}</span>
                </div>
                <div className={styles.row}>
                    <span className={styles.key_bold}>A dividir</span>
                    <span className={`${styles.val} ${styles.blue}`}>{formatPrice(toSplitPaid)}</span>
                </div>
            </div>
        </div>
    );
}
