import { faBoxOpen, faCheckCircle, faRecycle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useMLPublish } from "../../../hooks/useMLPublish";
import { StepNav } from "../StepNav/StepNav";
import styles from "./StepCondition.module.css";

const CONDITIONS = [
    {
        id: "new",
        label: "Nuevo",
        description: "Producto sin uso, en su embalaje original. Recomendado para la mayoría de los productos.",
        icon: faBoxOpen,
        recommended: true,
    },
    {
        id: "used",
        label: "Usado",
        description: "Producto que fue utilizado anteriormente. Puede tener marcas de uso.",
        icon: faRecycle,
        recommended: false,
    },
];

export function StepCondition() {
    const { form, updateForm, goNext, goBack } = useMLPublish();

    return (
        <div>
            <h3 className={styles.title}>Condición del producto</h3>
            <p className={styles.subtitle}>
                Todos tus productos son <strong>nuevos</strong> — ya lo pre-seleccionamos. Confirmá o cambialo si es necesario.
            </p>

            <div className={styles.options}>
                {CONDITIONS.map(cond => {
                    const selected = form.condition === cond.id;
                    return (
                        <button
                            key={cond.id}
                            type="button"
                            className={`${styles.card} ${selected ? styles.selected : ""}`}
                            onClick={() => updateForm({ condition: cond.id })}
                        >
                            <div className={styles.card_header}>
                                <div className={`${styles.icon_wrap} ${selected ? styles.icon_selected : ""}`}>
                                    <FontAwesomeIcon icon={cond.icon} />
                                </div>
                                <div className={styles.card_info}>
                                    <span className={styles.card_label}>{cond.label}</span>
                                    {cond.recommended && (
                                        <span className={styles.recommended}>Recomendado para tu tienda</span>
                                    )}
                                </div>
                                {selected && (
                                    <FontAwesomeIcon icon={faCheckCircle} className={styles.check} />
                                )}
                            </div>
                            <p className={styles.card_desc}>{cond.description}</p>
                        </button>
                    );
                })}
            </div>

            <StepNav
                onBack={() => goBack("condicion")}
                onNext={() => goNext("condicion")}
                canNext={!!form.condition}
            />
        </div>
    );
}