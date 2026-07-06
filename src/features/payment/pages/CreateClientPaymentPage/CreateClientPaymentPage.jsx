import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNotch, faArrowLeft, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { ClientSelect } from '../../../../components/ClientSelect/ClientSelect';
import { PaymentService } from '../../../../services/payments/paymentsService';
import { formatPrice } from '../../../../utils/formatPrice';
import { parseApiError } from '../../../../utils/parseApiError';
import styles from './CreateClientPaymentPage.module.css';

const PAYMENT_METHODS = [
    { value: 'cash', label: 'Efectivo' },
    { value: 'transfer', label: 'Transferencia' },
    { value: 'credit_card', label: 'Tarjeta' },
    { value: 'check', label: 'Cheque' },
];

const METHOD_LABELS = Object.fromEntries(PAYMENT_METHODS.map(m => [m.value, m.label]));

export function CreateClientPaymentPage() {
    const paymentService = useMemo(() => new PaymentService(), []);

    const [clientId, setClientId] = useState('');
    const [clientName, setClientName] = useState('');
    const [amount, setAmount] = useState('');
    const [method, setMethod] = useState(PAYMENT_METHODS[0].value);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState({});
    const [result, setResult] = useState(null);

    useEffect(() => {
        document.title = 'Agregar pago a cliente';
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError({});

        if (!clientId) {
            setError({ client_id: ['Seleccioná un cliente.'] });
            return;
        }
        const value = parseFloat(amount);
        if (!(value > 0)) {
            setError({ amount: ['El monto debe ser mayor a cero.'] });
            return;
        }

        setLoading(true);
        try {
            const res = await paymentService.createClientPayment(clientId, {
                amount: value,
                payment_method: method,
            });
            setResult(res);
        } catch (err) {
            setError(parseApiError(err).fieldErrors ?? {});
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        setResult(null);
        setClientId('');
        setClientName('');
        setAmount('');
        setMethod(PAYMENT_METHODS[0].value);
        setError({});
    };

    // ── Pantalla de resultado ──
    if (result) {
        const applied = result.applied ?? [];
        const appliedTotal = applied.reduce((s, a) => s + Number(a.amount), 0);
        const credited = Number(result.credited_remaining ?? 0);

        return (
            <div className={styles.page}>
                <div className={styles.card}>
                    <div className={styles.result_head}>
                        <span className={styles.result_icon}><FontAwesomeIcon icon={faCheckCircle} /></span>
                        <h2>Pago registrado</h2>
                        <p className={styles.result_client}>{clientName || 'Cliente'}</p>
                    </div>

                    {applied.length > 0 ? (
                        <>
                            <div className={styles.result_label}>Se aplicó a estos pedidos</div>
                            <ul className={styles.applied_list}>
                                {applied.map((a, i) => (
                                    <li key={i} className={styles.applied_row}>
                                        <span className={styles.applied_order}>Pedido #{a.number}</span>
                                        <span className={styles.applied_method}>{METHOD_LABELS[a.payment_method] || a.payment_method}</span>
                                        <span className={styles.applied_amount}>{formatPrice(a.amount)}</span>
                                    </li>
                                ))}
                            </ul>
                            <div className={styles.applied_total}>
                                <span>Total aplicado</span>
                                <span>{formatPrice(appliedTotal)}</span>
                            </div>
                        </>
                    ) : (
                        <p className={styles.no_applied}>El cliente no tenía pedidos con deuda. Todo quedó como saldo a favor.</p>
                    )}

                    <div className={styles.credit_box}>
                        <span>Saldo a favor</span>
                        <strong>{formatPrice(credited)}</strong>
                    </div>

                    <div className={styles.result_actions}>
                        <button type="button" className="btn btn_solid" onClick={reset}>Registrar otro pago</button>
                        {clientId && (
                            <Link to={`/clientes/detalle/${clientId}`} className="btn">Ver cliente</Link>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // ── Formulario ──
    return (
        <div className={styles.page}>
            <div className={styles.card}>
                <Link to="/pagos" className={styles.back}>
                    <FontAwesomeIcon icon={faArrowLeft} /> Volver a pagos
                </Link>
                <h2 className="title">Agregar pago a cliente</h2>
                <p className={styles.subtitle}>
                    El monto se aplica automáticamente a los pedidos con deuda (del más viejo al más nuevo).
                    Lo que sobre queda como saldo a favor.
                </p>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className="input_group">
                        <span>Cliente</span>
                        <ClientSelect
                            value={clientId}
                            onChange={(id, c) => { setClientId(id); setClientName(c?.name ?? ''); }}
                            placeholder="Buscar cliente..."
                        />
                        {error.client_id && <p className={styles.error}>{error.client_id[0]}</p>}
                    </div>

                    <div className="input_group">
                        <span>Monto</span>
                        <input
                            className="input"
                            type="number"
                            step="0.01"
                            min="0"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                        />
                        {error.amount && <p className={styles.error}>{error.amount[0]}</p>}
                    </div>

                    <div className="input_group">
                        <span>Método de pago</span>
                        <select className="input" value={method} onChange={(e) => setMethod(e.target.value)}>
                            {PAYMENT_METHODS.map(m => (
                                <option key={m.value} value={m.value}>{m.label}</option>
                            ))}
                        </select>
                        {error.payment_method && <p className={styles.error}>{error.payment_method[0]}</p>}
                    </div>

                    <button type="submit" className="btn btn_solid" disabled={loading}>
                        {loading ? <FontAwesomeIcon icon={faCircleNotch} spin /> : 'Registrar pago'}
                    </button>
                </form>
            </div>
        </div>
    );
}
