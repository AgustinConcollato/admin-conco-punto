import { SlidesEditor } from './SlidesEditor';
import styles from './SectionForms.module.css';

export function BannerSectionForm({ settings, onChange }) {
    const slides = settings.slides ?? [];

    return (
        <div className={styles.form}>
            <SlidesEditor slides={slides} onChange={(next) => onChange({ slides: next })} />

            <label className={styles.field}>
                <span>Autoplay (segundos entre banners)</span>
                <input
                    type="number"
                    min={2}
                    max={30}
                    value={(settings.autoplayMs ?? 5000) / 1000}
                    onChange={e => onChange({ autoplayMs: Math.min(30, Math.max(2, Number(e.target.value) || 5)) * 1000 })}
                />
            </label>
        </div>
    );
}
