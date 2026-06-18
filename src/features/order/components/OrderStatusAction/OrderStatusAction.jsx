import { useMemo, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faCircleNotch } from '@fortawesome/free-solid-svg-icons';
import { ConfirmModal } from '../../../../components/ConfirmModal/ConfirmModal';
import { OrderService } from '../../../../services/order/orderService';
import styles from './OrderStatusAction.module.css';

const NEXT_STEP = {
    pending: { status: 'processing', label: 'Empezar preparación' },
    processing: { status: 'confirmed', label: 'Marcar terminado' },
    confirmed: { status: 'shipped', label: 'Despachar' },
    shipped: { status: 'delivered', label: 'Confirmar entrega' },
};

const CANCELLABLE = ['pending', 'processing', 'confirmed', 'shipped'];

export function OrderStatusAction({ order, onUpdated, compact = false, row = false }) {
    const orderService = useMemo(() => new OrderService(), []);
    const [loading, setLoading] = useState(false);
    const [confirmCancel, setConfirmCancel] = useState(false);

    const next = NEXT_STEP[order.status];
    const canCancel = CANCELLABLE.includes(order.status);

    if (!next && !canCancel) return null;

    const change = async (status) => {
        setLoading(true);
        try {
            await orderService.updateOrderHeader(order.id, { status });
            onUpdated?.();
        } catch (e) {
            console.error('Error al cambiar estado:', e);
        } finally {
            setLoading(false);
            setConfirmCancel(false);
        }
    };

    return (
        <div className={`${styles.wrap} ${compact ? styles.compact : ''} ${row ? styles.row : ''}`} onClick={(e) => e.stopPropagation()}>
            {next && (
                <button
                    className={`btn btn_solid ${styles.next_btn}`}
                    disabled={loading}
                    onClick={() => change(next.status)}
                    title={next.label}
                >
                    {loading
                        ? <FontAwesomeIcon icon={faCircleNotch} spin />
                        : <>{next.label} <FontAwesomeIcon icon={faArrowRight} /></>}
                </button>
            )}
            {canCancel && (
                <button
                    className={`btn ${styles.cancel_btn}`}
                    disabled={loading}
                    onClick={() => setConfirmCancel(true)}
                >
                    Cancelar
                </button>
            )}
            {confirmCancel && (
                <ConfirmModal
                    message="¿Cancelar este pedido? Se devolverá el stock de los productos."
                    onConfirm={() => change('cancelled')}
                    onCancel={() => setConfirmCancel(false)}
                />
            )}
        </div>
    );
}
