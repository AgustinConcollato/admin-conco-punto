import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import { OrderService } from "../../../../services/order/orderService";
import { parseApiError } from "../../../../utils/parseApiError";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import styles from './EditShippingCost.module.css'

export function EditShippingCost({ orderId, currentCost, onSuccess }) {
    const orderService = useMemo(() => new OrderService(), []);
    const [loading, setLoading] = useState(false);
    const [shippingCost, setShippingCost] = useState(currentCost || 0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Enviamos el valor del estado al backend
            await orderService.updateOrderHeader(orderId, {
                shipping_cost: parseFloat(shippingCost)
            });
            // Notificamos al padre que hubo un cambio exitoso
            onSuccess();
        } catch (error) {
            toast.error(parseApiError(error).message || "Error al actualizar el costo de envío.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            <div className="input_group">
                <span>Nuevo costo de envío</span>
                <input
                    type="number"
                    step="0.01"
                    className="input" // Usa tus clases de CSS
                    value={shippingCost}
                    onChange={(e) => setShippingCost(e.target.value)}
                    required
                />
            </div>

            <button
                type="submit"
                className="btn btn_solid"
                disabled={loading}
            >
                {loading ? <FontAwesomeIcon icon={faCircleNotch} spin /> : "Actualizar Costo"}
            </button>
        </form>
    );
}