import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Loading } from '../../../../components/Loading/Loading';
import { Modal } from '../../../../components/Modal/Modal';
import { IMAGE_URL } from '../../../../config/api';
import { FILTERS } from '../../../../config/product';
import { OrderContext } from '../../../../context/OrderContext';
import { ProductService } from '../../../../services/product/productService';
import { ProductVariantService } from '../../../../services/product/productVariantService';
import { formatPrice } from '../../../../utils/formatPrice';
import { BatchAddModal } from '../BatchAddModal/BatchAddModal';
import styles from './ProductSearch.module.css';

// Normaliza un producto a la forma interna del buscador
const fromProduct = (p) => ({
    _key: `p-${p.id}`,
    _type: 'product',
    name: p.name,
    sku: p.sku,
    stock: p.stock,
    image: p.images?.[0]?.thumbnail_path ?? null,
    price_lists: p.price_lists ?? [],
    suppliers: p.suppliers ?? [],
    attribute_values: p.attribute_values,
    variants: p.variants ?? [],
    product_id: p.id,
    variant_id: null,
});

export function ProductSearch() {
    const { order, addProduct } = useContext(OrderContext);

    const productService = useMemo(() => new ProductService(), []);
    const variantService = useMemo(() => new ProductVariantService(), []);

    const filters = {
        ...FILTERS,
        price_list_id: order.price_list_id,
        status: 'published',
        stock_min: 1,
    };

    const searchRef = useRef(null);
    const inputRef = useRef(null);
    const optionRefs = useRef([]);

    const [results, setResults] = useState([]);
    const [search, setSearch] = useState('');
    const [showResults, setShowResults] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [isLoading, setIsLoading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState({});

    const [itemToQuantify, setItemToQuantify] = useState(null);
    const [itemToBatch, setItemToBatch] = useState(null);
    const [quantity, setQuantity] = useState(1);

    const selectItem = (item) => {
        console.log(item)
        const mobile = window.innerWidth < 640;
        const hasVariants = item._type === 'product' && item.variants.length > 0;

        if (hasVariants || mobile) {
            let batchItem = item;
            if (item._type === 'variant') {
                // Variante directa en celular: envolver como producto sintÃ©tico con una sola fila
                batchItem = {
                    ...item,
                    stock: 0,
                    variants: [{
                        id: item.variant_id,
                        stock: item.stock,
                        sku: item.sku,
                        attribute_values: item.attribute_values,
                        images: item.image ? [{ thumbnail_path: item.image }] : [],
                    }],
                };
            }
            setItemToBatch(batchItem);
        } else {
            setItemToQuantify(item);
            setQuantity(1);
        }
        setShowResults(false);
        setResults([]);
        setHighlightedIndex(-1);
    };

    const searchForProducts = async (value) => {
        if (!value.trim()) return;
        setHighlightedIndex(-1);
        setIsLoading(true);

        try {
            const productRes = await productService.getAll({ ...filters, search: value })
            const products = (productRes.data ?? []).map(fromProduct);
            // const variants = (variantRes ?? []).map(fromVariant);
            setResults(products);
            setShowResults(true);
        } catch (err) {
            console.error('Error fetching products:', err);
            setResults([]);
        } finally {
            setIsLoading(false);
        }
    };

    function handleKeyDown(event) {
        if (event.key === 'ArrowDown') {
            setHighlightedIndex((prev) => prev === -1 ? 0 : Math.min(prev + 1, results.length - 1));
        } else if (event.key === 'ArrowUp') {
            setHighlightedIndex((prev) => Math.max(prev - 1, -1));
        } else if (event.key === 'Enter') {
            if (highlightedIndex < 0) return;
            event.preventDefault();
            const selected = results[highlightedIndex];
            if (selected) {
                selectItem(selected);
            }
        }
    }

    const confirmToOrder = async () => {
        setError({});
        setLoading(true);
        if (!itemToQuantify || quantity < 1) return;

        try {
            const item = itemToQuantify;
            const priceListItem = item.price_lists[0];
            const unitPrice = priceListItem ? parseFloat(priceListItem.pivot?.price) : 0;
            const supplierItem = item.suppliers[0] ?? null;
            const purchasePrice = supplierItem
                ? parseFloat(supplierItem.pivot?.purchase_price)
                : unitPrice - (unitPrice * (order.price_list_id === 1 ? 0.3 : 0.45));

            const orderData = {
                product_id: item.product_id,
                ...(item.variant_id && { variant_id: item.variant_id }),
                quantity,
                unit_price: unitPrice,
                purchase_price: purchasePrice,
            };

            await addProduct(orderData);
            setItemToQuantify(null);
            setQuantity(1);
        } catch (err) {
            setError(err[0] ?? {});
        } finally {
            setLoading(false);
        }
    };

    function handleQuantifyKeyDown(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            confirmToOrder();
        }
    }

    useEffect(() => {
        if (!search || search.trim() === '') {
            setResults([]);
            return;
        }
        searchForProducts(search);
    }, [search]);

    useEffect(() => {
        setError({});
        setShowResults(false);
        setResults([]);
    }, [itemToQuantify]);

    useEffect(() => {
        if (optionRefs.current[highlightedIndex]) {
            optionRefs.current[highlightedIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }, [highlightedIndex]);

    useEffect(() => {
        const handler = (event) => {
            if (event.code === 'ShiftLeft') {
                event.preventDefault();
                setError(null);
                inputRef.current?.focus();
            }
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, []);

    return (
        <>
            <form className={styles.search_form} onSubmit={e => e.preventDefault()} ref={searchRef}>
                <input
                    type="text"
                    placeholder="Nombre, SKU, CÃ³digo de barras"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className={'input'}
                    onKeyDown={handleKeyDown}
                    ref={inputRef}
                    autoComplete="off"
                    id='order-search'
                    autoFocus
                />
            </form>
            {(showResults && results.length > 0) ? (
                <div className={styles.container_results_list}>
                    <ul className={styles.results_list}>
                        {isLoading ? <Loading /> : results.map((item, i) => (
                            <li
                                key={item._key}
                                className={`${highlightedIndex === i ? styles.highlighted : ''} ${styles.result}`}
                                ref={(el) => (optionRefs.current[i] = el)}
                                onClick={() => selectItem(item)}
                            >
                                <div>
                                    {item.image && <img src={`${IMAGE_URL}/${item.image}`} alt="" />}
                                    <p>
                                        {item.name}
                                        <span>{item.sku}</span>
                                        {item._type === 'variant' && item.attribute_values.length > 0 && (
                                            <span className={styles.variant_attrs}>
                                                {item.attribute_values.map(av => av.value).join(' Â· ')}
                                            </span>
                                        )}
                                        {item._type === 'product' && item.variants.length > 0 && (
                                            <span className={styles.variant_badge}>
                                                {item.variants.length} var.
                                            </span>
                                        )}
                                    </p>
                                </div>
                                <p>
                                    {item._type === 'product' && item.variants.length > 0
                                        ? <span className={styles.variant_badge}>{item.variants.filter(v => v.stock > 0).length} con stock</span>
                                        : formatPrice(item.price_lists[0]?.pivot?.price)
                                    }
                                </p>
                            </li>
                        ))}
                    </ul>
                </div>
            ) : (
                (showResults && search && !isLoading) &&
                <div className={styles.container_results_list}>
                    <ul className={styles.results_list}>
                        <li className={styles.no_results}>No hay resultados</li>
                    </ul>
                </div>
            )}

            {itemToQuantify && (
                <Modal onClose={() => setItemToQuantify(null)} title={itemToQuantify.name}>
                    <div className={styles.quantify_container}>
                        {itemToQuantify._type === 'variant' && itemToQuantify.attribute_values.length > 0 && (
                            <div className={styles.variant_pills}>
                                {itemToQuantify.attribute_values.map(av => (
                                    <span key={av.category_attribute_id} className={styles.variant_pill}>
                                        <span className={styles.pill_label}>{av.category_attribute?.name}</span>
                                        {av.value}
                                    </span>
                                ))}
                            </div>
                        )}
                        <div className='input_group'>
                            <span>Cantidad</span>
                            <input
                                type="number"
                                value={quantity}
                                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value)))}
                                onKeyDown={handleQuantifyKeyDown}
                                className={'input ' + styles.quantity_input}
                                ref={inputRef}
                                max={itemToQuantify.stock}
                                autoFocus
                            />
                            {error?.quantity && <p className={styles.error}>{error.quantity[0]}</p>}
                        </div>
                        <p>Cantidad en stock: {itemToQuantify.stock}</p>
                        {error?.status && <p className={styles.error}>{error.status[0]}</p>}
                        <button type="button" onClick={confirmToOrder} className='btn btn_solid'>
                            {loading ? <FontAwesomeIcon icon={faCircleNotch} spin /> : 'Agregar'}
                        </button>
                        <button type="button" onClick={() => setItemToQuantify(null)} className='btn'>Cancelar</button>
                    </div>
                </Modal>
            )}

            {itemToBatch && (
                <BatchAddModal
                    product={itemToBatch}
                    order={order}
                    addProduct={addProduct}
                    onClose={() => { setItemToBatch(null); setSearch(''); }}
                />
            )}
        </>
    );
}

