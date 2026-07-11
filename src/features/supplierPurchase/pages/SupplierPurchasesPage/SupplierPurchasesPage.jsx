import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { SupplierService } from '../../../../services/supplier/supplierService';
import { SupplierPurchaseService } from '../../../../services/supplierPurchase/supplierPurchaseService';
import { RANGE_OPTIONS, DEFAULT_RANGE, buildRangeFilters } from '../../../../utils/rangeHelpers';
import { ConfirmModal } from '../../../../components/ConfirmModal/ConfirmModal';
import { SupplierPurchaseList } from '../../components/SupplierPurchaseList/SupplierPurchaseList';
import { PurchaseFormModal } from '../../components/PurchaseFormModal/PurchaseFormModal';
import { PaymentFormModal } from '../../components/PaymentFormModal/PaymentFormModal';
import { PurchaseDetailModal } from '../../components/PurchaseDetailModal/PurchaseDetailModal';
import { applyStatsDelta } from '../../utils/purchaseCalc';
import styles from './SupplierPurchasesPage.module.css';

const STATUS_OPTIONS = {
    '': 'Todas',
    pending: 'Pendientes',
    partial: 'Parciales',
    paid: 'Pagadas',
    overdue: 'Vencidas',
};

const supplierService = new SupplierService();
const purchaseService = new SupplierPurchaseService();

