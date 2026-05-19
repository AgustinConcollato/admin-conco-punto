import { faBarcode, faExclamationCircle, faFolder, faPen, faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Barcode } from '../../../../components/Barcode/Barcode';
import { Modal } from '../../../../components/Modal/Modal';
import { IMAGE_URL } from '../../../../config/api';
import { formatPrice } from '../../../../utils/formatPrice';
import { AddImagesModal } from '../detail/AddImagesModal/AddImagesModal';
import { EditInfo } from '../detail/EditInfo/EditInfo';
import { EditPriceLists } from '../detail/EditPriceLists/EditPriceLists';
import { EditStatus } from '../detail/EditStatus/EditStatus';
import { EditSupplier } from '../detail/EditSupplier/EditSupplier';
import styles from './Card.module.css';
import { EditCategories } from '../detail/edit/EditCategories/EditCategories';
import { ProductPromotionControl } from '../../../promotion/components/ProductPromotionControl/ProductPromotionControl';
import { MercadoLibreIcon } from '../../../../icons/icons';

export function Card({ product, categories: allCategories }) {

    const [barcodeVisible, setBarcodeVisible] = useState(false);
    const [showMenuEdit, setShowMenuEdit] = useState(false);
    const [edit, setEdit] = useState(null);
    const [prices, setPrices] = useState(product.price_lists || []);
    const [suppliers, setSuppliers] = useState(product.suppliers || []);
    const [categories, setCategories] = useState(product.categories || []);
    const [currentProduct, setCurrentProduct] = useState(product);
    const [images, setImages] = useState(product.images); // Usamos un estado interno para el reordenamiento
    const [currentPromotions, setCurrentPromotions] = useState(product.promotions || []);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        setCurrentProduct(product);
        setPrices(product.price_lists || []);
        setSuppliers(product.suppliers || []);
        setCategories(product.categories || []);
        setImages(product.images || []);
        setCurrentPromotions(product.promotions || []);
        setCurrentImageIndex(0);
    }, [product]);

    const onRefreshInfo = (updatedProduct) => {
        setCurrentProduct(updatedProduct);
        setEdit(null);
    };

    const onRefreshSupplisersAndPrices = ({ price_lists, suppliers }) => {
        console.log({ price_lists, suppliers })
        setPrices(price_lists);
        suppliers && setSuppliers(suppliers);
        setEdit(null)
    }

    const onRefreshStatus = (newStatus) => {
        setCurrentProduct(prev => ({
            ...prev,
            status: newStatus
        }));
        setEdit(null); // Cerramos el modal
    };

    const onRefreshCategories = (updatedProduct) => {
        setCategories(updatedProduct);
        setEdit(null);
    };

    const nextImage = (e) => {
        e.preventDefault(); // Evita que el Link se active
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = (e) => {
        e.preventDefault(); // Evita que el Link se active
        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    // Obtener URL de imagen del producto
    const getProductImage = (imgs, index = 0) => {
        if (imgs && imgs.length > 0) {
            const sortedImages = [...imgs].sort((a, b) => (a.position || 0) - (b.position || 0));
            const image = sortedImages[index] || sortedImages[0];
            const imagePath = image.thumbnail_path || image.path;
            return `${IMAGE_URL}/${imagePath}`;
        }
        return null;
    };

    const editProduct = (type) => {
        setEdit(type);
        setShowMenuEdit(false);
    };

    const NotificationContent = {
        'incomplete': (
            <>
                <p>Faltan precios <Link to={`/productos/nuevo/2/${product.id}`}>Agregar</Link></p>
                <p>Falta código de barras <Link to={`/productos/nuevo/3/${product.id}`}>Agregar</Link></p>
            </>
        ),
        'pending_barcode': (
            <p>Falta código de barras <Link to={`/productos/nuevo/3/${product.id}`}>Agregar</Link></p>
        ),
        'pending_prices': (
            <p>Faltan precios <Link to={`/productos/nuevo/2/${product.id}`}>Agregar</Link></p>
        ),
    };

    return (
        <>
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

                            {/* Solo mostrar flechas si hay más de una imagen */}
                            {images.length > 1 && (
                                <div className={styles.image_nav}>
                                    <button
                                        className={styles.nav_arrow_left}
                                        onClick={prevImage}
                                    >
                                        ‹
                                    </button>
                                    <button
                                        className={styles.nav_arrow_right}
                                        onClick={nextImage}
                                    >
                                        ›
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
                            {categories.map((cat, idx) => (
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
                            <Link to={`/productos/nuevo/2/${product.id}`}>Agregar precios</Link>
                        }
                    </div>

                    <div
                        className={styles.detail_item}
                        onClick={(e) => {
                            e.preventDefault();
                        }}
                    >
                        {suppliers && suppliers.length > 0 ?
                            <div className={styles.suppliers}>
                                <span className={styles.suppliers_label}>
                                    Proveedores: {suppliers.length}
                                </span>
                            </div> :
                            <div></div>
                        }
                        <div className={styles.container_btn}>
                            <Link
                                className={styles.btn_barcode}
                                to={`/mercado-libre/publicar/${product.id}/categoria`}
                            >
                                <MercadoLibreIcon width={18} height={18} />
                            </Link>
                            <ProductPromotionControl
                                productId={product.id}
                                promotions={currentPromotions}
                                onPromotionsChange={setCurrentPromotions}
                                trigger="icon"
                                blockNavigation
                            />
                            <button
                                className={styles.btn_barcode}
                                onClick={() => setShowMenuEdit(true)}
                            >
                                <FontAwesomeIcon icon={faPen} />
                            </button>
                            <button
                                className={styles.btn_barcode}
                                onClick={() => setBarcodeVisible(true)}
                            >
                                <FontAwesomeIcon icon={faBarcode} />
                            </button>
                        </div>
                    </div>
                </div>
                {barcodeVisible &&
                    <div
                        className={styles.barcode}
                        onClick={(e) => {
                            e.preventDefault();
                        }}
                    >
                        <button
                            className={styles.btn_close_barcode}
                            onClick={() => {
                                setBarcodeVisible(false)
                            }}
                        >
                            <FontAwesomeIcon icon={faXmark} />
                        </button>
                        {
                            product.barcodes.length > 0 ?
                                product.barcodes.map(({ barcode }, i) =>
                                    <div className={styles.container_barcode} key={i}>
                                        <Barcode value={barcode} code={product.sku} />
                                    </div>
                                ) :
                                <Link to={`/productos/nuevo/3/${product.id}`}>Agregar código de barras</Link>
                        }
                    </div>
                }
                {showMenuEdit &&
                    <div
                        className={styles.menu_edit}
                        onClick={(e) => {
                            e.preventDefault();
                        }}
                    >
                        <button
                            className={styles.btn_close_barcode}
                            onClick={() => {
                                setShowMenuEdit(false)
                            }}
                        >
                            <FontAwesomeIcon icon={faXmark} />
                        </button>
                        <span>Editar</span>
                        <ul>
                            <li onClick={() => editProduct('info')}>Info principal</li>
                            <li onClick={() => editProduct('priceLists')}>Lista de precios</li>
                            <li onClick={() => editProduct('supplier')}>Proveedor</li>
                            {(currentProduct.status == 'archived' || currentProduct.status == 'published') &&
                                <li onClick={() => editProduct('status')}>Estado</li>
                            }
                            <li onClick={() => editProduct('image')}>Imagenes</li>
                            <li onClick={() => editProduct('category')}>Categorías</li>
                        </ul>
                    </div>
                }
            </Link>
            {edit === 'info' && (
                <Modal onClose={() => setEdit(null)} title={`Editar ${currentProduct.name}`}>
                    <EditInfo
                        product={currentProduct}
                        onSuccess={onRefreshInfo}
                    />
                </Modal>
            )}

            {edit === 'priceLists' && (
                <Modal onClose={() => setEdit(null)} title="Actualizar precios">
                    <EditPriceLists
                        currentPriceLists={prices}
                        productId={product.id}
                        onRefresh={onRefreshSupplisersAndPrices}
                    />
                </Modal>
            )}
            {edit === 'supplier' && (
                <Modal onClose={() => setEdit(null)} title={`Editar: ${product.suppliers[0].name}`}>
                    <EditSupplier
                        supplier={suppliers[0]}
                        suppliers={[suppliers[0]]}
                        productId={product.id}
                        onRefresh={onRefreshSupplisersAndPrices}
                        onClose={() => setEdit(null)}
                    />
                </Modal>
            )}

            {edit === 'status' && (
                <Modal onClose={() => setEdit(null)} title={'Confirmar cambio de estado'}>
                    <EditStatus
                        currentStatus={currentProduct.status}
                        productId={product.id}
                        onRefresh={onRefreshStatus}
                        onCancel={() => setEdit(null)}
                    />
                </Modal>
            )}

            {edit === 'image' && (
                <Modal onClose={() => setEdit(null)} title={'Agregar nuevas imagens'} >
                    <AddImagesModal
                        productId={product.id}
                        onClose={() => setEdit(null)}
                        onUpdate={setImages} // Pasamos la función de recarga
                    />
                </Modal>
            )}

            {edit === 'category' && (
                <Modal onClose={() => setEdit(null)} title={'Editar categorías'}>
                    <EditCategories
                        productId={product.id}
                        currentCategoryIds={categories.map(cat => cat.id)}
                        onRefresh={onRefreshCategories}
                    />
                </Modal>
            )}
        </>
    );
}