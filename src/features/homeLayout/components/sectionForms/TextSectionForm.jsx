import styles from './SectionForms.module.css';

export function TextSectionForm({ settings, onChange }) {
    return (
        <div className={styles.form}>
            <label className={styles.field}>
                <span>Título</span>
                <input
                    type="text"
                    value={settings.title ?? ''}
                    onChange={e => onChange({ title: e.target.value })}
                    placeholder="Ej: Envíos a todo el país"
                />
            </label>

            <label className={styles.field}>
                <span>Texto</span>
                <textarea
                    rows={4}
                    value={settings.body ?? ''}
                    onChange={e => onChange({ body: e.target.value })}
                    placeholder="Escribí el contenido del aviso…"
                />
            </label>
        </div>
    );
}
