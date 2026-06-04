import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { ClientService } from "../../../../services/client/clientService";
import { PriceListService } from "../../../../services/priceList/priceListService";
import { generateRandomString } from "../../../../utils/generateRandomString";
import styles from './NewClientForm.module.css';

export function NewClientForm() {
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [priceLists, setPriceLists] = useState([]);

    const getPriceLists = async () => {
        const priceListService = new PriceListService();

        try {
            const response = await priceListService.get();
            setPriceLists(response);
        } catch (error) {

        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setErrors({});
        setLoading(true);

        const clientService = new ClientService();
        const formData = new FormData(e.target);

        const password = generateRandomString();
        formData.append('password', `${password}`)

        if (!e.target.email.value) {
            formData.delete('email');
            formData.append('email', `test-${password}@gmail.com`)
        }

        try {
            await clientService.create(formData);
            e.target.reset();

            scrollTo({
                top: 0,
                behavior: 'smooth'
            });

        } catch (error) {
            setErrors(error.errors);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        getPriceLists();
    }, []);

    return (
        <>
            <form onSubmit={handleSubmit} className={styles.form}>
                <div className="input_group">
                    <span>Nombre</span>
                    <input className="input" type="text" name="name" placeholder="Nombre" />
                    {errors.name && <p className={styles.error}>{errors.name[0]}</p>}
                </div>
                <div className="input_group">
                    <span>Correo electrÃ³nico (opcional)</span>
                    <input className="input" type="email" name="email" placeholder="Correo electrÃ³nico (opcional)" />
                    {errors.email && <p className={styles.error}>{errors.email[0]}</p>}
                </div>
                <div className="input_group">
                    <span>Celular (opcional)</span>
                    <input className="input" type="tel" name="phone" placeholder="Celular (opcional)" />
                    {errors.phone && <p className={styles.error}>{errors.phone[0]}</p>}
                </div>
                <div className="input_group">
                    <span>Lista de precios</span>
                    <select className="input" name="price_list_id">
                        <option value="">Seleccionar lista</option>
                        {priceLists && priceLists.map((priceList) => (
                            <option value={priceList.id}>{priceList.name}</option>
                        ))}
                    </select>
                    {errors.price_list_id && <p className={styles.error}>{errors.price_list_id[0]}</p>}
                </div>
                <button type="submit" className="btn btn_solid" disabled={loading}>
                    {loading ? <FontAwesomeIcon icon={faCircleNotch} spin /> : 'Agregar cliente'}
                </button>
            </form>
        </>
    );
}


