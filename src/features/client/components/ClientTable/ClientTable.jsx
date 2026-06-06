import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faTrash, faSort, faSortUp, faSortDown } from '@fortawesome/free-solid-svg-icons';
import { formatPrice } from '../../../../utils/formatPrice';
import { formatDate } from '../../../../utils/formatDate';
import styles from './ClientTable.module.css';

const SEGMENT_LABELS = {
    nuevo: 'Nuevo',
    recurrente: 'Recurrente',
    inactivo: 'Inactivo',
    sin_pedidos: 'Sin pedidos',
};

const COLUMNS = [
    { key: 'name', label: 'Nombre', align: 'left' },
    { key: 'segment', label: 'Segmento', align: 'left' },
    { key: 'total_orders', label: 'Pedidos', align: 'right' },
    { key: 'total_spent', label: 'Facturado', align: 'right' },
    { key: 'balance_due', label: 'Saldo', align: 'right' },
    { key: 'last_order_at', label: 'Último pedido', align: 'right' },
];

export function ClientTable({ clients, sortConfig, onSort, onEdit, onDelete }) {
    const navigate = useNavigate();

    const sortIcon = (key) => {
        if (sortConfig.key !== key) return faSort;
        return sortConfig.dir === 'asc' ? faSortUp : faSortDown;
    };

    const stopAnd = (fn) => (e) => {
        e.preventDefault();
        e.stopPropagation();
        fn();
    };

    return (
        <div className={styles.table_wrapper}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        {COLUMNS.map(col => (
                            <th
                                key={col.key}
                                className={`${styles.th_sortable} ${col.align === 'right' ? styles.right : ''}`}
                                onClick={() => onSort(col.key)}
                            >
                                <span className={styles.th_inner}>
                                    {col.label}
                                    <FontAwesomeIcon
                                        icon={sortIcon(col.key)}
                                        className={`${styles.sort_icon} ${sortConfig.key === col.key ? styles.sort_active : ''}`}
                                    />
                                </span>
                            </th>
                        ))}
                        <th className={styles.right}>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {clients.map(client => {
                        const stats = client.stats ?? {};
                        const segment = stats.segment ?? 'sin_pedidos';
                        const hasDebt = parseFloat(stats.balance_due) > 0;

                        return (
                            <tr
                                key={client.id}
                                className={styles.row}
                                onClick={() => navigate(`/clientes/detalle/${client.id}`)}
                            >
                                <td>
                                    <span className={styles.name}>{client.name}</span>
                                    {client.email && <span className={styles.sub}>{client.email}</span>}
                                </td>
                                <td>
                                    <span className={`${styles.segment_badge} ${styles[`segment_${segment}`]}`}>
                                        {SEGMENT_LABELS[segment] ?? segment}
                                    </span>
                                </td>
                                <td className={styles.right}>{stats.total_orders ?? 0}</td>
                                <td className={styles.right}>{formatPrice(stats.total_spent ?? 0)}</td>
                                <td className={`${styles.right} ${hasDebt ? styles.debt : ''}`}>
                                    {formatPrice(stats.balance_due ?? 0)}
                                </td>
                                <td className={styles.right}>
                                    {stats.last_order_at ? formatDate(stats.last_order_at, 'short') : '—'}
                                </td>
                                <td className={styles.right}>
                                    <div className={styles.actions}>
                                        <button
                                            className={styles.icon_btn}
                                            onClick={stopAnd(() => onEdit(client))}
                                            aria-label="Editar cliente"
                                        >
                                            <FontAwesomeIcon icon={faPen} />
                                        </button>
                                        <button
                                            className={`${styles.icon_btn} ${styles.icon_delete}`}
                                            onClick={stopAnd(() => onDelete(client.id))}
                                            aria-label="Eliminar cliente"
                                        >
                                            <FontAwesomeIcon icon={faTrash} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
