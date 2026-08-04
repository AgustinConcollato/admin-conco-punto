import { useEffect, useMemo, useState } from 'react';
import Select from 'react-select';
import { CategoryService } from '../../../../services/category/categoryService';
import { SlidesEditor } from './SlidesEditor';
import styles from './SectionForms.module.css';

const SOURCE_OPTIONS = [
    { value: 'new-arrivals', label: 'Ingresos (últimos agregados)' },
    { value: 'best-sellers', label: 'Más vendidos' },
    { value: 'category', label: 'Productos de una categoría' },
    { value: 'keyword', label: 'Palabra clave (buscar)' },
];

const LAYOUT_OPTIONS = [
    { value: 'grid', label: 'Grilla (sin scroll)' },
    { value: 'scroll', label: 'Scroll horizontal' },
];

export function BannerProductsSectionForm({ settings, onChange }) {
    const categoryService = useMemo(() => new CategoryService(), []);
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        if (settings.source !== 'category') return;

        categoryService.getAll()
            .then(list => setCategories(list ?? []))
            .catch(() => setCategories([]));
    }, [settings.source, categoryService]);

    const categoryOptions = categories.map(c => ({ value: c.id, label: c.name }));
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

            <hr className={styles.divider} />

            <label className={styles.field}>
                <span>Título de la sección de productos</span>
                <input
                    type="text"
                    value={settings.title ?? ''}
                    onChange={e => onChange({ title: e.target.value })}
                    placeholder="Ej: Ingresos"
                />
            </label>

            <label className={styles.field}>
                <span>Origen de productos</span>
                <Select
                    options={SOURCE_OPTIONS}
                    value={SOURCE_OPTIONS.find(o => o.value === settings.source) ?? null}
                    onChange={opt => onChange({ source: opt.value, categoryId: null, keyword: '' })}
                    placeholder="Elegir origen"
                />
            </label>

            {settings.source === 'category' && (
                <label className={styles.field}>
                    <span>Categoría</span>
                    <Select
                        options={categoryOptions}
                        value={categoryOptions.find(o => o.value === settings.categoryId) ?? null}
                        onChange={opt => onChange({ categoryId: opt.value })}
                        placeholder="Elegir categoría"
                        noOptionsMessage={() => 'Sin categorías'}
                    />
                </label>
            )}

            {settings.source === 'keyword' && (
                <label className={styles.field}>
                    <span>Palabra clave</span>
                    <input
                        type="text"
                        value={settings.keyword ?? ''}
                        onChange={e => onChange({ keyword: e.target.value })}
                        placeholder="Ej: zapatillas running"
                    />
                </label>
            )}

            <div className={styles.row}>
                <label className={styles.field}>
                    <span>Límite de productos</span>
                    <input
                        type="number"
                        min={1}
                        max={24}
                        value={settings.limit ?? 8}
                        onChange={e => onChange({ limit: Number(e.target.value) || 8 })}
                    />
                </label>

                <label className={styles.field}>
                    <span>Diseño de productos</span>
                    <Select
                        options={LAYOUT_OPTIONS}
                        value={LAYOUT_OPTIONS.find(o => o.value === (settings.layout ?? 'grid'))}
                        onChange={opt => onChange({ layout: opt.value })}
                    />
                </label>
            </div>
        </div>
    );
}
