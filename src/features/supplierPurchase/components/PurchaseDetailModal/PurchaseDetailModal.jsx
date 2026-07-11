import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoneyBillWave, faPenToSquare, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Modal } from '../../../../components/Modal/Modal';
import { formatPrice } from '../../../../utils/formatPrice';
import { formatDate } from '../../../../utils/formatDate';
import { isOverdue, payableAmount, balanceOf } from '../../utils/purchaseCalc';
import styles from './PurchaseDetailModal.module.css';

const METHOD_LABELS = {
    transfer: 'Transferencia',
    cash: 'Efectivo',
    credit_card: 'Tarjeta',
    check: 'Cheque',
};

const STATUS_META = {
    pending: { label: 'Pendiente', bg: '#f1f5f9', color: '#475569' },
    partial: { label: 'Parcial', bg: '#fef3c7', color: '#92400e' },
    paid: { label: 'Pagada', bg: '#dcfce7', color: '#15803d' },
};

function statusMeta(p) {
    if (isOverdue(p)) return { label: 'Vencida', bg: '#fee2e2', color: '#b91c1c' };
    return STATUS_META[p.status] || STATUS_META.pending;
}

export function PurchaseDetailModal({ purchase, onClose, onPay, onEdit, onDelete }) {
    const p = purchase;
    const overdue = isOverdue(p);
    const discounted = Number(p.discount_percent) > 0;
    const balance = balanceOf(p);
    const payable = payableAmount(p);
    const payments = p.payments || [];
    const meta = statusMeta(p);

    return (
        <Modal onClose={onClose} title="Detalle de la compra">
            <div className={styles.wrap}>
                {/* Header */}
                <div className={styles.head}>
                    <div>
                        <div className={styles.supplier}>{p.supplier?.name || 'Sin proveedor'}</div>
                        <div className={styles.invoice}>Factura {p.invoice_number || '—'}</div>
                    </div>
                    <span className={styles.badge} style={{ background: meta.bg, color: meta.color }}>
                        {meta.label}
                    </span>
                </div>

                {/* Fields grid */}
                <div className={styles.grid}>
                    <div className={styles.field}>
                        <span className={styles.field_label}>Fecha</span>
                        <span className={styles.field_value}>{formatDate(p.purchase_date, 'short')}</span>
                    </div>
                    <div className={styles.field}>
                        <span className={styles.field_label}>Vencimiento</span>
                        <span className={styles.field_value}>{p.due_date ? formatDate(p.due_date, 'short') : '—'}</span>
                    </div>
                    <div className={styles.field}>
                        <span className={styles.field_label}>Total</span>
                        <span className={styles.field_value}>{formatPrice(p.total)}</span>
                    </div>
                    {discounted && (
                        <div className={styles.field}>
                            <span className={styles.field_label}>Descuento</span>
                            <span className={`${styles.field_value} ${overdue ? styles.void : ''}`}>
                                {Number(p.discount_percent)}%
                            </span>
                        </div>
                    )}
                    {discounted && (
                        <div className={styles.field}>
                            <span className={styles.field_label}>Total c/desc</span>
                            <span className={`${styles.field_value} ${overdue ? styles.void : ''}`}>
                                {formatPrice(p.total_with_discount)}
                            </span>
                        </div>
                    )}
                    {overdue && (
                        <div className={styles.field}>
                            <span className={styles.field_label}>Total a pagar</span>
                            <span className={styles.field_value}>{formatPrice(payable)}</span>
                        </div>
                    )}
                    <div className={styles.field}>
                        <span className={styles.field_label}>Pagado</span>
                        <span className={styles.field_value} style={{ color: '#16a34a' }}>{formatPrice(p.amount_paid)}</span>
                    </div>
                    <div className={styles.field}>
                        <span className={styles.field_label}>Saldo</span>
                        <span className={styles.field_value} style={{ color: balance > 0 ? '#dc2626' : '#16a34a' }}>
                            {formatPrice(balance)}
                        </span>
                    </div>
                    {(p.reminder_sent_at || (p.reminder_days != null && p.due_date && balance > 0)) && (
                        <div className={styles.field}>
                            <span className={styles.field_label}>Aviso por mail</span>
                            <span className={styles.field_value} style={{ fontSize: '13px' }}>
                                {p.reminder_sent_at
                                    ? 'Enviado ✓'
                                    : `${p.reminder_days} día${Number(p.reminder_days) === 1 ? '' : 's'} antes`}
                            </span>
                        </div>
                    )}
                </div>

                {overdue && discounted && (
                    <div className={styles.overdue_note}>
                        Factura vencida: se perdió el descuento, se paga el total ({formatPrice(p.total)}).
                    </div>
                )}

                {/* Note */}
                {p.note && (
                    <div className={styles.note_block}>
                        <span className={styles.note_label}>Nota</span>
                        <p className={styles.note_text}>{p.note}</p>
                    </div>
                )}

                {/* Payments */}
                <div className={styles.payments}>
                    <span className={styles.payments_title}>Pagos ({payments.length})</span>
                    {payments.length === 0 ? (
                        <p className={styles.payments_empty}>Todavía no hay pagos registrados.</p>
                    ) : (
                        <ul className={styles.payments_list}>
                            {payments.map(pay => (
                                <li key={pay.id} className={styles.payment_item}>
                                    <strong className={styles.payment_amount}>{formatPrice(pay.amount)}</strong>
                                    <span className={styles.payment_date}>{formatDate(pay.payment_date, 'short')}</span>
                                    {pay.payment_method && (
                                        <span className={styles.payment_method}>{METHOD_LABELS[pay.payment_method]}</span>
                                    )}
                                    {pay.note && <span className={styles.payment_note}>{pay.note}</span>}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Actions */}
                <div className={styles.actions}>
                    <button className="btn btn_error_thins" onClick={() => onDelete(p)}>
                        <FontAwesomeIcon icon={faTrash} /> Eliminar
                    </button>
                    <div className={styles.actions_right}>
                        <button className="btn btn_regular" onClick={() => onEdit(p)}>
                            <FontAwesomeIcon icon={faPenToSquare} /> Editar
                        </button>
                        {balance > 0 && (
                            <button className="btn btn_solid" onClick={() => onPay(p)}>
                                <FontAwesomeIcon icon={faMoneyBillWave} /> Registrar pago
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </Modal>
    );
}
