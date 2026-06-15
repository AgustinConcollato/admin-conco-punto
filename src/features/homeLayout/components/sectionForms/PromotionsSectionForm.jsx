import { useEffect, useMemo, useState } from 'react';
import Select from 'react-select';
import { PromotionService } from '../../../../services/promotion/promotionService';
import styles from './SectionForms.module.css';

const ALL_OPTION = { value: null, label: 'Todas las promociones visibles' };

export function PromotionsSectionForm({ settings, onChange }) {
    const promotionService = useMemo(() => new PromotionService(), []);
    const [promotions, setPromotions] = useState([]);

    useEffect(() => {
        promotionService.getAll({ is_active: 1, per_page: 100 })
            .then(res => setPromotions(res?.data ?? []))
            .catch(() => setPromotions([]));
    }, [promotionService]);

    const options = [
        ALL_OPTION,
        ...promotions.map(p => ({
            value: p.id,
            label: p.show_on_web ? p.name : `${p.name} (no visible en web)`,
            isDisabled: !p.show_on_web,
        })),
    ];

    return (
        <div className={styles.form}>
            <label className={styles.field}>
                <span>Título (opcional)</span>
                <input
                    type="text"
                    value={settings.title ?? ''}
                    onChange={e => onChange({ title: e.target.value })}
                    placeholder="Ej: Promociones"
                />
            </label>

            <label className={styles.field}>
                <span>Promoción a mostrar</span>
                <Select
                    options={options}
                    value={options.find(o => o.value === (settings.promotionId ?? null)) ?? ALL_OPTION}
                    onChange={opt => onChange({ promotionId: opt.value })}
                    isOptionDisabled={opt => opt.isDisabled}
                    placeholder="Elegir promoción"
                    noOptionsMessage={() => 'Sin promociones'}
                />
            </label>

            <p className={styles.hint}>
                Solo aparecen promos activas marcadas como visibles en la web y asignadas a la lista de
                precios que esté viendo el cliente (minorista/mayorista).
            </p>
        </div>
    );
}
