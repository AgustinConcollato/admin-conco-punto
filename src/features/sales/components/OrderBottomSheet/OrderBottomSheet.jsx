import { faCircleNotch, faChevronUp, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext, useMemo, useState } from "react";
import { Modal } from "../../../../components/Modal/Modal";
import { ConfirmModal } from "../../../../components/ConfirmModal/ConfirmModal";
import { OrderContext } from "../../../../context/OrderContext";
import { OrderService } from "../../../../services/order/orderService";
import { formatPrice } from "../../../../utils/formatPrice";
import { formatDate } from "../../../../utils/formatDate";
import { CreatePayment } from "../../../payment/components/CreatePayment/CreatePayment";
import { EditDiscount } from "../EditDiscount/EditDiscount";
import { EditShippingCost } from "../EditShippingCost/EditShippingCost";
import { LogisticsStepper } from "../LogisticsStepper/LogisticsStepper";
import summary from "../Summary/Summary.module.css";
import styles from "./OrderBottomSheet.module.css";

const PAYMENT_METHODS = [
    { value: 'cash', label: 'Efectivo' },
    { value: 'transfer', label: 'Transferencia Bancaria' },
    { value: 'credit_card', label: 'Tarjeta de Crédito' },
    { value: 'check', label: 'Cheque' },
];

const STATUS_LABELS = {
    pending: 'Pendiente',
    processing: 'Preparación',
    confirmed: 'Terminado',
    shipped: 'Enviado',
    delivered: 'Entregado',
    cancelled: 'Cancelado',
};

// Próximo paso logístico disponible desde cada estado (mismo flujo que el resumen de escritorio).
const NEXT_ACTION = {
    pending: { next: 'processing', label: 'Aceptar y empezar preparación' },
    processing: { next: 'confirmed', label: 'Marcar terminado' },
    confirmed: { next: 'shipped', label: 'Despachar / enviar' },
    shipped: { next: 'delivered', label: 'Confirmar entrega' },
};

