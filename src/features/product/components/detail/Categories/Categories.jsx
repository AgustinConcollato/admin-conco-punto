import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Modal } from '../../../../../components/Modal/Modal';
import { EditCategories } from '../edit/EditCategories/EditCategories';
import styles from './Categories.module.css';

export function Categories({ categories, productId, onRefresh, disabled = false }) {
    const [isEditing, setIsEditing] = useState(false);

    const handleSuccess = (updatedProduct) => {
        onRefresh(updatedProduct);
        setIsEditing(false);
    };

    return (
        <>
            <div className={styles.categories_container}>
                <div className={styles.header}>
                    <h3>Categorías</h3>
                    {/* <button
                        className='btn btn_regular'
                        onClick={() => !disabled && setIsEditing(true)}
                        disabled={disabled}
                        title={disabled ? 'La categoría no puede modificarse una vez asignada' : undefined}
                    >
                        Editar
                    </button> */}
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
                    <p className={styles.no_data}>
                        Sin categorías asignadas. <Link to={`/productos/nuevo/2/${productId}`}>Asignar</Link>
                    </p>
                )}

                <div className={styles.alert}>
                    La categoría no se puede cambiar una vez asignada al producto
                    {/* Si te equivocaste de categoría, podés volver a publicar el producto desde aquí. */}
                    {/* Eliminaremos esta publicación, junto con sus visitas y ventas. */}
                </div>
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