import { useEffect } from "react";
import { OrderList } from "../../components/OrderList/OrderList";

export const OrderPage = () => {

    useEffect(() => {
        document.title = 'Lista de pedidos'
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        })
    }, []);

    return (
        <OrderList />
    );
};

