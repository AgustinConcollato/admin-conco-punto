import { useState } from 'react';
import { Modal } from '../../../../components/Modal/Modal';
import { EditInfo } from '../EditInfo/EditInfo';
import styles from './Info.module.css';

export function Info({ product }) {
    const [isEditing, setIsEditing] = useState(false);
    // Usamos un estado local para el producto para que la UI se refresque al editar
    const [currentProduct, setCurrentProduct] = useState(product);

    const handleSuccess = (updatedProduct) => {
        setCurrentProduct(updatedProduct);
        setIsEditing(false);
    };

    return (
        <>
            <div className={styles.info_container}>
                <div className={styles.header}>
                    <h3>Información</h3>
                    <button onClick={() => setIsEditing(true)} className="btn btn_regular">
                        Editar
                    </button>
                </div>

                <div className={styles.info_detail}>
                    <span>SKU</span>
                    <p>{currentProduct.sku}</p>
                </div>

                <div className={styles.info_detail}>
                    <span>{currentProduct.is_dropshipping ? 'Disponibilidad' : 'Stock'}</span>
                    <p>
                        {currentProduct.is_dropshipping
                            ? (currentProduct.stock > 0 ? 'Disponible (dropshipping)' : 'Sin stock (dropshipping)')
                            : currentProduct.stock}
                    </p>
                </div>

                <div className={styles.info_detail}>
                    <span>Descripción:</span>
                    <pre className={styles.description_pre}>
                        {currentProduct.description || 'No tiene descripción'}
                    </pre>
                </div>
            </div>

            {isEditing && (
                <Modal onClose={() => setIsEditing(false)} title={`Editar ${currentProduct.name}`}>
                    <EditInfo
                        product={currentProduct}
                        onSuccess={handleSuccess}
                    />
                </Modal>
            )}
        </>
    );
}

