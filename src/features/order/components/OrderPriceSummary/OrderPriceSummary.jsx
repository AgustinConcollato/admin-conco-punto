import { InfoTooltip } from "../../../../components/InfoTooltip/InfoTooltip";
import { formatPrice } from "../../../../utils/formatPrice";
import { FINANCIAL_GLOSSARY } from "../../glossary";
import styles from './OrderPriceSummary.module.css';

export function OrderPriceSummary({ order }) {
    const profit = parseFloat(order.final_total_amount) - parseFloat(order.shipping_cost) - parseFloat(order.total_cost || 0);
    const savings = profit * 0.10;

    return (
        <div className={styles.grid}>
            {/* ── Resumen de precios ── */}
            <div className={styles.card}>
                <p className={styles.card_label}>Resumen de precios</p>
                <div className={styles.row}>
                    <span className={styles.row_label}>Subtotal</span>
                    <span className={styles.row_value}>{formatPrice(order.total_amount)}</span>
                </div>
                <div className={styles.row}>
                    <span className={styles.row_label}>Descuento</span>
                    <span className={styles.row_value}>
                        {`${order.discount_percentage == '0.00' ? 0 : order.discount_percentage}% / ${formatPrice(order.discount_fixed_amount)}`}
                    </span>
                </div>
                <div className={styles.row}>
                    <span className={styles.row_label}>Costo de envío</span>
                    <span className={styles.row_value}>{formatPrice(order.shipping_cost)}</span>
                </div>
                <div className={styles.total_row}>
                    <span>Total</span>
                    <span>{formatPrice(order.final_total_amount)}</span>
                </div>
            </div>

            {/* ── Desglose financiero ── */}
            <div className={styles.card}>
                <p className={styles.card_label}>Desglose financiero</p>
                <div className={styles.row}>
                    <span className={styles.row_label}>Total facturado <InfoTooltip text={FINANCIAL_GLOSSARY.invoiced} /></span>
                    <span className={styles.row_value}>{formatPrice(order.final_total_amount)}</span>
                </div>
                <div className={styles.row}>
                    <span className={styles.row_label}>Costo <InfoTooltip text={FINANCIAL_GLOSSARY.cost} /></span>
                    <span className={`${styles.row_value} ${styles.val_red}`}>−{formatPrice(order.total_cost)}</span>
                </div>
                <div className={styles.row}>
                    <span className={styles.row_label}>Envío <InfoTooltip text={FINANCIAL_GLOSSARY.shipping} /></span>
                    <span className={styles.row_value}>{formatPrice(order.shipping_cost)}</span>
                </div>
                <div className={styles.row}>
                    <span className={styles.row_label_bold}>Ganancia <InfoTooltip text={FINANCIAL_GLOSSARY.profit} /></span>
                    <span className={styles.val_green}>{formatPrice(profit)}</span>
                </div>
                <div className={styles.row}>
                    <span className={styles.row_label}>Reinversión (10%) <InfoTooltip text={FINANCIAL_GLOSSARY.reinvest} /></span>
                    <span className={styles.row_value}>{formatPrice(savings)}</span>
                </div>
                <div className={styles.row}>
                    <span className={styles.row_label_bold}>A dividir <InfoTooltip text={FINANCIAL_GLOSSARY.toSplit} /></span>
                    <span className={styles.val_blue}>{formatPrice(profit - savings)}</span>
                </div>
            </div>
        </div>
    );
}
