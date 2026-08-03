import { formatPrice } from "../../../../utils/formatPrice";
import styles from "./FinanceBreakdown.module.css";

export function FinanceBreakdown({ title, subtitle, cost, shipping, profit, savings, toSplit, actions = null }) {
    return (
        <div className={styles.card}>
            <div className={styles.head}>
                <div>
                    <div className={styles.title}>{title}</div>
                    {subtitle && <div className={styles.subtitle}>{subtitle}</div>}
                </div>
                {actions}
            </div>
            <div className={styles.rows}>
                <div className={styles.row}>
                    <span className={styles.key}>Costo</span>
                    <span className={`${styles.val} ${styles.red}`}>−{formatPrice(cost)}</span>
                </div>
                <div className={styles.row}>
                    <span className={styles.key}>Envío</span>
                    <span className={styles.val}>{formatPrice(shipping)}</span>
                </div>
                <div className={`${styles.row} ${styles.sep}`}>
                    <span className={styles.key_bold}>Ganancia</span>
                    <span className={`${styles.val} ${styles.green}`}>{formatPrice(profit)}</span>
                </div>
                <div className={styles.row}>
                    <span className={styles.key}>Reinversión (10%)</span>
                    <span className={styles.val}>{formatPrice(savings)}</span>
                </div>
                <div className={styles.row}>
                    <span className={styles.key_bold}>A dividir</span>
                    <span className={`${styles.val} ${styles.blue}`}>{formatPrice(toSplit)}</span>
                </div>
            </div>
        </div>
    );
}
