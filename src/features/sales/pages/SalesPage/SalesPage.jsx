import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import { normalizeStr } from '../../../../utils/normalizeStr';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Loading } from "../../../../components/Loading/Loading";
import { OrderProvider } from "../../../../context/OrderContext";
import { SalesLayout } from "../../../../components/layout/SalesLayout/SalesLayout";
import { ClientService } from "../../../../services/client/clientService";
import { OrderService } from "../../../../services/order/orderService";
import { PriceListService } from "../../../../services/priceList/priceListService";
import { formatDate } from "../../../../utils/formatDate";
import { formatPrice } from "../../../../utils/formatPrice";
import styles from './SalesPage.module.css';

export function SalesPage() {

    const { id } = useParams();
    const navigate = useNavigate();

    const clientService = useMemo(() => new ClientService(), []);
    const orderService = useMemo(() => new OrderService(), []);
    const priceListService = useMemo(() => new PriceListService(), []);


    const [clients, setClients] = useState([]);
    const [pendingOrders, setPendingOrders] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState({});
    const [priceLists, setPriceLists] = useState([]);

    const [selectedClientId, setSelectedClientId] = useState("");
    const [selectedPriceListId, setSelectedPriceListId] = useState("");
    const [clientSearch, setClientSearch] = useState('');
    const [clientDropdownOpen, setClientDropdownOpen] = useState(false);
    const clientSelectRef = useRef(null);

    const getPriceLists = async () => {
        try {
            setPriceLists(await priceListService.get());
        } catch (error) {

        }
    };

    const getClients = async () => {

        try {
            const response = await clientService.getAll({ per_page: 100 });
            setClients(response.data ?? []);
        } catch (error) {
            console.log(error)
        }
    };

    const createOrder = async () => {
        setIsLoading(true);

        const formData = new FormData();
        if (selectedClientId) {
            formData.append('client_id', selectedClientId);
        }

        if (selectedPriceListId) {
            formData.append('price_list_id', selectedPriceListId);
        }

        try {
            const response = await orderService.create(formData);
            navigate(`/ventas/${response.order.id}`);
        } catch (error) {
            setError(error[0])
        } finally {
            setIsLoading(false);
        }
    };

    const getPendingsOrders = async () => {

        try {
            const response = await orderService.getAll({ status: 'processing' })
            setPendingOrders(response.data);
        } catch (error) {
            console.log(error)
        }
    };

    useEffect(() => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        if (!id) {
            document.title = 'Nuevo pedido y pedidos en proceso';
            getClients();
            setPendingOrders(null);
            getPendingsOrders();
            getPriceLists();
        }
    }, [id]);

    // Cerrar dropdown cuando se hace clic fuera
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (clientSelectRef.current && !clientSelectRef.current.contains(e.target)) {
                setClientDropdownOpen(false);
                setClientSearch('');
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    useEffect(() => {
        const client = clients.find(c => c.id.toString() === selectedClientId);

        if (client && client.price_list) {
            setSelectedPriceListId(client.price_list.id);
        } else if (selectedClientId === "") {
            setSelectedPriceListId("");
        }
    }, [selectedClientId, clients]);

    return (
        <>
            {id ?
                <OrderProvider>
                    <SalesLayout orderId={id} />
                </OrderProvider> :
                <div className={styles.page}>
                    <div className={styles.create_order}>
                        <h2 className="title">Empezar nuevo pedido</h2>
                        <div className="input_group">
                            <span>Clientes</span>

                            <div className={styles.searchable_select} ref={clientSelectRef}>
                                <div className={styles.search_input_wrapper}>
                                    <input
                                        type="text"
                                        className='input'
                                        placeholder={'Seleccionar cliente (opcional)'}
                                        value={clientDropdownOpen ? clientSearch : (clients.find(c => String(c.id) === String(selectedClientId))?.name || '')}
                                        onChange={(e) => {
                                            setClientSearch(e.target.value);
                                            setClientDropdownOpen(true);
                                        }}
                                        onFocus={() => setClientDropdownOpen(true)}
                                    />
                                    {selectedClientId && (
                                        <button
                                            type="button"
                                            className={styles.clear_button}
                                            onClick={() => {
                                                setSelectedClientId('');
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
                                            onMouseDown={(e) => { e.preventDefault(); }}
                                            onClick={() => {
                                                setSelectedClientId('');
                                                setClientDropdownOpen(false);
                                                setClientSearch('');
                                            }}
                                        >
                                            Seleccionar cliente (opcional)
                                        </div>

                                        {clients
                                            .filter(c => !clientSearch || normalizeStr(c.name).includes(normalizeStr(clientSearch)))
                                            .slice(0, 50)
                                            .map(c => (
                                                <div
                                                    key={c.id}
                                                    className={styles.option}
                                                    onMouseDown={(e) => { e.preventDefault(); }}
                                                    onClick={() => {
                                                        setSelectedClientId(String(c.id));
                                                        setClientDropdownOpen(false);
                                                        setClientSearch('');
                                                    }}
                                                >
                                                    {c.name}
                                                </div>
                                            ))}
                                        {clients.length === 0 && (
                                            <div className={styles.option}>No hay clientes</div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {error.client_id && <p className={styles.error}>{error.client_id[0]}</p>}
                        </div>
                        <div className="input_group">
                            <span>Lista de precios</span>
                            <select
                                value={selectedPriceListId}
                                onChange={e => setSelectedPriceListId(e.target.value)}
                                className='input'
                            >
                                <option value={""}>Seleccionar lista de precio del pedido</option>
                                {priceLists.map(e =>
                                    <option value={e.id}>{e.name}</option>
                                )}
                            </select>
                            {error.price_list_id && <p className={styles.error}>{error.price_list_id[0]}</p>}
                        </div>
                        <button
                            className='btn btn_solid'
                            disabled={isLoading}
                            onClick={createOrder}
                        >
                            {isLoading ? <FontAwesomeIcon icon={faCircleNotch} spin /> : 'Crear pedido'}
                        </button>
                    </div>
                    <div>
                        <h3 className="title">Pedidos sin terminar</h3>
                        {pendingOrders ?
                            pendingOrders.length > 0 ?
                                <ul>
                                    {
                                        pendingOrders.map(e =>
                                            <li>
                                                <Link
                                                    className={styles.active_sales}
                                                    to={`/ventas/${e.id}`}
                                                >
                                                    <h3>
                                                        <span>Cliente: </span>
                                                        {e.client_id ?
                                                            e.client.name :
                                                            'Sin asignar'
                                                        }
                                                    </h3>
                                                    <span>Iniciada el {formatDate(e.created_at, 'short')}</span>
                                                    <span>Monto actual {formatPrice(e.final_total_amount)}</span>
                                                    <button className="btn btn_regular">Continuar</button>
                                                </Link>
                                            </li>
                                        )
                                    }
                                </ul> :
                                <p className={styles.no_orders}>No hay ventas activas en este momento</p> :
                            <Loading />
                        }
                    </div>
                </div >
            }
        </>
    )
}


