import { faShoppingBag } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { EmptyState } from '../../../../components/EmptyState/EmptyState';
import { Loading } from '../../../../components/Loading/Loading';
import { Modal } from '../../../../components/Modal/Modal';
import { ClientService } from '../../../../services/client/clientService';
import { formatDate } from '../../../../utils/formatDate';
import { formatPrice } from '../../../../utils/formatPrice';
import { OrderCard } from '../../../order/components/OrderCard/OrderCard';
import { EditClientForm } from '../../components/EditClientForm/EditClientForm';
import styles from './ClientDetailPage.module.css';

const IMAGE_URL = import.meta.env.VITE_IMAGE_URL;

const SEGMENT_LABELS = {
    nuevo: 'Nuevo',
    recurrente: 'Recurrente',
    inactivo: 'Inactivo',
    sin_pedidos: 'Sin pedidos',
};

const STATUS_LABELS = {
    pending: 'Pendiente',
    processing: 'En proceso',
    confirmed: 'Confirmado',
    shipped: 'Enviado',
    delivered: 'Entregado',
    cancelled: 'Cancelado',
};

const MONTH_NAMES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

const formatYAxis = (value) => {
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}k`;
    return `$${value}`;
};

const formatMonth = (yearMonth) => {
    const [year, month] = yearMonth.split('-');
    return `${MONTH_NAMES[parseInt(month, 10) - 1]} ${year}`;
};

function ChartTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return (
        <div className={styles.tooltip}>
            <p className={styles.tooltip_label}>{label}</p>
            <p className={styles.tooltip_value}>{formatPrice(Number(payload[0].value))}</p>
            {payload[0]?.payload?.count != null && (
                <p className={styles.tooltip_count}>{payload[0].payload.count} pedidos</p>
            )}
        </div>
    );
}

export function ClientDetailPage() {
    const { id } = useParams();
    const [client, setClient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showEditModal, setShowEditModal] = useState(false);

    const clientService = useMemo(() => new ClientService(), []);
    const loadClient = async () => {
        setLoading(true);
        try {
            const data = await clientService.getById(id);
            setClient(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadClient();
    }, [id]);

    const handleUpdate = async (updatedData) => {
        try {
            const updated = await clientService.update(id, updatedData);
            setClient(prev => ({ ...prev, ...updated }));
            setShowEditModal(false);
            toast.success('Cliente actualizado');
        } catch (error) {
            toast.error('Error al actualizar el cliente.');
        }
    };

    const handleOrderRefresh = (updatedOrder) => {
        if (updatedOrder) {
            setClient(prev => ({
                ...prev,
                orders: prev.orders.map(o => o.id === updatedOrder.id ? { ...o, ...updatedOrder } : o),
            }));
        } else {
            loadClient();
        }
    };

    if (loading) return <Loading />;
    if (!client) return <p className={styles.error_msg}>Cliente no encontrado.</p>;

    const { stats, addresses = [], orders = [], top_products = [], revenue_by_month = [] } = client;

    const chartData = revenue_by_month.map(d => ({
        month: formatMonth(d.month),
        revenue: d.revenue,
        count: d.count,
    }));

    const ordersByStatus = stats.orders_by_status ?? {};

    const maxTopQty = top_products.reduce((max, p) => Math.max(max, p.total_qty), 0);

    return (
        <div className={styles.page}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.header_info}>
                    <div className={styles.name_row}>
                        <h1 className={styles.name}>{client.name}</h1>
                        <span className={`${styles.segment_badge} ${styles[`segment_${stats.segment}`]}`}>
                            {SEGMENT_LABELS[stats.segment] ?? stats.segment}
                        </span>
                    </div>
                    <div className={styles.chips}>
                        {client.email && <span className={styles.chip}>{client.email}</span>}
                        {client.phone && <span className={styles.chip}>{client.phone}</span>}
                        {client.price_list && (
                            <span className={`${styles.chip} ${styles.chip_list}`}>{client.price_list.name}</span>
                        )}
                    </div>
                </div>
                <button className="btn btn_regular" onClick={() => setShowEditModal(true)}>
                    Editar
                </button>
            </div>

            {/* Métricas clave */}
            <div className={styles.stats_grid}>
                <div className={styles.stat_card}>
                    <p className={styles.stat_label}>Pedidos totales</p>
                    <p className={styles.stat_value}>{stats.total_orders}</p>
                </div>
                <div className={styles.stat_card}>
                    <p className={styles.stat_label}>Ticket promedio</p>
                    <p className={styles.stat_value}>{formatPrice(stats.avg_order_value)}</p>
                </div>
                <div className={styles.stat_card}>
                    <p className={styles.stat_label}>Total facturado</p>
                    <p className={styles.stat_value}>{formatPrice(stats.total_spent)}</p>
                </div>
                <div className={`${styles.stat_card} ${parseFloat(stats.balance_due) > 0 ? styles.stat_debt : ''}`}>
                    <p className={styles.stat_label}>Saldo pendiente</p>
                    <p className={styles.stat_value}>{formatPrice(stats.balance_due)}</p>
                </div>
            </div>

            {/* Detalle financiero */}
            <div className={styles.secondary_metrics}>
                <div className={styles.metric_item}>
                    <span className={styles.metric_label}>Total pagado</span>
                    <span className={styles.metric_value}>{formatPrice(stats.total_paid)}</span>
                </div>
                <div className={styles.metric_divider} />
                <div className={styles.metric_item}>
                    <span className={styles.metric_label}>% pagado</span>
                    <span className={styles.metric_value}>{stats.payment_rate}%</span>
                </div>
                <div className={styles.metric_divider} />
                <div className={styles.metric_item}>
                    <span className={styles.metric_label}>Con deuda</span>
                    <span className={styles.metric_value}>{stats.orders_with_debt} pedidos</span>
                </div>
                <div className={styles.metric_divider} />
                <div className={styles.metric_item}>
                    <span className={styles.metric_label}>Activos</span>
                    <span className={styles.metric_value}>{stats.active_count}</span>
                </div>
                <div className={styles.metric_divider} />
                <div className={styles.metric_item}>
                    <span className={styles.metric_label}>Cancelados</span>
                    <span className={styles.metric_value}>{stats.cancelled_count}</span>
                </div>
                <div className={styles.metric_divider} />
                <div className={styles.metric_item}>
                    <span className={styles.metric_label}>Margen bruto</span>
                    <span className={styles.metric_value}>{formatPrice(stats.gross_margin)}</span>
                </div>
                <div className={styles.metric_divider} />
                <div className={styles.metric_item}>
                    <span className={styles.metric_label}>Margen %</span>
                    <span className={styles.metric_value}>{stats.gross_margin_pct}%</span>
                </div>
            </div>

            {/* Comportamiento */}
            <div className={styles.behavior_grid}>
                <div className={styles.stat_card}>
                    <p className={styles.stat_label}>Primer pedido</p>
                    <p className={styles.stat_value_sm}>
                        {stats.first_order_at ? formatDate(stats.first_order_at, 'short') : '—'}
                    </p>
                </div>
                <div className={styles.stat_card}>
                    <p className={styles.stat_label}>Último pedido</p>
                    <p className={styles.stat_value_sm}>
                        {stats.last_order_at ? formatDate(stats.last_order_at, 'short') : '—'}
                    </p>
                </div>
                <div className={styles.stat_card}>
                    <p className={styles.stat_label}>Días desde último pedido</p>
                    <p className={styles.stat_value_sm}>
                        {stats.days_since_last !== null ? `${Math.round(stats.days_since_last)} días` : '—'}
                    </p>
                </div>
                <div className={styles.stat_card}>
                    <p className={styles.stat_label}>Frecuencia promedio</p>
                    <p className={styles.stat_value_sm}>
                        {stats.avg_days_between !== null ? `c/ ${stats.avg_days_between} días` : '—'}
                    </p>
                </div>
            </div>

            {/* Tendencia de ventas */}
            {chartData.length >= 2 && (
                <section className={styles.section}>
                    <h2 className={styles.section_title}>Tendencia de ventas</h2>
                    <div className={styles.chart_container}>
                        <ResponsiveContainer width="100%" height={220}>
                            <AreaChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="clientRevenueGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--primary, #3d6caa)" stopOpacity={0.18} />
                                        <stop offset="95%" stopColor="var(--primary, #3d6caa)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border, #e2e8f0)" vertical={false} />
                                <XAxis
                                    dataKey="month"
                                    tick={{ fontSize: 11, fill: 'var(--color-text-muted, #64748b)' }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    tickFormatter={formatYAxis}
                                    tick={{ fontSize: 11, fill: 'var(--color-text-muted, #64748b)' }}
                                    axisLine={false}
                                    tickLine={false}
                                    width={56}
                                />
                                <Tooltip content={<ChartTooltip />} />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    name="Ingresos"
                                    stroke="var(--primary, #3d6caa)"
                                    strokeWidth={2}
                                    fill="url(#clientRevenueGrad)"
                                    dot={false}
                                    activeDot={{ r: 4, fill: 'var(--primary, #3d6caa)' }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </section>
            )}

            {/* Pedidos por estado */}
            {Object.keys(ordersByStatus).length > 0 && (
                <section className={styles.section}>
                    <h2 className={styles.section_title}>Pedidos por estado</h2>
                    <div className={styles.status_badges_row}>
                        {Object.entries(ordersByStatus).map(([status, count]) => (
                            <span key={status} className={`${styles.status_badge} ${styles[`status_${status}`]}`}>
                                {STATUS_LABELS[status] ?? status}: {count}
                            </span>
                        ))}
                    </div>
                </section>
            )}

            {/* Top productos */}
            {top_products.length > 0 && (
                <section className={styles.section}>
                    <h2 className={styles.section_title}>Productos más vendidos</h2>
                    <ol className={styles.top_products_list}>
                        {top_products.map((p, i) => (
                            <li key={p.product_id} className={styles.top_product_item}>
                                <span className={styles.top_product_rank}>{i + 1}</span>
                                {p.image ? (
                                    <img
                                        className={styles.top_product_thumb}
                                        src={`${IMAGE_URL}/${p.image}`}
                                        alt={p.product_name}
                                    />
                                ) : (
                                    <span className={styles.top_product_thumb_placeholder}>—</span>
                                )}
                                <div className={styles.top_product_body}>
                                    <div className={styles.top_product_head}>
                                        <span className={styles.top_product_name}>{p.product_name}</span>
                                        <span className={styles.top_product_amount}>{formatPrice(p.total_amount)}</span>
                                    </div>
                                    <div className={styles.top_product_bar_track}>
                                        <div
                                            className={styles.top_product_bar_fill}
                                            style={{ width: `${maxTopQty > 0 ? (p.total_qty / maxTopQty) * 100 : 0}%` }}
                                        />
                                    </div>
                                    <span className={styles.top_product_qty}>{p.total_qty} u</span>
                                </div>
                            </li>
                        ))}
                    </ol>
                </section>
            )}

            {/* Direcciones */}
            <section className={styles.section}>
                <h2 className={styles.section_title}>Direcciones</h2>
                {addresses.length === 0 ? (
                    <p className={styles.empty_msg}>Sin direcciones registradas</p>
                ) : (
                    <div className={styles.address_list}>
                        {addresses.map(addr => (
                            <div key={addr.id} className={styles.address_card}>
                                <div className={styles.address_header}>
                                    <span className={styles.address_label}>{addr.label}</span>
                                    {addr.is_default && (
                                        <span className={styles.badge_default}>Principal</span>
                                    )}
                                </div>
                                <p className={styles.address_line}>
                                    {addr.street} {addr.street_number}
                                    {addr.floor ? `, Piso ${addr.floor}` : ''}
                                    {addr.apartment ? ` Depto ${addr.apartment}` : ''}
                                </p>
                                <p className={styles.address_line}>
                                    {addr.locality}, {addr.province} CP {addr.postal_code}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Historial de pedidos */}
            <section className={styles.section}>
                <div className={styles.section_header}>
                    <h2 className={styles.section_title}>Últimos 5 pedidos</h2>
                    {orders.length > 5 && (
                        <Link to={`/pedidos?client_id=${id}&range=all`} className="btn btn_regular">
                            Ver más
                        </Link>
                    )}
                </div>
                {orders.length === 0 ? (
                    <EmptyState icon={faShoppingBag} message="Sin pedidos registrados" />
                ) : (
                    <div className={styles.orders_grid}>
                        {orders.slice(0, 5).map(order => (
                            <OrderCard
                                key={order.id}
                                order={order}
                                onRefresh={handleOrderRefresh}
                            />
                        ))}
                    </div>
                )}
            </section>

            {showEditModal && (
                <Modal onClose={() => setShowEditModal(false)} title={`Editar: ${client.name}`}>
                    <EditClientForm
                        client={client}
                        onSave={handleUpdate}
                        onCancel={() => setShowEditModal(false)}
                    />
                </Modal>
            )}
        </div>
    );
}
