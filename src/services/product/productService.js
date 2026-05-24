import { apiRequest } from "../../utils/apiRequest";

export class ProductService {

    async createProduct(data) {
        return apiRequest('/products', {
            method: "POST",
            body: data
        });
    }

    async addPrices(data, id) {
        return apiRequest(`/products/add-prices/${id}`, {
            method: "POST",
            body: data
        });
    }

    async addBarcode(data, id) {
        return apiRequest(`/products/${id}/barcode`, {
            method: "POST",
            body: data
        });
    }

    async addImages(data, id) {
        // Importante: 'data' debe ser un FormData para la subida de archivos.
        return apiRequest(`/products/${id}/images`, {
            method: "POST",
            body: data
        });
    }

    /**
     * Obtiene la lista de productos con filtros
     * @param {Object} filters - Filtros de búsqueda
     * @param {string} [filters.search] - Búsqueda por nombre, SKU o descripción
     * @param {string|string[]} [filters.category_id] - ID de categoría(es)
     * @param {string} [filters.supplier_id] - ID de proveedor
     * @param {number} [filters.stock_min] - Stock mínimo
     * @param {number} [filters.stock_max] - Stock máximo
     * @param {number} [filters.price_min] - Precio mínimo
     * @param {number} [filters.price_max] - Precio máximo
     * @param {number} [filters.price_list_id] - ID de lista de precios (default: 1)
     * @param {string} [filters.sort_by] - Campo para ordenar (name, stock, sku, price, created_at, updated_at)
     * @param {string} [filters.sort_order] - Orden (asc, desc)
     * @param {number} [filters.per_page] - Productos por página (1-100, default: 20)
     * @param {number} [filters.page] - Página actual
     * @returns {Promise<Object>} Respuesta con productos y paginación
     */
    async getAll(filters = {}) {
        const params = new URLSearchParams();

        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                if (Array.isArray(value)) {
                    value.forEach(v => params.append(`${key}[]`, v));
                } else {
                    params.append(key, value);
                }
            }
        });

        const queryString = params.toString();
        const endpoint = `/products${queryString ? `?${queryString}` : ''}`;

        return apiRequest(endpoint, {
            method: "GET"
        });
    }

    /**
     * Obtiene un producto por ID
     * @param {string} id - ID del producto
     * @returns {Promise<Object>} Producto
     */
    async getById(id) {
        return apiRequest(`/products/${id}`, {
            method: "GET"
        });
    }

    async getByBarcode(code) {
        return apiRequest(`/products/barcode/${code}`, {
            method: "GET"
        });
    }

    async updateProduct(data, id) {
        return apiRequest(`/products/${id}`, {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
    }

    async syncCategories(data, id) {
        return apiRequest(`/products/${id}/categories`, {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
    }

    async updatePrices(data, id) {
        return apiRequest(`/products/${id}/prices`, {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
    }

    async reorderImages(data, id) {
        return apiRequest(`/products/${id}/images/reorder`, {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
    }

    async destroyBarcode(barcodeId) {
        return apiRequest(`/products/barcodes/${barcodeId}`, {
            method: "DELETE"
        });
    }

    /**
     * DELETE /products/{product}/images/delete -> Elimina imágenes por ID.
     * @param {Object} data - { image_ids: [1, 5, 9] }
     */
    async deleteImages(data, id) {
        return apiRequest(`/products/${id}/images/delete`, {
            method: "DELETE",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
    }

    async updateSuppliersAndPrices(data, productId) {
        return apiRequest(`/products/${productId}/suppliers-prices`, {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
    }

    async updateAttributeValues(productId, attributeValues) {
        return apiRequest(`/products/${productId}/attribute-values`, {
            method: "PUT",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ attribute_values: attributeValues }),
        });
    }

    async updateStatus(status, productId) {
        return apiRequest(`/products/${productId}/status`, {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({status})
        });
    }
}