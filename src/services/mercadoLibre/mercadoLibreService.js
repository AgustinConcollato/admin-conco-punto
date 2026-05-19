import { apiRequest } from "../../utils/apiRequest";

export class MercadoLibreService {

    // -------------------------------------------------------------------------
    // AUTH
    // -------------------------------------------------------------------------

    async getAuthUrl() {
        return apiRequest("/mercado-libre/auth-url", { method: "GET" });
    }

    async exchangeCode(code) {
        return apiRequest("/mercado-libre/callback", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code }),
        });
    }

    async revoke() {
        return apiRequest("/mercado-libre/revoke", { method: "POST" });
    }

    async getProfile() {
        return apiRequest("/mercado-libre/profile", { method: "GET" });
    }

    // -------------------------------------------------------------------------
    // CATEGORÍAS
    // -------------------------------------------------------------------------

    async searchCategories(query) {
        return apiRequest(`/mercado-libre/categories/search?q=${encodeURIComponent(query)}`, {
            method: "GET",
        });
    }

    async getCategoryAttributes(categoryId) {
        return apiRequest(`/mercado-libre/categories/${categoryId}/attributes`, {
            method: "GET",
        });
    }

    // -------------------------------------------------------------------------
    // PUBLICACIONES
    // -------------------------------------------------------------------------

    async publish(data) {
        return apiRequest("/mercado-libre/publications", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
    }

    async getPublications(status = "active") {
        return apiRequest(`/mercado-libre/publications?status=${status}`, {
            method: "GET",
        });
    }

    async getPublication(mlItemId) {
        return apiRequest(`/mercado-libre/publications/${mlItemId}`, {
            method: "GET",
        });
    }

    async updatePublication(mlItemId, data) {
        return apiRequest(`/mercado-libre/publications/${mlItemId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
    }

    async addVariation(mlItemId, data) {
        return apiRequest(`/mercado-libre/publications/${mlItemId}/variations`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
    }

    async deleteVariation(mlItemId, variationId) {
        return apiRequest(`/mercado-libre/publications/${mlItemId}/variations/${variationId}`, {
            method: "DELETE",
        });
    }

    async changeListingType(mlItemId, listingTypeId) {
        return apiRequest(`/mercado-libre/publications/${mlItemId}/listing-type`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ listing_type_id: listingTypeId }),
        });
    }

    async pausePublication(mlItemId) {
        return apiRequest(`/mercado-libre/publications/${mlItemId}/pause`, {
            method: "POST",
        });
    }

    async reactivatePublication(mlItemId) {
        return apiRequest(`/mercado-libre/publications/${mlItemId}/reactivate`, {
            method: "POST",
        });
    }

    async closePublication(mlItemId) {
        return apiRequest(`/mercado-libre/publications/${mlItemId}/close`, {
            method: "POST",
        });
    }

    async getPublicationPerformance(mlItemId) {
        return apiRequest(`/mercado-libre/publications/${mlItemId}/performance`, { method: "GET" });
    }

    async uploadPicture(file) {
        const formData = new FormData();
        formData.append('file', file);
        return apiRequest('/mercado-libre/pictures/upload', {
            method: 'POST',
            body: formData,
            // No Content-Type header — browser lo setea con boundary automáticamente
        });
    }

    async updatePublicationPictures(mlItemId, pictures) {
        return apiRequest(`/mercado-libre/publications/${mlItemId}/pictures`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pictures }),
        });
    }

    // -------------------------------------------------------------------------
    // PRECIOS Y COMISIONES
    // -------------------------------------------------------------------------

    async getListingTypesFees(params) {
        return apiRequest(`/mercado-libre/listing-fees?${params}`, {
            method: "GET"
        });
    }

    async getListingTypesTypes() {
        return apiRequest(`/mercado-libre/listing-types`, {
            method: "GET"
        });
    }

    async getUserShippingPreferences() {
        return apiRequest(`/mercado-libre/shipping-preferences`, {
            method: "GET"
        });
    }

    async getUserShippingCost(params) {
        return apiRequest(`/mercado-libre/shipping-cost?${params}`, {
            method: "GET"
        });
    }
}