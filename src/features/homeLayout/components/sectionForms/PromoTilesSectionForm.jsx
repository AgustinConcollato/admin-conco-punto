import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowDown, faArrowUp, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { MediaPicker } from '../MediaPicker/MediaPicker';
import { IMAGE_URL } from '../../../../config/api';
import styles from './SectionForms.module.css';

export function PromoTilesSectionForm({ settings, onChange }) {
    const [pickerOpen, setPickerOpen] = useState(false);
    const tiles = settings.tiles ?? [];

    const handleSelect = ({ path, url }) => {
        onChange({
            tiles: [
                ...tiles,
                { id: crypto.randomUUID(), path, url, link: '', eyebrow: '', title: '', buttonText: 'Ver ofertas', bgColor: '#f1f5f9' },
            ],
        });
        setPickerOpen(false);
    };

    const removeTile = (tile) => {
        onChange({ tiles: tiles.filter(t => t.id !== tile.id) });
    };

    const moveTile = (index, delta) => {
        const to = index + delta;
        if (to < 0 || to >= tiles.length) return;
        const next = [...tiles];
        const [moved] = next.splice(index, 1);
        next.splice(to, 0, moved);
        onChange({ tiles: next });
    };

    const updateTile = (id, patch) => {
        onChange({ tiles: tiles.map(t => (t.id === id ? { ...t, ...patch } : t)) });
    };

    return (
        <div className={styles.form}>
            <div className={styles.slides}>
                {tiles.map((tile, i) => (
                    <div key={tile.id} className={styles.tile_card}>
                        <div className={styles.tile_head}>
                            <img
                                src={tile.url ?? `${IMAGE_URL}/${tile.path}`}
                                alt=""
                                className={styles.slide_img}
                            />
                            <div className={styles.slide_actions}>
                                <button onClick={() => moveTile(i, -1)} disabled={i === 0} aria-label="Subir">
                                    <FontAwesomeIcon icon={faArrowUp} />
                                </button>
                                <button onClick={() => moveTile(i, 1)} disabled={i === tiles.length - 1} aria-label="Bajar">
                                    <FontAwesomeIcon icon={faArrowDown} />
                                </button>
                                <button onClick={() => removeTile(tile)} className={styles.slide_delete} aria-label="Eliminar">
                                    <FontAwesomeIcon icon={faTrash} />
                                </button>
                            </div>
                        </div>

                        <div className={styles.row}>
                            <label className={styles.field}>
                                <span>Etiqueta</span>
                                <input
                                    type="text"
                                    value={tile.eyebrow ?? ''}
                                    onChange={e => updateTile(tile.id, { eyebrow: e.target.value })}
                                    placeholder="Ej: Salud"
                                />
                            </label>
                            <label className={styles.field}>
                                <span>Color de fondo</span>
                                <input
                                    type="color"
                                    value={tile.bgColor ?? '#f1f5f9'}
                                    onChange={e => updateTile(tile.id, { bgColor: e.target.value })}
                                    className={styles.color_input}
                                />
                            </label>
                        </div>

                        <label className={styles.field}>
                            <span>Título</span>
                            <input
                                type="text"
                                value={tile.title ?? ''}
                                onChange={e => updateTile(tile.id, { title: e.target.value })}
                                placeholder="Ej: Todo en suplementos"
                            />
                        </label>

                        <div className={styles.row}>
                            <label className={styles.field}>
                                <span>Texto del botón</span>
                                <input
                                    type="text"
                                    value={tile.buttonText ?? ''}
                                    onChange={e => updateTile(tile.id, { buttonText: e.target.value })}
                                    placeholder="Ver ofertas"
                                />
                            </label>
                            <label className={styles.field}>
                                <span>Link</span>
                                <input
                                    type="text"
                                    value={tile.link ?? ''}
                                    onChange={e => updateTile(tile.id, { link: e.target.value })}
                                    placeholder="/categoria/suplementos"
                                />
                            </label>
                        </div>
                    </div>
                ))}
            </div>

            <button
                className={styles.add_image_btn}
                onClick={() => setPickerOpen(true)}
            >
                <FontAwesomeIcon icon={faPlus} /> Agregar tarjeta
            </button>
            {pickerOpen && (
                <MediaPicker onSelect={handleSelect} onClose={() => setPickerOpen(false)} />
            )}
        </div>
    );
}
