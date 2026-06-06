import { faExclamationCircle, faFolder } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { IMAGE_URL } from '../../../../config/api';
import { formatPrice } from '../../../../utils/formatPrice';
import { ProductActions } from '../ProductActions/ProductActions';
import styles from './Card.module.css';

export function Card({ product }) {

    const [prices, setPrices] = useState(product.price_lists || []);
    const [variants, setVariants] = useState(product.variants || []);
    const [suppliers, setSuppliers] = useState(product.suppliers || []);
    const [categories, setCategories] = useState(product.categories || []);
    const [currentProduct, setCurrentProduct] = useState(product);
    const [images, setImages] = useState(product.images || []);
    const [currentPromotions, setCurrentPromotions] = useState(product.promotions || []);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        setCurrentProduct(product);
        setPrices(product.price_lists || []);
        setVariants(product.variants || []);
        setSuppliers(product.suppliers || []);
        setCategories(product.categories || []);
        setImages(product.images || []);
        setCurrentPromotions(product.promotions || []);
        setCurrentImageIndex(0);
    }, [product]);

    const handleUpdated = (partial) => {
        if (!partial) return;
        if (partial.price_lists) setPrices(partial.price_lists);
        if (partial.variants) setVariants(partial.variants);
        if (partial.categories) setCategories(partial.categories);
        if (partial.images) setImages(partial.images);
        if (partial.promotions) setCurrentPromotions(partial.promotions);
        setCurrentProduct(prev => ({ ...prev, ...partial }));
    };

    const nextImage = (e) => {
        e.preventDefault();
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = (e) => {
        e.preventDefault();
        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    const getProductImage = (imgs, index = 0) => {
        if (imgs && imgs.length > 0) {
            const sortedImages = [...imgs].sort((a, b) => (a.position || 0) - (b.position || 0));
            const image = sortedImages[index] || sortedImages[0];
            const imagePath = image.thumbnail_path || image.path;
            return `${IMAGE_URL}/${imagePath}`;
        }
        return null;
    };

    const NotificationContent = {
        'incomplete': (
            <p>Faltan precios <Link to={`/productos/nuevo/3/${product.id}`}>Agregar</Link></p>
        ),
    };

    const productForActions = {
        ...currentProduct,
        price_lists: prices,
        variants,
        suppliers,
        categories,
        images,
        promotions: currentPromotions,
    };

    return (
        <Link to={`/productos/${product.id}`} className={styles.product_card}>
            {(currentProduct.status !== 'published' && currentProduct.status !== 'archived') &&
                <div className={styles.notification} onClick={(e) => e.preventDefault()}>
                    <FontAwesomeIcon icon={faExclamationCircle} color='#be3232' />
                    {NotificationContent[currentProduct.status]}
                </div>
            }
            {currentProduct.status == 'archived' &&
                <div className={styles.notification}>
                    <FontAwesomeIcon icon={faFolder} color='#df9710' />
                </div>
            }
            <div className={styles.product_image}>
                {images && images.length > 0 ? (
                    <>
                        <img
                            src={getProductImage(images, currentImageIndex)}
                            alt={product.name}
                            onError={(e) => { e.target.src = '/not-image.jpg'; }}
                        />

                        {images.length > 1 && (
                            <div className={styles.image_nav}>
                                <button className={styles.nav_arrow_left} onClick={prevImage}>
                                    <span>  ‹  </span>
                                </button>
                                <button className={styles.nav_arrow_right} onClick={nextImage}>
                                    <span>  ›  </span>
                                </button>
                                <div className={styles.image_counter}>
                                    {currentImageIndex + 1} / {images.length}
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className={styles.no_image}>Sin imagen</div>
                )}
            </div>
            <div className={styles.product_info}>
                <h3 className={styles.product_name}>{currentProduct.name}</h3>
                <p className={styles.product_sku}>SKU: {product.sku || 'N/A'}</p>

                {categories && categories.length > 0 && (
                    <div className={styles.product_categories}>
                        {categories.map((cat) => (
                            <span key={cat.id} className={styles.category_tag}>
                                {cat.name}
                            </span>
                        ))}
                    </div>
                )}

                <div className={styles.product_details}>
                    <div className={styles.detail_item}>
                        <span className={styles.detail_label}>Stock:</span>
                        <span className={styles.detail_value}>
                            {currentProduct.stock || 0}
                        </span>
                    </div>
                    <p>Precios</p>
                    {prices.length > 0 ?
                        prices.map(list =>
                            <div key={list.name} className={styles.detail_item}>
                                <span className={styles.detail_label}>{list.name}:</span>
                                <span className={styles.detail_value}>
                                    {formatPrice(list.pivot.price)}
                                </span>
                            </div>
                        ) :
                        <Link to={`/productos/nuevo/3/${product.id}`}>Agregar precios</Link>
                    }
                </div>

                <div className={styles.detail_item} onClick={(e) => e.preventDefault()}>
                    {variants && variants.length > 0 ? (
                        <div className={styles.variants_wrapper}>
                            <span className={styles.variants_label}>
                                Variantes: {variants.length}
                            </span>
                            <div className={styles.variants_preview}>
                                {variants.map(v => {
                                    const vImg = v.images?.[0]?.thumbnail_path
                                        ?? images?.[0]?.thumbnail_path ?? null;
                                    const attrs = v.attribute_values ?? [];
                                    return (
                                        <div key={v.id} className={styles.preview_row}>
                                            {vImg && (
                                                <img
                                                    src={`${IMAGE_URL}/${vImg}`}
                                                    className={styles.preview_img}
                                                    alt=""
                                                />
                                            )}
                                            <div className={styles.preview_info}>
                                                {attrs.length > 0 ? (
                                                    <span className={styles.preview_attrs}>
                                                        {attrs.map(av =>
                                                            `${av.category_attribute?.name ?? ''}: ${av.value}`
                                                        ).join(' · ')}
                                                    </span>
                                                ) : (
                                                    <span className={styles.preview_sku}>{v.sku || `#${v.id}`}</span>
                                                )}
                                                {v.sku && attrs.length > 0 && (
                                                    <span className={styles.preview_sku}>{v.sku}</span>
                                                )}
                                            </div>
                                            <div className={styles.preview_meta}>
                                                <span className={styles.preview_stock}>{v.stock} uds.</span>
                                                {!v.is_active && <span className={styles.preview_inactive}>Inact.</span>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <div />
                    )}
                    <ProductActions product={productForActions} onUpdated={handleUpdated} />
                </div>
            </div>
        </Link>
    );
}
