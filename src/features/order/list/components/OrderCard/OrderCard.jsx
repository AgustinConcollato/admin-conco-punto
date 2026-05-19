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
import { Modal } from '../../../../../components/Modal/Modal';
import { formatDate } from '../../../../../utils/formatDate';
import { formatPrice } from '../../../../../utils/formatPrice';
import { CreatePayment } from '../../../../payment/create/components/CreatePayment/CreatePayment';
import styles from './OrderCard.module.css';

const STATUS_TRANSLATIONS = {
    'pending': 'Pendiente',
    'processing': 'Preparación',
    'confirmed': 'Terminado',
    'shipped': 'Enviado',
    'delivered': 'Entregado',
    'cancelled': 'Cancelado',
};

export function OrderCard({ order, onDownload, onRefresh }) {
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const clientName = order.client?.name || 'No asignado';
    const translatedStatus = STATUS_TRANSLATIONS[order.status] || order.status.toUpperCase();

    const profit = parseFloat(order.final_total_amount) - parseFloat(order.shipping_cost) - parseFloat(order.total_cost || 0);
    const savings = profit * 0.10;
    const isPaid = order.balance_due <= 0;

    const downloadPDF = async () => {
        setLoading(true);
        try {
            await onDownload(order.id, clientName);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusClass = (status) => {
        // Esto buscará clases como .status_pending, .status_confirmed, etc.
        const statusClass = styles[`status_${status.toLowerCase()}`];
        return statusClass || styles.status_default;
    };

    return (
        <>
            <div className={styles.order_card}>
                {/* Cabecera con ID y Tags */}
                <div className={styles.header}>
                    <h3 className={styles.order_id}>Pedido: {order.id.substring(0, 8)}...</h3>
                    <div className={styles.tags}>
                        {/* Tag ejemplo extra como el de la imagen */}
                        <span className={styles.tag_blue}>
                            {order.price_list_id == 1 ? 'MAYORISTA' :
                                order.price_list_id == 2 ? 'MINORISTA' :
                                    'VIAJE'
                            }
                        </span>
                        <span className={`${styles.status_tag} ${getStatusClass(order.status)}`}>
                            {translatedStatus.toUpperCase()}
                        </span>
                    </div>
                </div>

                {/* Precio Principal */}
                <div className={styles.total_section}>
                    <span className={styles.total_label}>Total</span>
                    <h2 className={styles.main_price}>{formatPrice(order.final_total_amount)}</h2>
                </div>

                {/* Info Secundaria */}
                <div className={styles.sub_info}>
                    <span>Cliente: {clientName}</span>
                    <span className={styles.divider}>|</span>
                    <span>Fecha: {formatDate(order.created_at, 'short')}</span>
                </div>

                <hr className={styles.separator} />

                {/* Análisis Financiero */}
                <div className={styles.section}>
                    <h4 className={styles.section_title}>Análisis Financiero</h4>
                    <div className={styles.finance_item}>
                        <FontAwesomeIcon icon={faArrowDown} className={styles.icon_cost} />
                        <span>Costo: {formatPrice(order.total_cost)}</span>
                    </div>
                    <div className={styles.finance_item}>
                        <FontAwesomeIcon icon={faTruck} className={styles.icon_shipping} />
                        <span>Envío: {formatPrice(order.shipping_cost)}</span>
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
                        {order.status !== 'cancelled' &&
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
                                {!isPaid && order.status !== 'cancelled' && (
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
                                            <span>
                                                {payment.payment_method == 'cash' ? 'Efectivo' :
                                                    payment.payment_method == 'transfer' ? 'Transferencia' :
                                                        payment.payment_method == 'credit_card' ? 'Tarjeta de crédito/débito' :
                                                            'Cheque'
                                                }
                                            </span>
                                        </div>
                                        <small>{formatDate(payment.created_at, 'numeric')}</small>
                                    </li>
                                ))}
                                {!isPaid && order.status !== 'cancelled' && (
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
            </div>
            {
                showModal && (
                    <Modal onClose={() => setShowModal(false)} title="Registrar pago">
                        <CreatePayment orderId={order.id} balanceDue={order.balance_due} onSuccess={(result) => {
                            setShowModal(false);
                            onRefresh?.(result?.order ?? null);
                        }} />
                    </Modal>
                )
            }
        </>
    );
}