import { faCheckCircle, faCircleNotch, faExternalLinkAlt, faTimesCircle, faUnlink } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./MLAccountStatus.module.css";
import { useEffect } from "react";

export function MLAccountStatus({ profile, loading, onConnect, onDisconnect, disconnecting }) {

    useEffect(() => {
        document.title = 'Perfil Mercado Libre';
    }, []);

    if (loading) {
        return (
            <div className={styles.card}>
                <FontAwesomeIcon icon={faCircleNotch} spin />
            </div>
        );
    }

    if (!profile) {
        return (
            <div className={styles.card}>
                <div className={styles.disconnected}>
                    <FontAwesomeIcon icon={faTimesCircle} className={styles.icon_error} />
                    <div>
                        <h3>Cuenta no vinculada</h3>
                        <p>Conectá tu cuenta de Mercado Libre para empezar a publicar productos.</p>
                    </div>
                </div>
                <button className="btn btn_solid" onClick={onConnect}>
                    Conectar con Mercado Libre
                </button>
            </div>
        );
    }

    return (
        <div className={styles.card}>
            <div className={styles.connected}>
                {profile?.thumbnail ?
                    <img
                        src={profile.thumbnail.picture_url}
                        className={styles.thumbnail}
                    /> :
                    <div className={styles.not_thumbnail}>
                        <span>{profile.nickname[0]}</span>
                    </div>
                }
                <div className={styles.info}>
                    <h3>{profile.nickname ?? profile.first_name}</h3>
                    <p>
                        {profile.email}
                        {profile.permalink && (
                            <a href={profile.permalink} target="_blank" rel="noreferrer">
                                Ver perfil en ML <FontAwesomeIcon icon={faExternalLinkAlt} />
                            </a>
                        )}
                    </p>
                </div>
            </div>
            <button
                className={`btn ${styles.btn_disconnect}`}
                onClick={onDisconnect}
                disabled={disconnecting}
            >
                {disconnecting
                    ? <FontAwesomeIcon icon={faCircleNotch} spin />
                    : <><FontAwesomeIcon icon={faUnlink} /> Desvincular cuenta</>
                }
            </button>
        </div>
    );
}