export function SupplierPurchasesPage() {
    const [searchParams, setSearchParams] = useSearchParams();

    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [purchases, setPurchases] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [stats, setStats] = useState(null);

    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [payingPurchase, setPayingPurchase] = useState(null);
    const [deleting, setDeleting] = useState(null);
    const [detail, setDetail] = useState(null);

    const filters = useMemo(() => ({
        supplier_id: searchParams.get('supplier_id') || '',
        status: searchParams.get('status') || '',
        invoice_number: searchParams.get('invoice_number') || '',
        range: searchParams.get('range') || DEFAULT_RANGE,
        start_date: searchParams.get('start_date') || '',
        end_date: searchParams.get('end_date') || '',
        page: searchParams.get('page') || '1',
    }), [searchParams]);

    const filtersToSend = useMemo(() => buildRangeFilters(filters), [filters]);

    useEffect(() => {
        document.title = 'Cuentas por pagar';
        supplierService.getAll()
            .then(list => setSuppliers(list ?? []))
            .catch(() => setSuppliers([]));
    }, []);

    const loadPurchases = useCallback(async () => {
        setLoading(true);
        try {
            const res = await purchaseService.getAll(filtersToSend);
            setPurchases(res.data || []);
            setPagination({
                current_page: res.current_page || 1,
                last_page: res.last_page || 1,
                per_page: res.per_page || 20,
                total: res.total || 0,
            });
            setStats(res.stats || null);
        } catch (err) {
            setPurchases([]);
            setPagination(null);
            toast.error(err?.message ?? 'No se pudieron cargar las compras.');
        } finally {
            setLoading(false);
        }
    }, [filtersToSend]);

    useEffect(() => {
        loadPurchases();
    }, [loadPurchases]);

    const handleFilterChange = (name, value) => {
        const newParams = new URLSearchParams(searchParams);
        if (value) newParams.set(name, value);
        else newParams.delete(name);

        if (name !== 'page') newParams.set('page', '1');
        if (name === 'range' && value !== 'custom') {
            newParams.delete('start_date');
            newParams.delete('end_date');
        }
        setSearchParams(newParams);
    };

    const handleReset = () => setSearchParams({ range: DEFAULT_RANGE, page: '1' });

    const openNew = () => { setEditing(null); setShowForm(true); };
    const openEdit = (purchase) => { setEditing(purchase); setShowForm(true); };

    // Reemplaza una fila existente y ajusta las stats por delta (sin recargar todo).
    const applyUpdatedPurchase = (updated) => {
        setPurchases(prev => {
            const old = prev.find(p => p.id === updated.id);
            setStats(s => applyStatsDelta(s, old, updated));
            return prev.map(p => (p.id === updated.id ? { ...p, ...updated } : p));
        });
    };

    // Alta: agrega la fila arriba y suma su aporte a las stats.
    const applyCreatedPurchase = (created) => {
        setPurchases(prev => [created, ...prev]);
        setStats(s => applyStatsDelta(s, null, created));
        setPagination(pg => pg ? { ...pg, total: pg.total + 1 } : pg);
    };

    const handleSaved = (saved, isEdit) => {
        setShowForm(false);
        setEditing(null);
        if (!saved) return loadPurchases(); // fallback defensivo
        if (isEdit) applyUpdatedPurchase(saved);
        else applyCreatedPurchase(saved);
    };

    const confirmDelete = async () => {
        const target = deleting;
        setDeleting(null);
        try {
            await purchaseService.remove(target.id);
            setPurchases(prev => prev.filter(p => p.id !== target.id));
            setStats(s => applyStatsDelta(s, target, null));
            setPagination(pg => pg ? { ...pg, total: Math.max(pg.total - 1, 0) } : pg);
            toast.success('Compra eliminada.');
        } catch (err) {
            toast.error(err?.error ?? err?.message ?? 'No se pudo eliminar la compra.');
        }
    };

    const supplierName = suppliers.find(s => s.id === filters.supplier_id)?.name;

    return (
        <div className={styles.page_wrapper}>
            <div className={styles.page_header}>
                <h2 className="title">Cuentas por pagar</h2>
                <button className="btn btn_solid" onClick={openNew}>+ Nueva compra</button>
            </div>

            <div className={styles.container}>
                <div className={styles.filters_sidebar}>
                    <div className={styles.filter_group}>
                        <label>Periodo</label>
                        <div className={styles.button_group}>
                            {RANGE_OPTIONS.map(({ value, label }) => (
                                <button
                                    key={value}
                                    type="button"
                                    className={filters.range === value ? styles.btn_active : styles.btn_inactive}
                                    onClick={() => handleFilterChange('range', value)}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {filters.range === 'custom' && (
                        <div className={styles.date_inputs}>
                            <div>
                                <label>Desde</label>
                                <input
                                    type="date"
                                    value={filters.start_date}
                                    onChange={(e) => handleFilterChange('start_date', e.target.value)}
                                />
                            </div>
                            <div>
                                <label>Hasta</label>
                                <input
                                    type="date"
                                    value={filters.end_date}
                                    onChange={(e) => handleFilterChange('end_date', e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    <div className={styles.divider} />

                    <div className={styles.filter_group}>
                        <label>Estado</label>
                        <select
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                        >
                            {Object.entries(STATUS_OPTIONS).map(([k, label]) => (
                                <option key={k} value={k}>{label}</option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.filter_group}>
                        <label>Proveedor</label>
                        <select
                            value={filters.supplier_id}
                            onChange={(e) => handleFilterChange('supplier_id', e.target.value)}
                        >
                            <option value="">Todos los proveedores</option>
                            {suppliers.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.filter_group}>
                        <label>N° de factura</label>
                        <input
                            type="text"
                            placeholder="Ej: 29696"
                            value={filters.invoice_number}
                            onChange={(e) => handleFilterChange('invoice_number', e.target.value)}
                        />
                    </div>

                    <button className={styles.reset_link} onClick={handleReset}>
                        Limpiar filtros
                    </button>
                </div>

                <div className={styles.content}>
                    {filters.supplier_id && supplierName && (
                        <div className={styles.active_supplier}>
                            Mostrando: <strong>{supplierName}</strong>
                        </div>
                    )}
                    <SupplierPurchaseList
                        loading={loading}
                        purchases={purchases}
                        pagination={pagination}
                        stats={stats}
                        onPageChange={(page) => handleFilterChange('page', String(page))}
                        onRowClick={setDetail}
                        onRegisterPayment={setPayingPurchase}
                        onEdit={openEdit}
                        onDelete={setDeleting}
                    />
                </div>
            </div>

            {showForm && (
                <PurchaseFormModal
                    suppliers={suppliers}
                    purchase={editing}
                    defaultSupplierId={filters.supplier_id}
                    onClose={() => { setShowForm(false); setEditing(null); }}
                    onSaved={handleSaved}
                />
            )}

            {detail && (
                <PurchaseDetailModal
                    purchase={detail}
                    onClose={() => setDetail(null)}
                    onPay={(p) => { setDetail(null); setPayingPurchase(p); }}
                    onEdit={(p) => { setDetail(null); openEdit(p); }}
                    onDelete={(p) => { setDetail(null); setDeleting(p); }}
                />
            )}

            {payingPurchase && (
                <PaymentFormModal
                    purchase={payingPurchase}
                    onClose={() => setPayingPurchase(null)}
                    onSaved={(updated) => { if (updated) applyUpdatedPurchase(updated); }}
                />
            )}

            {deleting && (
                <ConfirmModal
                    title="Eliminar compra"
                    message={`¿Eliminar la compra ${deleting.invoice_number ? `N° ${deleting.invoice_number}` : ''}? Se borrarán también sus pagos.`}
                    onConfirm={confirmDelete}
                    onCancel={() => setDeleting(null)}
                />
            )}
        </div>
    );
}
