import { useMLPublish } from "../../../hooks/useMLPublish";
import { StepNav } from "../StepNav/StepNav";
import styles from "./StepDescription.module.css";

export function StepDescription() {
    const { form, updateForm, goNext, goBack } = useMLPublish();

    const titleLen = form.title.length;
    const titlePct = (titleLen / 60) * 100;
    const titleColor = titleLen > 54 ? "#ef4444" : titleLen > 45 ? "#f59e0b" : "#2563eb";

    return (
        <div>
            <h3 className={styles.title}>Título y descripción</h3>
            <p className={styles.subtitle}>Un buen título mejora el posicionamiento en las búsquedas de ML.</p>

            <div className={styles.field}>
                <label>
                    Título <span className={styles.required}>*</span>
                    <span className={styles.tip}>Incluí marca, modelo, material y características clave</span>
                </label>
                <input
                    type="text"
                    value={form.title}
                    onChange={e => updateForm({ title: e.target.value })}
                    maxLength={60}
                    placeholder="Ej: Zapatillas Nike Air Max 270 Hombre Talle 42 Blancas"
                    autoFocus
                />
                <div className={styles.char_bar}>
                    <div
                        className={styles.char_fill}
                        style={{ width: `${titlePct}%`, background: titleColor }}
                    />
                </div>
                <div className={styles.char_row}>
                    <span className={styles.char_tips}>
                        ✓ No uses signos de puntuación ni mayúsculas innecesarias
                    </span>
                    <span style={{ color: titleColor, fontWeight: 600 }}>{titleLen}/60</span>
                </div>
            </div>

            <div className={styles.field}>
                <label>
                    Descripción
                    <span className={styles.tip}>Opcional — describí el producto con más detalle</span>
                </label>
                <textarea
                    value={form.description}
                    onChange={e => updateForm({ description: e.target.value })}
                    rows={6}
                    placeholder="Describí características, materiales, instrucciones de uso, garantía..."
                    maxLength={50000}
                />
                <span className={styles.desc_count}>{(form.description || "").length} / 50.000</span>
            </div>

            <StepNav
                onBack={() => goBack("descripcion")}
                onNext={() => goNext("descripcion")}
                canNext={form.title.trim().length > 0}
            />
        </div>
    );
}