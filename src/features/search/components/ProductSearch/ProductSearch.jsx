import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loading } from '../../../../components/Loading/Loading';
import { IMAGE_URL } from '../../../../config/api';
import { FILTERS } from '../../../../config/product';
import { ProductService } from '../../../../services/product/productService';
import styles from './ProductSearch.module.css';

const getBaseVariantAttrValues = (baseAttrValues, variants) => {
    const variantAttrIds = new Set(
        variants.flatMap(v => (v.attribute_values ?? []).map(av => av.category_attribute_id))
    );
    return (baseAttrValues ?? [])
        .filter(av => variantAttrIds.has(av.category_attribute_id))
        .map(av => av.value)
        .filter(Boolean);
};

export function ProductSearch() {
    const productService = useMemo(() => new ProductService(), []);
    const navigate = useNavigate();

    const timeout = useRef(null);
    const searchRef = useRef(null);
    const inputRef = useRef(null);
    const optionRefs = useRef([]);

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
            const res = await productService.getAll({ ...FILTERS, search: value })

            const products = (res.data ?? []).map(p => ({
                id: p.id,
                productId: p.id,
                name: p.name,
                sku: p.sku,
                image: p.images?.[0]?.thumbnail_path ?? null,
                attribute_values: p.attribute_values,
                variants: p.variants.map(v => ({
                    attribute_values: v.attribute_values,
                    image: v?.images[0]?.thumbnail_path ?? p.images?.[0]?.thumbnail_path
                })),
            }));

            setResults(products);
            setShowResults(true);
        } catch (error) {
            console.error('Error fetching products:', error);
            setResults([]);
        } finally {
            setIsLoading(false);
        }
    };

    function handleKeyDown(event) {
        if (event.key === 'ArrowDown') {
            setHighlightedIndex((prev) => prev === -1 ? 0 : Math.min(prev + 1, results.length - 1));
        } else if (event.key === 'ArrowUp') {
            setHighlightedIndex((prev) => Math.max(prev - 1, -1));
        } else if (event.key === 'Enter') {
            if (highlightedIndex < 0) {
                setShowResults(false);
                return navigate(`/productos?search=${search}`);
            }
            event.preventDefault();
            const selected = results[highlightedIndex];
            if (selected) {
                setShowResults(false);
                navigate('/productos/' + selected.productId);
            }
        }
    }

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowResults(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (!search || search.trim() === '') {
            setResults([]);
            return;
        }

        clearTimeout(timeout.current);
        timeout.current = setTimeout(() => {
            searchForProducts(search)
        }, 200);
    }, [search]);

    useEffect(() => {
        if (optionRefs.current[highlightedIndex]) {
            optionRefs.current[highlightedIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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
            <label className={styles.label} htmlFor='search' onClick={(e) => {
                if (search.length != 0) {
                    e.preventDefault();
                    setShowResults(false);
                    return navigate(`/productos?search=${search}`);
                }
            }}>
                <FontAwesomeIcon icon={faSearch} className={styles.search_icon} />
            </label>

            {(showResults && results.length > 0) ? (
                <div className={styles.container_results_list}>
                    <ul className={styles.results_list}>
                        {isLoading ? <Loading /> : results.map((item, i) => (
                            <li
                                key={item._key}
                                className={`${highlightedIndex === i ? styles.highlighted : ''} ${styles.result}`}
                                ref={(el) => (optionRefs.current[i] = el)}
                            >
                                <Link to={'/productos/' + item.productId} onClick={() => setShowResults(false)}>
                                    <div className={styles.product}>
                                        {item.image && <img src={`${IMAGE_URL}/${item.image}`} alt="" />}
                                        <p>
                                            {item.name}
                                            <span className={styles.product_sku}>{item.sku}</span>
                                            {item.variants.length > 0 && (
                                                <div className={styles.attribute}>
                                                    {getBaseVariantAttrValues(item.attribute_values, item.variants).map((name, i) => (
                                                        <span key={i} className={styles.variant_attrs}>{name}</span>
                                                    ))}
                                                </div>
                                            )}
                                        </p>
                                    </div>
                                    {item.variants.length > 0 && (
                                        <div className={styles.variants_stack}>
                                            {item.variants.slice(0, 3).map((v, idx) => (
                                                <div key={idx} className={styles.variant_item}>
                                                    {v.image
                                                        ? <img className={styles.variant_thumb} src={`${IMAGE_URL}/${v.image}`} />
                                                        : <div className={styles.variant_thumb_placeholder} />
                                                    }
                                                    {v.attribute_values?.length > 0 && (
                                                        <div className={styles.variant_tooltip}>
                                                            {v.attribute_values.map(av => av.value).join(' · ')}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                            {item.variants.length > 3 && (
                                                <div className={styles.variant_more}>
                                                    +{item.variants.length - 3}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            ) : (
                (showResults && search) &&
                <div className={styles.container_results_list}>
                    <ul className={styles.results_list}>
                        <li className={styles.no_results}>No hay resultados</li>
                    </ul>
                </div>
            )}
        </form>
    );
}
