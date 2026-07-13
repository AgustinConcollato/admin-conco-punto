import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoneyBillWave, faPenToSquare, faTrash, faBell, faBellSlash, faSort, faSortUp, faSortDown } from '@fortawesome/free-solid-svg-icons';
import { Pagination } from '../../../../components/Pagination/Pagination';
import { TableSkeleton } from '../../../../components/TableSkeleton/TableSkeleton';
import { formatDate } from '../../../../utils/formatDate';
import { formatPrice } from '../../../../utils/formatPrice';
import { isOverdue, payableAmount } from '../../utils/purchaseCalc';
import styles from './SupplierPurchaseList.module.css';

const STATUS_META = {
    pending: { label: 'Pendiente', bg: '#f1f5f9', color: '#475569' },
    partial: { label: 'Parcial', bg: '#fef3c7', color: '#92400e' },
    paid: { label: 'Pagada', bg: '#dcfce7', color: '#15803d' },
};

/** Estado del recordatorio por mail de una factura. */
function reminderState(p) {
    if (p.reminder_sent_at) return 'sent';
    if (p.reminder_days != null && p.due_date && parseFloat(p.balance) > 0) return 'scheduled';
    return 'none';
}

function ReminderCell({ purchase }) {
    const state = reminderState(purchase);
    if (state === 'sent') {
        return (
            <span className={styles.reminder_sent} title="Recordatorio enviado">
                <FontAwesomeIcon icon={faBell} />
            </span>
        );
    }
    if (state === 'scheduled') {
        return (
            <span
                className={styles.reminder_scheduled}
                title={`Aviso programado: ${purchase.reminder_days} día(s) antes de vencer`}
            >
                <FontAwesomeIcon icon={faBell} />
            </span>
        );
    }
    return (
        <span className={styles.reminder_none} title="Sin aviso">
            <FontAwesomeIcon icon={faBellSlash} />
        </span>
    );
}

function StatusBadge({ purchase }) {
    if (isOverdue(purchase)) {
        return (
            <span className={styles.badge} style={{ background: '#fee2e2', color: '#b91c1c' }}>
                Vencida
            </span>
        );
    }
    const meta = STATUS_META[purchase.status] || STATUS_META.pending;
    return (
        <span className={styles.badge} style={{ background: meta.bg, color: meta.color }}>
            {meta.label}
        </span>
    );
}

function SortableHeader({ column, label, sortBy, sortDir, onSort }) {
    const active = sortBy === column;
    const icon = active ? (sortDir === 'asc' ? faSortUp : faSortDown) : faSort;
    return (
        <button
            type="button"
            className={`${styles.sortable} ${active ? styles.sortable_active : ''}`}
            onClick={() => onSort(column)}
        >
            {label}
            <FontAwesomeIcon icon={icon} className={styles.sort_icon} />
        </button>
    );
}

