import { useState } from 'react';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNotch, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Modal } from '../../../../components/Modal/Modal';
import { SupplierPurchaseService } from '../../../../services/supplierPurchase/supplierPurchaseService';
import { formatPrice } from '../../../../utils/formatPrice';
import { formatDate } from '../../../../utils/formatDate';
import styles from './PaymentFormModal.module.css';

const service = new SupplierPurchaseService();

const METHOD_LABELS = {
    transfer: 'Transferencia',
    cash: 'Efectivo',
    credit_card: 'Tarjeta',
    check: 'Cheque',
};

function todayStr() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

export function PaymentFormModal({ purchase, onClose, onSaved }) {
    const balance = parseFloat(purchase.balance) || 0;

    const [form, setForm] = useState({
        amount: balance > 0 ? String(balance) : '',
        payment_date: todayStr(),
        payment_method: 'transfer',
        note: '',
    });
    const [saving, setSaving] = useState(false);
    const [payments, setPayments] = useState(purchase.payments || []);
    const [currentBalance, setCurrentBalance] = useState(balance);
    // 'total' = paga el saldo completo, 'custom' = monto libre
    const [mode, setMode] = useState('total');

    const setField = (name, value) => setForm(f => ({ ...f, [name]: value }));

    const selectMode = (nextMode) => {
        setMode(nextMode);
        setForm(f => ({
            ...f,
            amount: nextMode === 'total' ? String(currentBalance) : '',
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const amount = parseFloat(form.amount);
        if (!amount || amount <= 0) return toast.error('Ingresá un monto válido.');
        if (amount > currentBalance + 0.001) {
            return toast.error(`El pago no puede superar el saldo (${formatPrice(currentBalance)}).`);
        }

        setSaving(true);
        try {
            const res = await service.addPayment(purchase.id, {
                amount,
                payment_date: form.payment_date,
                payment_method: form.payment_method,
                note: form.note || null,
            });
            const newBalance = parseFloat(res.purchase?.balance ?? (currentBalance - amount));
            setPayments(res.purchase?.payments || [...payments, res.payment]);
            setCurrentBalance(newBalance);
            setForm({
                amount: mode === 'total' && newBalance > 0 ? String(newBalance) : '',
                payment_date: todayStr(),
                payment_method: 'transfer',
                note: '',
            });
            toast.success('Pago registrado.');
            onSaved?.(res.purchase);
        } catch (err) {
            toast.error(err?.error ?? err?.message ?? 'No se pudo registrar el pago.');
        } finally {
            setSaving(false);
        }
    };

    const handleDeletePayment = async (paymentId) => {
        try {
            const res = await service.removePayment(paymentId);
            if (res?.purchase) {
                setPayments(res.purchase.payments || []);
                setCurrentBalance(parseFloat(res.purchase.balance) || 0);
            } else {
                const removed = payments.find(p => p.id === paymentId);
                setPayments(payments.filter(p => p.id !== paymentId));
                setCurrentBalance(cb => cb + (parseFloat(removed?.amount) || 0));
            }
            toast.success('Pago eliminado.');
            onSaved?.(res?.purchase);
        } catch (err) {
            toast.error(err?.error ?? err?.message ?? 'No se pudo eliminar el pago.');
        }
    };

    return (
        <Modal onClose={onClose} title={`Pagos — Factura ${purchase.invoice_number || '—'}`}>
            <div className={styles.wrap}>
                <div className={styles.summary}>
                    <div>
                        <span className={styles.summary_label}>{purchase.is_overdue ? 'Total a pagar' : 'Total c/desc'}</span>
                        <strong className={styles.summary_total}>
                            {formatPrice(purchase.is_overdue ? (purchase.payable_total ?? purchase.total) : purchase.total_with_discount)}
                        </strong>
                    </div>
                    <div>
                        <span className={styles.summary_label}>Saldo pendiente</span>
                        <strong className={currentBalance > 0 ? styles.summary_due : styles.summary_paid}>
                            {formatPrice(currentBalance)}
                        </strong>
                    </div>
                </div>

                {purchase.is_overdue && Number(purchase.discount_percent) > 0 && (
                    <div className={styles.overdue_note}>
                        Factura vencida: se pierde el descuento, se paga el total sin descuento ({formatPrice(purchase.total)}).
                    </div>
                )}

                {currentBalance > 0 ? (
                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.mode_group}>
                            <button
                                type="button"
                                className={mode === 'total' ? styles.mode_active : styles.mode_inactive}
                                onClick={() => selectMode('total')}
                            >
                                Total ({formatPrice(currentBalance)})
                            </button>
                            <button
                                type="button"
                                className={mode === 'custom' ? styles.mode_active : styles.mode_inactive}
                                onClick={() => selectMode('custom')}
                            >
                                Personalizado
                            </button>
                        </div>
                        <div className={styles.row}>
                            <div className="input_group">
                                <label>Monto</label>
                                <input
                                    className="input"
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    max={currentBalance}
                                    value={form.amount}
                                    onChange={e => setField('amount', e.target.value)}
                                    placeholder="0.00"
                                    readOnly={mode === 'total'}
                                />
                            </div>
                            <div className="input_group">
                                <label>Fecha</label>
                                <input
                                    className="input"
                                    type="date"
                                    value={form.payment_date}
                                    onChange={e => setField('payment_date', e.target.value)}
                                />
                            </div>
                        </div>
                        <div className={styles.row}>
                            <div className="input_group">
                                <label>Método</label>
                                <select
                                    className="input"
                                    value={form.payment_method}
                                    onChange={e => setField('payment_method', e.target.value)}
                                >
                                    {Object.entries(METHOD_LABELS).map(([k, label]) => (
                                        <option key={k} value={k}>{label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="input_group">
                                <label>Nota (opcional)</label>
                                <input
                                    className="input"
                                    type="text"
                                    value={form.note}
                                    onChange={e => setField('note', e.target.value)}
                                    placeholder="Ref..."
                                />
                            </div>
                        </div>
                        <div className={styles.form_actions}>
                            <button type="submit" className="btn btn_solid" disabled={saving}>
                                {saving ? <FontAwesomeIcon icon={faCircleNotch} spin /> : 'Registrar pago'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className={styles.settled}>✓ Compra saldada por completo</div>
                )}

                <div className={styles.history}>
                    <span className={styles.history_title}>Pagos registrados</span>
                    {payments.length === 0 ? (
                        <p className={styles.history_empty}>Todavía no hay pagos.</p>
                    ) : (
                        <ul className={styles.history_list}>
                            {payments.map(p => (
                                <li key={p.id} className={styles.history_item}>
                                    <div className={styles.history_info}>
                                        <strong>{formatPrice(p.amount)}</strong>
                                        <span>{formatDate(p.payment_date, 'short')}</span>
                                        {p.payment_method && <span className={styles.history_method}>{METHOD_LABELS[p.payment_method]}</span>}
                                    </div>
                                    <button
                                        className={styles.history_delete}
                                        onClick={() => handleDeletePayment(p.id)}
                                        aria-label="Eliminar pago"
                                    >
                                        <FontAwesomeIcon icon={faTrash} />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </Modal>
    );
}
