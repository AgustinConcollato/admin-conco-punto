import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faTrash } from '@fortawesome/free-solid-svg-icons';
import { formatPrice } from '../../../../utils/formatPrice';
import { formatDate } from '../../../../utils/formatDate';
import styles from './ClientCard.module.css';

const SEGMENT_LABELS = {
    nuevo: 'Nuevo',
    recurrente: 'Recurrente',
    inactivo: 'Inactivo',
    sin_pedidos: 'Sin pedidos',
};

export function ClientCard({ client, onEdit, onDelete }) {
    const stats = client.stats ?? {};
    const segment = stats.segment ?? 'sin_pedidos';
    const hasDebt = parseFloat(stats.balance_due) > 0;

    const handleEdit = (e) => {
        e.preventDefault();
        e.stopPropagation();
        onEdit(client);
    };

    const handleDelete = (e) => {
        e.preventDefault();
        e.stopPropagation();
        onDelete(client.id);
    };

    return (
        <Link to={`/clientes/detalle/${client.id}`} className={styles.card}>
            <div className={styles.actions}>
                <button className={styles.icon_btn} onClick={handleEdit} aria-label="Editar cliente">
                    <FontAwesomeIcon icon={faPen} />
                </button>
                <button className={`${styles.icon_btn} ${styles.icon_delete}`} onClick={handleDelete} aria-label="Eliminar cliente">
                    <FontAwesomeIcon icon={faTrash} />
                </button>
            </div>

            <div className={styles.header}>
                <h3 className={styles.name}>{client.name}</h3>
                <span className={`${styles.segment_badge} ${styles[`segment_${segment}`]}`}>
                    {SEGMENT_LABELS[segment] ?? segment}
                </span>
            </div>

            <div className={styles.chips}>
                {client.email && <span className={styles.chip}>{client.email}</span>}
                {client.phone && <span className={styles.chip}>{client.phone}</span>}
                {client.price_list && (
                    <span className={`${styles.chip} ${styles.chip_list}`}>{client.price_list.name}</span>
                )}
            </div>

            <div className={styles.stats}>
                <div className={styles.stat}>
                    <span className={styles.stat_label}>Pedidos</span>
                    <span className={styles.stat_value}>{stats.total_orders ?? 0}</span>
                </div>
                <div className={styles.stat}>
                    <span className={styles.stat_label}>Facturado</span>
                    <span className={styles.stat_value}>{formatPrice(stats.total_spent ?? 0)}</span>
                </div>
                <div className={styles.stat}>
                    <span className={styles.stat_label}>Saldo</span>
                    <span className={`${styles.stat_value} ${hasDebt ? styles.stat_debt : ''}`}>
                        {formatPrice(stats.balance_due ?? 0)}
                    </span>
                </div>
                <div className={styles.stat}>
                    <span className={styles.stat_label}>Último pedido</span>
                    <span className={styles.stat_value_sm}>
                        {stats.last_order_at ? formatDate(stats.last_order_at, 'short') : '—'}
                    </span>
                </div>
            </div>
        </Link>
    );
}
