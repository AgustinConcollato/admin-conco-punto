import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatPrice } from '../../../../utils/formatPrice';
import styles from './RevenueChart.module.css';

const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const [, month, day] = dateStr.split('-');
    return `${day}/${month}`;
};

const formatYAxis = (value) => {
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}k`;
    return `$${value}`;
};

function CustomTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return (
        <div className={styles.tooltip}>
            <p className={styles.tooltip_date}>{label}</p>
            {payload.map((entry) => (
                <p key={entry.dataKey} className={styles.tooltip_row} style={{ color: entry.color }}>
                    <span>{entry.name}</span>
                    <strong>
                        {entry.dataKey === 'orders_count'
                            ? entry.value
                            : formatPrice(Number(entry.value))}
                    </strong>
                </p>
            ))}
        </div>
    );
}

export function RevenueChart({ data = [] }) {
    if (!data.length) {
        return (
            <div className={styles.empty}>
                <p>Sin datos para el período seleccionado</p>
            </div>
        );
    }

    const chartData = data.map(d => ({
        date: formatDate(d.date),
        revenue: Number(d.revenue),
        orders_count: Number(d.orders_count),
    }));

    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <h3 className={styles.title}>Pagos cobrados en el período</h3>
            </div>
            <div className={styles.chart_wrap}>
                <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%"  stopColor="var(--primary, #3d6caa)" stopOpacity={0.18} />
                                <stop offset="95%" stopColor="var(--primary, #3d6caa)" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border, #e2e8f0)" vertical={false} />
                        <XAxis
                            dataKey="date"
                            tick={{ fontSize: 11, fill: 'var(--color-text-muted, #64748b)' }}
                            axisLine={false}
                            tickLine={false}
                            interval="preserveStartEnd"
                        />
                        <YAxis
                            tickFormatter={formatYAxis}
                            tick={{ fontSize: 11, fill: 'var(--color-text-muted, #64748b)' }}
                            axisLine={false}
                            tickLine={false}
                            width={56}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                            type="monotone"
                            dataKey="revenue"
                            name="Ingresos"
                            stroke="var(--primary, #3d6caa)"
                            strokeWidth={2}
                            fill="url(#revenueGrad)"
                            dot={false}
                            activeDot={{ r: 4, fill: 'var(--primary, #3d6caa)' }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
