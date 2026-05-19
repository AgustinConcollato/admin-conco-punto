import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loading } from "../../components/Loading/Loading";
import { Modal } from "../../components/Modal/Modal";
import { IMAGE_URL } from "../../config/api";
import { ProductService } from "../../services/product/productService";
import styles from "./ManageProductsPage.module.css";

export function ManageProductsPage() {
    const [barcode, setBarcode] = useState("");
    const [scannedProduct, setScannedProduct] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showUpdateStockModal, setShowUpdateStockModal] = useState(false);
    const [showAssociateModal, setShowAssociateModal] = useState(false);
    const [stockValue, setStockValue] = useState("");
    const [isUpdatingStock, setIsUpdatingStock] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isAssociating, setIsAssociating] = useState(false);

    const barcodeInputRef = useRef(null);
    const navigate = useNavigate();
    const productService = useMemo(() => new ProductService(), []);

    // Buscar producto por código de barras
    const searchByBarcode = async (code) => {
        setIsLoading(true);
        setError(null);
        setScannedProduct(null);

        try {
            const foundProduct = await productService.getByBarcode(code);
            setScannedProduct(foundProduct);
            setBarcode("");
        } catch (err) {
            setError("El código de barras no es de ningún producto");
            setScannedProduct(null);
        } finally {
            setIsLoading(false);
        }
    };

    // Manejar cambio en el input de código de barras
    useEffect(() => {
        if (barcode.trim().length >= 1 && !isLoading) {
            const timeoutId = setTimeout(() => {
                searchByBarcode(barcode.trim());
            }, 500); // Debounce de 500ms

            return () => clearTimeout(timeoutId);
        }

    }, [barcode]);

    // Buscar productos para asociar código de barras
    const searchProducts = async (term) => {
        if (!term.trim() || term.length < 2) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        try {
            const response = await productService.getAll({
                search: term,
                per_page: 10,
            });
            setSearchResults(response.data || []);
        } catch (err) {
            console.error("Error al buscar productos:", err);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    // Actualizar stock del producto encontrado
    const handleUpdateStock = async (e) => {
        e.preventDefault();

        if (!scannedProduct || !stockValue) return;

        setIsUpdatingStock(true);
        try {
            await productService.updateProduct(
                { stock: Number(stockValue) },
                scannedProduct.id
            );
            setScannedProduct({ ...scannedProduct, stock: Number(stockValue) });
            setShowUpdateStockModal(false);
            setStockValue("");
        } catch (err) {
            console.error("Error al actualizar stock:", err);
        } finally {
            setIsUpdatingStock(false);
        }
    };

    // Asociar código de barras a producto existente
    const handleAssociateBarcode = async (productId) => {
        if (!barcode.trim()) return;

        setIsAssociating(true);

        const formData = new FormData();

        formData.append('barcode', barcode.trim());

        try {
            await productService.addBarcode(formData, productId);
            setShowAssociateModal(false);
            setBarcode("");
            setSearchTerm("");
            setSearchResults([]);
            setError(null);
        } catch (err) {
            console.error("Error al asociar código de barras:", err);
        } finally {
            setIsAssociating(false);
        }
    };

    // Limpiar y resetear
    const handleClear = () => {
        setBarcode("");
        setScannedProduct(null);
        setError(null);
        setStockValue("");
        setSearchTerm("");
        setSearchResults([]);
        barcodeInputRef.current?.focus();
    };

    // Buscar productos cuando cambia el término de búsqueda
    useEffect(() => {
        if (showAssociateModal) {
            const timeoutId = setTimeout(() => {
                searchProducts(searchTerm);
            }, 500);

            return () => clearTimeout(timeoutId);
        }
    }, [searchTerm, showAssociateModal]);

    // Focus en el input al cargar
    useEffect(() => {
        barcodeInputRef.current?.focus();
    }, []);

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <Link
                    className="btn btn_solid"
                    onClick={() => sessionStorage.removeItem('pendingBarcode')}
                    to={"/productos/nuevo/1"}
                >
                    Crear producto nuevo
                </Link>
            </div>

            <div className={styles.scanner_section}>
                <div className={styles.input_container}>
                    <input
                        ref={barcodeInputRef}
                        type="text"
                        value={barcode}
                        onChange={(e) => setBarcode(e.target.value)}
                        placeholder="Escanear o introducir código de barras..."
                        className="input"
                        autoFocus
                        disabled={isLoading}
                    />
                    {barcode && (
                        <button
                            className="btn btn_secondary"
                            onClick={handleClear}
                            type="button"
                        >
                            Limpiar
                        </button>
                    )}
                </div>

                {isLoading && (
                    <div className={styles.status}>
                        <Loading />
                    </div>
                )}

                {error && !scannedProduct && barcode.trim().length >= 1 && (
                    <div className={styles.error_message}>
                        <p>{error}</p>
                        <h3>¿Que hacer con el código "{barcode}"?</h3>
                        <div className={styles.actions}>
                            <button
                                className="btn btn_regular"
                                onClick={() => {
                                    setShowAssociateModal(true);
                                }}
                            >
                                Asociar a producto existente
                            </button>
                            <button
                                className="btn btn_regular"
                                onClick={() => {
                                    sessionStorage.setItem("pendingBarcode", barcode);
                                    navigate("/productos/nuevo/1");
                                }}
                            >
                                Crear producto nuevo
                            </button>
                        </div>
                    </div>
                )}

                {scannedProduct && (
                    <div className={styles.product_found}>
                        <div className={styles.product_info}>
                            {scannedProduct.images && scannedProduct.images.length > 0 && (
                                <img
                                    src={`${IMAGE_URL}/${scannedProduct.images[0].thumbnail_path}`}
                                    alt={scannedProduct.name}
                                    className={styles.product_image}
                                />
                            )}
                            <div className={styles.product_details}>
                                <h3>{scannedProduct.name}</h3>
                                <p className={styles.sku}>SKU: {scannedProduct.sku}</p>
                                <p className={styles.stock}>
                                    Stock actual: <strong>{scannedProduct.stock || 0}</strong>
                                </p>
                            </div>
                        </div>
                        <div className={styles.product_actions}>
                            <button
                                className="btn btn_solid"
                                onClick={() => {
                                    setStockValue(scannedProduct.stock || 0);
                                    setShowUpdateStockModal(true);
                                }}
                            >
                                Actualizar Stock
                            </button>
                            <Link
                                className="btn btn_regular"
                                to={`/productos/${scannedProduct.id}`}
                            >
                                Ver Detalles
                            </Link>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal para actualizar stock */}
            {showUpdateStockModal && scannedProduct && (
                <Modal
                    onClose={() => {
                        setShowUpdateStockModal(false);
                        setStockValue("");
                    }}
                    title={`Actualizar Stock - ${scannedProduct.name}`}
                >
                    <form
                        onSubmit={handleUpdateStock}
                        className={styles.update_stock_form}
                    >
                        <p>
                            Stock Actual: <span className={styles.current_stock}>{scannedProduct.stock || 0}</span>
                        </p>

                        <div className="input_group">
                            <span>Nuevo Stock</span>
                            <input
                                type="number"
                                className="input"
                                value={stockValue}
                                onChange={(e) => setStockValue(e.target.value)}
                                min="0"
                                autoFocus
                            />
                        </div>
                        <button
                            type="submit"
                            className="btn btn_solid"
                            disabled={isUpdatingStock || !stockValue}
                        >
                            {isUpdatingStock ? (
                                <FontAwesomeIcon icon={faCircleNotch} spin />
                            ) : (
                                "Actualizar Stock"
                            )}
                        </button>
                    </form>
                </Modal>
            )}

            {/* Modal para asociar código de barras a producto existente */}
            {showAssociateModal && (
                <Modal
                    onClose={() => {
                        setShowAssociateModal(false);
                        setSearchTerm("");
                        setSearchResults([]);
                    }}
                    title="Asociar Código de Barras a Producto Existente"
                >
                    <div className={styles.associate_form}>
                        <div className="input_group">
                            <span>Código de Barras</span>
                            <input
                                type="text"
                                className="input"
                                value={barcode}
                                onChange={(e) => setBarcode(e.target.value)}
                                placeholder="Código de barras a asociar"
                            />
                        </div>
                        <div className="input_group">
                            <span>Buscar Producto</span>
                            <input
                                type="text"
                                className="input"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Buscar por nombre o SKU..."
                            />
                        </div>

                        {isSearching && (
                            <div className={styles.search_loading}>
                                <Loading />
                            </div>
                        )}

                        {searchResults.length > 0 && (
                            <div className={styles.search_results}>
                                <h4>Resultados:</h4>
                                <div className={styles.results_list}>
                                    {searchResults.map((product) => (
                                        <div
                                            key={product.id}
                                            className={styles.result_item}
                                        >
                                            <div className={styles.result_info}>
                                                {product.images &&
                                                    product.images.length > 0 && (
                                                        <img
                                                            src={`${IMAGE_URL}/${product.images[0].thumbnail_path}`}
                                                            alt={product.name}
                                                            className={styles.result_image}
                                                        />
                                                    )}
                                                <div>
                                                    <p className={styles.result_name}>
                                                        {product.name}
                                                    </p>
                                                    <p className={styles.result_sku}>
                                                        SKU: {product.sku}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                className="btn btn_solid"
                                                onClick={() =>
                                                    handleAssociateBarcode(product.id)
                                                }
                                                disabled={isAssociating}
                                            >
                                                {isAssociating ? <FontAwesomeIcon icon={faCircleNotch} spin /> : "Asociar"}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {searchTerm.length >= 2 &&
                            !isSearching &&
                            searchResults.length === 0 && (
                                <p className={styles.no_results}>
                                    No se encontraron productos
                                </p>
                            )}
                    </div>
                </Modal>
            )}
        </div>
    );
}
