import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';
import styles from './TopBar.module.css';

const PRICE_LISTS = [
    { id: 2, label: 'Minorista' },
    { id: 3, label: 'Mayorista' },
];

export function TopBar({
    designName,
    isLive,
    dirty,
    saving,
    publishing,
    canSave,
    viewport,
    priceListId,
    onViewportChange,
    onPriceListChange,
    onSave,
    onPublish,
    onBack,
}) {
    return (
        <div className={styles.bar}>
            <button className={styles.backBtn} onClick={onBack} title="Volver al panel">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 3L5 8l5 5" />
                </svg>
            </button>

            <span className={styles.brand}>Diseño de inicio</span>
            <div className={styles.divider} />

            <div className={styles.designBadge}>
                <span className={styles.designName}>{designName || 'Sin diseño'}</span>
                <span className={`${styles.statusTag} ${isLive ? styles.statusLive : styles.statusDraft}`}>
                    {isLive ? 'EN VIVO' : 'BORRADOR'}
                </span>
                {dirty && <span className={`${styles.statusTag} ${styles.statusDirty}`}>SIN GUARDAR</span>}
            </div>

            <div className={styles.spacer} />

            {/* Viewport toggle */}
            <div className={styles.toggleGroup}>
                <button
                    className={`${styles.toggleBtn} ${viewport === 'desktop' ? styles.toggleActive : styles.toggleInactive}`}
                    onClick={() => onViewportChange('desktop')}
                >
                    <svg width="14" height="11" viewBox="0 0 14 11" fill="none" stroke="currentColor" strokeWidth="1.6">
                        <rect x=".75" y=".75" width="12.5" height="8.5" rx="1.5" />
                        <path d="M4.5 10.25h5M7 9.25v1" strokeLinecap="round" />
                    </svg>
                    Escritorio
                </button>
                <button
                    className={`${styles.toggleBtn} ${viewport === 'mobile' ? styles.toggleActive : styles.toggleInactive}`}
                    onClick={() => onViewportChange('mobile')}
                >
                    <svg width="9" height="13" viewBox="0 0 9 13" fill="none" stroke="currentColor" strokeWidth="1.6">
                        <rect x=".75" y=".75" width="7.5" height="11.5" rx="1.5" />
                        <circle cx="4.5" cy="10.5" r=".8" fill="currentColor" stroke="none" />
                    </svg>
                    Móvil
                </button>
            </div>

            {/* Price list toggle */}
            <div className={styles.toggleGroup}>
                {PRICE_LISTS.map(pl => (
                    <button
                        key={pl.id}
                        className={`${styles.toggleBtn} ${priceListId === pl.id ? styles.toggleActive : styles.toggleInactive}`}
                        onClick={() => onPriceListChange(pl.id)}
                    >
                        {pl.label}
                    </button>
                ))}
            </div>

            <div className={styles.divider} />

            <button
                className={`${styles.saveBtn} ${dirty ? styles.saveBtnUnsaved : styles.saveBtnSaved}`}
                onClick={onSave}
                disabled={!canSave}
            >
                {saving ? <FontAwesomeIcon icon={faCircleNotch} spin /> : dirty ? 'Guardar' : 'Guardado'}
            </button>

            <button
                className={styles.publishBtn}
                onClick={onPublish}
                disabled={!designName || saving || publishing}
            >
                {publishing ? <FontAwesomeIcon icon={faCircleNotch} spin /> : 'Publicar'}
            </button>
        </div>
    );
}
