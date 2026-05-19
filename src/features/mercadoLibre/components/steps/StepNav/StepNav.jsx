import { faChevronLeft, faChevronRight, faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./StepNav.module.css";

export function StepNav({ onBack, onNext, canNext = true, nextLabel = "Continuar", loading = false, isSubmit = false }) {
    return (
        <div className={styles.nav}>
            <button type="button" className={styles.btn_back} onClick={onBack} disabled={loading}>
                <FontAwesomeIcon icon={faChevronLeft} /> Atrás
            </button>
            <button
                type="button"
                className={isSubmit ? styles.btn_publish : styles.btn_next}
                onClick={onNext}
                disabled={!canNext || loading}
            >
                {loading
                    ? <><FontAwesomeIcon icon={faCircleNotch} spin /> Publicando...</>
                    : <>{nextLabel} {!isSubmit && <FontAwesomeIcon icon={faChevronRight} />}</>
                }
            </button>
        </div>
    );
}