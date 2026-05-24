import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Loading } from "../../../../components/Loading/Loading";
import { IMAGE_URL } from "../../../../config/api";
import { ProductService } from "../../../../services/product/productService";
import { formatPrice } from "../../../../utils/formatPrice";
import styles from "./SearchProductsByBarcode.module.css";

export function SearchProductsByBarcode({ onClose }) {
    const [barcode, setBarcode] = useState('');
    const [product, setProduct] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const barcodeInputRef = useRef(null);

    const searchProduct = async (code) => {
        setIsLoading(true);
        setError(null);
        setProduct(null);

        const productService = new ProductService();

        try {
            const foundProduct = await productService.getByBarcode(code);
            setProduct(foundProduct);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
            setBarcode('');
            setTimeout(() => barcodeInputRef.current?.focus(), 0);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const code = barcode.trim();
        if (code.length > 0) await searchProduct(code);
    };

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'F8') {
                event.preventDefault();
                setProduct(null);
                setError(null);
                setBarcode('');
                barcodeInputRef.current?.focus();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    useEffect(() => {
        barcodeInputRef.current?.focus();
    }, []);

    // Si el barcode pertenece a una variante, mostrar datos de la variante
    const variant = product?.matched_variant ?? null;
    const displayStock = variant ? variant.stock : product?.stock;
    const displaySku = variant?.sku ?? product?.sku;
    const variantImage = variant?.images?.[0]?.thumbnail_path ?? null;
    const productImage = product?.images?.[0]?.thumbnail_path ?? null;
    const displayImage = variantImage ?? productImage;

    return (
        <div className={styles.main_wrapper}>
            <form className={styles.form_search} onSubmit={handleSubmit}>
                <div className={styles.container_inputs}>
                    <input
                        id="barcode-input"
                        type="text"
                        value={barcode}
                        onChange={(e) => setBarcode(e.target.value)}
                        placeholder="Escanear o introducir código..."
                        autoFocus
                        disabled={isLoading}
                        className={styles.form_input}
                        ref={barcodeInputRef}
                        autoComplete="off"
                    />
                </div>
            </form>

            {isLoading && <p className={styles.status_loading}><Loading /></p>}
            {error && <p className={styles.status_error}>{error}</p>}

            {product && (
                <div className={styles.product_card}>
                    <h2 className={styles.product_name}>{product.name}</h2>

                    <div className={styles.product_content}>
                        {displayImage && (
                            <img
                                src={`${IMAGE_URL}/${displayImage}`}
                                alt={product.name}
                                className={styles.product_image}
                            />
                        )}

                        <div className={styles.product_info}>
                            <p className={styles.detail_item}>
                                <strong>SKU:</strong>
                                <span className={styles.detail_value}>{displaySku}</span>
                            </p>

                            {variant && variant.attribute_values?.length > 0 && (
                                <div className={styles.attr_pills}>
                                    {variant.attribute_values.map(av => (
                                        <span key={av.category_attribute_id} className={styles.attr_pill}>
                                            <span className={styles.pill_label}>{av.category_attribute?.name}</span>
                                            {av.value}
                                        </span>
                                    ))}
                                </div>
                            )}

                            <p className={styles.detail_item}>
                                <strong>Stock:</strong>
                                <span className={styles.detail_value}>{displayStock}</span>
                            </p>

                            <h4 className={styles.price_list_title}>Precios de Venta:</h4>
                            <ul className={styles.price_list}>
                                {product.price_lists.map((list) => (
                                    <li key={list.id} className={styles.price_list_item}>
                                        <span className={styles.list_name}>{list.name}:</span>
                                        <span className={styles.list_price}>{formatPrice(list.pivot.price)}</span>
                                    </li>
                                ))}
                            </ul>

                            <Link to={`/productos/${product.id}`} className="btn btn_regular" onClick={onClose}>
                                Ver detalle
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {!product && !error && !isLoading && barcode.trim() === '' && (
                <p className={styles.status_initial}>Esperando el código de barras...</p>
            )}
        </div>
    );
}
