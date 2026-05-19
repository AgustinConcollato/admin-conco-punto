import { useMemo, useState } from 'react';
import { Loading } from '../../../../components/Loading/Loading';
import { IMAGE_URL } from '../../../../config/api';
import { AnalyticsService } from '../../../../services/analytics/analyticsService';
import { monthsList, yearsList } from '../../../../utils/dateHelpers';
import { formatPrice } from '../../../../utils/formatPrice';
import styles from './MonthlyComparison.module.css';

export function MonthlyComparison() {

    const analyticsService = useMemo(() => new AnalyticsService(), []);

    const [compareData, setCompareData] = useState(null);
    const [compareLoading, setCompareLoading] = useState(false);
    const [monthA, setMonthA] = useState(null);
    const [yearA, setYearA] = useState(null);
    const [monthB, setMonthB] = useState(null);
    const [yearB, setYearB] = useState(null);


    const loadCompare = async ({ month_a, year_a, month_b, year_b } = {}) => {
        setCompareLoading(true);
        try {
            const res = await analyticsService.compareMonths({ month_a, year_a, month_b, year_b });
            setCompareData(res);
        } catch (err) {
            console.warn('Error fetching compare data', err);
        } finally {
            setCompareLoading(false);
        }
    };

    return (
        <>
            <div className={styles.compare_controls}>
                <h3>Comparar meses</h3>
                <div className={styles.compare_selects}>
                    <select className='input' value={monthA || ''} onChange={(e) => setMonthA(Number(e.target.value))}>
                        {monthsList().map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                    </select>
                    <select className='input' value={yearA || ''} onChange={(e) => setYearA(Number(e.target.value))}>
                        {yearsList().map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                    <span className={styles.vs}>con</span>
                    <select className='input' value={monthB || ''} onChange={(e) => setMonthB(Number(e.target.value))}>
                        {monthsList().map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                    </select>
                    <select className='input' value={yearB || ''} onChange={(e) => setYearB(Number(e.target.value))}>
                        {yearsList().map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                    <button type="button" className={styles.apply_button} onClick={() => loadCompare({ month_a: monthA, year_a: yearA, month_b: monthB, year_b: yearB })}>Comparar</button>
                </div>
            </div>

            {compareLoading ? <div style={{ display: 'flex', justifyContent: 'center', padding: '1.5rem' }}><Loading /></div> : (
                compareData ? (
                    <>
                        <div className={styles.compare_changes}>
                            <h4>Diferencias principales</h4>
                            <table className={styles.comparison_table}>
                                <thead>
                                    <tr>
                                        <th></th>
                                        <th>{`${monthsList().filter(e => e.value == compareData.month_a.month)[0].label} ${compareData.month_a.year}`}</th>
                                        <th>{`${monthsList().filter(e => e.value == compareData.month_b.month)[0].label} ${compareData.month_b.year}`}</th>
                                        <th>Diferencia</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(() => {
                                        const aOverview = compareData.month_a.overview || {};
                                        const bOverview = compareData.month_b.overview || {};
                                        const rows = [
                                            { key: 'total_revenue', label: 'Total facturado', type: 'money' },
                                            { key: 'net_profit', label: 'Ganancia neta', type: 'money' },
                                            { key: 'orders_count', label: 'Pedidos', type: 'int' }
                                        ];

                                        return rows.map(r => {
                                            const aVal = (aOverview[r.key] ?? compareData.month_a[r.key] ?? 0);
                                            const bVal = (bOverview[r.key] ?? compareData.month_b[r.key] ?? 0);
                                            const comp = compareData.comparison && compareData.comparison[r.key] ? compareData.comparison[r.key] : { diff: (aVal - bVal), percent_change: null };
                                            const diff = comp.diff ?? (aVal - bVal);
                                            const percent = comp.percent_change;
                                            const monthALabel = `${monthsList().filter(e => e.value == compareData.month_a.month)[0].label} ${compareData.month_a.year}`;
                                            const monthBLabel = `${monthsList().filter(e => e.value == compareData.month_b.month)[0].label} ${compareData.month_b.year}`;
                                            const percentText = percent !== null && percent !== undefined ? `${Math.abs(Number(percent))}%` : '(N/A)';
                                            const moreLess = diff === 0 ? '' : (diff < 0 ? ` más en ${monthBLabel}` : ` más en ${monthALabel}`);

                                            return (
                                                <tr key={r.key}>
                                                    <td><strong>{r.label}</strong></td>
                                                    <td>{r.type === 'money' ? r.key === 'net_profit' ? formatPrice(Math.abs(aVal * 0.9)) : formatPrice(aVal) : (aVal ?? 0)}</td>
                                                    <td>{r.type === 'money' ? r.key === 'net_profit' ? formatPrice(Math.abs(bVal * 0.9)) : formatPrice(bVal) : (bVal ?? 0)}</td>
                                                    <td>
                                                        <div className={styles.difference_value}>
                                                            <span className={styles.diff_amount}>{
                                                                r.type === 'money' ? r.key === 'net_profit' ? formatPrice(Math.abs(diff * 0.9)) : formatPrice(Math.abs(diff)) : Math.abs(diff)}
                                                            </span>
                                                            <small className={diff < 0 ? styles.up : styles.down}>{percentText}{diff !== 0 ? moreLess : ''}</small>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        });
                                    })()}
                                </tbody>
                            </table>
                        </div>

                        <div className={styles.top_products_comparison}>
                            <h4>Top productos comparados</h4>
                            <div className={styles.products_grid}>
                                <div className={styles.products_column}>
                                    <h5>{`${monthsList().filter(e => e.value == compareData.month_a.month)[0].label} ${compareData.month_a.year}`}</h5>
                                    <table className={styles.products_table}>
                                        <thead>
                                            <tr>
                                                <th>Producto</th>
                                                <th>Cantidad</th>
                                                <th>Ingresos</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {compareData.top_products.a && compareData.top_products.a.length > 0 ? (
                                                compareData.top_products.a.map(p => (
                                                    <tr key={p.product_id}>
                                                        <td>
                                                            <div className={styles.product_cell}>
                                                                <img src={p.image_url ? `${IMAGE_URL}/${p.image_url}` : 'https://via.placeholder.com/40'} alt={p.product_name} />
                                                                <div>
                                                                    <div className={styles.product_name}>{p.product_name}</div>
                                                                    <div className={styles.product_cat}>{p.categories && p.categories.length > 0 ? p.categories.join(', ') : 'Sin cat.'}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td>{p.total_quantity}</td>
                                                        <td>{formatPrice(Number(p.total_revenue))}</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="3">No hay datos</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                <div className={styles.products_column}>
                                    <h5>{`${monthsList().filter(e => e.value == compareData.month_b.month)[0].label} ${compareData.month_b.year}`}</h5>
                                    <table className={styles.products_table}>
                                        <thead>
                                            <tr>
                                                <th>Producto</th>
                                                <th>Cantidad</th>
                                                <th>Ingresos</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {compareData.top_products.b && compareData.top_products.b.length > 0 ? (
                                                compareData.top_products.b.map(p => (
                                                    <tr key={p.product_id}>
                                                        <td>
                                                            <div className={styles.product_cell}>
                                                                <img src={p.image_url ? `${IMAGE_URL}/${p.image_url}` : 'https://via.placeholder.com/40'} alt={p.product_name} />
                                                                <div>
                                                                    <div className={styles.product_name}>{p.product_name}</div>
                                                                    <div className={styles.product_cat}>{p.categories && p.categories.length > 0 ? p.categories.join(', ') : 'Sin cat.'}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td>{p.total_quantity}</td>
                                                        <td>{formatPrice(Number(p.total_revenue))}</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="3">No hay datos</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </>
                ) : null
            )}
        </>
    )
}