export function SupplierPurchaseList({
    loading,
    purchases,
    pagination,
    stats,
    sortBy,
    sortDir,
    onSort,
    onPageChange,
    onRowClick,
    onRegisterPayment,
    onEdit,
    onDelete,
}) {
    return (
        <div className={styles.wrap}>
            {/* Stats cards */}
            <div className={styles.stats}>
                <div className={styles.stat_card}>
                    <div className={styles.stat_label}>Se debe</div>
                    <div className={styles.stat_value} style={{ color: '#dc2626' }}>
                        {formatPrice(stats?.total_debt || 0)}
                    </div>
                </div>
                <div className={styles.stat_card}>
                    <div className={styles.stat_label}>Pago total</div>
                    <div className={styles.stat_value} style={{ color: '#16a34a' }}>
                        {formatPrice(stats?.total_paid || 0)}
                    </div>
                </div>
                <div className={styles.stat_card}>
                    <div className={styles.stat_label}>Vencidas</div>
                    <div className={styles.stat_value} style={{ color: '#d97706' }}>
                        {formatPrice(stats?.overdue_amount || 0)}
                    </div>
                    <div className={styles.stat_sub}>{stats?.overdue_count || 0} factura(s)</div>
                </div>
            </div>

            {/* Table */}
            <div className={styles.table_wrap}>
                <div className={styles.table_header}>
                    <SortableHeader column="purchase_date" label="Fecha" sortBy={sortBy} sortDir={sortDir} onSort={onSort} />
                    <span>Proveedor</span>
                    <SortableHeader column="invoice_number" label="N° Factura" sortBy={sortBy} sortDir={sortDir} onSort={onSort} />
                    <SortableHeader column="due_date" label="Vencimiento" sortBy={sortBy} sortDir={sortDir} onSort={onSort} />
                    <span>Total</span>
                    <span>Desc.</span>
                    <SortableHeader column="total" label="Total c/desc" sortBy={sortBy} sortDir={sortDir} onSort={onSort} />
                    <span>Pagado</span>
                    <span>Saldo</span>
                    <span>Estado</span>
                    <span>Aviso</span>
                    <span>Acciones</span>
                </div>

                {loading ? (
                    <div className={styles.skeleton}>
                        <TableSkeleton rows={6} cols={12} />
                    </div>
                ) : purchases.length > 0 ? (
                    purchases.map((p, i) => (
                        <div
                            key={p.id}
                            className={`${styles.table_row} ${styles.table_row_click} ${i % 2 === 1 ? styles.row_striped : ''}`}
                            onClick={() => onRowClick(p)}
                        >
                            <span className={styles.cell_date}>{formatDate(p.purchase_date, 'short')}</span>
                            <span className={styles.cell_supplier} title={p.supplier?.name || ''}>{p.supplier?.name || '—'}</span>
                            <span className={styles.cell_invoice} title={p.invoice_number || ''}>{p.invoice_number || '—'}</span>
                            <span className={styles.cell_date}>{p.due_date ? formatDate(p.due_date, 'short') : '—'}</span>
                            <span className={styles.cell_num}>{formatPrice(p.total)}</span>
                            <span className={`${styles.cell_discount} ${isOverdue(p) && Number(p.discount_percent) > 0 ? styles.cell_discount_void : ''}`}>
                                {Number(p.discount_percent) > 0 ? `${Number(p.discount_percent)}%` : '—'}
                            </span>
                            <span className={styles.cell_amount}>{formatPrice(payableAmount(p))}</span>
                            <span className={styles.cell_num}>{formatPrice(p.amount_paid)}</span>
                            <span className={styles.cell_balance}>{formatPrice(p.balance)}</span>
                            <span><StatusBadge purchase={p} /></span>
                            <span className={styles.cell_reminder}><ReminderCell purchase={p} /></span>
                            <span className={styles.cell_actions} onClick={(e) => e.stopPropagation()}>
                                {parseFloat(p.balance) > 0 && (
                                    <button
                                        className={styles.action_pay}
                                        onClick={() => onRegisterPayment(p)}
                                        title="Registrar pago"
                                    >
                                        <FontAwesomeIcon icon={faMoneyBillWave} />
                                    </button>
                                )}
                                <button className={styles.action_btn} onClick={() => onEdit(p)} title="Editar">
                                    <FontAwesomeIcon icon={faPenToSquare} />
                                </button>
                                <button className={styles.action_delete} onClick={() => onDelete(p)} title="Eliminar">
                                    <FontAwesomeIcon icon={faTrash} />
                                </button>
                            </span>
                        </div>
                    ))
                ) : (
                    <div className={styles.empty}>
                        <div className={styles.empty_title}>Sin compras</div>
                        <div className={styles.empty_sub}>No hay compras que coincidan con los filtros aplicados.</div>
                    </div>
                )}

                {pagination && pagination.last_page > 1 && (
                    <div className={styles.table_footer}>
                        <Pagination
                            currentPage={pagination.current_page}
                            lastPage={pagination.last_page}
                            onPageChange={onPageChange}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
