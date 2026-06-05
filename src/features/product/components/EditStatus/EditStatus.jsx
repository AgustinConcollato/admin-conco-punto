import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import { ProductService } from "../../../../services/product/ProductService";
import styles from '../Status/Stauts.module.css';

export function EditStatus({ currentStatus, productId, onRefresh, onCancel }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const productService = useMemo(() => new ProductService(), []);

    const nextStatus = currentStatus === 'published' ? 'archived' : 'published';

    const handleUpdateStatus = async () => {
        setIsSubmitting(true);
        try {
            const updated = await productService.updateStatus(nextStatus, productId);
            onRefresh(updated?.status ?? nextStatus);
        } catch (error) {
            console.error("Error al actualizar estado:", error);
            toast.error("No se pudo cambiar el estado.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={styles.modal_body}>
            <p>
                ¿Estás seguro de que deseas <strong>{currentStatus === 'published' ? 'archivar' : 'publicar'}</strong> este producto?
            </p>
            <p className={styles.modal_description}>
                {currentStatus === 'published'
                    ? 'El producto dejará de estar visible en la tienda.'
                    : 'El producto volverá a estar disponible para los clientes.'}
            </p>

            <button
                className={`btn ${currentStatus === 'published' ? 'btn_error_solid' : 'btn_solid'}`}
                onClick={handleUpdateStatus}
                disabled={isSubmitting}
            >
                {isSubmitting ? (
                    <FontAwesomeIcon icon={faCircleNotch} spin />
                ) : (
                    currentStatus === 'published' ? 'Archivar' : 'Publicar'
                )}
            </button>
            <button
                className="btn"
                onClick={onCancel}
                disabled={isSubmitting}
            >
                Cancelar
            </button>
        </div>
    );
}


