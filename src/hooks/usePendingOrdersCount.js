import { useState, useEffect } from 'react';
import { OrderService } from '../services/order/orderService';

const orderService = new OrderService();

export function usePendingOrdersCount(reload) {
    const [count, setCount] = useState(0);

    const fetchCount = async () => {
        try {
            const res = await orderService.getPendingCount();
            setCount(res.count ?? 0);
        } catch {}
    };

    useEffect(() => {
        fetchCount();
    }, [reload]);

    return count;
}