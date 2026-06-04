import { Route, Routes } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";
import { PrivateRoute } from "./PrivateRoute";
import { AppLayout } from "../components/layout/AppLayout/AppLayout";
import { Login } from "../features/auth/components/Login/Login";

export function AppRouter() {
    return (
        <AuthProvider>
            <Routes>
                <Route path="/iniciar-sesion" element={<Login />} />
                {/* <Route path="/usuario/registro" element={<Register />} /> */}
                <Route path="/*" element={<PrivateRoute><AppLayout /></PrivateRoute>} />
            </Routes>
        </AuthProvider>
    );
}

