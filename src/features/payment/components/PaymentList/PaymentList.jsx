import { faCircleNotch, faCreditCard, faMoneyBillWave } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Pagination } from "../../../../components/Pagination/Pagination";
import { PaymentService } from "../../../../services/payments/paymentsService";
import { formatDate } from "../../../../utils/formatDate";
import { formatPrice } from "../../../../utils/formatPrice";
import styles from './PaymentList.module.css';

const PAYMENT_ICONS = {
    'transfer': faCreditCard,
    'cash': faMoneyBillWave,
    'credit_card': faCreditCard,
};

export function PaymentList({
    filters = {},
    defaultStatus = 'completed',
    showViewAllLink = false,
    onPageChange = null,
}) {

    const paymentService = useMemo(() => new PaymentService(), []);

    const [loadingPayments, setLoadingPayments] = useState(false);
    const [payments, setPayments] = useState([]);
    const [pagination, setPagination] = useState(null);

    const loadPayments = async (incomingFilters) => {
        setLoadingPayments(true);
        try {
            const baseFilters = incomingFilters || {};
            const page = Number(baseFilters.page || 1);
            const statusToUse = baseFilters.status || defaultStatus;
            const paymentsRes = await paymentService.getPayments({
                ...baseFilters,
                page,
                status: statusToUse,
            });
            setPayments(paymentsRes.data || []);
            setPagination({
                current_page: paymentsRes.current_page || 1,
                last_page: paymentsRes.last_page || 1,
                per_page: paymentsRes.per_page || 20,
                total: paymentsRes.total || 0,
            });
        } catch (err) {
            console.log(err);
            setPayments([]);
            setPagination(null);
        } finally {
            setLoadingPayments(false);
        }
    };

    useEffect(() => {
        loadPayments(filters);
    }, [filters]);

    return (
        <>
            {!loadingPayments ?
                <section className={styles.payments_section}>
                    <div className={styles.header}>
                        <h3>Pagos completados</h3>
                        {showViewAllLink && filters && Object.keys(filters).length > 0 &&
                            <Link
                                to={`/pagos?start_date=${filters.start_date || ''}&end_date=${filters.end_date || ''}&range=${filters.range || ''}&client_id=${filters.client_id || ''}`}
                                className="btn "
                            >
                                Ver todos
                            </Link>
                        }
                    </div>
                    {pagination && (
                        <p style={{ marginTop: 8, marginBottom: 8 }}>
                            Mostrando {payments?.length || 0} de {pagination.total} pagos
                        </p>
                    )}
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Monto</th>
                                <th>Método de pago</th>
                                <th>Cliente</th>
                                {/* <th>Estado</th> */}
                                <th>Pedido</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payments && payments.length > 0 ? (
                                payments.map((p) => (
                                    <tr key={p.id}>
                                        <td>{formatDate(p.payment_date || p.created_at, 'short')}</td>
                                        <td>{formatPrice(Number(p.amount))}</td>
                                        <td>
                                            <div>
                                                <FontAwesomeIcon
                                                    icon={PAYMENT_ICONS[p.payment_method] || faMoneyBillWave}
                                                    className={styles.payment_icon}
                                                />
                                                {p.payment_method === 'cash' ? 'Efectivo' :
                                                    p.payment_method === 'transfer' ? 'Transferencia' :
                                                        p.payment_method === 'credit_card' ? 'Tarjeta de crédito/débito' :
                                                            'Cheque'
                                                }
                                            </div>
                                        </td>
                                        <td>{p.order?.client?.name || '-'}</td>
                                        {/* <td>{p.status}</td> */}
                                        <td>
                                            <div>
                                                <span>{String(p.order_id).split('-')[0]}</span>
                                                <Link to={`/ventas/${p.order_id}`}>Ver</Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5">No hay datos de pagos</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    {pagination && pagination.last_page > 1 && (
                        <Pagination
                            currentPage={pagination.current_page}
                            lastPage={pagination.last_page}
                            onPageChange={(page) => onPageChange?.(page)}
                        />
                    )}
                </section> :
                <FontAwesomeIcon icon={faCircleNotch} spin />
            }
        </>

    );
}