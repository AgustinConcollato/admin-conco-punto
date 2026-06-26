import {
    faArrowDown,
    faCheckCircle,
    faCircleNotch,
    faClock,
    faHandshake,
    faMoneyBillTrendUp,
    faPiggyBank,
    faTruck
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Modal } from '../../../../components/Modal/Modal';
import { downloadOrderPdf } from '../../../../utils/downloadOrderPdf';
import { formatDate } from '../../../../utils/formatDate';
import { formatPrice } from '../../../../utils/formatPrice';
import { CreatePayment } from '../../../payment/components/CreatePayment/CreatePayment';
import { OrderStatusAction } from '../OrderStatusAction/OrderStatusAction';
import styles from './OrderCard.module.css';

const PAYMENT_METHODS = {
    cash: 'Efectivo',
    transfer: 'Transferencia',
    credit_card: 'Tarjeta de crédito/débito',
    check: 'Cheque',
};

export function OrderDetails({ order, onRefresh, variant = 'card' }) {
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const clientName = order.client?.name || 'No asignado';
    const profit = parseFloat(order.final_total_amount) - parseFloat(order.shipping_cost) - parseFloat(order.total_cost || 0);
    const savings = profit * 0.10;
    const isPaid = order.balance_due <= 0;
    const notCancelled = order.status !== 'cancelled';
    const showStatus = order.status !== 'cancelled' && order.status !== 'delivered';

    const downloadPDF = async () => {
        setLoading(true);
        try {
            await downloadOrderPdf(order.id, clientName);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const paymentModal = showModal && (
        <Modal onClose={() => setShowModal(false)} title="Registrar pago">
            <CreatePayment orderId={order.id} balanceDue={order.balance_due} onSuccess={(result) => {
                setShowModal(false);
                onRefresh?.(result?.order ?? null);
            }} />
        </Modal>
    );

    // ── Variante panel (fila expandida): 2 columnas ──
    if (variant === 'panel') {
        const paidAmount = parseFloat(order.final_total_amount) - order.balance_due;
        const payPct = parseFloat(order.final_total_amount) > 0
            ? Math.round((paidAmount / parseFloat(order.final_total_amount)) * 100)
            : 0;

        return (
            <div className={styles.panel_grid}>
                {/* Columna izquierda: desglose financiero */}
                <div className={styles.panel_col}>
                    <div className={styles.panel_label}>Desglose financiero</div>
                    <div className={styles.breakdown}>
                        <div className={styles.breakdown_row}>
                            <span className={styles.breakdown_key}>Total facturado</span>
                            <span className={styles.breakdown_val}>{formatPrice(order.final_total_amount)}</span>
                        </div>
                        <div className={styles.breakdown_row}>
                            <span className={styles.breakdown_key}>Costo</span>
                            <span className={`${styles.breakdown_val} ${styles.val_red}`}>−{formatPrice(order.total_cost)}</span>
                        </div>
                        <div className={styles.breakdown_row}>
                            <span className={styles.breakdown_key}>Envío</span>
                            <span className={styles.breakdown_val}>{formatPrice(order.shipping_cost)}</span>
                        </div>
                        <div className={`${styles.breakdown_row} ${styles.breakdown_sep}`}>
                            <span className={styles.breakdown_key_bold}>Ganancia</span>
                            <span className={styles.val_green}>{formatPrice(profit)}</span>
                        </div>
                        <div className={styles.breakdown_row}>
                            <span className={styles.breakdown_key}>Reinversión (10%)</span>
                            <span className={styles.breakdown_val}>{formatPrice(savings)}</span>
                        </div>
                        <div className={styles.breakdown_row}>
                            <span className={styles.breakdown_key_bold}>A dividir</span>
                            <span className={styles.val_blue}>{formatPrice(profit - savings)}</span>
                        </div>
                    </div>
                </div>

                {/* Columna derecha: pagos + acciones */}
                <div className={styles.panel_col}>
                    <div className={styles.panel_label}>Pagos</div>

                    {notCancelled && !isPaid && (
                        <div className={styles.debt_card}>
                            <div className={styles.debt_row}>
                                <span className={styles.debt_key}>Pagado</span>
                                <span className={styles.debt_val}>{formatPrice(paidAmount)}</span>
                            </div>
                            <div className={styles.debt_progress}>
                                <span className={styles.debt_bar} style={{ width: `${payPct}%` }} />
                            </div>
                            <div className={styles.debt_row}>
                                <span className={styles.debt_pending}>Saldo pendiente</span>
                                <span className={styles.debt_pending_val}>{formatPrice(order.balance_due)}</span>
                            </div>
                        </div>
                    )}

                    {notCancelled && isPaid && (
                        <div className={styles.paid_card}>
                            ✓ Pedido cobrado por completo
                        </div>
                    )}

                    <div className={styles.panel_actions}>
                        {!isPaid && notCancelled && (
                            <button className={styles.panel_btn_primary} onClick={() => setShowModal(true)}>
                                Registrar pago
                            </button>
                        )}
                        <Link to={`/ventas/${order.id}`} className={styles.panel_btn_secondary}>
                            Ver pedido
                        </Link>
                        <button className={styles.panel_btn_ghost} onClick={downloadPDF} disabled={loading}>
                            {loading ? <FontAwesomeIcon icon={faCircleNotch} spin /> : 'Descargar detalle'}
                        </button>
                        {showStatus && <OrderStatusAction order={order} onUpdated={onRefresh} row />}
                    </div>
                </div>

                {paymentModal}
            </div>
        );
    }

    // ── Variante card (grilla): cuerpo vertical ──
    return (
        <>
            {/* Análisis Financiero */}
            <div className={styles.section}>
                <h4 className={styles.section_title}>Análisis Financiero</h4>
                <div className={styles.finance_item}>
                    <FontAwesomeIcon icon={faArrowDown} className={styles.icon_cost} />
                    <span>Costo: {formatPrice(order.total_cost)}</span>
                </div>
                <div className={styles.finance_item}>
                    <FontAwesomeIcon icon={faTruck} className={styles.icon_shipping} />
                    <span>Enví­o: {formatPrice(order.shipping_cost)}</span>
                </div>
                <div className={styles.finance_item}>
                    <FontAwesomeIcon icon={faMoneyBillTrendUp} className={styles.icon_profit} />
                    <span>Ganancia: {formatPrice(profit)}</span>
                </div>
                <div className={`${styles.finance_item} ${styles.savings}`}>
                    <span className={styles.l_connector}>└</span>
                    <FontAwesomeIcon icon={faPiggyBank} className={styles.icon_savings} />
                    <span className={styles.savings_text}>*Reinversión (10%): {formatPrice(savings)}</span>
                </div>
                <div className={`${styles.finance_item} ${styles.savings}`}>
                    <span className={styles.l_connector}>└</span>
                    <FontAwesomeIcon icon={faHandshake} className={styles.icon_savings} />
                    <span className={styles.savings_text}>*Ganancias a dividir: {formatPrice(profit - savings)}</span>
                </div>
            </div>

            {/* Pagos Realizados */}
            <div className={styles.section}>
                <h4 className={styles.section_title}>
                    Pagos Realizados
                    {notCancelled &&
                        <span className={isPaid ? styles.paid_tag : styles.pending_payment_tag}>
                            <FontAwesomeIcon icon={isPaid ? faCheckCircle : faClock} />
                            {isPaid ? ' PAGADO' : ' DEBE ' + formatPrice(order.balance_due)}
                        </span>
                    }
                </h4>
                <ul className={styles.payment_list}>
                    {order.payments.length == 0 ?
                        <p className={styles.no_payments}>
                            No se realizaron pagos
                            {!isPaid && notCancelled && (
                                <button className={styles.btn_pay} onClick={() => setShowModal(true)}>
                                    Registrar pago
                                </button>
                            )}
                        </p> :
                        <>
                            {order.payments.map((payment, index) => (
                                <li key={index} className={styles.payment_item}>
                                    <div>
                                        <b> {formatPrice(payment.amount)} </b>
                                        <span>{PAYMENT_METHODS[payment.payment_method] || payment.payment_method}</span>
                                    </div>
                                    <small>{formatDate(payment.created_at, 'numeric')}</small>
                                </li>
                            ))}
                            {!isPaid && notCancelled && (
                                <button className={styles.btn_pay} onClick={() => setShowModal(true)}>
                                    Registrar pago
                                </button>
                            )}
                        </>
                    }
                </ul>
            </div>

            {/* Botones de Acción */}
            <div className={styles.actions}>
                <button
                    className={"btn btn_solid"}
                    onClick={downloadPDF}
                    disabled={loading}
                >
                    {loading ? <FontAwesomeIcon icon={faCircleNotch} spin /> : 'Descargar detalle'}
                </button>
                <Link to={`/ventas/${order.id}`} className={'btn'}>
                    Ver pedido
                </Link>
            </div>

            {/* Cambio de estado rápido */}
            {showStatus && (
                <div className={styles.status_action}>
                    <OrderStatusAction order={order} onUpdated={onRefresh} />
                </div>
            )}

            {paymentModal}
        </>
    );
}
