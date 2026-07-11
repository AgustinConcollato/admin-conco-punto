import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';
import { Modal } from '../../../../components/Modal/Modal';
import { SupplierPurchaseService } from '../../../../services/supplierPurchase/supplierPurchaseService';
import { formatPrice } from '../../../../utils/formatPrice';
import { normalizeStr } from '../../../../utils/normalizeStr';
import styles from './PurchaseFormModal.module.css';

const service = new SupplierPurchaseService();

// Proveedores frecuentes: label a mostrar + término de búsqueda para matchear.
const QUICK_SUPPLIERS = [
    { key: 'mago', label: 'El Mago' },
    { key: 'colucci', label: 'Bazar Colucci' },
    { key: 'swing', label: 'El Swing' },
];

/** Formatea una fecha a yyyy-mm-dd usando la zona local (evita el corrimiento de toISOString/UTC). */
function fmtLocal(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

function todayStr() {
    return fmtLocal(new Date());
}

function toDateInput(value) {
    if (!value) return '';
    return String(value).split('T')[0];
}

/** Suma n días a una fecha yyyy-mm-dd y devuelve yyyy-mm-dd. */
function addDays(dateStr, n) {
    if (!dateStr || n === '' || n === null || isNaN(n)) return '';
    const d = new Date(dateStr + 'T00:00:00');
    d.setDate(d.getDate() + Number(n));
    return fmtLocal(d);
}

/** Días enteros entre dos fechas yyyy-mm-dd (to - from). */
function daysBetween(from, to) {
    if (!from || !to) return '';
    const a = new Date(from + 'T00:00:00');
    const b = new Date(to + 'T00:00:00');
    return Math.round((b - a) / 86400000);
}

export function PurchaseFormModal({ suppliers, purchase, defaultSupplierId = '', onClose, onSaved }) {
    const isEdit = Boolean(purchase);

    const initialPurchaseDate = toDateInput(purchase?.purchase_date) || todayStr();
    const initialDueDate = toDateInput(purchase?.due_date) || '';

    const [form, setForm] = useState({
        supplier_id: purchase?.supplier_id || defaultSupplierId || '',
        invoice_number: purchase?.invoice_number || '',
        purchase_date: initialPurchaseDate,
        due_date: initialDueDate,
        due_days: initialDueDate ? String(daysBetween(initialPurchaseDate, initialDueDate)) : '',
        total: purchase?.total ?? '',
        discount_percent: purchase?.discount_percent ?? 0,
        reminder_days: purchase ? (purchase.reminder_days ?? '') : 5,
        note: purchase?.note || '',
    });
    const [saving, setSaving] = useState(false);

    // Searchable supplier select
    const [supplierSearch, setSupplierSearch] = useState('');
    const [supplierOpen, setSupplierOpen] = useState(false);
    const supplierRef = useRef(null);

    useEffect(() => {
        const onClickOutside = (e) => {
            if (supplierRef.current && !supplierRef.current.contains(e.target)) {
                setSupplierOpen(false);
                setSupplierSearch('');
            }
        };
        document.addEventListener('mousedown', onClickOutside);
        return () => document.removeEventListener('mousedown', onClickOutside);
    }, []);

    const selectedSupplierName = suppliers.find(s => s.id === form.supplier_id)?.name || '';

    const totalWithDiscount = useMemo(() => {
        const total = parseFloat(form.total) || 0;
        const pct = parseFloat(form.discount_percent) || 0;
        return Math.round((total - (total * pct / 100)) * 100) / 100;
    }, [form.total, form.discount_percent]);

    const setField = (name, value) => setForm(f => ({ ...f, [name]: value }));

    // Cambiar fecha de factura: si hay días cargados, recalcula el vencimiento.
    const handlePurchaseDateChange = (value) => {
        setForm(f => ({
            ...f,
            purchase_date: value,
            due_date: f.due_days !== '' ? addDays(value, f.due_days) : f.due_date,
        }));
    };

    // Cambiar días: recalcula el vencimiento desde la fecha de factura.
    const handleDueDaysChange = (value) => {
        const clean = value === '' ? '' : String(Math.max(0, parseInt(value) || 0));
        setForm(f => ({
            ...f,
            due_days: clean,
            due_date: clean !== '' ? addDays(f.purchase_date, clean) : f.due_date,
        }));
    };

    // Cambiar la fecha de vencimiento a mano: sincroniza los días.
    const handleDueDateChange = (value) => {
        setForm(f => ({
            ...f,
            due_date: value,
            due_days: value ? String(daysBetween(f.purchase_date, value)) : '',
        }));
    };

    const selectSupplier = (supplier) => {
        setField('supplier_id', supplier.id);
        setSupplierOpen(false);
        setSupplierSearch('');
    };

    const findQuickSupplier = (key) =>
        suppliers.find(s => normalizeStr(s.name).includes(key));

    const selectQuick = (quick) => {
        const match = findQuickSupplier(quick.key);
        if (!match) return toast.error(`No se encontró el proveedor "${quick.label}".`);
        selectSupplier(match);
    };

    const isQuickActive = (key) => {
        const match = findQuickSupplier(key);
        return match && match.id === form.supplier_id;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.supplier_id) return toast.error('Elegí un proveedor.');
        if (form.total === '' || parseFloat(form.total) < 0) return toast.error('Ingresá un total válido.');

        setSaving(true);
        try {
            const payload = {
                supplier_id: form.supplier_id,
                invoice_number: form.invoice_number || null,
                purchase_date: form.purchase_date,
                due_date: form.due_date || null,
                total: parseFloat(form.total),
                discount_percent: parseFloat(form.discount_percent) || 0,
                reminder_days: form.reminder_days === '' ? null : parseInt(form.reminder_days),
                note: form.note || null,
            };

            let saved;
            if (isEdit) {
                saved = await service.update(purchase.id, payload);
                toast.success('Compra actualizada.');
            } else {
                saved = await service.create(payload);
                toast.success('Compra registrada.');
            }
            onSaved(saved, isEdit);
        } catch (err) {
            toast.error(err?.message ?? err?.error ?? 'No se pudo guardar la compra.');
        } finally {
            setSaving(false);
        }
    };

    const filteredSuppliers = suppliers
        .filter(s => !supplierSearch || normalizeStr(s.name).includes(normalizeStr(supplierSearch)))
        .slice(0, 50);

    return (
        <Modal onClose={onClose} title={isEdit ? 'Editar compra' : 'Nueva compra'}>
            <form onSubmit={handleSubmit} className={styles.form}>
                <div className="input_group">
                    <label>Proveedor</label>
                    <div className={styles.searchable} ref={supplierRef}>
                        <input
                            className="input"
                            type="text"
                            placeholder={isEdit ? selectedSupplierName : 'Buscar proveedor...'}
                            value={supplierOpen ? supplierSearch : selectedSupplierName}
                            onChange={(e) => { setSupplierSearch(e.target.value); setSupplierOpen(true); }}
                            onClick={() => !isEdit && setSupplierOpen(true)}
                            disabled={isEdit}
                            aria-expanded={supplierOpen}
                        />
                        {supplierOpen && !isEdit && (
                            <div className={styles.options} role="listbox">
                                {filteredSuppliers.length > 0 ? (
                                    filteredSuppliers.map(s => (
                                        <div
                                            key={s.id}
                                            className={`${styles.option} ${s.id === form.supplier_id ? styles.option_active : ''}`}
                                            onMouseDown={(e) => { e.preventDefault(); selectSupplier(s); }}
                                        >
                                            {s.name}
                                        </div>
                                    ))
                                ) : (
                                    <div className={styles.option_empty}>Sin resultados</div>
                                )}
                            </div>
                        )}
                    </div>

                    {!isEdit && (
                        <div className={styles.quick}>
                            <span className={styles.quick_label}>Rápido:</span>
                            {QUICK_SUPPLIERS.map(q => (
                                <button
                                    key={q.key}
                                    type="button"
                                    className={`${styles.quick_chip} ${isQuickActive(q.key) ? styles.quick_chip_active : ''}`}
                                    onClick={() => selectQuick(q)}
                                >
                                    {q.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className={styles.row}>
                    <div className="input_group">
                        <label>N° Factura</label>
                        <input
                            className="input"
                            type="text"
                            value={form.invoice_number}
                            onChange={e => setField('invoice_number', e.target.value)}
                            placeholder="Ej: 29696"
                        />
                    </div>
                    <div className="input_group">
                        <label>Fecha</label>
                        <input
                            className="input"
                            type="date"
                            value={form.purchase_date}
                            onChange={e => handlePurchaseDateChange(e.target.value)}
                        />
                    </div>
                </div>

                <div className={styles.row}>
                    <div className="input_group">
                        <label>Días para vencer</label>
                        <input
                            className="input"
                            type="number"
                            min="0"
                            value={form.due_days}
                            onChange={e => handleDueDaysChange(e.target.value)}
                            placeholder="Ej: 20"
                        />
                    </div>
                    <div className="input_group">
                        <label>Vencimiento</label>
                        <input
                            className="input"
                            type="date"
                            value={form.due_date}
                            onChange={e => handleDueDateChange(e.target.value)}
                        />
                    </div>
                </div>

                <div className="input_group">
                    <label>Avisar por mail (días antes de vencer)</label>
                    <input
                        className="input"
                        type="number"
                        min="0"
                        max="365"
                        onChange={e => setField('reminder_days', e.target.value)}
                        placeholder="Ej: 5 — vacío = sin aviso"
                    />
                </div>

                <div className={styles.row}>
                    <div className="input_group">
                        <label>Total</label>
                        <input
                            className="input"
                            type="number"
                            step="0.01"
                            min="0"
                            value={form.total}
                            onChange={e => setField('total', e.target.value)}
                            placeholder="0.00"
                        />
                    </div>
                    <div className="input_group">
                        <label>Descuento (%)</label>
                        <input
                            className="input"
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            value={form.discount_percent}
                            onChange={e => setField('discount_percent', e.target.value)}
                            placeholder="0"
                        />
                    </div>
                </div>

                <div className={styles.computed}>
                    <span>Total con descuento</span>
                    <strong>{formatPrice(totalWithDiscount)}</strong>
                </div>

                <div className="input_group">
                    <label>Nota (opcional)</label>
                    <input
                        className="input"
                        type="text"
                        value={form.note}
                        onChange={e => setField('note', e.target.value)}
                        placeholder="Observaciones..."
                    />
                </div>

                <div className={styles.actions}>
                    <button type="button" className="btn btn_regular" onClick={onClose}>Cancelar</button>
                    <button type="submit" className="btn btn_solid" disabled={saving}>
                        {saving ? <FontAwesomeIcon icon={faCircleNotch} spin /> : (isEdit ? 'Guardar' : 'Registrar compra')}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
