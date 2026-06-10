import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import { OrderService } from "../../../../services/order/orderService";
import { parseApiError } from "../../../../utils/parseApiError";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import styles from './EditDiscount.module.css';

export function EditDiscount({ orderId, currentPercentage, currentFixed, onSuccess }) {
    const orderService = useMemo(() => new OrderService(), []);
    const [loading, setLoading] = useState(false);

    // Determinamos el tipo inicial: si hay porcentaje > 0, empezamos con 'percentage'
    const [discountType, setDiscountType] = useState('percentage');
    const [value, setValue] = useState(discountType === 'percentage' ? currentPercentage : currentFixed);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Preparamos el payload: uno en el valor ingresado y el otro en 0
        const payload = {
            discount_percentage: discountType === 'percentage' ? parseFloat(value) : 0,
            discount_fixed_amount: discountType === 'fixed' ? parseFloat(value) : 0
        };

        try {
            await orderService.updateOrderHeader(orderId, payload);
            onSuccess();
        } catch (error) {
            toast.error(parseApiError(error).message || "Error al actualizar el descuento.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.type_selector}>
                <button
                    type="button"
                    className={discountType === 'percentage' ? styles.active : ''}
                    onClick={() => { setDiscountType('percentage'); setValue(0); }}
                >
                    Porcentaje (%)
                </button>
                <button
                    type="button"
                    className={discountType === 'fixed' ? styles.active : ''}
                    onClick={() => { setDiscountType('fixed'); setValue(0); }}
                >
                    Monto Fijo ($)
                </button>
            </div>

            <div className="input_group">
                <span>{discountType === 'percentage' ? 'Porcentaje de descuento' : 'Monto fijo de descuento'}</span>
                <input
                    type="number"
                    step={discountType === 'fixed' ? "0.01" : "1"}
                    className="input"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    required
                    min="0"
                />
            </div>

            <button
                type="submit"
                className="btn btn_solid"
                disabled={loading}
            >
                {loading ? <FontAwesomeIcon icon={faCircleNotch} spin /> : "Actualizar Descuento"}
            </button>
        </form>
    );
}