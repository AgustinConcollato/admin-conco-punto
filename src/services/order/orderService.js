// src/services/OrderService.js

import { apiRequest } from "../../utils/apiRequest";

export class OrderService {

    /**
     * POST /api/orders
     * Crea la cabecera de un nuevo pedido (vacío).
     * @param {object} data - {client_id, shipping_address, notes}
     */
    async create(data) {
        return apiRequest('/orders', {
            method: "POST",
            body: data
        });
    }

    /**
     * 
     * @param {*} filters 
     * @returns 
     */
    async getAll(filters = {}) {
        const params = new URLSearchParams();
    
        // Iteramos sobre el objeto de filtros y agregamos los que tengan valor
        Object.keys(filters).forEach(key => {
            if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
                params.append(key, filters[key]);
            }
        });
    
        const url = `/orders?${params.toString()}`;
    
        return apiRequest(url, {
            method: "GET",
        });
    }

    /**
     * GET /api/orders/{id}
     * Obtiene los detalles de un pedido específico.
     * @param {string} orderId - UUID del pedido
     */
    async getById(orderId) {
        return apiRequest(`/orders/${orderId}`, {
            method: "GET",
        });
    }

    // --- Gestión de Ítems (Productos) ---

    /**
     * POST /api/orders/{orderId}/items
     * Añade un producto al pedido.
     * @param {string} orderId - UUID del pedido
     * @param {object} productData - {product_id, quantity, unit_price_at_sale, line_discount_percentage, ...}
     */
    async addProductToOrder(orderId, productData) {
        return apiRequest(`/orders/${orderId}/product`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(productData)
        });
    }

    /**
     * DELETE /api/orders/items/{orderDetailId}
     * Elimina una línea de producto del pedido.
     * @param {string} orderDetailId - UUID del detalle del pedido (la línea a eliminar)
     */
    async removeProductFromOrder(orderDetailId) {
        return apiRequest(`/orders/product/${orderDetailId}`, {
            method: "DELETE",
        });
    }

    // --- Gestión de Descuentos/Costos Globales (Opcional, si usas PUT/PATCH) ---

    /**
     * PUT /api/orders/{id}
     * Actualiza la cabecera del pedido (ej. aplicar descuentos o cambiar dirección).
     * @param {string} orderId - UUID del pedido
     * @param {object} updateData - {discount_percentage, shipping_cost, shipping_address}
     */
    async updateOrderHeader(orderId, updateData) {
        return apiRequest(`/orders/${orderId}`, {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        });
    }

    /**
     * PUT /api/orders/products/{orderDetailId}
     * Modifica los datos de una línea de producto (cantidad, precios, descuentos).
     * @param {string} orderDetailId - UUID del detalle del pedido (la línea a modificar)
     * @param {object} updateData - {quantity, unit_price, discount_percentage, discount_fixed_amount, ...}
     */
    async updateProductInOrder(orderDetailId, updateData) {
        return apiRequest(`/orders/product/${orderDetailId}`, {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        });
    }

    /**
     * GET /api/orders/{id}/pdf
     * Descarga el PDF del comprobante de compra de un pedido.
     * @param {string} orderId - UUID del pedido
     */
    async downloadPdf(orderId) {
        return apiRequest(`/orders/${orderId}/pdf`, {
            method: "GET",
            responseType: 'arrayBuffer'
        });
    }
}