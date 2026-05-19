import { AnalyticsLayout } from '../../layout/AnalyticsLayout/AnalyticsLayout';
import styles from './AnalyticsPage.module.css';

export const AnalyticsPage = () => {

    return (
        <div className={styles.container}>
            <h2 className="title">Reportes</h2>
            <AnalyticsLayout />
        </div>
    );
}