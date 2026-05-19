import { useEffect, useState } from "react";
import { api } from "../services/api";

export function useCompareWithPreviousMonth(date) {

    const { Analytics } = api;
    const analytics = new Analytics();

    const [orders, setOrders] = useState(null);
    const [comparison, setComparison] = useState(null); 

    async function getData() {
        const response = await analytics.compareWithPreviousMonth({ year: date.getFullYear(), month: date.getMonth() + 1 });
        setOrders(response.orders);
        setComparison(response.comparison);
    }

    useEffect(() => {
        setOrders(null);
        setComparison(null);
        getData();
    }, [date]);

    return { comparison, orders };
}
