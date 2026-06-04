import { useSearchParams } from 'react-router-dom';
import { Filters } from '../../../features/product/components/Filters/Filters';
import { ProductList } from '../../../features/product/components/ProductList/ProductList';
import { useGetFilters } from '../../../features/product/hooks/useGetFilters';
import styles from './ProductListLayout.module.css';
import { useEffect } from 'react';

export function ProductListLayout() {
    const [searchParams, setSearchParams] = useSearchParams();

    const filters = useGetFilters(searchParams);

    const handleFilterChange = (key, value) => {
        const newParams = new URLSearchParams(searchParams);

        // Si cambia un filtro (excepto pÃ¡gina), volver a la pÃ¡gina 1
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

    useEffect(() => {
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
            />
        </div>
    )
}

