import { useEffect, useMemo, useState } from 'react';
import { Barcodes } from '../../../features/product/components/Barcodes/Barcodes';
import { Images } from '../../../features/product/components/Images/Images';
import { Status } from '../../../features/product/components/Status/Status';
import { Info } from '../../../features/product/components/Info/Info';
import { Categories } from '../../../features/product/components/Categories/Categories';
import { Suppliers } from '../../../features/product/components/Suppliers/Suppliers';
import { PriceLists } from '../../../features/product/components/PriceLists/PriceLists';
import { ProductAttributeValues } from '../../../features/product/components/ProductAttributeValues/ProductAttributeValues';
import { Variants } from '../../../features/product/components/Variants/Variants';
import { ProductPromotionControl } from '../../../features/promotion/components/ProductPromotionControl/ProductPromotionControl';
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
        if (suppliers) setCurrentSuppliers(suppliers);
        if (price_lists) setCurrentPriceLists(price_lists);
    };

    const refreshCategories = (updatedProduct) => {
        setCurrentCategories(updatedProduct);
    };

    const { images, barcodes } = product;

    const deepestCategoryId = useMemo(() => {
        if (!currentCategories?.length) return null;
        const category = currentCategories.reduce((max, obj) => obj.id > max.id ? obj : max, currentCategories[0]);
        return category.id;
    }, [currentCategories]);

    const totalCost = useMemo(() => {
        if (!currentSuppliers?.length) return 0;
        const s = currentSuppliers[0];
        const base = Number(s.pivot.purchase_price) || 0;
        const freightPct = Number(s.pivot.freight_percent) || 0;
        return base + (base * freightPct / 100);
    }, [currentSuppliers]);

    return (
        <div className={styles.layout}>
            <div className={styles.left}>
                <Images images={images} productId={product.id} />
                <Status status={currentStatus} id={product.id} onStatusChange={setCurrentStatus} />
                <Barcodes barcodes={barcodes} sku={product.sku} id={product.id} />
                <ProductPromotionControl
                    productId={product.id}
                    promotions={currentPromotions}
                    onPromotionsChange={setCurrentPromotions}
                />
            </div>

            <div className={styles.right}>
                <Info product={product} />

                <div className={styles.two_col}>
                    <PriceLists
                        priceLists={currentPriceLists}
                        productId={product.id}
                        onRefresh={refreshSuppliersPrices}
                        cost={totalCost}
                    />
                    <Suppliers
                        suppliers={currentSuppliers}
                        productId={product.id}
                        onRefresh={refreshSuppliersPrices}
                    />
                </div>

                <div className={styles.two_col_reverse}>
                    <Categories
                        categories={currentCategories}
                        productId={product.id}
                        onRefresh={refreshCategories}
                        disabled={currentCategories.length > 0}
                    />
                    <ProductAttributeValues
                        productId={product.id}
                        deepestCategoryId={deepestCategoryId}
                        initialAttributeValues={product.attribute_values}
                    />
                </div>

                <Variants productId={product.id} productSku={product.sku} isDropship={!!product.is_dropshipping} />
            </div>
        </div>
    );
}
