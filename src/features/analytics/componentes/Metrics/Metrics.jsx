import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowDown, faArrowUp } from "@fortawesome/free-solid-svg-icons";
import { formatPrice } from "../../../../utils/formatPrice";
import styles from './Metrics.module.css';

function ChangeIndicator({ comparison, metricKey, isMonetary, comparisonLabel }) {
    if (!comparison?.[metricKey]) return null;
    const { percent_change, current, previous, diff } = comparison[metricKey];
    if (percent_change === null || percent_change === undefined) return null;

    const isPositive = percent_change >= 0;
    const fmt = (v) => isMonetary ? formatPrice(Number(v)) : v;

    return (
        <div className={styles.change_wrap}>
            <div className={`${styles.change} ${isPositive ? styles.change_up : styles.change_down}`}>
                <FontAwesomeIcon icon={isPositive ? faArrowUp : faArrowDown} />
                <span>{Math.abs(percent_change).toFixed(1)}%</span>
                {comparisonLabel && (
                    <span className={styles.change_label}>vs. {comparisonLabel}</span>
                )}
            </div>
            {/* Tooltip detalle */}
            <div className={styles.change_tooltip}>
                <div className={styles.tooltip_row}>
                    <span>Actual</span>
                    <strong>{fmt(current)}</strong>
                </div>
                <div className={styles.tooltip_row}>
                    <span>Anterior</span>
                    <strong>{fmt(previous)}</strong>
                </div>
                <div className={styles.tooltip_row}>
                    <span>Diferencia</span>
                    <strong>{isPositive ? '+' : ''}{fmt(diff)}</strong>
                </div>
            </div>
        </div>
    );
}

export function Metrics({ data, comparison }) {
    const label = data?.comparison_label || null;

    const keyCards = [
        { label: 'Total facturado', value: formatPrice(data.total_revenue), compKey: 'total_revenue', accent: 'blue', isMonetary: true },
        { label: 'Cobrado en período', value: formatPrice(data.total_collected_in_period ?? 0), accent: 'green', isMonetary: true },
        { label: 'Ganancia según facturación', value: formatPrice(data.net_profit), compKey: 'net_profit', isMonetary: true },
        { label: 'Total de pedidos', value: data.orders_count, compKey: 'orders_count', isMonetary: false },
    ];

    const secondaryRows = [
        { label: 'Dinero a cobrar', value: formatPrice(data.total_debt) },
        { label: 'Costo mercadería', value: formatPrice(data.total_cost) },
        { label: 'Envíos cobrados', value: formatPrice(data.shipping_cost) },
        { label: 'Reinversión (10%)', value: formatPrice(data.reinvestment_amount) },
        { label: 'Ticket promedio', value: formatPrice(data.average_order_value) },
        { label: 'Margen bruto', value: `${data.gross_margin_percent}%` },
    ];

    return (
        <div className={styles.wrapper}>
            <div className={styles.key_cards}>
                {keyCards.map((card) => (
                    <div
                        key={card.label}
                        className={`${styles.card} 
                        ${card.accent === 'green' ?
                                styles.card_green :
                                card.accent === 'blue' ? styles.card_blue :
                                    ''}
                            ` }
                    >
                        <p className={styles.card_label}>{card.label}</p>
                        <p className={styles.card_value}>{card.value}</p>
                        {card.compKey && (
                            <ChangeIndicator
                                comparison={comparison}
                                metricKey={card.compKey}
                                isMonetary={card.isMonetary}
                                comparisonLabel={label}
                            />
                        )}
                    </div>
                ))}
            </div>

            <div className={styles.secondary}>
                {secondaryRows.map((row) => (
                    <div key={row.label} className={styles.secondary_item}>
                        <span className={styles.secondary_label}>{row.label}</span>
                        <span className={styles.secondary_value}>{row.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
