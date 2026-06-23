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

    const handleModal = () => setShowModal(!showModal);

    return (
        <>
            <div className={styles.card}>
                <div className={styles.header}>
                    <span className={styles.label}>Proveedores</span>
                    <button className={styles.action_btn} onClick={handleModal}>Asociar</button>
                </div>

                {suppliers.length > 0 ? (
                    suppliers.map(e => {
                        const base = Number(e.pivot.purchase_price) || 0;
                        const freightPct = Number(e.pivot.freight_percent) || 0;
                        const freightAmt = (base * freightPct) / 100;
                        const total = base + freightAmt;
                        const basePct = total > 0 ? (base / total) * 100 : 100;

                        return (
                            <div key={e.id} className={styles.supplier} onClick={() => setSelectedSupplier(e)}>
                                <div className={styles.supplier_header}>
                                    <span className={styles.supplier_name}>{e.name}</span>
                                    <span className={styles.supplier_total}>{formatPrice(total)}</span>
                                </div>

                                <div className={styles.breakdown}>
                                    <div className={styles.breakdown_bar}>
                                        <div className={styles.bar_base} style={{ width: `${basePct}%` }} />
                                        <div className={styles.bar_freight} style={{ width: `${100 - basePct}%` }} />
                                    </div>
                                    <div className={styles.breakdown_items}>
                                        <div className={styles.breakdown_row}>
                                            <div className={styles.breakdown_label}>
                                                <span className={styles.dot_base} />
                                                <span>Costo base</span>
                                            </div>
                                            <span className={styles.breakdown_val}>{formatPrice(base)}</span>
                                        </div>
                                        <div className={styles.breakdown_row}>
                                            <div className={styles.breakdown_label}>
                                                <span className={styles.dot_freight} />
                                                <span>Envío ({e.pivot.freight_percent}%)</span>
                                            </div>
                                            <span className={styles.breakdown_val}>{formatPrice(freightAmt)}</span>
                                        </div>
                                    </div>
                                </div>

                                {e.pivot.supplier_product_url && (
                                    <Link
                                        to={e.pivot.supplier_product_url}
                                        target="_blank"
                                        onClick={(event) => event.stopPropagation()}
                                        className={styles.product_url}
                                    >
                                        Ver producto →
                                    </Link>
                                )}
                            </div>
                        );
                    })
                ) : (
                    <div className={styles.empty}>No hay proveedores</div>
                )}
            </div>

            {showModal && (
                <Modal onClose={handleModal} title="Asociar proveedor">
                    <AddSuppliers
                        productId={productId}
                        currentSuppliers={suppliers}
                        onRefresh={onRefresh}
                        onClose={handleModal}
                    />
                </Modal>
            )}
            {selectedSupplier && (
                <Modal onClose={() => setSelectedSupplier(null)} title={`Editar: ${selectedSupplier.name}`}>
                    <EditSupplier
                        supplier={selectedSupplier}
                        suppliers={suppliers}
                        productId={productId}
                        onRefresh={onRefresh}
                        onClose={() => setSelectedSupplier(null)}
                    />
                </Modal>
            )}
        </>
    );
}
