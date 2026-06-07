import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Loading } from '../../../../components/Loading/Loading';
import { PRICE_LISTS } from '../../../../config/priceList';
import { PriceListService } from '../../../../services/priceList/priceListService';
import { ProductService } from '../../../../services/product/productService';
import { formatPrice } from '../../../../utils/formatPrice';
import { SupplierList } from '../SupplierList/SupplierList';
import styles from './AddPrices.module.css';
import { ProductSummary } from '../ProductSummary/ProductSummary';

export function AddPrices() {

    const productService = useMemo(() => new ProductService(), []);

    const { id } = useParams();
    const navigate = useNavigate();

    const [suppliers, setSuppliers] = useState([]);
    const [product, setProduct] = useState(() => {
        const sessionProduct = sessionStorage.getItem('product');
        return sessionProduct ? JSON.parse(sessionProduct) : null;
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

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

        const formData = new FormData(e.target);

        suppliers.forEach((supplier, i) => {
            formData.append(`suppliers[${i}][supplier_id]`, supplier.supplier_id);
            formData.append(`suppliers[${i}][purchase_price]`, supplier.purchase_price);
            formData.append(`suppliers[${i}][freight_percent]`, supplier.freight_percent ?? 5);
            formData.append(`suppliers[${i}][supplier_product_url]`, supplier.supplier_product_url || '');
        });

        suggestedPriceLists.forEach((list, i) => {
            formData.append(`price_lists[${i}][list_id]`, list.list_id);
            formData.append(`price_lists[${i}][price]`, list.price);
        });

        try {
            if (!product) {
                throw new Error('Producto no encontrado');
            }
            const updatedProduct = await productService.addPrices(formData, product.id);
            navigate(`/productos/nuevo/4/${updatedProduct.id}`);

        } catch (error) {
            setErrors(error[0]);
        } finally {
            setLoading(false);
        }
    }

    const getProductDetail = async () => {
        try {
            const productData = await productService.getById(id);
            setProduct(productData);
            sessionStorage.setItem('product', JSON.stringify(productData));
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        suppliers.length > 0 && calculateSuggestedPrices(suppliers[0].purchase_price, suppliers[0].freight_percent ?? 5);
    }, [suppliers]);

    useEffect(() => {
        if (!id && !product) {
            navigate('/productos/nuevo/1');
        }

        if (!product && id) {
            getProductDetail();
        }

        getPriceLists();
    }, []);

    useEffect(() => {
        if (product && product?.price_lists?.length > 0) {
            navigate(`/productos/nuevo/4/${product.id}`);
        }
    }, [product])

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            <h1 className="title">Agregar Proveedor y Precios</h1>
            {product ?
                <>
                    <ProductSummary product={product} />
                    <SupplierList
                        suppliers={suppliers}
                        setSuppliers={setSuppliers}
                        errors={errors}
                    />
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
                    <button type="submit" className="btn btn_solid" disabled={loading}>
                        {loading ? <FontAwesomeIcon icon={faCircleNotch} spin /> : 'Siguiente'}
                    </button>
                </> :
                <Loading />
            }
            {product && <Link to={`/productos/nuevo/4/${product.id}`} className="btn btn_regular">Agregar Código de Barras</Link>}
        </form>
    );
}

