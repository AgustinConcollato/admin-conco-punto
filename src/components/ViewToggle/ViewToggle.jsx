import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBorderAll, faList } from '@fortawesome/free-solid-svg-icons';
import styles from './ViewToggle.module.css';

export function ViewToggle({ value, onChange }) {
    return (
        <div className={styles.view_toggle}>
            <button
                className={`${styles.toggle_btn} ${value === 'cards' ? styles.toggle_active : ''}`}
                onClick={() => onChange('cards')}
                aria-label="Ver como tarjetas"
            >
                <FontAwesomeIcon icon={faBorderAll} />
            </button>
            <button
                className={`${styles.toggle_btn} ${value === 'table' ? styles.toggle_active : ''}`}
                onClick={() => onChange('table')}
                aria-label="Ver como tabla"
            >
                <FontAwesomeIcon icon={faList} />
            </button>
        </div>
    );
}
