import { useEffect, useState } from "react";
import { Analytics } from "../services/analyticsService";

export function useNetProfit(date) {

    const analytics = new Analytics()

    const [netProfit, setNetProfit] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    useEffect(() => {
        async function fetchNetProfit() {
            try {
                const response = await analytics.netProfit({ year, month });
                setNetProfit(response.net_profit);
            } catch (error) {
                setError(error);
            } finally {
                setLoading(false);
            }
        }

        fetchNetProfit();
    }, [year, month]);

    return { netProfit, loading, error };
}