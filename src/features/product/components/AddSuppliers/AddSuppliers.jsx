import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useMemo, useState } from 'react';
import { Loading } from '../../../../components/Loading/Loading';
import { PRICE_LISTS } from '../../../../config/priceList';
import { PriceListService } from '../../../../services/priceList/priceListService';
import { ProductService } from '../../../../services/product/productService';
import { formatPrice } from '../../../../utils/formatPrice';
import { SupplierList } from '../SupplierList/SupplierList';
import styles from './AddSuppliers.module.css';

export function AddSuppliers({ productId, currentSuppliers, onRefresh, onClose }) {

    const productService = useMemo(() => new ProductService(), []);

    const [suppliers, setSuppliers] = useState([]);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [updatePrice, setUpdatePrice] = useState(false);

    const [suggestedPriceLists, setSuggestedPriceLists] = useState(null);

    const getPriceLists = async () => {
        const priceListService = new PriceListService();

        try {
            const response = await priceListService.get();
            setSuggestedPriceLists(
                response.map(e => {
                    return {
                        list_id: e.id,
                        list_name: e.name,
                        price: '',
                    }
                })
            );
        } catch (error) {

        }
    };

    const calculateSuggestedPrices = (baseCost, freightPercent = 5) => {

        const cost = parseFloat(baseCost * (1 + freightPercent / 100));

        const suggestions = PRICE_LISTS.map(list => {
            // Fórmula: Precio de Venta = Precio de Compra / (1 - Margen de Ganancia)
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
                    return {
                        ...list,
                        price: value
                    };
                }
                return list;
            });
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});


        const payload = {
            // 'suppliers' se llenará después de la lógica de fusión.
            suppliers: [],
            // Solo enviamos price_lists si updatePrice está activado
            price_lists: updatePrice ? suggestedPriceLists.map(list => ({
                list_id: list.list_id,
                price: parseFloat(list.price) || 0,
            })) : undefined, // Si no está activo, se omite del payload
        };


        let isDuplicateInCurrentSupplies = [];


        try {
            if (suppliers.length != 0) {
                isDuplicateInCurrentSupplies = currentSuppliers.map(s => {
                    return {
                        supplier_id: s.id,
                        purchase_price: s.pivot.purchase_price,
                        freight_percent: s.pivot.freight_percent ?? 5,
                        supplier_product_url: s.pivot.supplier_product_url,
                    }
                })

                isDuplicateInCurrentSupplies = isDuplicateInCurrentSupplies.filter(e => e.supplier_id !== suppliers[0].supplier_id)
                payload.suppliers = [...isDuplicateInCurrentSupplies, ...suppliers];
            } else {
                throw [{
                    suppliers: ['Selecciona algún proveedor.']
                }]
            }

            if (!productId) {
                throw new Error('Producto no encontrado');
            }

            // Llamada al servicio con el payload unificado
            const { price_lists, suppliers: s } = await productService.updateSuppliersAndPrices(payload, productId);

            onRefresh({ price_lists, suppliers: s });
            onClose();
        } catch (error) {
            // Asumiendo que `error[0]` es el formato correcto para los errores
            setErrors(error[0]);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        setErrors({});
        suppliers.length > 0 && calculateSuggestedPrices(suppliers[0].purchase_price, suppliers[0].freight_percent ?? 5);
    }, [suppliers]);

    useEffect(() => {
        getPriceLists();
    }, []);


    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            {productId ?
                <>
                    <SupplierList
                        suppliers={suppliers}
                        setSuppliers={setSuppliers}
                        errors={errors}
                        currentSuppliers={currentSuppliers}
                    />
                    <h3>Actualizar precios</h3>
                    <button
                        type='button'
                        className='btn btn_regular'
                        onClick={() => setUpdatePrice(!updatePrice)}
                    >
                        Sugerir precios
                    </button>
                    {updatePrice &&
                        <>
                            {suppliers.length > 0 &&
                                <div className={styles.delivery_price}>
                                    <h3>Precio de compra con envio aprox.</h3>
                                    <p>
                                        {(() => {
                                            const base = parseFloat(suppliers[0].purchase_price || 0);
                                            const pct = parseFloat(suppliers[0].freight_percent ?? 5) / 100;
                                            return `${formatPrice(base)} + ${formatPrice(base * pct)} = ${formatPrice(base * (1 + pct))}`;
                                        })()}
                                    </p>
                                </div>
                            }
                            <div className={styles.price_list}>
                                <h3>Listas de Precios</h3>
                                {suggestedPriceLists ?
                                    suggestedPriceLists.map((list) => (
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
                                            {errors['price_lists.' + suggestedPriceLists.findIndex(s => s.list_id === list.list_id) + '.price'] &&
                                                <p className={styles.error}>{errors['price_lists.' + suggestedPriceLists.findIndex(s => s.list_id === list.list_id) + '.price'][0]}</p>
                                            }
                                        </div>
                                    )) :
                                    <Loading />
                                }
                            </div>
                        </>
                    }
                    <button type="submit" className="btn btn_solid" disabled={loading}>
                        {loading ? <FontAwesomeIcon icon={faCircleNotch} spin /> : 'Agregar'}
                    </button>
                </> :
                <Loading />
            }
        </form >
    );
}



