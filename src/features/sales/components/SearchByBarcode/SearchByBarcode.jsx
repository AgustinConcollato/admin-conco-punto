import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext, useEffect, useRef, useState } from "react";
import { Loading } from "../../../../components/Loading/Loading";
import { IMAGE_URL } from "../../../../config/api";
import { OrderContext } from "../../../../contexts/OrderContext";
import { ProductService } from "../../../../services/product/productService";
import styles from "./SearchByBarcode.module.css";

export function SearchByBarcode() {
    const { order, addProduct } = useContext(OrderContext);

    const [product, setProduct] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const barcodeInputRef = useRef(null);

    const addProductToOrder = async (product) => {
        try {
            // Extracción de precios
            const [priceListItem] = product.price_lists.filter(e => e.id == order.price_list_id);
            const unitPrice = priceListItem ? parseFloat(priceListItem.pivot.price) : 0;
            const supplierItem = product.suppliers.length > 0 ? product.suppliers[0] : null;
            const purchasePrice = supplierItem ? parseFloat(supplierItem.pivot.purchase_price) : unitPrice - (unitPrice * (order.price_list_id === 1 ? 0.3 : 0.45));

            // Objeto de datos listo para el backend
            const productDataForOrder = {
                product_id: product.id,
                quantity: 1,
                unit_price: unitPrice,
                purchase_price: purchasePrice,
            };

            await addProduct(productDataForOrder);
        } catch (error) {
            setError(error[0].quantity);
        } finally {
            setProduct(null)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        setIsLoading(true);
        setError(null);
        setProduct(null);

        const productService = new ProductService();

        const barcode = e.target.barcode.value

        try {
            const foundProduct = await productService.getByBarcode(barcode);
            setProduct(foundProduct);

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
            if (barcodeInputRef.current) {
                barcodeInputRef.current.value = '';
            }
            barcodeInputRef.current.focus();
        }
    }

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.code === "ShiftLeft") {
                event.preventDefault();

                setProduct(null);
                setError(null);

                barcodeInputRef.current?.focus();
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    useEffect(() => {
        if (product) {
            addProductToOrder(product);
        }
    }, [product]);

    useEffect(() => {
        if (!isLoading) {
            barcodeInputRef.current?.focus();
        }
    }, [isLoading]);

    return (
        <>
            <form className={styles.form_search} onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="barcode"
                    placeholder="Escanear o introducir código..."
                    autoFocus
                    disabled={isLoading}
                    className={styles.form_input}
                    ref={barcodeInputRef}
                    autoComplete="off"
                />
            </form>

            {isLoading && <p className={styles.status_loading}><Loading /></p>}
            {error && <p className={styles.error}> {error}</p>}

            {product && (
                <div className={styles.product_card}>
                    <img
                        src={`${IMAGE_URL}/${product.images[0]?.thumbnail_path}`}
                        alt={`Imagen de ${product.name}`}
                    />
                    <div className={styles.product_info}>
                        <h4> {product.name}</h4>
                        <span >{product.sku}</span>
                    </div>
                    <FontAwesomeIcon icon={faCircleNotch} spin />
                </div>
            )}
        </>
    );
}