import { faCircleNotch, faCheck } from "@fortawesome/free-solid-svg-icons";
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
import styles from "./Summary.module.css";

const PAYMENT_METHODS = [
    { value: 'cash', label: 'Efectivo' },
    { value: 'transfer', label: 'Transferencia Bancaria' },
    { value: 'credit_card', label: 'Tarjeta de CrÃ©dito' },
    { value: 'check', label: 'Cheque' },
];

export const ORDER_STATUSES = [
    { value: 'pending', label: 'Pendiente' },
    { value: 'processing', label: 'En PreparaciÃ³n' },
    { value: 'confirmed', label: 'Terminado' },
    { value: 'shipped', label: 'Enviado' },
    { value: 'delivered', label: 'Entregado' },
    { value: 'cancelled', label: 'Cancelado' },
];

const LOGISTICS_STEPS = [
    { value: 'pending', label: 'Pendiente' },
    { value: 'processing', label: 'PreparaciÃ³n' },
    { value: 'confirmed', label: 'Listo' },
    { value: 'shipped', label: 'Enviado' },
    { value: 'delivered', label: 'Entregado' },
];

export function Summary() {

    const { getOrder, order } = useContext(OrderContext);
    const orderService = useMemo(() => new OrderService(), []);

    const [showModal, setShowModal] = useState(false);
    const [editShippingCost, setEditShippingCost] = useState(false);
    const [editDiscount, setEditDiscount] = useState(false);
    const [loading, setLoading] = useState(false);
    const [confirmCancel, setConfirmCancel] = useState(false);

    if (!order) return <p>No se encontrÃ³ informaciÃ³n de la orden.</p>;

    const isPaid = order.balance_due <= 0;
    const totalItems = order.details.reduce((sum, d) => sum + d.quantity, 0);
    const currentStatusLabel = ORDER_STATUSES.find(s => s.value === order.status)?.label;

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
            <div className={styles.order_summary_card}>

                {/* â”€â”€ Cliente â”€â”€ */}
                {order.client && (
                    <div className={styles.section}>
                        <p className={styles.section_label}>Cliente</p>
                        <div className={styles.row}>
                            <span className={styles.row_label}>Nombre</span>
                            <span className={styles.row_value}>{order.client.name}</span>
                        </div>
                        {order.client.email && (
                            <div className={styles.row}>
                                <span className={styles.row_label}>Email</span>
                                <span className={styles.row_value}>{order.client.email}</span>
                            </div>
                        )}
                        {order.client.phone && (
                            <div className={styles.row}>
                                <span className={styles.row_label}>TelÃ©fono</span>
                                <span className={styles.row_value}>{order.client.phone}</span>
                            </div>
                        )}
                    </div>
                )}

                {/* â”€â”€ Productos â”€â”€ */}
                <div className={styles.section}>
                    <p className={styles.section_label}>Productos</p>
                    <div className={styles.row}>
                        <span className={styles.row_label}>Ãtems distintos</span>
                        <span className={styles.row_value}>{order.details.length}</span>
                    </div>
                    <div className={styles.row}>
                        <span className={styles.row_label}>Total de unidades</span>
                        <span className={styles.row_value}>{totalItems}</span>
                    </div>
                </div>

                {/* â”€â”€ Precios â”€â”€ */}
                <div className={styles.section}>
                    <p className={styles.section_label}>Resumen de precios</p>
                    <div className={styles.row}>
                        <span className={styles.row_label}>Subtotal</span>
                        <span className={styles.row_value}>{formatPrice(order.total_amount)}</span>
                    </div>
                    <div className={styles.row}>
                        <span className={styles.row_label}>Descuento</span>
                        <div className={styles.row_value_group}>
                            <span className={styles.row_value}>
                                {`${order.discount_percentage == '0.00' ? 0 : order.discount_percentage}% / ${formatPrice(order.discount_fixed_amount)}`}
                            </span>
                            <button className={styles.edit_link} onClick={() => setEditDiscount(true)}>Editar</button>
                        </div>
                    </div>
                    <div className={styles.row}>
                        <span className={styles.row_label}>Costo de envÃ­o</span>
                        <div className={styles.row_value_group}>
                            <span className={styles.row_value}>{formatPrice(order.shipping_cost)}</span>
                            <button className={styles.edit_link} onClick={() => setEditShippingCost(true)}>Editar</button>
                        </div>
                    </div>
                    <div className={styles.total_row}>
                        <span>Total</span>
                        <span>{formatPrice(order.final_total_amount)}</span>
                    </div>
                </div>

                {/* â”€â”€ Estado financiero â”€â”€ */}
                {order.details.length > 0 && (
                    <div className={styles.section}>
                        <p className={styles.section_label}>Estado financiero</p>
                        {order.payments.map(payment => (
                            <div key={payment.id} className={styles.row}>
                                <span className={styles.row_label}>
                                    {PAYMENT_METHODS.find(m => m.value === payment.payment_method)?.label}
                                </span>
                                <span className={styles.row_value}><small>{formatDate(payment.created_at, 'numeric')}</small> {formatPrice(payment.amount)}</span>
                            </div>
                        ))}
                        {isPaid ? (
                            <p className={styles.paid_badge}>Totalmente pagado</p>
                        ) : (
                            <div className={styles.row} style={{ marginTop: 6 }}>
                                <span className={styles.row_label}>Saldo pendiente</span>
                                <span className={styles.balance_due}>{formatPrice(order.balance_due)}</span>
                            </div>
                        )}
                        {!isPaid && order.status !== 'cancelled' && (
                            <div className={styles.actions_container}>
                                <button className="btn" onClick={() => setShowModal(true)}>
                                    Registrar pago
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* â”€â”€ Estado logÃ­stico â”€â”€ */}
                <div className={styles.section}>
                    <p className={styles.section_label}>Estado logÃ­stico</p>

                    {order.status === 'cancelled' ? (
                        <p className={`${styles.outcome_banner} ${styles.outcome_cancelled}`}>Pedido cancelado</p>
                    ) : (() => {
                        const stepIndex = LOGISTICS_STEPS.findIndex(s => s.value === order.status);
                        return (
                            <div className={styles.stepper}>
                                {/* Track plano: dot â†’ connector â†’ dot â†’ connector â†’ dot */}
                                <div className={styles.stepper_track}>
                                    {LOGISTICS_STEPS.map((step, i) => {
                                        const isDone = i < stepIndex;
                                        const isActive = i === stepIndex;
                                        return (
                                            <div key={step.value} className={styles.stepper_track_item}>
                                                <div className={`${styles.stepper_dot} ${isDone ? styles.stepper_done : ''} ${isActive ? styles.stepper_active : ''}`}>
                                                    {isDone && <FontAwesomeIcon icon={faCheck} />}
                                                    {/* Labels */}
                                                    <div className={styles.stepper_labels}>
                                                        <span
                                                            key={step.value}
                                                            className={`${styles.stepper_label} ${isActive ? styles.stepper_label_active : ''} ${isDone ? styles.stepper_label_done : ''}`}
                                                        >
                                                            {step.label}
                                                        </span>
                                                    </div>
                                                </div>
                                                {i < LOGISTICS_STEPS.length - 1 && (
                                                    <div className={`${styles.stepper_connector} ${isDone ? styles.stepper_connector_done : ''}`} />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })()}

                    <div className={styles.actions_container}>
                        {order.status === 'pending' && (
                            <button className="btn btn_solid" onClick={() => updateStatus('processing')} disabled={loading}>
                                {loading ? <FontAwesomeIcon icon={faCircleNotch} spin /> : 'Aceptar y empezar preparaciÃ³n'}
                            </button>
                        )}
                        {(order.status === 'processing' && order.details.length > 0) && (
                            <button className="btn btn_solid" onClick={() => updateStatus('confirmed')} disabled={loading}>
                                {loading ? <FontAwesomeIcon icon={faCircleNotch} spin /> : 'Marcar como terminado'}
                            </button>
                        )}
                        {order.status === 'confirmed' && (
                            <button className="btn btn_solid" onClick={() => updateStatus('shipped')} disabled={loading}>
                                {loading ? <FontAwesomeIcon icon={faCircleNotch} spin /> : 'Despachar / enviar'}
                            </button>
                        )}
                        {order.status === 'shipped' && (
                            <button className="btn btn_solid" onClick={() => updateStatus('delivered')} disabled={loading}>
                                {loading ? <FontAwesomeIcon icon={faCircleNotch} spin /> : 'Confirmar entrega'}
                            </button>
                        )}
                        {['pending', 'processing', 'confirmed'].includes(order.status) && (
                            <button className="btn btn_error_regular" onClick={() => setConfirmCancel(true)} disabled={loading}>
                                Cancelar pedido
                            </button>
                        )}
                        {order.status === 'delivered' && (
                            <p className={`${styles.outcome_banner} ${styles.outcome_success}`}>Pedido completado con Ã©xito</p>
                        )}
                    </div>
                </div>

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
                <Modal onClose={() => setEditShippingCost(false)} title="Editar costo de envÃ­o">
                    <EditShippingCost
                        orderId={order.id}
                        currentCost={order.shipping_cost}
                        onSuccess={() => { getOrder(order.id); setEditShippingCost(false); }}
                    />
                </Modal>
            )}
            {confirmCancel && (
                <ConfirmModal
                    message="Â¿EstÃ¡s seguro de que quieres cancelar este pedido?"
                    onConfirm={() => { updateStatus('cancelled'); setConfirmCancel(false); }}
                    onCancel={() => setConfirmCancel(false)}
                />
            )}
        </>
    );
}


