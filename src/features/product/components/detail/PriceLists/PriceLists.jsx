import { useState } from 'react';
import { Modal } from '../../../../../components/Modal/Modal';
import { EditPriceLists } from '../EditPriceLists/EditPriceLists';
import { formatPrice } from '../../../../../utils/formatPrice';
import styles from './PriceLists.module.css';

export function PriceLists({ priceLists, productId, onRefresh }) {
    const [showModal, setShowModal] = useState(false);

    const handleSuccess = (updatedData) => {
        onRefresh(updatedData); // Notifica a la Card para actualizar el estado global del producto
        setShowModal(false);
    };

    return (
        <>
            <div className={styles.price_lists}>
                <div className={styles.header}>
                    <h3>Lista de precios</h3>
                    <button
                        className="btn btn_regular"
                        onClick={() => setShowModal(true)}
                    >
                        {priceLists.length > 0 ? 'Editar' : 'Agregar'}
                    </button>
                </div>

                {priceLists.length > 0 ? (
                    priceLists.map(list => (
                        <div key={list.id || list.name} className={styles.detail_item}>
                            <span className={styles.detail_label}>{list.name}:</span>
                            <span className={styles.detail_value}>
                                {formatPrice(list.pivot.price)}
                            </span>
                        </div>
                    ))
                ) : (
                    <p className={styles.no_data}>No hay precios configurados</p>
                )}
            </div>

            {showModal && (
                <Modal onClose={() => setShowModal(false)} title="Actualizar precios">
                    <EditPriceLists
                        currentPriceLists={priceLists}
                        productId={productId}
                        onRefresh={handleSuccess}
                    />
                </Modal>
            )}
        </>
    );
}