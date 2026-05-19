import { apiRequest } from "../../utils/apiRequest";

export class CategoryService {

    async getAll() {
        return apiRequest('/categories', {
            method: "GET"
        });
    }

    async create(data) {
        // data: { name, parent_id? }
        return apiRequest('/categories', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
    }

    async update(id, data) {
        return apiRequest(`/categories/${id}`, {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
    }

    async delete(id) {
        return apiRequest(`/categories/${id}`, {
            method: "DELETE"
        });
    }
}