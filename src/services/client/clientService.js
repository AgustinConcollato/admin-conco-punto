import { apiRequest } from "../../utils/apiRequest";

export class ClientService {

    async create(data) {
        return apiRequest('/clients', {
            method: "POST",
            body: data
        });
    }

    async getAll() {
        return apiRequest('/clients', {
            method: "GET"
        });
    }

    async getById(id) {
        return apiRequest(`/clients/${id}`, {
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