import { apiRequest } from "../../utils/apiRequest";

export class ClientService {

    async create(data) {
        return apiRequest('/clients', {
            method: "POST",
            body: data
        });
    }

    async getAll(params = {}) {
        const qs = new URLSearchParams(
            Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v != null))
        ).toString();
        return apiRequest(`/clients${qs ? `?${qs}` : ''}`, { method: 'GET' });
    }

    async getById(id) {
        return apiRequest(`/clients/${id}`, {
            method: "GET"
        });
    }

    async getCredits(id) {
        return apiRequest(`/clients/${id}/credits`, {
            method: "GET"
        });
    }

    async update(id, data) {
        return apiRequest(`/clients/${id}`, {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
    }

    async delete(id) {
        return apiRequest(`/clients/${id}`, {
            method: "DELETE"
        });
    }
}