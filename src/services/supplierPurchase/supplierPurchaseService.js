import { apiRequest } from "../../utils/apiRequest";

export class SupplierPurchaseService {

    /**
     * Lista paginada de compras a proveedores con filtros y estadísticas.
     * @param {object} filters - {supplier_id, status, start_date, end_date, invoice_number, page, per_page}
     */
    async getAll(filters = {}) {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
                params.append(key, value);
            }
        });
        const query = params.toString();
        return apiRequest(`/supplier-purchases${query ? `?${query}` : ""}`, {
            method: "GET",
        });
    }

    /**
     * Crea una compra.
     * @param {object} data - {supplier_id, invoice_number, purchase_date, due_date, total, discount_percent, note}
     */
    async create(data) {
        return apiRequest("/supplier-purchases", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
    }

    /**
     * Actualiza una compra existente.
     * @param {string} id
     * @param {object} data
     */
    async update(id, data) {
        return apiRequest(`/supplier-purchases/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
    }

    /**
     * Elimina una compra (y sus pagos por cascada).
     * @param {string} id
     */
    async remove(id) {
        return apiRequest(`/supplier-purchases/${id}`, {
            method: "DELETE",
        });
    }

    /**
     * Registra un pago parcial sobre una compra.
     * @param {string} purchaseId
     * @param {object} data - {amount, payment_date, payment_method, note}
     */
    async addPayment(purchaseId, data) {
        return apiRequest(`/supplier-purchases/${purchaseId}/payments`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
    }

    /**
     * Elimina un pago parcial.
     * @param {string} paymentId
     */
    async removePayment(paymentId) {
        return apiRequest(`/supplier-purchases/payments/${paymentId}`, {
            method: "DELETE",
        });
    }
}
