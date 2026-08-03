import { Link } from "react-router-dom";
import styles from './OrderDetailInfo.module.css';

function getInitials(name) {
    if (!name) return '—';
    const parts = name.trim().split(/\s+/);
    return (parts[0][0] + (parts[1] ? parts[1][0] : '')).toUpperCase();
}

function formatAddress(address) {
    if (!address) return null;
    const line1 = [address.street, address.street_number].filter(Boolean).join(' ');
    const line2 = [address.floor, address.apartment].filter(Boolean).join(' ');
    const line3 = [address.locality, address.province].filter(Boolean).join(', ');
    return [line1, line2, line3, address.postal_code ? `CP: ${address.postal_code}` : null]
        .filter(Boolean);
}

export function OrderDetailInfo({ order }) {
    const client = order.client;
    const addressLines = order.delivery_method === 'shipping' ? formatAddress(order.shipping_address) : null;

    return (
        <div className={styles.grid}>
            {/* ── Cliente ── */}
            <div className={styles.card}>
                <p className={styles.card_label}>Cliente</p>
                {client ? (
                    <div className={styles.client}>
                        <span className={styles.avatar}>{getInitials(client.name)}</span>
                        <div className={styles.client_info}>
                            <span className={styles.client_name}>{client.name}</span>
                            {client.email && <span className={styles.client_meta}>{client.email}</span>}
                            {client.phone && <span className={styles.client_meta}>{client.phone}</span>}
                        </div>
                        <Link to={`/clientes/detalle/${client.id}`} className={styles.client_link}>
                            Ver ficha →
                        </Link>
                    </div>
                ) : (
                    <p className={styles.empty}>Sin cliente asignado</p>
                )}
            </div>

            {/* ── Entrega ── */}
            <div className={styles.card}>
                <p className={styles.card_label}>Entrega</p>
                {order.delivery_method === 'whatsapp' ? (
                    <p className={styles.whatsapp}>Coordina por WhatsApp</p>
                ) : addressLines ? (
                    <div className={styles.address}>
                        {addressLines.map((line, i) => <span key={i}>{line}</span>)}
                    </div>
                ) : (
                    <p className={styles.empty}>Sin dirección cargada</p>
                )}
            </div>

            {/* ── Notas ── */}
            {order.notes && (
                <div className={`${styles.card} ${styles.notes_card}`}>
                    <p className={styles.card_label}>Notas</p>
                    <p className={styles.notes_text}>{order.notes}</p>
                </div>
            )}
        </div>
    );
}
