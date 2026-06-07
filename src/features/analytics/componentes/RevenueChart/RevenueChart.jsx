import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
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
                entry.value != null && (
                    <p key={entry.dataKey} className={styles.tooltip_row} style={{ color: entry.color }}>
                        <span>{entry.name}</span>
                        <strong>{formatPrice(Number(entry.value))}</strong>
                    </p>
                )
            ))}
        </div>
    );
}

export function RevenueChart({ data = [], ordersData = [] }) {
    const hasData = data.length > 0 || ordersData.length > 0;

    const chartData = useMemo(() => {
        const map = {};
        data.forEach(d => {
            map[d.date] = { date: formatDate(d.date), collected: Number(d.revenue) };
        });
        ordersData.forEach(d => {
            if (!map[d.date]) map[d.date] = { date: formatDate(d.date) };
            map[d.date].billed = Number(d.billed);
        });
        return Object.values(map).sort((a, b) => a.date.localeCompare(b.date));
    }, [data, ordersData]);

    if (!hasData) {
        return (
            <div className={styles.empty}>
                <p>Sin datos para el período seleccionado</p>
            </div>
        );
    }

    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <h3 className={styles.title}>Facturado vs Cobrado</h3>
            </div>
            <div className={styles.chart_wrap}>
                <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="collectedGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%"  stopColor="#3d6caa" stopOpacity={0.15} />
                                <stop offset="95%" stopColor="#3d6caa" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="billedGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%"  stopColor="#16a34a" stopOpacity={0.12} />
                                <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
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
                        <Legend
                            iconType="circle"
                            iconSize={8}
                            wrapperStyle={{ fontSize: '0.75rem', paddingTop: '8px' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="collected"
                            name="Cobrado"
                            stroke="#3d6caa"
                            strokeWidth={2}
                            fill="url(#collectedGrad)"
                            dot={false}
                            activeDot={{ r: 4, fill: '#3d6caa' }}
                            connectNulls
                        />
                        <Area
                            type="monotone"
                            dataKey="billed"
                            name="Facturado"
                            stroke="#16a34a"
                            strokeWidth={2}
                            strokeDasharray="5 3"
                            fill="url(#billedGrad)"
                            dot={false}
                            activeDot={{ r: 4, fill: '#16a34a' }}
                            connectNulls
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
