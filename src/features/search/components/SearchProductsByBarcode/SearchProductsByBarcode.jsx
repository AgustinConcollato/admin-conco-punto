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
            // Restaurar el focus después de la búsqueda
            setTimeout(() => {
                barcodeInputRef.current?.focus();
            }, 0);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const code = barcode.trim();
        if (code.length > 0) {
            await searchProduct(code);
        }
    };

    useEffect(() => {
        const handleKeyDown = (event) => {
            // Verifica que la tecla presionada sea 'F8'
            if (event.key === 'F8') {
                event.preventDefault(); // Evita cualquier acción predeterminada del navegador

                // 1. Limpia los estados del producto y errores
                setProduct(null);
                setError(null);
                setBarcode(''); // Limpia el valor actual del input

                // 2. Enfoca el input del código de barras
                // Usamos optional chaining (?) por seguridad
                barcodeInputRef.current?.focus();
            }
        };

        // 3. Agrega el escuchador de eventos al documento (todo el componente)
        document.addEventListener('keydown', handleKeyDown);

        // 4. Función de limpieza: Remueve el escuchador al desmontar el componente
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []); // 🎣 Array de dependencias vacío, se ejecuta solo al montar/desmontar

    useEffect(() => {
        // Enfocar el input al montar el componente
        barcodeInputRef.current?.focus();
    }, []);

    const handleChange = (event) => {
        setBarcode(event.target.value);
    };

    return (
        <div className={styles.main_wrapper}>
            <form className={styles.form_search} onSubmit={handleSubmit}>
                <div className={styles.container_inputs}>
                    <input
                        id="barcode-input"
                        type="text"
                        value={barcode}
                        onChange={handleChange}
                        placeholder="Escanear o introducir código..."
                        autoFocus
                        disabled={isLoading}
                        className={styles.form_input}
                        ref={barcodeInputRef}
                        autoComplete="off"
                    />
                    {/* 🆕 SECCIÓN DE CONFIGURACIÓN CON SELECTOR */}

                </div>
            </form>

            {/* --- Estado de la Búsqueda --- */}

            {isLoading && <p className={styles.status_loading}><Loading /></p>}
            {error && <p className={styles.status_error}> {error}</p>}

            {/* --- Tarjeta de Producto Encontrado --- */}
            {product && (
                <div className={styles.product_card}>
                    <h2 className={styles.product_name}> {product.name}</h2>

                    <div className={styles.product_content}>
                        <img
                            src={`${IMAGE_URL}/${product.images[0].thumbnail_path}`}
                            alt={`Imagen de ${product.name}`}
                            className={styles.product_image}
                        />

                        <div className={styles.product_info}>
                            {/* SKU y Stock */}
                            <p className={styles.detail_item}>
                                <strong>SKU :</strong> <span className={styles.detail_value}>{product.sku}</span>
                            </p>
                            <p className={styles.detail_item}>
                                <strong>Stock: </strong>
                                <span className={styles.detail_value}>
                                    {product.stock}
                                </span>
                            </p>

                            {/* Listas de Precios */}
                            <h4 className={styles.price_list_title}>Precios de Venta:</h4>
                            <ul className={styles.price_list}>
                                {product.price_lists.map((list) => (
                                    <li key={list.id} className={styles.price_list_item}>
                                        <span className={styles.list_name}>{list.name}:</span>
                                        <span className={styles.list_price}>
                                            {formatPrice(list.pivot.price)}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                            <Link to={`/productos/${product.id}`} className="btn btn_regular" onClick={onClose}>Ver detalle</Link>
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