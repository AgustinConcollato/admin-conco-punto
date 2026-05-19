import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loading } from '../../../../components/Loading/Loading';
import { IMAGE_URL } from '../../../../config/api';
import { FILTERS } from '../../../../config/product';
import { ProductService } from '../../../../services/product/productService';
import styles from './ProductSearch.module.css';

export function ProductSearch() {

    const productService = useMemo(() => new ProductService(), []);

    const navigate = useNavigate();

    const searchRef = useRef(null);
    const inputRef = useRef(null);
    const optionRefs = useRef([])

    const [results, setResults] = useState([]);
    const [search, setSearch] = useState('');
    const [showResults, setShowResults] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [isLoading, setIsLoading] = useState(false);

    const searchForProducts = async (value) => {
        if (!value.trim()) return;

        setHighlightedIndex(-1);
        setIsLoading(true);

        try {
            const response = await productService.getAll({ ...FILTERS, search: value });
            setResults(response.data);

        } catch (error) {
            console.error('Error fetching products:', error);
            setResults([]);
        } finally {
            setIsLoading(false);
        }
    };

    function handleKeyDown(event) {
        if (event.key === 'ArrowDown') {
            setHighlightedIndex((prevIndex) =>
                prevIndex === -1 ? 0 : Math.min(prevIndex + 1, results.length - 1)
            )
        } else if (event.key === 'ArrowUp') {
            setHighlightedIndex((prevIndex) => Math.max(prevIndex - 1, -1));
        } else if (event.key === 'Enter') {

            if (highlightedIndex < 0) return;

            event.preventDefault();
            const selectedOption = results[highlightedIndex];
            if (selectedOption) {
                setShowResults(false);
                navigate('/productos/' + selectedOption.id);
            }
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowResults(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        }
    }, []);

    useEffect(() => {
        if (!search || search.trim() === '') {
            setResults([]);
            return;
        }

        searchForProducts(search);
    }, [search]);

    useEffect(() => {
        if (optionRefs.current[highlightedIndex]) {
            optionRefs.current[highlightedIndex].scrollIntoView({
                behavior: 'smooth',
                block: 'nearest'

            })
        }
    }, [highlightedIndex]);

    return (
        <form
            className={styles.search_form}
            onSubmit={e => e.preventDefault()}
            ref={searchRef}
        >
            <input
                type="text"
                placeholder="Nombre, SKU, Código de barras"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={'input'}
                onFocus={() => setShowResults(true)}
                onKeyDown={handleKeyDown}
                ref={inputRef}
                autoComplete="off"
                id='search'
            />
            <label
                className={styles.label}
                htmlFor='search'
            >
                <FontAwesomeIcon icon={faSearch} className={styles.search_icon} />
            </label>
            {(showResults && results.length > 0) ? (
                <div className={styles.container_results_list}>
                    <ul className={styles.results_list}>
                        {isLoading ? (
                            <Loading />
                        ) : (
                            results.map((product, i) => (
                                <li
                                    key={product.id}
                                    className={`${highlightedIndex === i ? styles.highlighted : ''} ${styles.result}`}
                                    ref={(el) => (optionRefs.current[i] = el)}
                                >
                                    <Link to={'/productos/' + product.id} onClick={() => setShowResults(false)}>
                                        <img src={`${IMAGE_URL}/${product.images[0]?.thumbnail_path}`} />
                                        <p>
                                            {product.name}
                                            <span>{product.sku}</span>
                                        </p>
                                    </Link>
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            ) : (
                (showResults && search) &&
                <div className={styles.container_results_list}>
                    <ul className={styles.results_list}>
                        <li className={styles.no_results}>No hay resultados</li>
                    </ul>
                </div>
            )
            }
        </form >
    );
}