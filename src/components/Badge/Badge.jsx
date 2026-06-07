import styles from './Badge.module.css';

export function Badge({ tone = 'gray', className = '', children }) {
    return (
        <span className={`${styles.badge} ${styles[`tone_${tone}`] ?? styles.tone_gray} ${className}`}>
            {children}
        </span>
    );
}
