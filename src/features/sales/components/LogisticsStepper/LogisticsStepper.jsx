import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from './LogisticsStepper.module.css';

const LOGISTICS_STEPS = [
    { value: 'pending', label: 'Pendiente' },
    { value: 'processing', label: 'Preparación' },
    { value: 'confirmed', label: 'Terminado' },
    { value: 'shipped', label: 'Enviado' },
    { value: 'delivered', label: 'Entregado' },
];

export function LogisticsStepper({ status }) {
    return (
        <div className={styles.section}>
            <p className={styles.section_label}>Estado logístico</p>

            {status === 'cancelled' ? (
                <p className={`${styles.outcome_banner} ${styles.outcome_cancelled}`}>Pedido cancelado</p>
            ) : (() => {
                const stepIndex = LOGISTICS_STEPS.findIndex(s => s.value === status);
                return (
                    <div className={styles.stepper}>
                        {/* Track plano: dot → connector → dot → connector → dot */}
                        <div className={styles.stepper_track}>
                            {LOGISTICS_STEPS.map((step, i) => {
                                const isDone = i < stepIndex;
                                const isActive = i === stepIndex;
                                return (
                                    <div key={step.value} className={styles.stepper_track_item}>
                                        <div className={`${styles.stepper_dot} ${isDone ? styles.stepper_done : ''} ${isActive ? styles.stepper_active : ''}`}>
                                            {isDone && <FontAwesomeIcon icon={faCheck} />}
                                            <div className={styles.stepper_labels}>
                                                <span
                                                    className={`${styles.stepper_label} ${isActive ? styles.stepper_label_active : ''} ${isDone ? styles.stepper_label_done : ''}`}
                                                >
                                                    {step.label}
                                                </span>
                                            </div>
                                        </div>
                                        {i < LOGISTICS_STEPS.length - 1 && (
                                            <div className={`${styles.stepper_connector} ${isDone ? styles.stepper_connector_done : ''}`} />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })()}
        </div>
    );
}
