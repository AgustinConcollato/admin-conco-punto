import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filters } from '../../../../features/product/components/Filters/Filters';
import { ProductList } from '../../../../features/product/components/ProductList/ProductList';
import { useGetFilters } from '../../../../features/product/hooks/useGetFilters';
import styles from './ProductListPage.module.css';

export function ProductListPage() {

    const [searchParams, setSearchParams] = useSearchParams();

    const filters = useGetFilters(searchParams);

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
            <ProductList
                filters={filters}
                params={searchParams}
                handleFilterChange={handleFilterChange}
                onSortChange={handleSortChange}
            />
        </div>
    );
}


