import { useState } from 'react';
import { Modal } from '../../../../../components/Modal/Modal';
import styles from './Categories.module.css';
import { EditCategories } from '../edit/EditCategories/EditCategories';

export function Categories({ categories, productId, onRefresh }) {
    const [isEditing, setIsEditing] = useState(false);

    const handleSuccess = (updatedProduct) => {
        onRefresh(updatedProduct); // Actualiza el estado en la Card
        setIsEditing(false);
    };

    return (
        <>
            <div className={styles.categories_container}>
                <div className={styles.header}>
                    <h3>Categorías</h3>
                    <button
                        className='btn btn_regular'
                        onClick={() => setIsEditing(true)}
                    >
                        Editar
                    </button>
                </div>

                {categories && categories.length > 0 ? (
                    <div className={styles.product_categories}>
                        {categories.map((cat) => (
                            <span key={cat.id} className={styles.category_tag}>
                                {cat.name}
                            </span>
                        ))}
                    </div>
                ) : (
                    <p className={styles.no_data}>Sin categorías asignadas.</p>
                )}
            </div>

            {isEditing && (
                <Modal onClose={() => setIsEditing(false)} title={'Editar categorías'}>
                    <EditCategories
                        productId={productId}
                        currentCategoryIds={categories.map(cat => cat.id)}
                        onRefresh={handleSuccess}
                    />
                </Modal>
            )}
        </>
    );
}