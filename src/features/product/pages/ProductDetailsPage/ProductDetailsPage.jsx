import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faCircleNotch, faRotate } from '@fortawesome/free-solid-svg-icons';
import { Loading } from '../../../../components/Loading/Loading';
import { ProductDetailsLayout } from '../../../../components/layout/ProductDetailsLayout/ProductDetailsLayout';
import { ProductService } from '../../../../services/product/productService';
import styles from "./ProductDetailsPage.module.css";

export function ProductDetailsPage() {
    const { id } = useParams();

    const [product, setProduct] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSyncing, setIsSyncing] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    const productService = useMemo(() => new ProductService(), []);

    const handleSyncStock = async () => {
        if (isSyncing) return;
        setIsSyncing(true);
        try {
            const r = await productService.syncProductDropshippingStock(id);
            if (r.updated > 0) {
                toast.success('Disponibilidad actualizada según el proveedor.');
            } else if (r.unmatched > 0) {
                toast.warn('Sin match en el proveedor (revisá la URL o el código de barras).');
            } else if (r.errors > 0) {
                toast.error('No se pudo consultar el proveedor.');
            } else {
                toast.info('Sin cambios: ya estaba al día.');
            }
            const updated = await productService.getById(id);
            if (updated) setProduct(updated);
            setRefreshKey(k => k + 1);
        } catch (err) {
            console.error('Error al sincronizar stock:', err);
            toast.error('No se pudo actualizar el stock.');
        } finally {
            setIsSyncing(false);
        }
    };

    useEffect(() => {
        const loadProduct = async () => {
            setIsLoading(true);
            setError(null);

            if (!id) {
                setError("ID de producto no proporcionado en la URL.");
                setIsLoading(false);
                return;
            }

            try {
                const foundProduct = await productService.getById(id);
                if (foundProduct) {
                    setProduct(foundProduct);
                } else {
                    setError(`Producto con ID "${id}" no encontrado.`);
                }
            } catch (err) {
                console.error("Error al cargar el producto:", err);
                setError("Ocurrió un error al intentar cargar el detalle del producto.");
            } finally {
                setIsLoading(false);
            }
        };

        loadProduct();
    }, [id]);

    useEffect(() => {
        document.title = product ? product.name : 'Detalle del producto'
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        })
    }, [product]);

    if (isLoading) {
        return (
            <div className={styles.page_container}>
                <div className={styles.status_loading}><Loading /></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.page_container}>
                <h1 className={styles.status_error}>Error de Carga</h1>
                <p className={styles.status_error_message}>{error}</p>
            </div>
        );
    }

    return (
        <div className={styles.page_container}>
            <div className={styles.page_header}>
                <Link to="/productos" className={styles.btn_back}>
                    <FontAwesomeIcon icon={faArrowLeft} />
                </Link>
                <h1 className={styles.header_title}>{product.name}</h1>
                {product.sku && (
                    <span className={styles.header_sku}>{product.sku}</span>
                )}
                {product.is_dropshipping && (
                    <button
                        className="btn btn_regular"
                        onClick={handleSyncStock}
                        disabled={isSyncing}
                        title="Revisa el stock del proveedor y actualiza la disponibilidad de este producto"
                        style={{ marginLeft: 'auto' }}
                    >
                        <FontAwesomeIcon icon={isSyncing ? faCircleNotch : faRotate} spin={isSyncing} />
                        {' '}{isSyncing ? 'Actualizando…' : 'Actualizar stock'}
                    </button>
                )}
            </div>
            <ProductDetailsLayout key={refreshKey} product={product} />
        </div>
    );
}


