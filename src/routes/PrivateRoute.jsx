import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { Modal } from "../components/Modal/Modal";
import { Loading } from "../components/Loading/Loading";

export function PrivateRoute({ children }) {
    const { user, loading } = useContext(AuthContext);

    if (loading) return <Modal onClose={null}>
        <Loading />
    </Modal>;

    if (!user) return <Navigate to="/iniciar-sesion" />;

    return children;
}
