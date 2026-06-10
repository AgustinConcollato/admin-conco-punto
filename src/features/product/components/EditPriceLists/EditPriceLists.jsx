import { useState, useEffect, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import { PRICE_LISTS } from '../../../../config/priceList';
import { ProductService } from '../../../../services/product/ProductService';
import { parseApiError } from '../../../../utils/parseApiError';
import styles from '../PriceLists/PriceLists.module.css';

export function EditPriceLists({ currentPriceLists, productId, onRefresh }) {
    const [priceList, setPriceList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const productService = useMemo(() => new ProductService(), []);

    // Inicializar los datos combinando la configuración base con los precios actuales
    useEffect(() => {
        const mergedPriceLists = PRICE_LISTS.map(baseList => {
            const currentPriceItem = currentPriceLists.find(cp => cp.id === baseList.id);
            return {
                id: baseList.id,
                name: baseList.name,
                price: currentPriceItem ? currentPriceItem.pivot.price : null,
            };
        });
        setPriceList(mergedPriceLists);
    }, [currentPriceLists]);

    const handleChangePriceList = (id, value) => {
        setPriceList(prev => prev.map(item =>
            item.id === id ? { ...item, price: value } : item
        ));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const data = {
            price_lists: priceList.map(e => ({
                list_id: e.id,
                price: e.price === '' || e.price === null ? null : parseFloat(e.price)
            }))
        };

        try {
            const response = await productService.updatePrices(data, productId);
            onRefresh(response);
            toast.success('Precios actualizados.');
        } catch (error) {
            const { fieldErrors, message } = parseApiError(error);
            setErrors(fieldErrors ?? {});
            if (!fieldErrors) toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className={styles.edit_form}>
            {priceList.map((list, i) => (
                <div key={list.id} className="input_group">
                    <span>{list.name}</span>
                    <input
                        type="number"
                        className="input"
                        value={list.price === null ? '' : list.price}
                        onChange={(e) => handleChangePriceList(list.id, e.target.value)}
                        placeholder={`0.00`}
                        step="0.01"
                    />
                    {errors[`price_lists.${i}.price`] && (
                        <p className={styles.error}>{errors[`price_lists.${i}.price`][0]}</p>
                    )}
                </div>
            ))}
            <button type="submit" className="btn btn_solid" disabled={loading}>
                {loading ? <FontAwesomeIcon icon={faCircleNotch} spin /> : 'Actualizar Precios'}
            </button>
        </form>
    );
}

