import styles from './TableSkeleton.module.css';

export function TableSkeleton({ rows = 5, cols = 4 }) {
    return (
        <div className={styles.wrapper}>
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className={styles.row} style={{ animationDelay: `${i * 60}ms` }}>
                    {Array.from({ length: cols }).map((_, j) => (
                        <div key={j} className={styles.cell} />
                    ))}
                </div>
            ))}
        </div>
    );
}
