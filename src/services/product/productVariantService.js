import { apiRequest } from "../../utils/apiRequest";

export class ProductVariantService {

    async getAll(productId) {
        return apiRequest(`/products/${productId}/variants`, { method: "GET" });
    }

    async create(productId, data) {
        return apiRequest(`/products/${productId}/variants`, {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
    }

    async update(productId, variantId, data) {
        return apiRequest(`/products/${productId}/variants/${variantId}`, {
            method: "PUT",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
    }

    async delete(productId, variantId) {
        return apiRequest(`/products/${productId}/variants/${variantId}`, {
            method: "DELETE",
        });
    }

    async search(q) {
        return apiRequest(`/products/variants/search?q=${encodeURIComponent(q)}`, { method: "GET" });
    }

    async addBarcode(productId, variantId, barcode) {
        return apiRequest(`/products/${productId}/variants/${variantId}/barcode`, {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ barcode }),
        });
    }
}
