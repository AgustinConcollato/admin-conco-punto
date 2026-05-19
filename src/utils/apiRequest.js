import { API_URL } from "../config/api";

/**
 * @typedef {Object} ApiRequestOptions
 * @property {"GET"|"POST"|"PUT"|"PATCH"|"DELETE"} [method]
 * @property {Record<string,string>|null} [headers]
 * @property {BodyInit|null} [body]
 */

/**
 * @template T
 * @param {string} endpoint
 * @param {ApiRequestOptions} [options]
 * @returns {Promise<T|null>}
 */

export async function apiRequest(endpoint, options = {}) {
    const token = localStorage.getItem('auth_token')

    const responseType = options.responseType || 'json';

    options.headers = {
        ...options.headers,
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        ...(token && { Authorization: `Bearer ${token}` })
    };

    try {
        const response = await fetch(`${API_URL}${endpoint}`, options);

        if (!response.ok) {
            const error = await response.json();
            throw error;
        }

        if (response.status === 204) return null;

        if (responseType === 'arrayBuffer') {
            return response.arrayBuffer();
        }

        return response.json();
    } catch (error) {
        throw error;
    }
}
