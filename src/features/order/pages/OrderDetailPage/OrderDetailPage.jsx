import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { OrderService } from "../../../../services/order/orderService";
import { Loading } from "../../../../components/Loading/Loading";
import { Modal } from "../../../../components/Modal/Modal";
import { CreatePayment } from "../../../payment/components/CreatePayment/CreatePayment";
import { PaymentsList } from "../../components/PaymentsList/PaymentsList";
import { LogisticsStepper } from "../../../sales/components/LogisticsStepper/LogisticsStepper";
import { OrderDetailHeader } from "../../components/OrderDetailHeader/OrderDetailHeader";
import { OrderDetailInfo } from "../../components/OrderDetailInfo/OrderDetailInfo";
import { OrderProductsTable } from "../../components/OrderProductsTable/OrderProductsTable";
import { OrderPriceSummary } from "../../components/OrderPriceSummary/OrderPriceSummary";
import { formatPrice } from "../../../../utils/formatPrice";
import styles from './OrderDetailPage.module.css';

export function OrderDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const orderService = useMemo(() => new OrderService(), []);

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    const fetchOrder = useCallback(async () => {
        try {
            const data = await orderService.getById(id);
            setOrder(data);
        } catch (err) {
            const msg = err?.error ?? err?.message ?? '';
            if (msg === "Pedido no encontrado") {
                toast.error('El pedido no existe.');
                navigate('/pedidos');
                return;
            }
            toast.error('No se pudo cargar el pedido.');
        } finally {
            setLoading(false);
        }
    }, [id, orderService, navigate]);

    useEffect(() => {
        document.title = 'Detalle de pedido';
        fetchOrder();
    }, [fetchOrder]);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                <Loading />
            </div>
        );
    }

    if (!order) return null;

    const isPaid = order.balance_due <= 0;
    const notCancelled = order.status !== 'cancelled';

    const handlePaymentRecorded = () => {
        setShowPaymentModal(false);
        fetchOrder();
    };

    return (
        <div className={styles.page}>
            <OrderDetailHeader order={order} onUpdated={fetchOrder} />

            <div className={styles.body}>
                <div className={styles.main}>
                    <OrderDetailInfo order={order} />

                    <div className={styles.card}>
                        <LogisticsStepper status={order.status} />
                    </div>

                    <div className={styles.section}>
                        <p className={styles.section_label}>Productos ({order.details.length})</p>
                        <OrderProductsTable details={order.details} />
                    </div>

                    <OrderPriceSummary order={order} />
                </div>

                <div className={styles.sidebar}>
                    <div className={styles.card}>
                        <p className={styles.card_label}>Pagos</p>

                        {notCancelled && (
                            <div className={styles.balance_row}>
                                <span>{isPaid ? 'Totalmente pagado' : 'Saldo pendiente'}</span>
                                <strong className={isPaid ? styles.paid : styles.pending}>
                                    {formatPrice(isPaid ? order.final_total_amount : order.balance_due)}
                                </strong>
                            </div>
                        )}

                        <PaymentsList
                            payments={order.payments}
                            breakdown={{
                                total: parseFloat(order.final_total_amount),
                                cost: parseFloat(order.total_cost || 0),
                                shipping: parseFloat(order.shipping_cost || 0),
                                profit: parseFloat(order.final_total_amount) - parseFloat(order.shipping_cost) - parseFloat(order.total_cost || 0),
                                savings: (parseFloat(order.final_total_amount) - parseFloat(order.shipping_cost) - parseFloat(order.total_cost || 0)) * 0.10,
                            }}
                        />

                        {!isPaid && notCancelled && (
                            <button className="btn btn_solid" style={{ width: '100%', marginTop: 12 }} onClick={() => setShowPaymentModal(true)}>
                                Registrar pago
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {showPaymentModal && (
                <Modal onClose={() => setShowPaymentModal(false)} title="Registrar pago">
                    <CreatePayment orderId={order.id} balanceDue={order.balance_due} onSuccess={handlePaymentRecorded} />
                </Modal>
            )}
        </div>
    );
}
