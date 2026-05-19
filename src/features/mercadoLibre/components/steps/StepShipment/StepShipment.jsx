import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { useMLPublish } from "../../../hooks/useMLPublish";
import { getShippingOptions } from "../../../../../utils/getShippingOptions";
import { FREE_SHIPPING_THRESHOLD } from "../../../hooks/useMLFees";
import { StepNav } from "../StepNav/StepNav";
import styles from "./StepShipment.module.css";

// Mapeo shipping option → logistic_type para el API de comisiones
const LOGISTIC_MAP = {
    me2: "drop_off",
    local: "not_specified",
    custom: "custom",
};

export function StepShipment() {
    const { form, updateForm, shippingPrefs, goNext, goBack } = useMLPublish();
    const [options, setOptions] = useState([]);

    useEffect(() => {
        if (shippingPrefs) {
            const opts = getShippingOptions(shippingPrefs, parseFloat(form.price) || 0);
            setOptions(opts);
            // Selección default: me2 si existe
            if (!form.shipping_mode && opts.some(o => o.id === "me2")) {
                updateForm({ shipping_mode: "me2", logistic_type: "drop_off" });
            }
        }
    }, [shippingPrefs, form.price]);

    const selectOption = (opt) => {
        updateForm({
            shipping_mode: opt.id === "local" ? "not_specified" : opt.id,
            logistic_type: LOGISTIC_MAP[opt.id] ?? "not_specified",
            free_shipping: opt.isFree ?? false,
        });
    };

    const currentId = form.shipping_mode === "not_specified" ? "local" : form.shipping_mode;
    const isMandatoryFree = parseFloat(form.price) >= FREE_SHIPPING_THRESHOLD;

    if (!shippingPrefs) {
        return (
            <div className={styles.loading}>
                <FontAwesomeIcon icon={faCircleNotch} spin />
                <span>Cargando preferencias de envío...</span>
            </div>
        );
    }

    return (
        <div>
            <h3 className={styles.title}>Configuración de envío</h3>
            <p className={styles.subtitle}>Elegí cómo vas a entregar el producto a los compradores.</p>

            <div className={styles.options}>
                {options.map(opt => {
                    const selected = currentId === opt.id;
                    return (
                        <div
                            key={opt.id}
                            className={`${styles.card} ${selected ? styles.selected : ""}`}
                            onClick={() => selectOption(opt)}
                        >
                            <div className={styles.card_top}>
                                <input type="radio" readOnly checked={selected} />
                                <div className={styles.card_info}>
                                    <strong className={styles.card_title}>{opt.title}</strong>
                                    {opt.isFree && <span className={styles.free_badge}>Envío gratis obligatorio</span>}
                                </div>
                            </div>
                            <p className={styles.card_desc}>{opt.description}</p>

                            {/* Toggle opcional si no es obligatorio */}
                            {opt.id === "me2" && selected && !isMandatoryFree && (
                                <label className={styles.free_toggle} onClick={e => e.stopPropagation()}>
                                    <input
                                        type="checkbox"
                                        checked={form.free_shipping}
                                        onChange={e => updateForm({ free_shipping: e.target.checked })}
                                    />
                                    Ofrecer envío gratis al comprador (lo pagas vos)
                                </label>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Peso y dimensiones — obligatorios para me2 */}
            {currentId === "me2" && (
                <div className={styles.package_section}>
                    <p className={styles.package_title}>Medidas del paquete</p>
                    <p className={styles.package_sub}>Necesarias para calcular el costo real de envío.</p>
                    <div className={styles.package_grid}>
                        <div className={styles.field}>
                            <label>Peso <span className={styles.unit}>(g)</span></label>
                            <input
                                type="number" min={1}
                                value={form.billable_weight}
                                onChange={e => updateForm({ billable_weight: e.target.value })}
                                placeholder="Ej: 800"
                            />
                        </div>
                        <div className={styles.field}>
                            <label>Alto <span className={styles.unit}>(cm)</span></label>
                            <input
                                type="number" min={1}
                                value={form.dim_height}
                                onChange={e => updateForm({ dim_height: e.target.value })}
                                placeholder="Ej: 10"
                            />
                        </div>
                        <div className={styles.field}>
                            <label>Ancho <span className={styles.unit}>(cm)</span></label>
                            <input
                                type="number" min={1}
                                value={form.dim_width}
                                onChange={e => updateForm({ dim_width: e.target.value })}
                                placeholder="Ej: 15"
                            />
                        </div>
                        <div className={styles.field}>
                            <label>Largo <span className={styles.unit}>(cm)</span></label>
                            <input
                                type="number" min={1}
                                value={form.dim_length}
                                onChange={e => updateForm({ dim_length: e.target.value })}
                                placeholder="Ej: 20"
                            />
                        </div>
                    </div>
                </div>
            )}

            <StepNav
                onBack={() => goBack("envio")}
                onNext={() => goNext("envio")}
                canNext={
                    !!form.shipping_mode && (
                        currentId !== "me2" || (
                            form.billable_weight && form.dim_height &&
                            form.dim_width && form.dim_length
                        )
                    )
                }
            />
        </div>
    );
}