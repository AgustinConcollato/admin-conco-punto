import { faCheckCircle, faCircleNotch, faInfoCircle, faPercent, faTag, faTruck, faWallet } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { formatPrice } from "../../../../utils/formatPrice";
import styles from "./PriceBreakdown.module.css";

export function PriceBreakdown({ fees, loading, source, listingTypeLabel }) {
    if (loading) {
        return (
            <div className={styles.shell}>
                <div className={styles.loading}>
                    <FontAwesomeIcon icon={faCircleNotch} spin />
                    <span>Calculando comisiones...</span>
                </div>
            </div>
        );
    }

    if (!fees) return null;

    const netPct = fees.price > 0 ? (fees.netAmount / fees.price) * 100 : 0;
    const commPct = fees.price > 0 ? (fees.commissionAmount / fees.price) * 100 : 0;
    const shipPct = fees.price > 0 ? (fees.shippingCost / fees.price) * 100 : 0;
    const listPct = fees.price > 0 ? (fees.listingFeeAmount / fees.price) * 100 : 0;

    const isHealthy = netPct >= 70;
    const displayLabel = fees.listingTypeName ?? listingTypeLabel;

    return (
        <div className={styles.shell}>
            <div className={styles.header}>
                <span className={styles.title}>Desglose de costos</span>
                {source === "fallback" && (
                    <span className={styles.fallback_badge}>
                        <FontAwesomeIcon icon={faInfoCircle} /> Valores estimados
                    </span>
                )}
                {source === "api" && (
                    <span className={styles.api_badge}>
                        <FontAwesomeIcon icon={faCheckCircle} /> Datos oficiales ML
                    </span>
                )}
            </div>

            {/* Barra visual */}
            <div className={styles.bar_wrap}>
                <div className={styles.bar}>
                    <div className={styles.bar_net} style={{ width: `${Math.max(netPct, 0)}%` }} />
                    <div className={styles.bar_commission} style={{ width: `${commPct}%` }} />
                    {fees.shippingCost > 0 && <div className={styles.bar_shipping} style={{ width: `${shipPct}%` }} />}
                    {fees.listingFeeAmount > 0 && <div className={styles.bar_listing} style={{ width: `${listPct}%` }} />}
                </div>
                <div className={styles.bar_legend}>
                    <span className={styles.legend_net}>■ Ganancia</span>
                    <span className={styles.legend_comm}>■ Comisión</span>
                    {fees.shippingCost > 0 && <span className={styles.legend_ship}>■ Envío</span>}
                    {fees.listingFeeAmount > 0 && <span className={styles.legend_list}>■ Publicación</span>}
                </div>
            </div>

            {/* Filas */}
            <div className={styles.rows}>
                {/* Precio de venta */}
                <div className={styles.row}>
                    <span className={styles.row_label}>
                        <span className={styles.icon_wrap} data-type="price">$</span>
                        Precio de venta
                    </span>
                    <span className={styles.row_value}>{formatPrice(fees.price)}</span>
                </div>

                {/* Comisión ML — con desglose si hay fixed_fee */}
                <div className={`${styles.row} ${styles.row_deduction}`}>
                    <span className={styles.row_label}>
                        <span className={styles.icon_wrap} data-type="commission">
                            <FontAwesomeIcon icon={faPercent} />
                        </span>
                        <span>
                            Comisión ML
                            <span className={styles.sub_label}> {displayLabel} · {fees.meliPercentageFee}%</span>
                        </span>
                    </span>
                    <span className={styles.row_value_neg}>− {formatPrice((fees.price * fees.meliPercentageFee) / 100)}</span>
                </div>

                <div className={`${styles.row} ${styles.row_deduction}`}>
                    <span className={styles.row_label}>
                        <span className={styles.icon_wrap} data-type="commission">
                            <FontAwesomeIcon icon={faPercent} />
                        </span>
                        <span>
                            Cargo fijo por unidad vendida
                        </span>
                    </span>
                    <span className={styles.row_value_neg}>− {formatPrice(fees.fixedFee)}</span>
                </div>

                {/* Cargo por financiación (cuotas) — solo si > 0 */}
                {fees.financingFee > 0 && (
                    <div className={`${styles.row} ${styles.row_deduction}`}>
                        <span className={styles.row_label}>
                            <span className={styles.icon_wrap} data-type="financing">%</span>
                            Cargo por cuotas sin interés
                            <span className={styles.sub_label}> {fees.financingFee}%</span>
                        </span>
                        <span className={styles.row_value_neg}>- {formatPrice((fees.price * fees.financingFee) / 100)}</span>
                    </div>
                )}

                {/* Costo de publicación — solo si > 0 */}
                {fees.listingFeeAmount > 0 && (
                    <div className={`${styles.row} ${styles.row_deduction}`}>
                        <span className={styles.row_label}>
                            <span className={styles.icon_wrap} data-type="listing">
                                <FontAwesomeIcon icon={faTag} />
                            </span>
                            Costo de publicación
                        </span>
                        <span className={styles.row_value_neg}>− {formatPrice(fees.listingFeeAmount)}</span>
                    </div>
                )}

                {/* Envío */}
                <div className={`${styles.row} ${styles.row_deduction}`}>
                    <span className={styles.row_label}>
                        <span className={styles.icon_wrap} data-type="shipping">
                            <FontAwesomeIcon icon={faTruck} />
                        </span>
                        Costo de envío
                        {/* {fees.freeShipping && <span className={styles.free_tag}>Lo absorbés vos</span>} */}
                        {!fees.freeShipping && fees.shippingCost === 0 && <span className={styles.sub_label}>(sin envío)</span>}
                        {!fees.freeShipping && fees.shippingCost > 0 && <span className={styles.sub_label}>(estimado)</span>}
                    </span>
                    <span className={fees.freeShipping ? styles.row_value_muted : styles.row_value_neg}>
                        − {formatPrice(fees.shippingCost)}
                    </span>
                </div>

                <div className={styles.divider} />

                {/* Ganancia neta */}
                <div className={`${styles.row} ${styles.row_net}`}>
                    <span className={styles.row_label}>
                        <span className={styles.icon_wrap} data-type="net">
                            <FontAwesomeIcon icon={faWallet} />
                        </span>
                        <strong>Ganancia neta estimada</strong>
                    </span>
                    <span className={`${styles.net_amount} ${isHealthy ? styles.net_healthy : styles.net_low}`}>
                        {formatPrice(fees.netAmount)}
                        <span className={styles.net_pct}>{netPct.toFixed(0)}%</span>
                    </span>
                </div>
            </div>

            {fees.financingFee === 0 && source === "api" && (
                <p className={styles.financing_note}>
                    <FontAwesomeIcon icon={faInfoCircle} /> Si el comprador paga en cuotas, ML puede aplicar un cargo adicional.
                </p>
            )}

            {!isHealthy && fees.netAmount > 0 && (
                <div className={styles.warning}>
                    <FontAwesomeIcon icon={faInfoCircle} />
                    Margen neto bajo ({netPct.toFixed(0)}%). Considerá ajustar el precio o el tipo de publicación.
                </div>
            )}
            {fees.netAmount <= 0 && (
                <div className={styles.error_msg}>
                    <FontAwesomeIcon icon={faInfoCircle} />
                    Con este precio perdés dinero. Las comisiones superan el valor de venta.
                </div>
            )}
        </div>
    );
}