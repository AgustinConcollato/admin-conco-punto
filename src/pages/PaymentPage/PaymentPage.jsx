import { useEffect, useMemo, useRef, useState } from "react";
import { normalizeStr } from '../../utils/normalizeStr';
import { useSearchParams } from "react-router-dom";
import { PaymentList } from "../../features/payment/components/PaymentList/PaymentList";
import { ClientService } from "../../services/client/clientService";
import { RANGE_OPTIONS, DEFAULT_RANGE, buildRangeFilters } from "../../utils/rangeHelpers";
import styles from "./PaymentPage.module.css";

const PAYMENT_STATUS_MAP = {
    '': 'Todos',
    pending: 'Pendiente',
    completed: 'Completado',
    failed: 'Fallido',
    refunded: 'Reintegrado',
};

const PAYMENT_METHOD_MAP = {
    '': 'Todos',
    cash: 'Efectivo',
    transfer: 'Transferencia',
    credit_card: 'Tarjeta',
    check: 'Cheque',
};

export function PaymentPage() {
    const [searchParams, setSearchParams] = useSearchParams();

    const clientService = useMemo(() => new ClientService(), []);

    const [clients, setClients] = useState([]);
    const [clientSearch, setClientSearch] = useState('');
    const [clientDropdownOpen, setClientDropdownOpen] = useState(false);
    const searchableRef = useRef(null);

    // Memoizamos los filtros para que su referencia solo cambie
    // cuando cambian los searchParams (no al hacer focus/blur).
    const filters = useMemo(() => ({
        status: searchParams.get("status") || "",
        payment_method: searchParams.get("payment_method") || "",
        order_id: searchParams.get("order_id") || "",
        start_date: searchParams.get("start_date") || "",
        end_date: searchParams.get("end_date") || "",
        range: searchParams.get("range") || DEFAULT_RANGE,
        client_id: searchParams.get("client_id") || "",
        page: searchParams.get("page") || "1",
    }), [searchParams]);

    useEffect(() => {
        const fetchClients = async () => {
            try {
                const res = await clientService.getAll();
                setClients(res || []);
            } catch (e) {
                setClients([]);
            }
        };
        fetchClients();
    }, [clientService]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (searchableRef.current && !searchableRef.current.contains(e.target)) {
                setClientDropdownOpen(false);
                setClientSearch('');
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const handleFilterChange = (name, value) => {
        const newParams = new URLSearchParams(searchParams);

        if (value) {
            newParams.set(name, value);
        } else {
            newParams.delete(name);
        }

        // Si cambio un filtro (que no sea paginación), vuelvo a la página 1
        if (name !== 'page') {
            newParams.set('page', '1');
        }

        // Lógica de rango: si no es custom, borramos fechas manuales
        if (name === 'range' && value !== 'custom') {
            newParams.delete('start_date');
            newParams.delete('end_date');
        }

        setSearchParams(newParams);
    };

    const handleReset = () => {
        setSearchParams({ range: DEFAULT_RANGE, page: '1' });
    };

    const clientNameSelected = clients.find(c => String(c.id) === String(filters.client_id))?.name || '';

    const filtersToSend = useMemo(() => buildRangeFilters(filters), [filters]);

    return (
        <div className={styles.page_wrapper}>
            <h2 className="title">Pagos</h2>
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
                    <div className={styles.filter_group}>
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
                    </div>
                )}

                <div className={styles.filter_group}>
                    <label>Estado</label>
                    <select
                        value={filters.status}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                    >
                        {Object.entries(PAYMENT_STATUS_MAP).map(([k, label]) => (
                            <option key={k} value={k}>{label}</option>
                        ))}
                    </select>
                </div>

                <div className={styles.filter_group}>
                    <label>Método de pago</label>
                    <select
                        value={filters.payment_method}
                        onChange={(e) => handleFilterChange('payment_method', e.target.value)}
                    >
                        {Object.entries(PAYMENT_METHOD_MAP).map(([k, label]) => (
                            <option key={k} value={k}>{label}</option>
                        ))}
                    </select>
                </div>

                <div className={styles.filter_group}>
                    <label>Pedido (UUID)</label>
                    <input
                        type="text"
                        placeholder="order_id..."
                        value={filters.order_id}
                        onChange={(e) => handleFilterChange('order_id', e.target.value)}
                    />
                </div>

                <div className={styles.filter_group}>
                    <label>Filtrar por Cliente</label>

                    <div className={styles.searchable_select} ref={searchableRef}>
                        <input
                            type="text"
                            className={styles.select_input}
                            placeholder="Buscar cliente..."
                            value={clientDropdownOpen ? clientSearch : clientNameSelected}
                            onChange={(e) => {
                                setClientSearch(e.target.value);
                                setClientDropdownOpen(true);
                            }}
                            onFocus={() => setClientDropdownOpen(true)}
                            aria-expanded={clientDropdownOpen}
                        />
                        {filters.client_id && (
                            <button
                                type="button"
                                className={styles.clear_button}
                                onClick={() => {
                                    handleFilterChange('client_id', '');
                                    setClientSearch('');
                                    setClientDropdownOpen(false);
                                }}
                                aria-label="Limpiar cliente"
                            >
                                ×
                            </button>
                        )}

                        {clientDropdownOpen && (
                            <div className={styles.options_list} role="listbox">
                                <div
                                    className={styles.option}
                                    onMouseDown={(e) => { e.preventDefault(); }}
                                    onClick={() => {
                                        handleFilterChange('client_id', '');
                                        setClientDropdownOpen(false);
                                        setClientSearch('');
                                    }}
                                >
                                    Todos los clientes
                                </div>

                                {clients
                                    .filter(c =>
                                        !clientSearch || normalizeStr(c.name).includes(normalizeStr(clientSearch))
                                    )
                                    .slice(0, 50)
                                    .map(client => (
                                        <div
                                            key={client.id}
                                            className={styles.option}
                                            onMouseDown={(e) => { e.preventDefault(); }}
                                            onClick={() => {
                                                handleFilterChange('client_id', String(client.id));
                                                setClientDropdownOpen(false);
                                                setClientSearch('');
                                            }}
                                        >
                                            {client.name}
                                        </div>
                                    ))}
                                {clients.length === 0 && (
                                    <div className={styles.option}>No hay clientes</div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <button className={styles.reset_link} onClick={handleReset}>
                    Limpiar filtros
                </button>
            </div>

            <div className={styles.content}>
                <PaymentList
                    filters={filtersToSend}
                    defaultStatus=""
                    showViewAllLink={false}
                    onPageChange={(page) => handleFilterChange('page', String(page))}
                />
            </div>
            </div>
        </div>
    );
}