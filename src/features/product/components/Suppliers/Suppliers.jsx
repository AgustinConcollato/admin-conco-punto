import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Modal } from '../../../../components/Modal/Modal';
import { formatPrice } from '../../../../utils/formatPrice';
import { AddSuppliers } from '../AddSuppliers/AddSuppliers';
import { EditSupplier } from '../EditSupplier/EditSupplier';
import styles from './Suppliers.module.css';

export function Suppliers({ suppliers, productId, onRefresh }) {

    const [showModal, setShowModal] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState(null);

    const handleModal = () => {
        setShowModal(!showModal);
    }

    const handleSelectSupplier = (supplier) => {
        setSelectedSupplier(supplier);
    }

    const freightPerUnit = (price, percentage) => formatPrice((price * percentage) / 100);

    return (
        <>
            <div className={styles.suppliers_container} >
                <div className={styles.header}>
                    <h3>Proveedores</h3>
                    <button
                        className='btn btn_regular'
                        onClick={handleModal}
                    >
                        Asociar proveedor
                    </button>
                </div>
                {suppliers.length > 0 ?
                    suppliers.map(e =>
                        <div key={e.id} className={styles.supplier} onClick={() => handleSelectSupplier(e)}>
                            <div>
                                <p>{e.name}:</p>
                                <span className={styles.purchase_price}>
                                    <span className={styles.price_main}>
                                        {formatPrice(e.pivot.purchase_price)} + {freightPerUnit(e.pivot.purchase_price, e.pivot.freight_percent)} = {formatPrice(e.pivot.purchase_price * (1 + e.pivot.freight_percent / 100))}
                                    </span>
                                    <span className={styles.price_tooltip}>
                                        Envio {e.pivot.freight_percent}% = {freightPerUnit(e.pivot.purchase_price, e.pivot.freight_percent)}
                                    </span>
                                </span>
                            </div>
                            {e.pivot.supplier_product_url &&
                                <div>
                                    <p>Link del producto</p>
                                    <Link
                                        to={e.pivot.supplier_product_url}
                                        target='_blank'
                                        onClick={(event) => event.stopPropagation()}
                                        className={styles.product_url}
                                    >
                                        [Ver producto]
                                    </Link>
                                </div>
                            }
                        </div>
                    ) :
                    <p>No hay proveedores</p>
                }
            </div>
            {showModal &&
                <Modal onClose={handleModal} title={'Asociar proveedor'}>
                    <AddSuppliers
                        productId={productId}
                        currentSuppliers={suppliers}
                        onRefresh={onRefresh}
                        onClose={handleModal}
                    />
                </Modal>
            }
            {selectedSupplier &&
                <Modal onClose={() => setSelectedSupplier(null)} title={`Editar: ${selectedSupplier.name}`}>
                    <EditSupplier
                        supplier={selectedSupplier}
                        suppliers={suppliers}
                        productId={productId}
                        onRefresh={onRefresh}
                        onClose={() => setSelectedSupplier(null)}
                    />
                </Modal>
            }
        </>
    )
}

