import { createContext, useEffect, useState } from "react";
import { AuthService } from "../services/auth/authService";

export const AuthContext = createContext();

export function AuthProvider({ children }) {

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const isAuthenticated = async () => {
        setLoading(true);
        const auth = new AuthService();
        try {
            const user = await auth.isAuthenticated();
            setUser(user);
            return
        } catch (error) {
            setUser(null);
            return
        } finally {
            setLoading(false);
        }
    };

    const register = async (formData) => {
        const auth = new AuthService();
        try {
            const user = await auth.register(formData);
            localStorage.setItem('auth_token', user.token);
            setUser(user);
        } catch (error) {
            throw error;
        }
    }

    const login = async (formData) => {
        const auth = new AuthService();
        try {
            const user = await auth.login(formData);
            localStorage.setItem('auth_token', user.token);
            setUser(user);
        } catch (error) {
            throw error;
        }
    };

    const logout = async () => {
        const auth = new AuthService();
        try {
            await auth.logout();
            localStorage.removeItem('auth_token');
            setUser(null);
            return;
        } catch (error) {
            throw error;
        }
    };

    useEffect(() => {
        isAuthenticated();
    }, [])

    const value = {
        login,
        logout,
        register,
        setUser,
        user,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
