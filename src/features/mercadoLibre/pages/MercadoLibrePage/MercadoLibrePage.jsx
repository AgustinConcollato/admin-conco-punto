import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ConfirmModal } from "../../../../components/ConfirmModal/ConfirmModal";
import { MLAccountStatus } from "../../../../features/mercadoLibre/components/MLAccountStatus/MLAccountStatus";
import { MLPublications } from "../../../../features/mercadoLibre/components/MLPublications/MLPublications";
import { MercadoLibreService } from "../../../../services/mercadoLibre/mercadoLibreService";
import styles from "./MercadoLibrePage.module.css";

const TABS = [
    { id: "account", label: "Mi cuenta", path: "/mercado-libre/cuenta" },
    { id: "publications", label: "Mis publicaciones", path: "/mercado-libre/publicaciones" },
];

export function MercadoLibrePage() {
    const mlService = useMemo(() => new MercadoLibreService(), []);
    const location = useLocation();
    const navigate = useNavigate();

    const isPublicationsTab = location.pathname === "/mercado-libre/publicaciones";

    const [profile, setProfile] = useState(null);
    const [profileLoading, setProfileLoading] = useState(true);
    const [disconnecting, setDisconnecting] = useState(false);
    const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const code = params.get("code");
        if (code) {
            handleOAuthCallback(code);
            navigate("/mercado-libre", { replace: true });
        }
    }, [location.search]);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        setProfileLoading(true);
        try {
            const data = await mlService.getProfile();
            setProfile(data);
        } catch {
            setProfile(null);
        } finally {
            setProfileLoading(false);
        }
    };

    const handleOAuthCallback = async (code) => {
        try {
            await mlService.exchangeCode(code);
            await loadProfile();
        } catch (e) {
            toast.error(e.message ?? "Error al vincular la cuenta.");
        }
    };

    const handleConnect = async () => {
        try {
            const { url } = await mlService.getAuthUrl();
            window.location.href = url;
        } catch (e) {
            toast.error("No se pudo obtener la URL de autorizaciÃ³n.");
        }
    };

    const handleDisconnect = async () => {
        setDisconnecting(true);
        try {
            await mlService.revoke();
            setProfile(null);
        } catch (e) {
            toast.error(e.message ?? "Error al desvincular.");
        } finally {
            setDisconnecting(false);
            setShowDisconnectConfirm(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h2 className={styles.title}>Mercado Libre</h2>
                    <p className={styles.subtitle}>PublicÃ¡ y gestionÃ¡ tus productos en el marketplace</p>
                </div>
            </div>

            <div className={styles.tabs}>
                {TABS.map(tab => (
                    <NavLink
                        key={tab.id}
                        to={tab.path}
                        className={({ isActive }) =>
                            `${styles.tab} ${isActive ? styles.tab_active : ""}`
                        }
                    >
                        {tab.label}
                    </NavLink>
                ))}
            </div>

            {!isPublicationsTab && (
                <div className={styles.tab_content}>
                    <MLAccountStatus
                        profile={profile}
                        loading={profileLoading}
                        onConnect={handleConnect}
                        onDisconnect={() => setShowDisconnectConfirm(true)}
                        disconnecting={disconnecting}
                    />
                    {profile && (
                        <div className={styles.hint}>
                            <p>âœ“ Tu cuenta estÃ¡ vinculada. PodÃ©s ir a <Link className={styles.link_btn} to={"/productos?stock_min=1"}>Publicar producto</Link> para subir productos a ML.</p>
                        </div>
                    )}
                </div>
            )}

            {isPublicationsTab && (
                <div className={styles.tab_content}>
                    {!profile && !profileLoading ? (
                        <div className={styles.no_account}>
                            <p>NecesitÃ¡s vincular tu cuenta de Mercado Libre primero.</p>
                            <Link className="btn btn_solid" to={"/mercado-libre/cuenta"}>
                                Ir a Mi cuenta
                            </Link>
                        </div>
                    ) : (
                        <MLPublications />
                    )}
                </div>
            )}
            {showDisconnectConfirm && (
                <ConfirmModal
                    message="Â¿Desvincular tu cuenta de Mercado Libre? PerderÃ¡s acceso a la gestiÃ³n de publicaciones."
                    onConfirm={handleDisconnect}
                    onCancel={() => setShowDisconnectConfirm(false)}
                />
            )}
        </div>
    );
}

