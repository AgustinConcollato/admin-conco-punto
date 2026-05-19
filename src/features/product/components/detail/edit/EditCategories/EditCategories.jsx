import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useMemo, useState } from 'react';
import { ProductService } from '../../../../../../services/product/ProductService';
import { CategoryList } from '../../../newProduct/CategoryList/CategoryList';
import styles from '../../Categories/Categories.module.css';

export function EditCategories({ productId, currentCategoryIds, onRefresh }) {
    const [selectedIds, setSelectedIds] = useState(currentCategoryIds);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const productService = useMemo(() => new ProductService(), []);

    const handleSave = async () => {
        setLoading(true);
        setErrors({});

        try {
            const updatedProduct = await productService.syncCategories(
                { categories: selectedIds },
                productId
            );
            // Notificamos al padre con el producto actualizado (que trae las nuevas categorías)
            onRefresh(updatedProduct.categories);
        } catch (error) {
            if (error[0]) setErrors(error[0]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.edit_container}>
            <CategoryList
                setCategories={setSelectedIds}
                selectedIds={selectedIds}
            />
            {errors.categories && (
                <p className={styles.error}>{errors.categories[0]}</p>
            )}
            <button
                className='btn btn_solid'
                onClick={handleSave}
                disabled={loading}
            >
                {loading ? <FontAwesomeIcon icon={faCircleNotch} spin /> : 'Guardar Cambios'}
            </button>
        </div>
    );
}