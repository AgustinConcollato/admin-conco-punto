import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBoxOpen } from '@fortawesome/free-solid-svg-icons';
import styles from './EmptyState.module.css';

export function EmptyState({ message = 'No hay resultados', icon = faBoxOpen, cta = null }) {
    return (
        <div className={styles.container}>
            <FontAwesomeIcon icon={icon} className={styles.icon} />
            <p className={styles.message}>{message}</p>
            {cta && <div className={styles.cta}>{cta}</div>}
        </div>
    );
}
