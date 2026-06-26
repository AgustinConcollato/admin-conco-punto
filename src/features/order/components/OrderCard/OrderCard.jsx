import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';
import { Modal } from '../../../../components/Modal/Modal';
import { CreatePayment } from '../../../payment/components/CreatePayment/CreatePayment';
import { OrderStatusAction } from '../OrderStatusAction/OrderStatusAction';
import { downloadOrderPdf } from '../../../../utils/downloadOrderPdf';
import { formatDate } from '../../../../utils/formatDate';
import { formatPrice } from '../../../../utils/formatPrice';
import styles from './OrderCard.module.css';

const STATUS_TRANSLATIONS = {
    pending: 'Pendiente',
    processing: 'Preparación',
    confirmed: 'Terminado',
    shipped: 'Enviado',
    delivered: 'Entregado',
    cancelled: 'Cancelado',
};

function getInitials(name) {
    if (!name || name === 'No asignado') return '—';
    const parts = name.trim().split(/\s+/);
    return (parts[0][0] + (parts[1] ? parts[1][0] : '')).toUpperCase();
}

export function OrderCard({ order, onRefresh }) {
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const clientName = order.client?.name || 'No asignado';
    const isNoClient = clientName === 'No asignado';
    const status = order.status;
    const notCancelled = status !== 'cancelled';
    const isPaid = order.balance_due <= 0;

    const total = parseFloat(order.final_total_amount);
    const cost = parseFloat(order.total_cost || 0);
    const shipping = parseFloat(order.shipping_cost || 0);
    const profit = total - shipping - cost;
    const savings = profit * 0.10;
    const toSplit = profit - savings;
    const paidAmount = total - order.balance_due;
    const payPct = total > 0 ? Math.min(100, Math.round((paidAmount / total) * 100)) : 0;

    const statusClass = styles[`oc_st_${status}`] || styles.oc_st_default;

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

    return (
        <div className={styles.oc_card}>
            {/* Header cliente */}
            <div className={styles.oc_header}>
                <div className={`${styles.oc_avatar} ${isNoClient ? styles.oc_avatar_empty : ''}`}>
                    {getInitials(clientName)}
                </div>
                <div className={styles.oc_head_info}>
                    <div className={styles.oc_name}>{clientName}</div>
                    <div className={styles.oc_meta}>
                        <span className={styles.oc_number}>#{order.number}</span> · {formatDate(order.created_at, 'numeric', true)}
                    </div>
                </div>
                <span className={`${styles.oc_status} ${statusClass}`}>
                    {STATUS_TRANSLATIONS[status] ?? status}
                </span>
            </div>

            {/* Total del pedido */}
            <div className={styles.oc_total_block}>
                <div className={styles.oc_label}>Total del pedido</div>
                <div className={styles.oc_total}>{formatPrice(total)}</div>
                {notCancelled && !isPaid && (
                    <>
                        <div className={styles.oc_debt_pill}>
                            <span className={styles.oc_debt_dot} />Debe {formatPrice(order.balance_due)}
                        </div>
                        <div className={styles.oc_progress}>
                            <span className={styles.oc_progress_bar} style={{ width: `${payPct}%` }} />
                        </div>
                    </>
                )}
            </div>

            {/* Desglose financiero */}
            <div className={styles.oc_section}>
                <div className={styles.oc_label}>Desglose financiero</div>
                <div className={styles.oc_breakdown}>
                    <div className={styles.oc_row}>
                        <span className={styles.oc_key}>Total facturado</span>
                        <span className={styles.oc_val}>{formatPrice(total)}</span>
                    </div>
                    <div className={styles.oc_row}>
                        <span className={styles.oc_key}>Costo</span>
                        <span className={`${styles.oc_val} ${styles.oc_val_red}`}>−{formatPrice(cost)}</span>
                    </div>
                    <div className={styles.oc_row}>
                        <span className={styles.oc_key}>Envío</span>
                        <span className={styles.oc_val}>{formatPrice(shipping)}</span>
                    </div>
                    <div className={styles.oc_divider} />
                    <div className={styles.oc_row}>
                        <span className={styles.oc_key_bold}>Ganancia</span>
                        <span className={`${styles.oc_val} ${styles.oc_val_green}`}>{formatPrice(profit)}</span>
                    </div>
                    <div className={styles.oc_row}>
                        <span className={styles.oc_key}>Reinversión (10%)</span>
                        <span className={styles.oc_val}>{formatPrice(savings)}</span>
                    </div>
                    <div className={styles.oc_row}>
                        <span className={styles.oc_key_bold}>A dividir</span>
                        <span className={`${styles.oc_val} ${styles.oc_val_blue}`}>{formatPrice(toSplit)}</span>
                    </div>
                </div>
            </div>

            {/* Pagos */}
            {notCancelled && !isPaid && (
                <div className={styles.oc_pagos}>
                    <div className={styles.oc_pagos_label}>Pagos</div>
                    <div className={styles.oc_pagos_row}>
                        <span className={styles.oc_pagos_key}>Pagado</span>
                        <span className={styles.oc_pagos_val}>{formatPrice(paidAmount)}</span>
                    </div>
                    <div className={styles.oc_pagos_progress}>
                        <span className={styles.oc_pagos_bar} style={{ width: `${payPct}%` }} />
                    </div>
                    <div className={styles.oc_pagos_row}>
                        <span className={styles.oc_pending}>Saldo pendiente</span>
                        <span className={styles.oc_pending}>{formatPrice(order.balance_due)}</span>
                    </div>
                </div>
            )}

            {notCancelled && isPaid && (
                <div className={styles.oc_paid}>✓ Pedido cobrado por completo</div>
            )}

            {/* Acciones */}
            <div className={styles.oc_actions}>
                {notCancelled && !isPaid && (
                    <button className={'btn btn_solid'} onClick={() => setShowModal(true)}>
                        Registrar pago
                    </button>
                )}
                <div className={styles.oc_btn_row}>
                    <Link to={`/ventas/${order.id}`} className={styles.oc_btn_outline}>
                        Ver pedido
                    </Link>
                    <button className={styles.oc_btn_outline} onClick={downloadPDF} disabled={loading}>
                        {loading ? <FontAwesomeIcon icon={faCircleNotch} spin /> : 'Descargar detalle'}
                    </button>
                </div>
                <OrderStatusAction order={order} onUpdated={onRefresh} stacked />
            </div>

            {showModal && (
                <Modal onClose={() => setShowModal(false)} title="Registrar pago">
                    <CreatePayment
                        orderId={order.id}
                        balanceDue={order.balance_due}
                        onSuccess={(result) => {
                            setShowModal(false);
                            onRefresh?.(result?.order ?? null);
                        }}
                    />
                </Modal>
            )}
        </div>
    );
}
