import { apiRequest } from "../../utils/apiRequest";

export class AuthService {

    async isAuthenticated() {
        return apiRequest('/authentication', {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            }
        });
    }

    async register(formData) {
        return apiRequest('/register', {
            method: "POST",
            body: formData
        });
    }

    async login(formData) {
        return apiRequest('/login', {
            method: "POST",
            body: formData
        })
    }

    async logout() {
        return apiRequest('/logout', {
            method: "POST"
        });
    }
}