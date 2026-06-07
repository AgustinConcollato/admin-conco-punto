import {
    faCircleNotch, faExternalLinkAlt,
    faEye,
    faPause, faPlay, faTimes
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { ConfirmModal } from "../../../../components/ConfirmModal/ConfirmModal";
import { MercadoLibreService } from "../../../../services/mercadoLibre/mercadoLibreService";
import styles from "./MLPublications.module.css";

const STATUS_TABS = [
    { value: "active", label: "Activas" },
    { value: "paused", label: "Pausadas" },
    { value: "closed", label: "Cerradas" },
];

const STATUS_BADGE = {
    active: { label: "Activa", cls: "badge_active" },
    paused: { label: "Pausada", cls: "badge_paused" },
    closed: { label: "Cerrada", cls: "badge_closed" },
};

export function MLPublications() {
    const mlService = useMemo(() => new MercadoLibreService(), []);
    const [status, setStatus] = useState("active");
    const [publications, setPublications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [pendingCloseId, setPendingCloseId] = useState(null);

    const load = async (s = status) => {
        setLoading(true);
        try {
            const data = await mlService.getPublications(s);
            // La API devuelve array de objetos { body: {...} } o directo
            const items = Array.isArray(data)
                ? data.map(d => d.body ?? d).filter(Boolean)
                : [];
            setPublications(items);
        } catch {
            setPublications([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        document.title = 'Mis publicaciones en Mercado Libre';
        load(status);
    }, [status]);

    const handlePause = async (id) => {
        setActionLoading(id);
        try { await mlService.pausePublication(id); await load(); }
        catch (e) { toast.error(e.message ?? "Error al pausar"); }
        finally { setActionLoading(null); }
    };

    const handleReactivate = async (id) => {
        setActionLoading(id);
        try { await mlService.reactivatePublication(id); await load(); }
        catch (e) { toast.error(e.message ?? "Error al reactivar"); }
        finally { setActionLoading(null); }
    };

    const confirmClose = async () => {
        if (!pendingCloseId) return;
        setActionLoading(pendingCloseId);
        try { await mlService.closePublication(pendingCloseId); await load(); }
        catch (e) { toast.error(e.message ?? "Error al cerrar"); }
        finally { setActionLoading(null); setPendingCloseId(null); }
    };

    return (
        <div className={styles.container}>
            <div className={styles.tabs}>
                {STATUS_TABS.map(tab => (
                    <button
                        key={tab.value}
                        className={`${styles.tab} ${status === tab.value ? styles.tab_active : ""}`}
                        onClick={() => setStatus(tab.value)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className={styles.loading}>
                    <FontAwesomeIcon icon={faCircleNotch} spin />
                </div>
            ) : publications.length === 0 ? (
                <p className={styles.empty}>No hay publicaciones {STATUS_TABS.find(t => t.value === status)?.label.toLowerCase()}.</p>
            ) : (
                <div className={styles.list}>
                    {publications.map(pub => {
                        const badge = STATUS_BADGE[pub.status] ?? { label: pub.status, cls: "badge_active" };
                        const isProcessing = actionLoading === pub.id;

                        return (
                            <div key={pub.id} className={styles.card}>
                                <Link to={`/mercado-libre/publicaciones/${pub.id}`}>
                                    {pub.pictures?.[0]?.url && (
                                        <img src={pub.pictures[0].url} alt={pub.title} className={styles.thumb} />
                                    )}
                                    <div className={styles.info}>
                                        <p className={styles.title}>{pub.title}</p>
                                        <div className={styles.meta}>
                                            <span className={`${styles.badge} ${styles[badge.cls]}`}>{badge.label}</span>
                                            <span className={styles.price}>$ {pub.price?.toLocaleString("es-AR")}</span>
                                            <span className={styles.stock}>Stock: {pub.available_quantity}</span>
                                            <span className={styles.type}>{pub.listing_type_id}</span>
                                        </div>
                                        <p className={styles.item_id}>{pub.id}</p>
                                    </div>
                                </Link>

                                <div className={styles.actions}>
                                    <Link
                                        className={styles.icon_btn}
                                        title="Ver detalle"
                                        to={`/mercado-libre/publicaciones/${pub.id}`}
                                    >
                                        <FontAwesomeIcon icon={faEye} />
                                    </Link>
                                    {pub.permalink && (
                                        <a href={pub.permalink} target="_blank" rel="noreferrer" className={styles.icon_btn} title="Ver en ML">
                                            <FontAwesomeIcon icon={faExternalLinkAlt} />
                                        </a>
                                    )}
                                    {pub.status === "active" && (
                                        <button
                                            className={styles.icon_btn}
                                            title="Pausar"
                                            onClick={() => handlePause(pub.id)}
                                            disabled={isProcessing}
                                        >
                                            {isProcessing ? <FontAwesomeIcon icon={faCircleNotch} spin /> : <FontAwesomeIcon icon={faPause} />}
                                        </button>
                                    )}
                                    {pub.status === "paused" && (
                                        <button
                                            className={`${styles.icon_btn} ${styles.icon_success}`}
                                            title="Reactivar"
                                            onClick={() => handleReactivate(pub.id)}
                                            disabled={isProcessing}
                                        >
                                            {isProcessing ? <FontAwesomeIcon icon={faCircleNotch} spin /> : <FontAwesomeIcon icon={faPlay} />}
                                        </button>
                                    )}
                                    {pub.status !== "closed" && (
                                        <button
                                            className={`${styles.icon_btn} ${styles.icon_danger}`}
                                            title="Cerrar publicación"
                                            onClick={() => setPendingCloseId(pub.id)}
                                            disabled={isProcessing}
                                        >
                                            <FontAwesomeIcon icon={faTimes} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
            {pendingCloseId && (
                <ConfirmModal
                    message="¿Cerrar esta publicación? Esta acción no se puede revertir."
                    onConfirm={confirmClose}
                    onCancel={() => setPendingCloseId(null)}
                />
            )}
        </div>
    );
}