import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import styles from './NewSupplierPage.module.css'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import { SupplierService } from "../../../../services/supplier/supplierService";

export function NewSupplierPage() {

    const supplierService = useMemo(() => new SupplierService(), []);

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.target)

        try {
            await supplierService.createSupplier(formData);

            e.target.reset();
            setErrors({});
            toast.success("Proveedor agregado");
        } catch (error) {
            setErrors(error[0]);
        } finally {
            setLoading(false);
        }
    }

    return (
        <form className={styles.page} onSubmit={handleSubmit}>
            <h1 className="title">Agregar proveedor</h1>
            <div className="input_group">
                <span>Nombre</span>
                <input
                    type="text"
                    name="name"
                    className="input"
                    placeholder="Nombre"
                />
                {errors.name && <p className={styles.error}>{errors.name[0]}</p>}
            </div>
            <div className="input_group">
                <span>Email</span>
                <input
                    type="text"
                    name="email"
                    className="input"
                    placeholder="Email (opcional)"
                />
                {errors.email && <p className={styles.error}>{errors.email[0]}</p>}
            </div>
            <div className="input_group">
                <span>Contacto</span>
                <input
                    type="text"
                    name="contact_person"
                    className="input"
                    placeholder="Contacto (opcional)"
                />
            </div>
            <div className="input_group">
                <span>TelÃ©fono</span>
                <input
                    type="text"
                    name="phone"
                    className="input"
                    placeholder="TelÃ©fono (opcional)"
                />
            </div>
            <div className="input_group">
                <span>PÃ¡gina web</span>
                <input
                    type="text"
                    name="address"
                    className="input"
                    placeholder="PÃ¡gina web (opcional)"
                />
            </div>
            <button
                type="submit"
                className="btn btn_solid"
                disabled={loading}
            >
                {loading ? <FontAwesomeIcon icon={faCircleNotch} spin /> : 'Agregar'}
            </button>
        </form>
    );
}
