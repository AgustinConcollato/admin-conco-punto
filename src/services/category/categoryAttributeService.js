import { apiRequest } from "../../utils/apiRequest";

export class CategoryAttributeService {

    async getAll(categoryId) {
        return apiRequest(`/categories/${categoryId}/attributes`, { method: "GET" });
    }

    async create(categoryId, data) {
        return apiRequest(`/categories/${categoryId}/attributes`, {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
    }

    async update(categoryId, attributeId, data) {
        return apiRequest(`/categories/${categoryId}/attributes/${attributeId}`, {
            method: "PUT",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
    }

    async delete(categoryId, attributeId) {
        return apiRequest(`/categories/${categoryId}/attributes/${attributeId}`, {
            method: "DELETE",
        });
    }
}
