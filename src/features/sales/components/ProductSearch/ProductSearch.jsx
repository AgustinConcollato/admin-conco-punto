import { faCircleNotch, faSearch } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Loading } from '../../../../components/Loading/Loading';
import { Modal } from '../../../../components/Modal/Modal';
import { IMAGE_URL } from '../../../../config/api';
import { FILTERS } from '../../../../config/product';
import { OrderContext } from '../../../../contexts/OrderContext';
import { ProductService } from '../../../../services/product/productService';
import { formatPrice } from '../../../../utils/formatPrice';
import styles from './ProductSearch.module.css';

export function ProductSearch() {

    const { order, addProduct } = useContext(OrderContext);

    const productService = useMemo(() => new ProductService(), []);

    const filters = {
        ...FILTERS,
        price_list_id: order.price_list_id,
        status: 'published',
        stock_min: 1
    }

    const searchRef = useRef(null);
    const inputRef = useRef(null);
    const optionRefs = useRef([])

    const [results, setResults] = useState([]);
    const [search, setSearch] = useState('');
    const [showResults, setShowResults] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [isLoading, setIsLoading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState({});

    const [productToQuantify, setProductToQuantify] = useState(null);
    const [quantity, setQuantity] = useState(1);

    const searchForProducts = async (value) => {
        if (!value.trim()) return;

        setHighlightedIndex(-1);
        setIsLoading(true);

        try {
            const response = await productService.getAll({ ...filters, search: value });
            setResults(response.data);
            setShowResults(true);
        } catch (error) {
            console.error('Error fetching products:', error);
            setResults([]);
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Maneja las teclas (Flechas y Enter) durante la BÚSQUEDA de productos.
     */
    function handleKeyDown(event) {
        if (event.key === 'ArrowDown') {
            setHighlightedIndex((prevIndex) =>
                prevIndex === -1 ? 0 : Math.min(prevIndex + 1, results.length - 1)
            )
        } else if (event.key === 'ArrowUp') {
            setHighlightedIndex((prevIndex) => Math.max(prevIndex - 1, -1));
        } else if (event.key === 'Enter') {

            if (highlightedIndex < 0) return;

            event.preventDefault();
            const selectedOption = results[highlightedIndex];

            if (selectedOption) {
                // Al seleccionar con Enter, pasa al modo cuantificación
                setProductToQuantify(selectedOption);
                setShowResults(false);
                setResults([]);
                // setSearch(selectedOption.name); // Muestra el nombre del producto seleccionado
                setHighlightedIndex(-1);
                setQuantity(1); // Resetear a 1
            }
        }
    };

    /**
     * Confirma la cantidad y agrega el producto a la orden.
     */
    const confirmProductToOrder = async () => {

        setError({});
        setLoading(true);

        if (!productToQuantify || quantity < 1) return;

        try {
            const product = productToQuantify;

            // Extracción de precios
            const priceListItem = product.price_lists[0];
            const unitPrice = priceListItem ? parseFloat(priceListItem.pivot?.price) : 0;

            const supplierItem = product.suppliers.length > 0 ? product.suppliers[0] : null;
            const purchasePrice = supplierItem ? parseFloat(supplierItem.pivot?.purchase_price) : unitPrice - (unitPrice * (order.price_list_id === 1 ? 0.3 : 0.45));

            // Cálculo de valores (si el backend lo requiere)
            const subtotal = unitPrice * quantity;

            // Objeto de datos listo para el backend
            const productDataForOrder = {
                product_id: product.id,
                quantity: quantity, // 🚨 Cantidad seleccionada
                unit_price: unitPrice,
                purchase_price: purchasePrice,
                // Campos adicionales requeridos por el backend:
                // subtotal: subtotal,
                // discount_percentage: 0,
                // subtotal_with_discount: subtotal,
            };

            await addProduct(productDataForOrder);

            setProductToQuantify(null);
            setQuantity(1);
        } catch (error) {
            setError(error[0]);
        } finally {
            setLoading(false);
        }
    }

    /**
     * Maneja la tecla Enter durante la CUANTIFICACIÓN.
     */
    function handleQuantifyKeyDown(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            confirmProductToOrder(); // Confirma la cantidad y agrega
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
    }, [productToQuantify]);

    // Efecto para el scroll al resaltar con las flechas.
    useEffect(() => {
        if (optionRefs.current[highlightedIndex]) {
            optionRefs.current[highlightedIndex].scrollIntoView({
                behavior: 'smooth',
                block: 'nearest'
            })
        }
    }, [highlightedIndex]);


    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.code === "ShiftLeft") {
                event.preventDefault();

                setError(null);

                inputRef.current?.focus();
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    return (
        <>
            <form
                className={styles.search_form}
                onSubmit={e => e.preventDefault()}
                ref={searchRef}
            >
                <input
                    type="text"
                    placeholder="Nombre, SKU, Código de barras"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className={'input'}
                    onKeyDown={handleKeyDown} // Maneja flechas y Enter
                    ref={inputRef}
                    autoComplete="off"
                    id='order-search'
                    autoFocus
                />
            </form >

            {(showResults && results.length > 0) ? (
                <div className={styles.container_results_list}>
                    <ul className={styles.results_list}>
                        {isLoading ? (
                            <Loading />
                        ) : (
                            results.map((product, i) => (
                                <li
                                    key={product.id}
                                    className={`${highlightedIndex === i ? styles.highlighted : ''} ${styles.result}`}
                                    ref={(el) => (optionRefs.current[i] = el)}
                                    onClick={() => {
                                        setProductToQuantify(product);
                                        // setSearch(product.name);
                                        setHighlightedIndex(-1);
                                        setQuantity(1);
                                    }}
                                >
                                    <div>
                                        <img src={`${IMAGE_URL}/${product.images[0]?.thumbnail_path}`} />
                                        <p>
                                            {product.name}
                                            <span>{product.sku}</span>
                                        </p>
                                    </div>
                                    <p>{formatPrice(product.price_lists[0]?.pivot?.price)}</p>
                                </li>
                            ))
                        )}
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
            {productToQuantify &&
                <Modal
                    onClose={() => setProductToQuantify(null)}
                    title={productToQuantify.name}
                >
                    <div className={styles.quantify_container}>
                        <div className='input_group'>
                            <span>Cantidad</span>
                            <input
                                type="number"
                                value={quantity}
                                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value)))}
                                onKeyDown={handleQuantifyKeyDown}
                                className={'input ' + styles.quantity_input}
                                ref={inputRef}
                                max={productToQuantify.stock}
                                autoFocus
                            />
                            {error.quantity && <p className={styles.error}>{error.quantity[0]}</p>}
                        </div>
                        <p>Cantidad en stock: {productToQuantify.stock}</p>
                        {error.status && <p className={styles.error}>{error.status[0]}</p>}
                        <button
                            type="button"
                            onClick={confirmProductToOrder}
                            className='btn btn_solid'
                        >
                            {loading ? <FontAwesomeIcon icon={faCircleNotch} spin /> : 'Agregar'}
                        </button>
                        <button
                            type="button"
                            onClick={() => { setProductToQuantify(null) }}
                            className='btn '
                        >
                            Cancelar
                        </button>
                    </div>
                </Modal>
            }
        </>
    );
}