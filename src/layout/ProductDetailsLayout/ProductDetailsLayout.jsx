import { useEffect, useState } from 'react';
import { Barcodes } from '../../features/product/components/detail/Barcodes/Barcodes';
import { Images } from '../../features/product/components/detail/Images/Images';
import { Status } from '../../features/product/components/detail/Status/Status';
import { Info } from '../../features/product/components/detail/Info/Info';
import { Categories } from '../../features/product/components/detail/Categories/Categories';
import { Suppliers } from '../../features/product/components/detail/Suppliers/Suppliers';
import { PriceLists } from '../../features/product/components/detail/PriceLists/PriceLists';
import { ProductPromotionControl } from '../../features/promotion/components/ProductPromotionControl/ProductPromotionControl';
import styles from './ProductDetailsLayout.module.css';

export function ProductDetailsLayout({ product }) {
    const [currentSuppliers, setCurrentSuppliers] = useState(product.suppliers);
    const [currentPriceLists, setCurrentPriceLists] = useState(product.price_lists);
    const [currentStatus, setCurrentStatus] = useState(product.status);
    const [currentCategories, setCurrentCategories] = useState(product.categories);
    const [currentPromotions, setCurrentPromotions] = useState(product.promotions);

    useEffect(() => {
        setCurrentStatus(product.status);
        setCurrentSuppliers(product.suppliers);
        setCurrentPriceLists(product.price_lists);
        setCurrentCategories(product.categories);
        setCurrentPromotions(product.promotions || []);
    }, [product]);

    const refreshSuppliersPrices = ({ price_lists = null, suppliers = null }) => {
        if (suppliers) {
            setCurrentSuppliers(suppliers);
        }
        if (price_lists) {
            setCurrentPriceLists(price_lists);
        }
    }

    const refreshCategories = (updatedProduct) => {
        setCurrentCategories(updatedProduct);
    };

    const { images, barcodes } = product;

    return (
        <div className={styles.layout}>
            <div className={styles.images}>
                <Images
                    images={images}
                    productId={product.id}
                />
            </div>
            <div className={styles.aside}>
                <div>
                    <Status
                        status={currentStatus}
                        id={product.id}
                        onStatusChange={setCurrentStatus}
                    />
                </div>
                <div>
                    <Barcodes barcodes={barcodes} sku={product.sku} id={product.id} />
                </div>
                <div>
                    <ProductPromotionControl
                        productId={product.id}
                        promotions={currentPromotions}
                        onPromotionsChange={setCurrentPromotions}
                    />
                </div>
            </div>
            <div className={styles.info}>
                <Info product={product} />
            </div>
            <div className={styles.categories}>
                <Categories
                    categories={currentCategories}
                    productId={product.id}
                    onRefresh={refreshCategories}
                />
            </div>
            <div className={styles.suppliers}>
                <Suppliers suppliers={currentSuppliers} productId={product.id} onRefresh={refreshSuppliersPrices} />
            </div>
            <div className={styles.prices_list}>
                <PriceLists priceLists={currentPriceLists} productId={product.id} onRefresh={refreshSuppliersPrices} />
            </div>
        </div>
    )
}