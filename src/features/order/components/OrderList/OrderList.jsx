import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Pagination } from '../../../../components/Pagination/Pagination';
import { ViewToggle } from '../../../../components/ViewToggle/ViewToggle';
import { useMediaQuery } from '../../../../hooks/useMediaQuery';
import { useViewMode } from '../../../../hooks/useViewMode';
import { ClientService } from '../../../../services/client/clientService';
import { OrderService } from '../../../../services/order/orderService';
import { normalizeStr } from '../../../../utils/normalizeStr';
import { DEFAULT_RANGE, RANGE_OPTIONS, buildRangeFilters } from '../../../../utils/rangeHelpers';
import { OrderCard } from '../OrderCard/OrderCard';
import { OrderRow } from '../OrderRow/OrderRow';
import styles from './OrderList.module.css';

const ORDER_STATUSES_MAP = {
    '': 'Todos',
    'pending': 'Pendiente',
    'processing': 'Preparación',
    'confirmed': 'Terminados',
    'shipped': 'Enviado',
    'delivered': 'Entregado',
    'cancelled': 'Cancelado'
};

const ORDER_STATUS_KEYS = Object.keys(ORDER_STATUSES_MAP);

export function OrderList() {
    // 1. Hook para manejar la URL
    const [searchParams, setSearchParams] = useSearchParams();

    const [orders, setOrders] = useState([]);
    const [clients, setClients] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [pagination, setPagination] = useState(null);
    const [clientSearch, setClientSearch] = useState('');
    const [clientDropdownOpen, setClientDropdownOpen] = useState(false);
    const searchableRef = useRef(null);

    // 2. Servicios (Instanciados fuera o con useMemo para evitar recreaciones)
    const orderService = useMemo(() => new OrderService(), []);
    const clientService = useMemo(() => new ClientService(), []);

    // 3. Obtener filtros iniciales desde la URL o valores por defecto
    const filters = {
        status: searchParams.get('status') || '',
        start_date: searchParams.get('start_date') || '',
        end_date: searchParams.get('end_date') || '',
        range: searchParams.get('range') || DEFAULT_RANGE,
        client_id: searchParams.get('client_id') || '',
        with_debt: searchParams.get('with_debt') || '',
        search: searchParams.get('search') || '',
        page: searchParams.get('page') || '1'
    };

    const [viewMode, setViewMode] = useViewMode('ordersViewMode');
    const isMobile = useMediaQuery('(max-width: 768px)');
    const effectiveView = isMobile ? 'cards' : viewMode;

    // Búsqueda con debounce: el input es local, se vuelca a la URL tras 400ms
    const [searchInput, setSearchInput] = useState(filters.search);
    useEffect(() => {
        if (searchInput === filters.search) return;
        const t = setTimeout(() => handleFilterChange('search', searchInput.trim()), 400);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchInput]);

    useEffect(() => {
        const fetchClients = async () => {
            try {
                const res = await clientService.getAll({ per_page: 100 });
                setClients(res.data ?? []);
            } catch (error) { console.error("Error clientes:", error); }
        };
        fetchClients();
    }, [clientService]);

    // Cerrar dropdown cuando se hace clic fuera
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

    // 4. Cada vez que cambian los searchParams, pedimos los pedidos
    useEffect(() => {
        getOrders();
    }, [searchParams]);

    const getOrders = async () => {
        setIsLoading(true);
        try {
            const response = await orderService.getAll(buildRangeFilters(filters));

            setPagination({
                current_page: response.current_page || 1,
                last_page: response.last_page || 1,
                per_page: response.per_page || 20,
                total: response.total || 0,
            });

            const data = response.data;
            setOrders(Array.isArray(data) ? data : []);
        } catch (error) {
            setOrders([]);
        } finally {
            setIsLoading(false);
        }
    };

    // 5. Actualizar la URL en lugar de un estado local
    const handleFilterChange = (name, value) => {
        const newParams = new URLSearchParams(searchParams);

        if (value) {
            newParams.set(name, value);
        } else {
            newParams.delete(name);
        }

        // Lógica especial para el rango: si no es custom, borramos fechas manuales
        if (name === 'range' && value !== 'custom') {
            newParams.delete('start_date');
            newParams.delete('end_date');
        }

        if (name !== 'page') {
            newParams.delete('page');
        }

        setSearchParams(newParams);
    };

    const handlePageChange = (page) => {
        setPagination(null);
        handleFilterChange('page', page.toString());
    };

    const handleReset = () => {
        setSearchInput('');
        setSearchParams({ range: DEFAULT_RANGE, page: 1 });
    };

    return (
        <div className={styles.container}>
            <div className={styles.filters_sidebar}>

                {/* 1. Barra de Estados como Botones */}
                <div className={styles.filter_group}>
                    <label>Estado del Pedido</label>
                    <div className={styles.button_grid}>
                        {ORDER_STATUS_KEYS.map((key) => (
                            <button
                                key={key}
                                type="button"
                                className={filters.status === key ? styles.btn_active : styles.btn_inactive}
                                onClick={() => handleFilterChange('status', key)}
                            >
                                {ORDER_STATUSES_MAP[key]}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 2. Barra de Periodo como Botones */}
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

                {/* 3. Inputs de Fecha Condicionales */}
                {filters.range === 'custom' && (
                    <div className={`${styles.filter_group} ${styles.fade_in}`}>
                        <div className={styles.date_inputs}>
                            <div>
                                <label>Desde:</label>
                                <input
                                    type="date"
                                    value={filters.start_date}
                                    onChange={(e) => handleFilterChange('start_date', e.target.value)}
                                />
                            </div>
                            <div>
                                <label>Hasta:</label>
                                <input
                                    type="date"
                                    value={filters.end_date}
                                    onChange={(e) => handleFilterChange('end_date', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* 4. Filtro por Deuda */}
                <div className={styles.filter_group}>
                    <label>Pedidos con deuda</label>
                    <label className={styles.inputs_radio}>
                        <input
                            type="radio"
                            name='with_debt'
                            onChange={() => handleFilterChange('with_debt', '1')}
                            checked={filters.with_debt === '1'}
                        />
                        Si
                    </label>
                    <label className={styles.inputs_radio}>
                        <input
                            type="radio"
                            name='with_debt'
                            onChange={() => handleFilterChange('with_debt', '')}
                            checked={filters.with_debt === ''}
                        />
                        Todos los pedidos
                    </label>
                </div>

                {/* 5. Selector de Cliente (Sigue siendo Select por ser muchos) */}
                <div className={styles.filter_group}>
                    <label>Filtrar por Cliente</label>

                    <div className={styles.searchable_select} ref={searchableRef}>
                        <div className={styles.search_input_wrapper}>
                            <input
                                type="text"
                                className={styles.select_input}
                                placeholder="Buscar cliente..."
                                value={clientDropdownOpen ? clientSearch : (clients.find(c => String(c.id) === String(filters.client_id))?.name || '')}
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
                        </div>

                        {clientDropdownOpen && (
                            <div className={styles.options_list} role="listbox">
                                <div
                                    className={styles.option}
                                    onMouseDown={(e) => { e.preventDefault(); /* evita blur */ }}
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

            <div className={styles.order_content}>
                <div className={styles.header}>
                    <h3>Pedidos</h3>
                    {pagination && (
                        <p className={styles.count}>
                            Mostrando {orders?.length || 0} de {pagination.total} pedidos
                        </p>
                    )}
                </div>

                <div className={styles.toolbar}>
                    <div className={styles.search_box}>
                        <input
                            type="text"
                            className={styles.search_input}
                            placeholder="Buscar por número o cliente…"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                        />
                        {searchInput && (
                            <button
                                type="button"
                                className={styles.search_clear}
                                onClick={() => setSearchInput('')}
                                aria-label="Limpiar búsqueda"
                            >
                                ×
                            </button>
                        )}
                    </div>
                    {!isMobile && <ViewToggle value={viewMode} onChange={setViewMode} />}
                </div>
                {isLoading ? (
                    <div className={styles.loader}>Cargando pedidos...</div>
                ) : (
                    <div className={effectiveView === 'table' ? styles.order_rows : styles.order_list}>
                        {orders.length > 0 ? (
                            orders.map((order) => {
                                const onRefresh = (updatedOrder) => {
                                    if (updatedOrder) {
                                        setOrders(prev => prev.map(o => o.id === updatedOrder.id ? { ...o, ...updatedOrder } : o));
                                    } else {
                                        getOrders();
                                    }
                                };
                                return effectiveView === 'table'
                                    ? <OrderRow key={order.id} order={order} onRefresh={onRefresh} />
                                    : <OrderCard key={order.id} order={order} onRefresh={onRefresh} />;
                            })
                        ) : (
                            <p className={styles.empty_msg}>No se encontraron pedidos para este filtro.</p>
                        )}
                    </div>
                )}
                {pagination && pagination.last_page > 1 && (
                    <Pagination
                        currentPage={pagination.current_page}
                        lastPage={pagination.last_page}
                        onPageChange={handlePageChange}
                    />
                )}
            </div>
        </div>
    );
}

