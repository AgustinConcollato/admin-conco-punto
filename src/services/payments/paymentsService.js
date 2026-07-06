// src/services/PaymentService.js

import { apiRequest } from "../../utils/apiRequest";

export class PaymentService {

    /**
     * POST /api/payments
     * Registra un nuevo pago.
     * @param {object} data - {order_id, amount, payment_method, transaction_id}
     */
    async create(data) {
        return apiRequest('/payments', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
    }

    /**
     * POST /api/payments/refund
     * Registra un reembolso para un pedido.
     * @param {object} data - {order_id, amount, reason, original_transaction_id}
     */
    async refund(data) {
        return apiRequest('/payments/refund', {
            method: "POST",
            body: data
        });
    }

    /**
     * POST /api/clients/{clientId}/payments
     * Registra un pago a nivel cliente: se reparte a los pedidos con deuda (FIFO)
     * y lo que sobra queda como saldo a favor.
     * @param {string} clientId - UUID del cliente
     * @param {object} data - {amount, payment_method, note?}
     */
    async createClientPayment(clientId, data) {
        return apiRequest(`/clients/${clientId}/payments`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
    }

    /**
     * GET /api/payments/{order}
     * Obtiene el historial de pagos de un pedido específico.
     * @param {string} orderId - UUID del pedido
     */
    async getPaymentsByOrder(orderId) {
        // La ruta usa el ID/UUID del pedido
        return apiRequest(`/payments/${orderId}`, {
            method: "GET",
        });
    }

    /**
     * GET /api/payments
     * Muestra una lista de todos los pagos.
     * @param {object} filters - {start_date,end_date,status,payment_method,order_id,client_id}
     */
    async getPayments(filters) {

        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
                params.append(key, value);
            }
        });
        const query = params.toString();
        const endpoint = `/payments${query ? `?${query}` : ""}`;

        return apiRequest(endpoint, {
            method: "GET",
        });
    }
}