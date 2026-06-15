import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowDown, faArrowUp, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { MediaPicker } from '../MediaPicker/MediaPicker';
import { IMAGE_URL } from '../../../../config/api';
import styles from './SectionForms.module.css';

export function BannerSectionForm({ settings, onChange }) {
    const [pickerOpen, setPickerOpen] = useState(false);

    const slides = settings.slides ?? [];

    const handleSelect = ({ path, url }) => {
        onChange({ slides: [...slides, { id: crypto.randomUUID(), path, url, link: '' }] });
        setPickerOpen(false);
    };

    const removeSlide = (slide) => {
        onChange({ slides: slides.filter(s => s.id !== slide.id) });
    };

    const moveSlide = (index, delta) => {
        const to = index + delta;
        if (to < 0 || to >= slides.length) return;
        const next = [...slides];
        const [moved] = next.splice(index, 1);
        next.splice(to, 0, moved);
        onChange({ slides: next });
    };

    const updateLink = (id, link) => {
        onChange({ slides: slides.map(s => (s.id === id ? { ...s, link } : s)) });
    };

    return (
        <div className={styles.form}>
            <div className={styles.slides}>
                {slides.map((slide, i) => (
                    <div key={slide.id} className={styles.slide}>
                        <img
                            src={slide.url ?? `${IMAGE_URL}/${slide.path}`}
                            alt=""
                            className={styles.slide_img}
                        />
                        <input
                            type="text"
                            value={slide.link ?? ''}
                            onChange={e => updateLink(slide.id, e.target.value)}
                            placeholder="Link al hacer click (opcional)"
                            className={styles.slide_link}
                        />
                        <div className={styles.slide_actions}>
                            <button onClick={() => moveSlide(i, -1)} disabled={i === 0} aria-label="Subir">
                                <FontAwesomeIcon icon={faArrowUp} />
                            </button>
                            <button onClick={() => moveSlide(i, 1)} disabled={i === slides.length - 1} aria-label="Bajar">
                                <FontAwesomeIcon icon={faArrowDown} />
                            </button>
                            <button onClick={() => removeSlide(slide)} className={styles.slide_delete} aria-label="Eliminar">
                                <FontAwesomeIcon icon={faTrash} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <button
                className={styles.add_image_btn}
                onClick={() => setPickerOpen(true)}
            >
                <FontAwesomeIcon icon={faPlus} /> Agregar imagen
            </button>
            {pickerOpen && (
                <MediaPicker onSelect={handleSelect} onClose={() => setPickerOpen(false)} />
            )}

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
