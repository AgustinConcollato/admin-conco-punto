import { apiRequest } from "../../utils/apiRequest";

export class PromotionService {

    /**
     * Obtiene un promoción por ID
     * @param {string} id - ID de la promoción
     * @returns {Promise<Object>} Promoción
     */
    async getById(id) {
        return apiRequest(`/promotions/${id}`, {
            method: "GET"
        });
    }

    /**
     * Obtiene promociones con filtros opcionales.
     * @param {{ is_active?: boolean|string, page?: number, per_page?: number }} filters
     */
    async getAll(filters = {}) {
        const params = new URLSearchParams();

        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
                params.append(key, value);
            }
        });

        const query = params.toString();
        const endpoint = `/promotions${query ? `?${query}` : ""}`;

        return apiRequest(endpoint, {
            method: "GET",
        });
    }

    /**
     * Crea una nueva promoción.
     * Espera los mismos campos que el API de Laravel.
     */
    async create(data) {
        return apiRequest("/promotions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });
    }

    /**
     * Actualiza una promoción existente.
     * @param {string} promotionId
     * @param {object} data
     */
    async update(promotionId, data) {
        return apiRequest(`/promotions/${promotionId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });
    }

    /**
     * Elimina una promoción.
     * @param {string} promotionId
     */
    async delete(promotionId) {
        return apiRequest(`/promotions/${promotionId}`, {
            method: "DELETE",
        });
    }

    /**
     * Reemplaza los productos asociados a una promoción.
     * @param {string} promotionId
     * @param {Array<{id: string, discount_type?: string, discount_value?: number, max_discount_amount?: number, min_quantity?: number}>} products
     */
    async syncProducts(promotionId, products) {
        return apiRequest(`/promotions/${promotionId}/products`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ products }),
        });
    }

    /**
     * Reemplaza las listas de precio asociadas a una promoción.
     * @param {string} promotionId
     * @param {number[]} priceListIds
     */
    async syncPriceLists(promotionId, priceListIds) {
        return apiRequest(`/promotions/${promotionId}/price-lists`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ price_list_ids: priceListIds }),
        });
    }
}

