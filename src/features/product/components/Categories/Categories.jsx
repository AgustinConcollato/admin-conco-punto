import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Modal } from '../../../../components/Modal/Modal';
import { EditCategories } from '../EditCategories/EditCategories';
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
                    <h3>CategorÃ­as</h3>
                    {/* <button
                        className='btn btn_regular'
                        onClick={() => !disabled && setIsEditing(true)}
                        disabled={disabled}
                        title={disabled ? 'La categorÃ­a no puede modificarse una vez asignada' : undefined}
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
                        Sin categorÃ­as asignadas. <Link to={`/productos/nuevo/2/${productId}`}>Asignar</Link>
                    </p>
                )}

                <div className={styles.alert}>
                    La categorÃ­a no se puede cambiar una vez asignada al producto
                    {/* Si te equivocaste de categorÃ­a, podÃ©s volver a publicar el producto desde aquÃ­. */}
                    {/* Eliminaremos esta publicaciÃ³n, junto con sus visitas y ventas. */}
                </div>
            </div>

            {isEditing && (
                <Modal onClose={() => setIsEditing(false)} title={'Editar categorÃ­as'}>
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