export function OrderBottomSheet({ expanded, onToggle }) {
    const { getOrder, order } = useContext(OrderContext);
    const orderService = useMemo(() => new OrderService(), []);

    const [showModal, setShowModal] = useState(false);
    const [editShippingCost, setEditShippingCost] = useState(false);
    const [editDiscount, setEditDiscount] = useState(false);
    const [loading, setLoading] = useState(false);
    const [confirmCancel, setConfirmCancel] = useState(false);

    if (!order) return null;

    const isPaid = order.balance_due <= 0;
    const totalItems = order.details.reduce((sum, d) => sum + d.quantity, 0);
    const statusLabel = STATUS_LABELS[order.status] ?? order.status;
    const nextAction = NEXT_ACTION[order.status];

    const handlePaymentRecorded = () => {
        getOrder(order.id);
        setShowModal(false);
    };

    const updateStatus = async (newStatus) => {
        setLoading(true);
        try {
            await orderService.updateOrderHeader(order.id, { status: newStatus });
            getOrder(order.id);
        } catch (error) {
            console.error("Error al actualizar estado:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {expanded && <div className={styles.scrim} onClick={onToggle} />}

            <div className={`${styles.sheet} ${expanded ? styles.sheet_expanded : styles.sheet_collapsed}`}>
                {expanded ? (
                    <>
                        {/* ── Header ── */}
                        <div className={styles.header}>
                            <div className={styles.handle} onClick={onToggle} />
                            <div className={styles.header_row}>
                                {order.number != null && (
                                    <span className={styles.header_title}>Pedido #{order.number}</span>
                                )}
                                <div className={styles.header_right}>
                                    <button className={styles.chevron_btn} onClick={onToggle} aria-label="Contraer resumen">
                                        <FontAwesomeIcon icon={faChevronDown} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* ── Cuerpo scrolleable ── */}
                        <div className={styles.body}>
                            {order.client && (
                                <div className={summary.section}>
                                    <p className={summary.section_label}>Cliente</p>
                                    <div className={summary.row}>
                                        <span className={summary.row_label}>Nombre</span>
                                        <span className={summary.row_value}>{order.client.name}</span>
                                    </div>
                                    {order.client.email && (
                                        <div className={summary.row}>
                                            <span className={summary.row_label}>Email</span>
                                            <span className={summary.row_value}>{order.client.email}</span>
                                        </div>
                                    )}
                                    {order.client.phone && (
                                        <div className={summary.row}>
                                            <span className={summary.row_label}>Teléfono</span>
                                            <span className={summary.row_value}>{order.client.phone}</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className={summary.section}>
                                <p className={summary.section_label}>Productos</p>
                                <div className={summary.row}>
                                    <span className={summary.row_label}>Ítems distintos</span>
                                    <span className={summary.row_value}>{order.details.length}</span>
                                </div>
                                <div className={summary.row}>
                                    <span className={summary.row_label}>Total de unidades</span>
                                    <span className={summary.row_value}>{totalItems}</span>
                                </div>
                            </div>

                            <div className={summary.section}>
                                <p className={summary.section_label}>Resumen de precios</p>
                                <div className={summary.row}>
                                    <span className={summary.row_label}>Subtotal</span>
                                    <span className={summary.row_value}>{formatPrice(order.total_amount)}</span>
                                </div>
                                <div className={summary.row}>
                                    <span className={summary.row_label}>Descuento</span>
                                    <div className={summary.row_value_group}>
                                        <span className={summary.row_value}>
                                            {`${order.discount_percentage == '0.00' ? 0 : order.discount_percentage}% / ${formatPrice(order.discount_fixed_amount)}`}
                                        </span>
                                        <button className={summary.edit_link} onClick={() => setEditDiscount(true)}>Editar</button>
                                    </div>
                                </div>
                                <div className={summary.row}>
                                    <span className={summary.row_label}>Costo de envío</span>
                                    <div className={summary.row_value_group}>
                                        <span className={summary.row_value}>{formatPrice(order.shipping_cost)}</span>
                                        <button className={summary.edit_link} onClick={() => setEditShippingCost(true)}>Editar</button>
                                    </div>
                                </div>
                                <div className={summary.total_row}>
                                    <span>Total</span>
                                    <span>{formatPrice(order.final_total_amount)}</span>
                                </div>
                            </div>

                            {order.details.length > 0 && (
                                <div className={summary.section}>
                                    <p className={summary.section_label}>Estado financiero</p>
                                    {order.payments.map(payment => (
                                        <div key={payment.id} className={summary.row}>
                                            <span className={summary.row_label}>
                                                {PAYMENT_METHODS.find(m => m.value === payment.payment_method)?.label}
                                            </span>
                                            <span className={summary.row_value}>
                                                <small>{formatDate(payment.created_at, 'numeric')}</small> {formatPrice(payment.amount)}
                                            </span>
                                        </div>
                                    ))}
                                    {isPaid ? (
                                        <p className={summary.paid_badge}>Totalmente pagado</p>
                                    ) : (
                                        <div className={summary.row} style={{ marginTop: 6 }}>
                                            <span className={summary.row_label}>Saldo pendiente</span>
                                            <span className={summary.balance_due}>{formatPrice(order.balance_due)}</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            <LogisticsStepper status={order.status} />
                        </div>

                        {/* ── Acciones fijas ── */}
                        <div className={styles.footer}>
                            {order.status === 'delivered' && (
                                <p className={`${summary.outcome_banner} ${summary.outcome_success}`}>Pedido completado con éxito</p>
                            )}
                            {order.status === 'cancelled' && (
                                <p className={`${summary.outcome_banner} ${summary.outcome_cancelled}`}>Pedido cancelado</p>
                            )}

                            {order.status !== 'cancelled' && order.status !== 'delivered' && (
                                <div className={styles.footer_buttons}>
                                    {!isPaid && (
                                        <button className={styles.btn_secondary} onClick={() => setShowModal(true)}>
                                            Registrar pago
                                        </button>
                                    )}
                                    {nextAction && order.details.length > 0 && (
                                        <button
                                            className={styles.btn_primary}
                                            onClick={() => updateStatus(nextAction.next)}
                                            disabled={loading}
                                        >
                                            {loading ? <FontAwesomeIcon icon={faCircleNotch} spin /> : nextAction.label}
                                        </button>
                                    )}
                                </div>
                            )}

                            {!isPaid && order.status === 'delivered' && (
                                <button className={styles.btn_secondary} onClick={() => setShowModal(true)}>
                                    Registrar pago
                                </button>
                            )}

                            {['pending', 'processing', 'confirmed'].includes(order.status) && (
                                <button className={`${styles.cancel_link} btn btn_error_regular`} onClick={() => setConfirmCancel(true)} disabled={loading}>
                                    Cancelar pedido
                                </button>
                            )}
                        </div>
                    </>
                ) : (
                    /* ── Peek (colapsada) ── */
                    <button className={styles.peek} onClick={onToggle}>
                        <div className={styles.handle} />
                        <div className={styles.peek_row}>
                            <div className={styles.peek_left}>
                                {order.number != null && (
                                    <span className={styles.peek_title}>Pedido #{order.number}
                                    </span>
                                )}
                                <span className={`${styles.status_badge} ${order.status === 'delivered' ? styles.status_badge_green : ''} ${order.status === 'cancelled' ? styles.status_badge_red : ''}`}>
                                    {statusLabel.toUpperCase()}
                                </span>
                            </div>
                            <div className={styles.peek_right}>
                                <div className={styles.peek_total_block}>
                                    <span className={styles.peek_total_label}>TOTAL</span>
                                    <span className={styles.peek_total_value}>{formatPrice(order.final_total_amount)}</span>
                                </div>
                                <span className={styles.chevron_btn}>
                                    <FontAwesomeIcon icon={faChevronUp} />
                                </span>
                            </div>
                        </div>
                    </button>
                )}
            </div>

            {showModal && (
                <Modal onClose={() => setShowModal(false)} title="Registrar pago">
                    <CreatePayment orderId={order.id} balanceDue={order.balance_due} onSuccess={handlePaymentRecorded} />
                </Modal>
            )}
            {editDiscount && (
                <Modal onClose={() => setEditDiscount(false)} title="Editar descuento">
                    <EditDiscount
                        orderId={order.id}
                        currentPercentage={order.discount_percentage}
                        currentFixed={order.discount_fixed_amount}
                        onSuccess={() => { getOrder(order.id); setEditDiscount(false); }}
                    />
                </Modal>
            )}
            {editShippingCost && (
                <Modal onClose={() => setEditShippingCost(false)} title="Editar costo de envío">
                    <EditShippingCost
                        orderId={order.id}
                        currentCost={order.shipping_cost}
                        onSuccess={() => { getOrder(order.id); setEditShippingCost(false); }}
                    />
                </Modal>
            )}
            {confirmCancel && (
                <ConfirmModal
                    message="¿Estás seguro de que quieres cancelar este pedido?"
                    onConfirm={() => { updateStatus('cancelled'); setConfirmCancel(false); }}
                    onCancel={() => setConfirmCancel(false)}
                />
            )}
        </>
    );
}
