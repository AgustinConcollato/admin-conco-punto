import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { NewProductForm } from "../../features/product/components/newProduct/NewProductForm/NewProductForm";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import styles from "./NewProductPage.module.css";

const STEPS = [
    { num: 1, label: 'Datos' },
    { num: 2, label: 'Proveedor y Precios' },
    { num: 3, label: 'Código de barras' },
];

export function NewProductPage() {
    const { step } = useParams();
    const currentStep = parseInt(step) || 1;

    useEffect(() => {
        return () => {
            sessionStorage.removeItem('product');
        }
    }, []);

    return (
        <div className={styles.page}>
            <div className={styles.stepper}>
                {/* Track: dot → connector → dot → connector → dot */}
                <div className={styles.stepper_track}>
                    {STEPS.map((s, i) => {
                        const isDone = currentStep > s.num;
                        const isActive = currentStep === s.num;
                        return (
                            <div key={s.num} className={styles.stepper_track_item}>
                                <div className={`${styles.stepper_dot} ${isDone ? styles.stepper_done : ''} ${isActive ? styles.stepper_active : ''}`}>
                                    {isDone && <FontAwesomeIcon icon={faCheck} />}
                                    {/* Labels */}
                                    <div className={styles.stepper_labels}>
                                        <span key={s.num} className={`${styles.stepper_label} ${isDone ? styles.stepper_label_done : ''} ${isActive ? styles.stepper_label_active : ''}`}>
                                            {s.label}
                                        </span>
                                    </div>
                                </div>
                                {i < STEPS.length - 1 && (
                                    <div className={`${styles.stepper_connector} ${isDone ? styles.stepper_connector_done : ''}`} />
                                )}
                            </div>
                        );
                    })}

                </div>
            </div>

            <div className={styles.card}>
                <NewProductForm step={step} />
            </div>
        </div>
    );
}
