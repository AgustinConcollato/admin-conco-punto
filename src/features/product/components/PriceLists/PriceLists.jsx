import { useState } from 'react';
import { Modal } from '../../../../components/Modal/Modal';
import { EditPriceLists } from '../EditPriceLists/EditPriceLists';
import { formatPrice } from '../../../../utils/formatPrice';
import styles from './PriceLists.module.css';

export function PriceLists({ priceLists, productId, onRefresh, cost = 0 }) {
    const [showModal, setShowModal] = useState(false);

    const handleSuccess = (updatedData) => {
        onRefresh(updatedData);
        setShowModal(false);
    };

    const maxPrice = priceLists.reduce((max, pl) => Math.max(max, pl.pivot.price), 0);

    return (
        <>
            <div className={styles.card}>
                <div className={styles.header}>
                    <span className={styles.label}>Lista de Precios</span>
                    <button className={styles.action_btn} onClick={() => setShowModal(true)}>
                        {priceLists.length > 0 ? 'Editar' : 'Agregar'}
                    </button>
                </div>

                {priceLists.length > 0 ? (
                    <>
                        {priceLists.map((pl, i) => {
                            const price = pl.pivot.price;
                            const profitPct = price > 0 && cost > 0 ? ((price - cost) / price * 100) : 0;
                            const barWidth = maxPrice > 0 ? (price / maxPrice * 100) : 0;
                            const costPortion = price > 0 && cost > 0 ? Math.min((cost / price) * 100, 100) : 0;

                            return (
                                <div key={pl.id || pl.name} className={`${styles.price_row} ${i % 2 === 1 ? styles.row_alt : ''}`}>
                                    <div className={styles.price_header}>
                                        <span className={styles.price_name}>{pl.name}</span>
                                        <div className={styles.price_right}>
                                            <span className={styles.price_value}>{formatPrice(price)}</span>
                                            {cost > 0 && (
                                                <span className={styles.profit_badge}>+{profitPct.toFixed(1)}%</span>
                                            )}
                                        </div>
                                    </div>
                                    {cost > 0 && (
                                        <div className={styles.bar_track}>
                                            <div className={styles.bar_fill} style={{ width: `${barWidth}%` }}>
                                                <div className={styles.bar_cost} style={{ width: `${costPortion}%` }} />
                                                <div className={styles.bar_profit} style={{ width: `${100 - costPortion}%` }} />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                        {cost > 0 && (
                            <div className={styles.legend}>
                                <div className={styles.legend_item}>
                                    <span className={styles.legend_swatch_cost} />
                                    <span>Costo</span>
                                </div>
                                <div className={styles.legend_item}>
                                    <span className={styles.legend_swatch_profit} />
                                    <span>Ganancia</span>
                                </div>
                                <div className={styles.legend_item}>
                                    <span className={styles.legend_line} />
                                    <span>Umbral ({formatPrice(cost)})</span>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className={styles.empty}>No hay precios configurados</div>
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
