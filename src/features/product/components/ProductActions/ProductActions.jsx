import { faBarcode, faPen } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Barcode } from '../../../../components/Barcode/Barcode';
import { Modal } from '../../../../components/Modal/Modal';
import { MercadoLibreIcon } from '../../../../assets/icons';
import { ProductPromotionControl } from '../../../promotion/components/ProductPromotionControl/ProductPromotionControl';
import { AddImagesModal } from '../AddImagesModal/AddImagesModal';
import { EditCategories } from '../EditCategories/EditCategories';
import { EditInfo } from '../EditInfo/EditInfo';
import { EditPriceLists } from '../EditPriceLists/EditPriceLists';
import { EditStatus } from '../EditStatus/EditStatus';
import { EditSupplier } from '../EditSupplier/EditSupplier';
import styles from './ProductActions.module.css';

export function ProductActions({ product, onUpdated }) {
    const [showMenuEdit, setShowMenuEdit] = useState(false);
    const [edit, setEdit] = useState(null);
    const [barcodeVisible, setBarcodeVisible] = useState(false);
    const [selectedSupplierIndex, setSelectedSupplierIndex] = useState(0);

    const [prices, setPrices] = useState(product.price_lists || []);
    const [suppliers, setSuppliers] = useState(product.suppliers || []);
    const [variants, setVariants] = useState(product.variants || []);
    const [categories, setCategories] = useState(product.categories || []);
    const [status, setStatus] = useState(product.status);
    const [promotions, setPromotions] = useState(product.promotions || []);

    useEffect(() => {
        setPrices(product.price_lists || []);
        setSuppliers(product.suppliers || []);
        setVariants(product.variants || []);
        setCategories(product.categories || []);
        setStatus(product.status);
        setPromotions(product.promotions || []);
    }, [product]);

    const stop = (e) => {
        e.stopPropagation();
        // Solo evitar navegación para clicks del DOM real (no de portales como Modal)
        if (e.currentTarget.contains(e.target)) {
            e.preventDefault();
        }
    };

    const editProduct = (type) => {
        setEdit(type);
        setShowMenuEdit(false);
        if (type === 'supplier') setSelectedSupplierIndex(0);
    };

    const onRefreshInfo = (updatedProduct) => {
        onUpdated?.(updatedProduct);
        setEdit(null);
    };

    const onRefreshSupplisersAndPrices = ({ price_lists, variants: newVariants }) => {
        setPrices(price_lists);
        if (newVariants) setVariants(newVariants);
        onUpdated?.({ price_lists, ...(newVariants ? { variants: newVariants } : {}) });
        setEdit(null);
    };

    const onRefreshStatus = (newStatus) => {
        setStatus(newStatus);
        onUpdated?.({ status: newStatus });
        setEdit(null);
    };

    const onRefreshCategories = (updatedCategories) => {
        setCategories(updatedCategories);
        onUpdated?.({ categories: updatedCategories });
        setEdit(null);
    };

    const onRefreshImages = (newImages) => {
        onUpdated?.({ images: newImages });
    };

    const onRefreshPromotions = (newPromotions) => {
        setPromotions(newPromotions);
        onUpdated?.({ promotions: newPromotions });
    };

    return (
        <div className={styles.actions} onClick={stop}>
            <div className={styles.buttons}>
                <Link
                    className={styles.btn_action}
                    to={`/mercado-libre/publicar/${product.id}/categoria`}
                    onClick={(e) => e.stopPropagation()}
                >
                    <MercadoLibreIcon width={18} height={18} />
                </Link>
                <ProductPromotionControl
                    productId={product.id}
                    promotions={promotions}
                    onPromotionsChange={onRefreshPromotions}
                    trigger="icon"
                    blockNavigation
                />
                <button className={styles.btn_action} onClick={() => setShowMenuEdit(true)}>
                    <FontAwesomeIcon icon={faPen} />
                </button>
                <button className={styles.btn_action} onClick={() => setBarcodeVisible(true)}>
                    <FontAwesomeIcon icon={faBarcode} />
                </button>
            </div>

            {barcodeVisible && (
                <Modal onClose={() => setBarcodeVisible(false)} title="Códigos de barras">
                    {product.barcodes?.length > 0 ? (
                        product.barcodes.map(({ barcode }, i) => (
                            <div key={i} className={styles.barcode_item}>
                                <Barcode value={barcode} code={product.sku} />
                            </div>
                        ))
                    ) : (
                        <Link to={`/productos/nuevo/4/${product.id}`} className={styles.add_barcode_link}>
                            Agregar código de barras
                        </Link>
                    )}
                </Modal>
            )}

            {showMenuEdit && (
                <Modal onClose={() => setShowMenuEdit(false)} title={`Editar — ${product.name}`}>
                    <ul className={styles.edit_menu}>
                        <li onClick={() => editProduct('info')}>Info principal</li>
                        <li onClick={() => editProduct('priceLists')}>Lista de precios</li>
                        <li onClick={() => editProduct('supplier')}>Proveedor</li>
                        {(status === 'archived' || status === 'published') && (
                            <li onClick={() => editProduct('status')}>Estado</li>
                        )}
                        <li onClick={() => editProduct('image')}>Imágenes</li>
                        {categories?.length === 0 && (
                            <li><Link to={`/productos/nuevo/2/${product.id}`}>Categoría</Link></li>
                        )}
                    </ul>
                </Modal>
            )}

            {edit === 'info' && (
                <Modal onClose={() => setEdit(null)} title={`Editar ${product.name}`}>
                    <EditInfo product={product} onSuccess={onRefreshInfo} />
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

            {edit === 'supplier' && suppliers.length > 0 && (
                <Modal onClose={() => setEdit(null)} title="Editar proveedor">
                    {suppliers.length > 1 && (
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                            {suppliers.map((s, i) => (
                                <button
                                    key={s.id}
                                    type="button"
                                    className={`btn ${i === selectedSupplierIndex ? 'btn_solid' : 'btn_regular'}`}
                                    onClick={() => setSelectedSupplierIndex(i)}
                                >
                                    {s.name}
                                </button>
                            ))}
                        </div>
                    )}
                    <EditSupplier
                        supplier={suppliers[selectedSupplierIndex]}
                        suppliers={suppliers}
                        productId={product.id}
                        onRefresh={onRefreshSupplisersAndPrices}
                        onClose={() => setEdit(null)}
                    />
                </Modal>
            )}

            {edit === 'status' && (
                <Modal onClose={() => setEdit(null)} title={'Confirmar cambio de estado'}>
                    <EditStatus
                        currentStatus={status}
                        productId={product.id}
                        onRefresh={onRefreshStatus}
                        onCancel={() => setEdit(null)}
                    />
                </Modal>
            )}

            {edit === 'image' && (
                <Modal onClose={() => setEdit(null)} title={'Agregar nuevas imagens'}>
                    <AddImagesModal
                        productId={product.id}
                        onClose={() => setEdit(null)}
                        onUpdate={onRefreshImages}
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
        </div>
    );
}
