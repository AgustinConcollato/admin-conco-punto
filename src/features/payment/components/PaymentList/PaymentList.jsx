import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Pagination } from "../../../../components/Pagination/Pagination";
import { PaymentService } from "../../../../services/payments/paymentsService";
import { formatDate } from "../../../../utils/formatDate";
import { formatPrice } from "../../../../utils/formatPrice";
import styles from './PaymentList.module.css';

const METHOD_LABELS = {
    transfer: 'Transferencia',
    cash: 'Efectivo',
    credit_card: 'Tarjeta',
    check: 'Cheque',
};

const METHOD_STYLES = {
    transfer: { bg: '#dbeafe', color: '#1d4ed8', dot: '#3b82f6' },
    cash: { bg: '#dcfce7', color: '#15803d', dot: '#22c55e' },
    check: { bg: '#fef3c7', color: '#92400e', dot: '#f59e0b' },
    credit_card: { bg: '#ede9fe', color: '#6d28d9', dot: '#8b5cf6' },
};

const AVATAR_PALETTES = [
    { bg: '#ede9fe', color: '#7c3aed' },
    { bg: '#fce7f3', color: '#be185d' },
    { bg: '#fed7aa', color: '#c2410c' },
    { bg: '#cffafe', color: '#0e7490' },
    { bg: '#d1fae5', color: '#065f46' },
];

function getInitials(name) {
    const clean = name.split(' - ')[0].trim();
    const parts = clean.split(/\s+/);
    return parts.length >= 2
        ? (parts[0][0] + parts[1][0]).toUpperCase()
        : name.slice(0, 2).toUpperCase();
}

function getAvatarStyle(name) {
    let h = 0;
    for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffff;
    return AVATAR_PALETTES[h % AVATAR_PALETTES.length];
}

