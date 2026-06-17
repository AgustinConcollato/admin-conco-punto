import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNotch, faRotate } from '@fortawesome/free-solid-svg-icons';
import { Filters } from '../../../../features/product/components/Filters/Filters';
import { ProductList } from '../../../../features/product/components/ProductList/ProductList';
import { useGetFilters } from '../../../../features/product/hooks/useGetFilters';
import { ProductService } from '../../../../services/product/productService';
import styles from './ProductListPage.module.css';

export function ProductListPage() {

    const [searchParams, setSearchParams] = useSearchParams();
    const productService = useMemo(() => new ProductService(), []);
    const [isSyncing, setIsSyncing] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    const filters = useGetFilters(searchParams);

    const handleSyncDropship = async () => {
        if (isSyncing) return;
        setIsSyncing(true);
        try {
            const r = await productService.syncDropshippingStock();
            toast.success(
                `Stock dropshipping: ${r.updated} actualizados de ${r.checked} revisados` +
                (r.unmatched ? `, ${r.unmatched} sin match` : '') +
                (r.errors ? `, ${r.errors} con error` : '')
            );
            setRefreshKey(k => k + 1);
        } catch (err) {
            console.error('Error al sincronizar stock dropshipping:', err);
            toast.error('No se pudo actualizar el stock de dropshipping.');
        } finally {
            setIsSyncing(false);
        }
    };

    const handleFilterChange = (key, value) => {
        const newParams = new URLSearchParams(searchParams);

        // Si cambia un filtro (excepto página), volver a la página 1
        if (key !== 'page') {
            newParams.delete('page');
        }

        if (value === '' || value === null || value === undefined) {
            newParams.delete(key);
        } else {
            newParams.set(key, value);
        }

        setSearchParams(newParams);
    };

    // Setea sort_by y sort_order juntos (evita pisar params con dos updates)
    const handleSortChange = (sortBy, sortOrder) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('page');
        newParams.set('sort_by', sortBy);
        newParams.set('sort_order', sortOrder);
        setSearchParams(newParams);
    };

    useEffect(() => {
        document.title = 'Lista de productos'
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        })
    }, []);

    return (
        <div className={styles.layout}>
            <Filters
                filters={filters}
                resetFilters={setSearchParams}
                handleFilterChange={handleFilterChange}
            />
            <div className={styles.main}>
                <div className={styles.toolbar}>
                    <button
                        className="btn btn_regular"
                        onClick={handleSyncDropship}
                        disabled={isSyncing}
                        title="Revisa el stock del proveedor y actualiza la disponibilidad de todos los productos dropshipping"
                    >
                        <FontAwesomeIcon icon={isSyncing ? faCircleNotch : faRotate} spin={isSyncing} />
                        {' '}{isSyncing ? 'Actualizando…' : 'Actualizar stock dropshipping'}
                    </button>
                </div>
                <ProductList
                    key={refreshKey}
                    filters={filters}
                    params={searchParams}
                    handleFilterChange={handleFilterChange}
                    onSortChange={handleSortChange}
                />
            </div>
        </div>
    );
}


