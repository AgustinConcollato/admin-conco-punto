import { useMemo, useState } from 'react';
import { PaymentService } from '../../../../services/payments/paymentsService';
import { formatPrice } from '../../../../utils/formatPrice';
import styles from './CreatePayment.module.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';

const PAYMENT_METHODS = [
    { value: 'cash', label: 'Efectivo' },
    { value: 'transfer', label: 'Transferencia Bancaria' },
    { value: 'credit_card', label: 'Tarjeta de Crédito' },
    { value: 'check', label: 'Cheque' },
];

export function CreatePayment({ orderId, balanceDue, onSuccess = null }) {

    const paymentService = useMemo(() => new PaymentService(), []);
    const [amountPaid, setAmountPaid] = useState(balanceDue);
    const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0].value);
    // const [transactionId, setTransactionId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState({});

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validación básica
        if (amountPaid <= 0) {
            setError("El monto a pagar debe ser mayor a cero.");
            return;
        }

        setIsLoading(true);
        setError({});

        const paymentData = {
            order_id: orderId,
            amount: amountPaid,
            payment_method: paymentMethod,
            // transaction_id: transactionId || null, // Puede ser opcional
        };

        try {
            const result = await paymentService.create(paymentData);

            if (onSuccess) {
                onSuccess(result);
            }
        } catch (error) {
            setError(error[0]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.create_payment}>
            <form onSubmit={handleSubmit}>
                <p>
                    Saldo pendiente: <strong>{formatPrice(balanceDue)}</strong>
                </p>

                <div className='input_group'>
                    <span>Monto a Pagar:</span>
                    <input
                        className='input'
                        type="number"
                        value={amountPaid}
                        onChange={(e) => setAmountPaid(parseFloat(e.target.value))}
                        step="0.01"
                        min="0"
                        max={balanceDue} // Máximo el saldo pendiente
                    />
                    {error.amount && <p className={styles.error}>{error.amount[0]}</p>}
                </div>

                <div className='input_group'>
                    <span>Método de Pago:</span>
                    <select
                        className='input'
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                    >
                        {PAYMENT_METHODS.map(method => (
                            <option key={method.value} value={method.value}>
                                {method.label}
                            </option>
                        ))}
                    </select>
                    {error.payment_method && <p className={styles.error}>{error.payment_method[0]}</p>}
                </div>

                {/* <label>ID de Transacción (Opcional):</label>
                <input
                    type="text"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="Nro. de comprobante, referencia, etc."
                /> */}
                <button type="submit" disabled={isLoading} className="btn btn_solid">
                    {isLoading ? <FontAwesomeIcon icon={faCircleNotch} spin /> : 'Registrar Pago'}
                </button>
            </form>
        </div>
    );
}

