import { useEffect, useMemo, useState } from "react";
import { faBox, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";
import { EmptyState } from "../../../../components/EmptyState/EmptyState";
import { Loading } from "../../../../components/Loading/Loading";
import { Pagination } from "../../../../components/Pagination/Pagination";
import { ProductService } from "../../../../services/product/productService";
import { Card } from "../Card/Card";
import styles from './ProductList.module.css';

export function ProductList({ params, handleFilterChange, filters }) {

    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState(null);
    const [products, setProducts] = useState(null);

    const productService = useMemo(() => new ProductService(), []);

    const loadProducts = async () => {
        setLoading(true);
        try {
            const cleanFilters = Object.fromEntries(
                Object.entries(filters).filter(([_, v]) => v !== '')
            );

            if (cleanFilters.stock_min) cleanFilters.stock_min = parseInt(cleanFilters.stock_min);
            if (cleanFilters.stock_max) cleanFilters.stock_max = parseInt(cleanFilters.stock_max);
            if (cleanFilters.price_min) cleanFilters.price_min = parseFloat(cleanFilters.price_min);
            if (cleanFilters.price_max) cleanFilters.price_max = parseFloat(cleanFilters.price_max);
            if (cleanFilters.price_list_id) cleanFilters.price_list_id = parseInt(cleanFilters.price_list_id);
            if (cleanFilters.per_page) cleanFilters.per_page = parseInt(cleanFilters.per_page);
            if (cleanFilters.page) cleanFilters.page = parseInt(cleanFilters.page);

            const response = await productService.getAll(cleanFilters);
            setProducts(response.data || response || []);
            setPagination({
                current_page: response.current_page || 1,
                last_page: response.last_page || 1,
                per_page: response.per_page || 20,
                total: response.total || 0,
            });
        } catch (error) {
            console.error('Error al cargar productos:', error);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProducts();
    }, [params]);

    const handlePageChange = (page) => {
        handleFilterChange('page', page.toString());
    };

    return (
        <div className={styles.content}>
            {loading ? (
                <div className={styles.skeleton_grid}>
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className={styles.skeleton_card}>
                            <div className={styles.skeleton_img} />
                            <div className={styles.skeleton_line} style={{ width: '80%', marginTop: '12px' }} />
                            <div className={styles.skeleton_line} style={{ width: '50%', marginTop: '8px' }} />
                            <div className={styles.skeleton_line} style={{ width: '65%', marginTop: '8px' }} />
                        </div>
                    ))}
                </div>
            ) : (
                <>
                    <div className={styles.header}>
                        <div>
                            <h3>Productos</h3>
                            {pagination && (
                                <p className={styles.count}>
                                    {pagination.total} productos en total
                                </p>
                            )}
                        </div>
                        <Link to="/productos/nuevo/1" className="btn btn_solid">
                            <FontAwesomeIcon icon={faPlus} /> Nuevo
                        </Link>
                    </div>

                    {products && products.length > 0 ? (
                        <>
                            <div className={styles.productGrid}>
                                {products.map((product) => (
                                    <Card key={product.id} product={product} />
                                ))}
                            </div>

                            {pagination && pagination.last_page > 1 && (
                                <Pagination
                                    currentPage={pagination.current_page}
                                    lastPage={pagination.last_page}
                                    onPageChange={handlePageChange}
                                />
                            )}
                        </>
                    ) : (
                        <EmptyState
                            icon={faBox}
                            message="No se encontraron productos con los filtros aplicados."
                        />
                    )}
                </>
            )}
        </div>
    );
}



