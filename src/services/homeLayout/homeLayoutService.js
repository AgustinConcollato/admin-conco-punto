import { apiRequest } from "../../utils/apiRequest";

export class HomeLayoutService {

    /**
     * Lista las imágenes de la biblioteca de medios.
     * @returns {Promise<Array<{id: number, path: string, name: string, url: string, created_at: string}>>}
     */
    async getMedia() {
        return apiRequest("/home-layout/media", {
            method: "GET",
        });
    }

    /**
     * Sube una imagen a la biblioteca de medios.
     * @param {File} file
     * @returns {Promise<{id: number, path: string, name: string, url: string, created_at: string}>}
     */
    async uploadMedia(file) {
        const formData = new FormData();
        formData.append("image", file);

        return apiRequest("/home-layout/media", {
            method: "POST",
            body: formData,
        });
    }

    /**
     * Elimina una imagen de la biblioteca de medios. Falla si está en uso.
     * @param {number} id
     */
    async deleteMedia(id) {
        return apiRequest(`/home-layout/media/${id}`, {
            method: "DELETE",
        });
    }

    /**
     * Lista los diseños guardados junto con cuál está publicado.
     * @returns {Promise<{designs: Array<{id: number, name: string, sections: Array<Object>, created_at: string}>, publishedId: number|null, publishedAt: string|null}>}
     */
    async getDesigns() {
        return apiRequest("/home-layout/presets", {
            method: "GET",
        });
    }

    /**
     * Crea un diseño nuevo con las secciones dadas.
     * @param {string} name
     * @param {Array<Object>} sections
     */
    async savePreset(name, sections) {
        return apiRequest("/home-layout/presets", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ name, sections }),
        });
    }

    /**
     * Actualiza un diseño guardado existente (sobrescribe nombre y secciones).
     * @param {number} id
     * @param {string} name
     * @param {Array<Object>} sections
     */
    async updatePreset(id, name, sections) {
        return apiRequest(`/home-layout/presets/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ name, sections }),
        });
    }

    /**
     * Publica un diseño: lo copia a lo que ve la web pública.
     * @param {number} id
     * @returns {Promise<{publishedId: number, publishedAt: string}>}
     */
    async publishDesign(id) {
        return apiRequest(`/home-layout/presets/${id}/publish`, {
            method: "POST",
        });
    }

    /**
     * Elimina un diseño guardado. Falla si está en vivo.
     * @param {number} id
     */
    async deletePreset(id) {
        return apiRequest(`/home-layout/presets/${id}`, {
            method: "DELETE",
        });
    }
}