export function PaymentList({
    filters = {},
    defaultStatus = 'completed',
    showViewAllLink = false,
    onPageChange = null,
}) {
    const paymentService = useMemo(() => new PaymentService(), []);

    const [loadingPayments, setLoadingPayments] = useState(false);
    const [payments, setPayments] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [stats, setStats] = useState({ total_amount: 0, transfer_count: 0, cash_count: 0, check_count: 0, credit_card_count: 0 });

    const loadPayments = async (incomingFilters) => {
        setLoadingPayments(true);
        try {
            const baseFilters = incomingFilters || {};
            const page = Number(baseFilters.page || 1);
            const statusToUse = baseFilters.status || defaultStatus;
            const paymentsRes = await paymentService.getPayments({
                ...baseFilters,
                page,
                status: statusToUse,
            });
            setPayments(paymentsRes.data || []);
            setPagination({
                current_page: paymentsRes.current_page || 1,
                last_page: paymentsRes.last_page || 1,
                per_page: paymentsRes.per_page || 20,
                total: paymentsRes.total || 0,
            });
            if (paymentsRes.stats) setStats(paymentsRes.stats);
        } catch (err) {
            console.log(err);
            setPayments([]);
            setPagination(null);
        } finally {
            setLoadingPayments(false);
        }
    };

    useEffect(() => {
        loadPayments(filters);
    }, [filters]);

    if (loadingPayments) {
        return (
            <div className={styles.loader}>
                <FontAwesomeIcon icon={faCircleNotch} spin size="lg" />
            </div>
        );
    }

    return (
        <div className={styles.wrap}>
            {/* Header */}
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Pagos completados</h1>
                    {pagination && (
                        <p className={styles.subtitle}>
                            Mostrando {payments.length} de {pagination.total} pagos
                        </p>
                    )}
                </div>
                {showViewAllLink && filters && Object.keys(filters).length > 0 && (
                    <Link
                        to={`/pagos?start_date=${filters.start_date || ''}&end_date=${filters.end_date || ''}&range=${filters.range || ''}&client_id=${filters.client_id || ''}`}
                        className="btn"
                    >
                        Ver todos
                    </Link>
                )}
            </div>

            {/* Stats cards */}
            <div className={styles.stats}>
                <div className={styles.stat_card}>
                    <div className={styles.stat_label_row}>
                        <div className={styles.stat_label}>Monto total</div>
                    </div>
                    <div className={styles.stat_value}>{formatPrice(stats.total_amount)}</div>
                </div>
                <div className={styles.stat_card}>
                    <div className={styles.stat_label_row}>
                        <span className={styles.stat_dot} style={{ background: '#3b82f6' }} />
                        <span className={styles.stat_label}>Transferencias</span>
                    </div>
                    <div className={styles.stat_count} style={{ color: '#2563eb' }}>{stats.transfer_count}</div>
                </div>
                <div className={styles.stat_card}>
                    <div className={styles.stat_label_row}>
                        <span className={styles.stat_dot} style={{ background: '#22c55e' }} />
                        <span className={styles.stat_label}>Efectivo</span>
                    </div>
                    <div className={styles.stat_count} style={{ color: '#16a34a' }}>{stats.cash_count}</div>
                </div>
                <div className={styles.stat_card}>
                    <div className={styles.stat_label_row}>
                        <span className={styles.stat_dot} style={{ background: '#f59e0b' }} />
                        <span className={styles.stat_label}>Cheques</span>
                    </div>
                    <div className={styles.stat_count} style={{ color: '#d97706' }}>{stats.check_count}</div>
                </div>
            </div>

            {/* Table */}
            <div className={styles.table_wrap}>
                {/* Table header */}
                <div className={styles.table_header}>
                    <span>Fecha</span>
                    <span>Monto</span>
                    <span>Método</span>
                    <span>Cliente</span>
                    <span>Pedido</span>
                </div>

                {/* Rows */}
                {payments.length > 0 ? (
                    payments.map((p, i) => {
                        const ms = METHOD_STYLES[p.payment_method] || { bg: '#f3f4f6', color: '#374151', dot: '#9ca3af' };
                        const clientName = p.order?.client?.name;
                        const av = clientName ? getAvatarStyle(clientName) : null;

                        return (
                            <div key={p.id} className={`${styles.table_row} ${i % 2 === 1 ? styles.row_striped : ''}`}>
                                <span className={styles.cell_date}>
                                    {formatDate(p.payment_date || p.created_at, 'short')}
                                </span>
                                <span className={styles.cell_amount}>
                                    {formatPrice(Number(p.amount))}
                                </span>
                                <span>
                                    <span
                                        className={styles.method_badge}
                                        style={{ background: ms.bg, color: ms.color }}
                                    >
                                        <span className={styles.badge_dot} style={{ background: ms.dot }} />
                                        {METHOD_LABELS[p.payment_method] || p.payment_method}
                                    </span>
                                </span>
                                <span className={styles.cell_client}>
                                    {clientName ? (
                                        p.order?.client?.id ? (
                                            <Link
                                                to={`/clientes/detalle/${p.order.client.id}`}
                                                className={styles.client_link}
                                            >
                                                <span
                                                    className={styles.avatar}
                                                    style={{ background: av.bg, color: av.color }}
                                                >
                                                    {getInitials(clientName)}
                                                </span>
                                                <span className={styles.client_name}>{clientName}</span>
                                            </Link>
                                        ) : (
                                            <>
                                                <span
                                                    className={styles.avatar}
                                                    style={{ background: av.bg, color: av.color }}
                                                >
                                                    {getInitials(clientName)}
                                                </span>
                                                <span className={styles.client_name}>{clientName}</span>
                                            </>
                                        )
                                    ) : (
                                        <span className={styles.no_client}>—</span>
                                    )}
                                </span>
                                <span className={styles.cell_order}>
                                    <code className={styles.order_code}>
                                        #{p.order?.number}
                                    </code>
                                    <Link to={`/ventas/${p.order_id}`} className={styles.order_link}>
                                        Ver →
                                    </Link>
                                </span>
                            </div>
                        );
                    })
                ) : (
                    <div className={styles.empty}>
                        <div className={styles.empty_title}>Sin resultados</div>
                        <div className={styles.empty_sub}>No hay pagos que coincidan con los filtros aplicados.</div>
                    </div>
                )}

            </div>
            {/* Footer */}
            {pagination && pagination.last_page > 1 && (
                <div className={styles.table_footer}>
                    <Pagination
                        currentPage={pagination.current_page}
                        lastPage={pagination.last_page}
                        onPageChange={(page) => onPageChange?.(page)}
                    />
                </div>
            )}
        </div>
    );
}
