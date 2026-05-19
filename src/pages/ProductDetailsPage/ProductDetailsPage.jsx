import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { Loading } from '../../components/Loading/Loading';
import { ProductDetailsLayout } from '../../layout/ProductDetailsLayout/ProductDetailsLayout';
import { ProductService } from '../../services/product/productService';
import styles from "./ProductDetailsPage.module.css";

export function ProductDetailsPage() {
    const { id } = useParams();

    const [product, setProduct] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const productService = useMemo(() => new ProductService(), []);

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
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

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
            </div>
            <ProductDetailsLayout product={product} />
        </div>
    );
}
