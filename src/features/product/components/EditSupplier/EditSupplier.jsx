import { useEffect, useMemo, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';
import { ProductService } from '../../../../services/product/productService';
import { PriceListService } from '../../../../services/priceList/priceListService';
import { PRICE_LISTS } from '../../../../config/priceList';
import { formatPrice } from '../../../../utils/formatPrice';
import { Loading } from '../../../../components/Loading/Loading';
import { parseApiError } from '../../../../utils/parseApiError';
import styles from './EditSupplier.module.css';

export function EditSupplier({ supplier, suppliers, productId, onRefresh, onClose }) {

    const productService = useMemo(() => new ProductService(), []);
    const priceListService = useMemo(() => new PriceListService(), []);

    const [form, setForm] = useState({
        purchase_price: supplier?.pivot?.purchase_price ?? '',
        freight_percent: supplier?.pivot?.freight_percent ?? 5,
        supplier_product_url: supplier?.pivot?.supplier_product_url ?? ''
    });
    const [errors, setErrors] = useState({});
    const [loadingUpdate, setLoadingUpdate] = useState(false);
    const [loadingDisassociate, setLoadingDisassociate] = useState(false);

    const [updatePrice, setUpdatePrice] = useState(false);
    const [suggestedPriceLists, setSuggestedPriceLists] = useState(null);

    const selectedIndex = suppliers.findIndex(s => supplier && s.id === supplier.id);

    const getPriceLists = async () => {
        try {
            const response = await priceListService.get();
            setSuggestedPriceLists(
                response.map(e => ({
                    list_id: e.id,
                    list_name: e.name,
                    price: '',
                }))
            );
        } catch (error) {
            setSuggestedPriceLists([]);
        }
    };

    const calculateSuggestedPrices = (baseCost, freightPercent = 5) => {
        const cost = parseFloat(baseCost * (1 + freightPercent / 100));
        const suggestions = PRICE_LISTS.map(list => {
            const sellingPrice = cost / (1 - list.margin);
            return {
                list_id: list.id,
                list_name: list.name,
                price: sellingPrice.toFixed(2),
            };
        });
        setSuggestedPriceLists(suggestions);
    };

    const handleChangePriceList = (listToUpdate, value) => {
        setSuggestedPriceLists(currentLists => {
            return currentLists.map(list => {
                if (list.list_id === listToUpdate.list_id) {
                    return { ...list, price: value };
                }
                return list;
            });
        });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (!supplier) return;
        setLoadingUpdate(true);
        setErrors({});

        const payload = {
            suppliers: suppliers.map((s, index) => ({
                supplier_id: s.id,
                purchase_price: index === selectedIndex ? parseFloat(form.purchase_price) || 0 : s?.pivot?.purchase_price,
                freight_percent: index === selectedIndex ? parseFloat(form.freight_percent) ?? 5 : s?.pivot?.freight_percent ?? 5,
                supplier_product_url: index === selectedIndex ? form.supplier_product_url || null : s?.pivot?.supplier_product_url
            })),
            price_lists: updatePrice && suggestedPriceLists ? suggestedPriceLists.map(list => ({
                list_id: list.list_id,
                price: parseFloat(list.price) || 0,
            })) : undefined,
        };

        try {
            const { price_lists, suppliers: updatedSuppliers } = await productService.updateSuppliersAndPrices(payload, productId);
            onRefresh({ price_lists, suppliers: updatedSuppliers });
            onClose();
        } catch (error) {
            setErrors(parseApiError(error).fieldErrors ?? {});
        } finally {
            setLoadingUpdate(false);
        }
    };

    const handleDissociate = async () => {
        if (!supplier) return;
        setLoadingDisassociate(true);
        setErrors({});

        const remainingSuppliers = suppliers
            .filter(s => s.id !== supplier.id)
            .map(s => ({
                supplier_id: s.id,
                purchase_price: s.pivot.purchase_price,
                freight_percent: s.pivot.freight_percent ?? 5,
                supplier_product_url: s.pivot.supplier_product_url
            }));

        const payload = { suppliers: remainingSuppliers };

        try {
            const { price_lists, suppliers: updatedSuppliers } = await productService.updateSuppliersAndPrices(payload, productId);
            onRefresh({ price_lists, suppliers: updatedSuppliers });
            onClose();
        } catch (error) {
            setErrors(parseApiError(error).fieldErrors ?? {});
        } finally {
            setLoadingDisassociate(false);
        }
    };

    useEffect(() => {
        if (supplier) {
            setForm({
                purchase_price: supplier.pivot.purchase_price,
                freight_percent: supplier.pivot.freight_percent ?? 5,
                supplier_product_url: supplier.pivot.supplier_product_url || ''
            });
            setErrors({});
        }
    }, [supplier]);

    useEffect(() => {
        getPriceLists();
    }, []);

    useEffect(() => {
        if (!updatePrice) return;
        if (form.purchase_price === '' || isNaN(parseFloat(form.purchase_price))) return;
        calculateSuggestedPrices(parseFloat(form.purchase_price), parseFloat(form.freight_percent ?? 5));
    }, [form.purchase_price, form.freight_percent, updatePrice]);

    return (
        <form onSubmit={handleUpdate} className={styles.form}>
            <div className="input_group">
                <span>Precio de compra</span>
                <input
                    type="number"
                    name="purchase_price"
                    className="input"
                    step="0.01"
                    value={form.purchase_price}
                    onChange={handleChange}
                />
                {errors[`suppliers.${selectedIndex}.purchase_price`] &&
                    <p className={styles.error}>{errors[`suppliers.${selectedIndex}.purchase_price`][0]}</p>
                }
            </div>
            <div className="input_group">
                <span>Flete de compra (%)</span>
                <input
                    type="number"
                    name="freight_percent"
                    className="input"
                    step="0.1"
                    min="0"
                    max="100"
                    value={form.freight_percent}
                    onChange={handleChange}
                />
                {errors[`suppliers.${selectedIndex}.freight_percent`] &&
                    <p className={styles.error}>{errors[`suppliers.${selectedIndex}.freight_percent`][0]}</p>
                }
            </div>
            <div className="input_group">
                <span>Link del producto</span>
                <input
                    type="url"
                    name="supplier_product_url"
                    className="input"
                    value={form.supplier_product_url}
                    onChange={handleChange}
                />
                {errors[`suppliers.${selectedIndex}.supplier_product_url`] &&
                    <p className={styles.error}>{errors[`suppliers.${selectedIndex}.supplier_product_url`][0]}</p>
                }
            </div>

            <button
                type="button"
                className="btn"
                onClick={() => setUpdatePrice(prev => !prev)}
            >
                {updatePrice ? 'Ocultar precios sugeridos' : 'Sugerir precios'}
            </button>

            {updatePrice && (
                <>
                    {form.purchase_price &&
                        <div className={styles.delivery_price}>
                            <h3>Precio de compra con envío aprox.</h3>
                            <p>
                                {(() => {
                                    const base = parseFloat(form.purchase_price) || 0;
                                    const pct = parseFloat(form.freight_percent ?? 5) / 100;
                                    return `${formatPrice(base)} + ${formatPrice(base * pct)} = ${formatPrice(base * (1 + pct))}`;
                                })()}
                            </p>
                        </div>
                    }
                    <div className={styles.price_list}>
                        <h3>Listas de Precios</h3>
                        {suggestedPriceLists ?
                            suggestedPriceLists.map((list, idx) => (
                                <div key={list.list_id} className="input_group">
                                    <span>{list.list_name}</span>
                                    <input
                                        type="number"
                                        className="input"
                                        value={list.price}
                                        onChange={(e) => handleChangePriceList(list, e.target.value)}
                                        placeholder={`Precio ${list.list_name}`}
                                        step="0.01"
                                    />
                                    {errors[`price_lists.${idx}.price`] &&
                                        <p className={styles.error}>{errors[`price_lists.${idx}.price`][0]}</p>
                                    }
                                </div>
                            )) :
                            <Loading />
                        }
                    </div>
                </>
            )}

            <button type="submit" className="btn btn_solid" disabled={loadingUpdate}>
                {loadingUpdate ? <FontAwesomeIcon icon={faCircleNotch} spin /> : 'Guardar cambios'}
            </button>
            <button type="button" className="btn btn_error_regular" onClick={handleDissociate} disabled={loadingDisassociate}>
                {loadingDisassociate ? <FontAwesomeIcon icon={faCircleNotch} spin /> : 'Desasociar'}
            </button>
        </form>
    );
}



