import { apiRequest } from "../../utils/apiRequest";

export class SupplierService {

    /**
     * Obtener todos los proveedores.
     * @returns 
     */
    async getAll() {
        return apiRequest('/suppliers', {
            method: "GET"
        });
    }

    /**
     * Crea un nuevo proveedor.
     * @param {FormData} data - Datos del nuevo proveedor (name, email, etc.)
     */
    async createSupplier(data) {
        return apiRequest('/suppliers', {
            method: "POST",
            body: data
        });
    }

    /**
     * Actualiza un proveedor existente.
     * @param {Object} data - Datos a actualizar del proveedor (name, email, etc.)
     * @param {string} supplierId - ID del proveedor a actualizar.
     */
    async updateSupplier(data, supplierId) {
        return apiRequest(`/suppliers/${supplierId}`, {
            method: "PUT", // Usamos PUT para la actualización
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
    }
}