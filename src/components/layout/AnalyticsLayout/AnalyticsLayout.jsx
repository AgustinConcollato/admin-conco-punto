import { useEffect, useMemo, useState } from "react";
import { buildRangeFilters, DEFAULT_RANGE } from "../../../utils/rangeHelpers";
import { Loading } from "../../../components/Loading/Loading";
import { useSearchParams } from "react-router-dom";
import { IMAGE_URL } from "../../../config/api";
import { Filters } from "../../../features/analytics/componentes/Filters/Filters";
import { Metrics } from "../../../features/analytics/componentes/Metrics/Metrics";
import { MonthlyComparison } from "../../../features/analytics/componentes/MonthlyComparison/MonthlyComparison";
import { RevenueChart } from "../../../features/analytics/componentes/RevenueChart/RevenueChart";
import { PaymentList } from "../../../features/payment/components/PaymentList/PaymentList";
import { AnalyticsService } from "../../../services/analytics/analyticsService";
import { ClientService } from "../../../services/client/clientService";
import { formatPrice } from "../../../utils/formatPrice";
import styles from './AnalyticsLayout.module.css';

const PAYMENT_STATUS_LABELS = {
    completed: 'Completado',
    pending: 'Pendiente',
    failed: 'Fallido',
    refunded: 'Reintegrado',
};

export const AnalyticsLayout = () => {

    const analyticsService = useMemo(() => new AnalyticsService(), []);
    const clientService = useMemo(() => new ClientService(), []);

    const [searchParams, setSearchParams] = useSearchParams();

    const [data, setData] = useState(null);
    const [comparison, setComparison] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [clients, setClients] = useState([]);

    const [filters, setFilters] = useState(() => ({
        range: searchParams.get('range') || DEFAULT_RANGE,
        client_id: searchParams.get('client_id') || '',
        start_date: searchParams.get('start_date') || '',
        end_date: searchParams.get('end_date') || ''
    }));

    const loadData = async (appliedFilters = {}) => {
        setLoading(true);
        setError(null);
        try {
            const res = await analyticsService.getAnalyticsData(buildRangeFilters(appliedFilters));
            setData(res);
            setComparison(res.comparison || null);
        } catch (err) {
            setError(err?.message || 'Error al obtener datos');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (filters.start_date && filters.end_date) {
            loadData(filters);
        }
    }, [filters.start_date, filters.end_date]);

    useEffect(() => {
        loadData(filters);
        (async () => {
            try {
                const res = await clientService.getAll();
                setClients(res || []);
            } catch (err) {
                console.warn('No se pudieron cargar clientes', err);
            }
        })();
    }, []);

    useEffect(() => {
        const params = new URLSearchParams();
        if (filters.range) params.set('range', filters.range);
        if (filters.client_id) params.set('client_id', filters.client_id);
        if (filters.start_date) params.set('start_date', filters.start_date);
        if (filters.end_date) params.set('end_date', filters.end_date);
        setSearchParams(params);
    }, [filters, setSearchParams]);

    return (
        <>
            <Filters filters={filters} setFilters={setFilters} loadData={loadData} clients={clients} />

            {error && <p className={styles.error}>{error}</p>}

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                    <Loading />
                </div>
            ) : data && (
                <>
                    {/* Métricas clave */}
                    <Metrics data={data} comparison={comparison} />

                    {/* Gráfico de ingresos */}
                    <RevenueChart data={data.revenue_over_time || []} />

                    {/* Grid inferior: pagos + top productos */}
                    <div className={styles.bottom_grid}>

                        {/* Estado de pagos */}
                        <section className={styles.section_card}>
                            <h3 className={styles.section_title}>Estado de pagos</h3>
                            {data.payments_by_status?.length > 0 ? (
                                <ul className={styles.payment_list}>
                                    {data.payments_by_status.map((p) => (
                                        <li key={p.status} className={styles.payment_item}>
                                            <span className={styles.payment_label}>
                                                {PAYMENT_STATUS_LABELS[p.status] || p.status}
                                            </span>
                                            <span className={styles.payment_value}>
                                                {formatPrice(Number(p.total))}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className={styles.empty_text}>Sin registros de pagos</p>
                            )}
                        </section>

                        {/* Top productos */}
                        <section className={styles.section_card}>
                            <h3 className={styles.section_title}>Top productos más vendidos</h3>
                            {data.top_products?.length > 0 ? (
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th>Producto</th>
                                            <th>Cant.</th>
                                            <th>Ingresos</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.top_products.map((p) => (
                                            <tr key={p.product_id}>
                                                <td>
                                                    <div className={styles.product_cell}>
                                                        <img src={`${IMAGE_URL}/${p.image_url}`} alt="" />
                                                        <div>
                                                            <p className={styles.product_name}>{p.product_name}</p>
                                                            <p className={styles.product_cat}>
                                                                {p.categories?.length > 0 ? p.categories.join(', ') : 'Sin categoría'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className={styles.td_num}>{p.total_quantity}</td>
                                                <td className={styles.td_num}>{formatPrice(Number(p.total_revenue))}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <p className={styles.empty_text}>Sin datos de productos</p>
                            )}
                        </section>
                    </div>

                    <PaymentList filters={filters} showViewAllLink />
                </>
            )}

            <MonthlyComparison />
        </>
    );
};

export default AnalyticsLayout;

