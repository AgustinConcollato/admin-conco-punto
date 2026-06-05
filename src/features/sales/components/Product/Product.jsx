import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { IMAGE_URL } from "../../../../config/api";
import { OrderContext } from "../../../../context/OrderContext";
import { formatPrice } from "../../../../utils/formatPrice";
import { ConfirmModal } from "../../../../components/ConfirmModal/ConfirmModal";
import { Modal } from "../../../../components/Modal/Modal";
import styles from './Product.module.css';

export function Product({ detail }) {

    console.log(detail);

    const { updateProduct, removeProduct } = useContext(OrderContext);

    const [showModal, setShowModal] = useState(false);
    const [showConfirmRemove, setShowConfirmRemove] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState({});

    // Estado local para los campos editables del detalle
    const [formData, setFormData] = useState({
        quantity: detail.quantity,
        unit_price: detail.unit_price,
        discount_percentage: detail.discount_percentage,
        discount_fixed_amount: detail.discount_fixed_amount,
    });

    useEffect(() => {
        setFormData({
            quantity: detail.quantity,
            unit_price: detail.unit_price,
            discount_percentage: detail.discount_percentage,
            discount_fixed_amount: detail.discount_fixed_amount,
        })
    }, [detail])

    const handleChange = (e) => {
        const { name, value } = e.target;
        const floatValue = parseFloat(value);

        setFormData(prev => {
            const newState = {
                ...prev,
                [name]: floatValue || value, // Usa el valor flotante o el valor original si no es un número válido
            };

            // Lógica de Descuento Exclusivo:
            if (name === 'discount_percentage' && floatValue > 0) {
                // Si se establece un porcentaje > 0, forzar el monto fijo a 0
                newState.discount_fixed_amount = 0;
            } else if (name === 'discount_fixed_amount' && floatValue > 0) {
                // Si se establece un monto fijo > 0, forzar el porcentaje a 0
                newState.discount_percentage = 0;
            } else if (name === 'discount_percentage' && floatValue === 0) {
                // Si se borra el porcentaje (es 0), no tocar el monto fijo, para permitir que el usuario lo edite
            } else if (name === 'discount_fixed_amount' && floatValue === 0) {
                // Si se borra el monto fijo (es 0), no tocar el porcentaje
            }

            return newState;
        });
    };

    const update = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            let percent = parseFloat(formData.discount_percentage || 0);
            let fixed = parseFloat(formData.discount_fixed_amount || 0);

            // Re-aplicar la regla de exclusividad al enviar (medida de seguridad)
            if (percent > 0) {
                fixed = 0;
            } else if (fixed > 0) {
                percent = 0;
            }
            // Aseguramos que los valores numéricos sean válidos antes de enviar
            const dataToSend = {
                quantity: parseInt(formData.quantity),
                unit_price: parseFloat(formData.unit_price),
                discount_percentage: parseFloat(formData.discount_percentage || 0),
                discount_fixed_amount: parseFloat(formData.discount_fixed_amount || 0),
            };

            // Llamar a la función del contexto con el ID del detalle y los datos
            await updateProduct(detail.id, dataToSend);
            setShowModal(false); // Cerrar modal al completar
        } catch (error) {
            setError(error[0]);
        } finally {
            setLoading(false);
        }
    };

    const remove = async () => {
        try {
            await removeProduct(detail.id);
        } catch (error) {
            toast.error(error.error ?? "No se pudo eliminar el producto.");
        } finally {
            setShowConfirmRemove(false);
        }
    };

    return (
        <>
            <div key={detail.id} className={styles.order_product_card}>
                <div className={styles.container_img}>
                    <img
                        src={`${IMAGE_URL}/${detail.variant?.images?.[0]?.thumbnail_path ?? detail.product.images[0]?.thumbnail_path}`}
                        alt={detail.product.name}
                    />
                </div>
                <div className={styles.product_name}>
                    <div>
                        <p>{detail.product.name}</p>
                        <small>
                            {detail.variant_id ?
                                detail.variant.sku ??
                                '':
                                detail.product.sku
                            }
                        </small>
                    </div>
                </div>

                {/* En móvil, envolvemos cada dato con una etiqueta descriptiva */}
                <div className={styles.mobile_row}>
                    <span className={styles.label}>Cant:</span>
                    <span>{detail.quantity}</span>
                </div>

                <div className={styles.mobile_row}>
                    <span className={styles.label}>Precio:</span>
                    <span>{formatPrice(detail.unit_price)}</span>
                </div>

                <div className={styles.mobile_row}>
                    <span className={styles.label}>Desc:</span>
                    <span>
                        {detail.discount_percentage !== "0.00" && detail.discount_percentage !== 0
                            ? `-${parseFloat(detail.discount_percentage)}%`
                            : detail.discount_fixed_amount && parseFloat(detail.discount_fixed_amount) > 0
                                ? formatPrice(detail.discount_fixed_amount)
                                : '0'}
                    </span>
                </div>

                <div className={styles.mobile_row}>
                    <span className={styles.label}>Subtotal:</span>
                    <span className={styles.subtotal_value}>{formatPrice(detail.subtotal_with_discount)}</span>
                </div>

                <span className={styles.options}>
                    <button className="btn" onClick={() => setShowModal(true)}>Editar</button>
                    <button className="btn btn_error_regular" onClick={() => setShowConfirmRemove(true)}>Eliminar</button>
                </span>
            </div>

            {showModal &&
                <Modal onClose={() => setShowModal(false)} title={`Editar: ${detail.product.name}`}>
                    <form onSubmit={update} className={styles.edit_form}>
                        <div className="input_group">
                            <span>Cantidad</span>
                            <input
                                className="input"
                                type="number"
                                name="quantity"
                                value={formData.quantity}
                                onChange={handleChange}
                            />
                            {error.quantity && <p className={styles.error}>{error.quantity[0]}</p>}
                        </div>
                        <div className="input_group">
                            <span>Precio Unitario</span>
                            <input
                                className="input"
                                type="number"
                                name="unit_price"
                                value={formData.unit_price}
                                onChange={handleChange}
                                step="0.01"
                            />
                            {error.unit_price && <p className={styles.error}>{error.unit_price[0]}</p>}
                        </div>

                        <h3>Descuentos</h3>

                        <div className="input_group">
                            <span>
                                Desc. Porcentaje (%):
                            </span>
                            <input
                                className="input"
                                type="number"
                                name="discount_percentage"
                                value={formData.discount_percentage}
                                onChange={handleChange}
                                step="0.01"
                            />
                            {error.discount_percentage && <p className={styles.error}>{error.discount_percentage[0]}</p>}
                        </div>
                        <div className="input_group">
                            {/* Campo de Descuento Fijo */}
                            <span>
                                Desc. Fijo ({formatPrice('0').slice(0, 1)}):
                            </span>
                            <input
                                className="input"
                                type="number"
                                name="discount_fixed_amount"
                                value={formData.discount_fixed_amount}
                                onChange={handleChange}
                                step="0.01"
                            />
                            {error.discount_fixed_amount && <p className={styles.error}>{error.discount_fixed_amount[0]}</p>}
                        </div>
                        {error.status && <p className={styles.error}>{error.status[0]}</p>}
                        <button
                            type="submit"
                            className="btn btn_solid"
                            disabled={loading}
                        >
                            {loading ? <FontAwesomeIcon icon={faCircleNotch} spin /> : 'Guardar Cambios'}
                        </button>
                    </form>
                </Modal>
            }
            {showConfirmRemove && (
                <ConfirmModal
                    message="¿Estás seguro de que quieres eliminar este producto del pedido?"
                    onConfirm={remove}
                    onCancel={() => setShowConfirmRemove(false)}
                />
            )}
        </>
    );
}
