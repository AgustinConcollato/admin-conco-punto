export const RANGE_OPTIONS = [
    { value: 'month',   label: 'Este mes' },
    { value: 'last_7',  label: '7 días' },
    { value: 'last_30', label: '30 días' },
    { value: 'last_60', label: '60 días' },
    { value: 'last_90', label: '90 días' },
    { value: 'all',     label: 'Todo' },
    { value: 'custom',  label: 'Personalizado' },
];

export const DEFAULT_RANGE = 'month';

function todayStr() {
    return new Date().toISOString().split('T')[0];
}

function daysAgoStr(n) {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString().split('T')[0];
}

const PRESET_DAYS = { last_7: 7, last_30: 30, last_60: 60, last_90: 90 };

/**
 * Transforma los filtros UI → parámetros para la API.
 * - last_X  → start_date/end_date calculados, sin range
 * - custom  → start_date/end_date del estado, sin range
 * - all     → range=all, sin fechas
 */
export function buildRangeFilters(filters) {
    const f = { ...filters };
    const days = PRESET_DAYS[f.range];

    if (days !== undefined) {
        f.start_date = daysAgoStr(days);
        f.end_date = todayStr();
        delete f.range;
    } else if (f.range === 'custom') {
        delete f.range;
    }

    return f;
}
