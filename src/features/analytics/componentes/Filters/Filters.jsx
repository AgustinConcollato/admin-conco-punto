import { RANGE_OPTIONS } from '../../../../utils/rangeHelpers';
import styles from './Filters.module.css';

export function Filters({ filters, setFilters, loadData }) {
    return (
        <form className={styles.filters_form} onSubmit={(e) => e.preventDefault()}>
            <div className={styles.filters}>
                <div className={styles.range_buttons}>
                    <label>Período</label>
                    <div className={styles.buttons_group}>
                        {RANGE_OPTIONS.map(({ value, label }) => (
                            <button
                                key={value}
                                type="button"
                                className={`${styles.range_button} ${filters.range === value ? styles.active : ''}`}
                                onClick={() => {
                                    const next = { ...filters, range: value };
                                    if (value !== 'custom') {
                                        next.start_date = '';
                                        next.end_date = '';
                                        setFilters(next);
                                        loadData(next);
                                    } else {
                                        setFilters(next);
                                    }
                                }}
                            >
                                {label}
                            </button>
                        ))}
                        <button type="button" className={styles.clear_button} onClick={() => {
                            const newFilters = { range: 'month', client_id: '', start_date: '', end_date: '' };
                            setFilters(newFilters);
                            loadData(newFilters);
                        }}>
                            Limpiar filtros
                        </button>
                    </div>
                </div>
                {filters.range === 'custom' && (
                    <div className={styles.custom_date_filters}>
                        <div>
                            <label>Desde</label>
                            <input type="date" value={filters.start_date} onChange={(e) => setFilters(prev => ({ ...prev, start_date: e.target.value }))} />
                        </div>
                        <div>
                            <label>Hasta</label>
                            <input type="date" value={filters.end_date} onChange={(e) => setFilters(prev => ({ ...prev, end_date: e.target.value }))} />
                        </div>
                    </div>
                )}
            </div>

            {/* <div className={styles.filter_buttons}>
                <button type="button" className={styles.clear_button} onClick={() => {
                    const newFilters = { range: 'month', client_id: '', start_date: '', end_date: '' };
                    setFilters(newFilters);
                    loadData(newFilters);
                }}>
                    Limpiar filtros
                </button>
            </div> */}
        </form>
    )
}   