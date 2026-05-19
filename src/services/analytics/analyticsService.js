import { apiRequest } from "../../utils/apiRequest";

export class AnalyticsService {

    /**
     * Obtiene datos de analytics desde la API.
     * @param {Object} [filters] Opciones: start_date, end_date, range, status, client_id
     */
    async getAnalyticsData(filters = {}) {
        const params = new URLSearchParams();

        if (filters.start_date) params.append('start_date', filters.start_date);
        if (filters.end_date) params.append('end_date', filters.end_date);
        if (filters.range) params.append('range', filters.range);
        if (filters.status) params.append('status', filters.status);
        if (filters.client_id) params.append('client_id', filters.client_id);

        const query = params.toString() ? `?${params.toString()}` : '';

        try {
            const data = await apiRequest(`/analytics/overview${query}`, { method: 'GET' });
            return data;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Comparar dos meses en el backend.
     * params: { month_a, year_a, month_b, year_b }
     */
    async compareMonths(params = {}) {
        const qs = new URLSearchParams();
        if (params.month_a) qs.append('month_a', params.month_a);
        if (params.year_a) qs.append('year_a', params.year_a);
        if (params.month_b) qs.append('month_b', params.month_b);
        if (params.year_b) qs.append('year_b', params.year_b);

        const query = qs.toString() ? `?${qs.toString()}` : '';

        try {
            const data = await apiRequest(`/analytics/compare-months${query}`, { method: 'GET' });
            return data;
        } catch (error) {
            throw error;
        }
    }

}