import { useEffect, useMemo, useState } from 'react';
import Select from 'react-select';
import { CategoryService } from '../../../../services/category/categoryService';
import styles from './SectionForms.module.css';

const SOURCE_OPTIONS = [
    { value: 'new-arrivals', label: 'Ingresos (últimos agregados)' },
    { value: 'best-sellers', label: 'Más vendidos' },
    { value: 'category', label: 'Productos de una categoría' },
    { value: 'keyword', label: 'Palabra clave (buscar)' },
];

export function ProductsSectionForm({ settings, onChange }) {
    const categoryService = useMemo(() => new CategoryService(), []);
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        if (settings.source !== 'category') return;

        categoryService.getAll()
            .then(list => setCategories(list ?? []))
            .catch(() => setCategories([]));
    }, [settings.source, categoryService]);

    const categoryOptions = categories.map(c => ({ value: c.id, label: c.name }));

    return (
        <div className={styles.form}>
            <label className={styles.field}>
                <span>Título</span>
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
                        value={settings.limit ?? 12}
                        onChange={e => onChange({ limit: Number(e.target.value) || 12 })}
                    />
                </label>

                <label className={styles.field}>
                    <span>Link "Ver todo" (opcional)</span>
                    <input
                        type="text"
                        value={settings.viewAllHref ?? ''}
                        onChange={e => onChange({ viewAllHref: e.target.value })}
                        placeholder="/ingresos"
                    />
                </label>
            </div>
        </div>
    );
}
