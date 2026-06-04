// src/context/OrderContext.jsx
import React, { createContext, useContext, useMemo, useState } from 'react';
import { OrderService } from '../services/order/orderService';
import { PaymentService } from '../services/payments/paymentsService';
import { useNavigate } from 'react-router-dom';

export const OrderContext = createContext();

export function OrderProvider({ children }) {

    const navigate = useNavigate();
    const orderService = useMemo(() => new OrderService(), []);
    const paymentService = useMemo(() => new PaymentService(), []);

    const [order, setOrder] = useState(null);
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const addProduct = async (productData) => {
        if (!order || isLoading) return;
        setIsLoading(true);
        setError(null);

        try {
            const response = await orderService.addProductToOrder(order.id, productData);
            getOrder(response.order_totals.id);
        } catch (err) {
            throw err
        } finally {
            setIsLoading(false);
        }
    };

    const removeProduct = async (detailId) => {
        if (!order || isLoading) return;
        setIsLoading(true);
        setError(null);

        try {
            const response = await orderService.removeProductFromOrder(detailId);
            getOrder(response.order_totals.id);
        } catch (err) {
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const updateProduct = async (detailId, data) => {
        if (!order || isLoading) return;
        setIsLoading(true);
        setError(null);

        try {
            await orderService.updateProductInOrder(detailId, data);
            getOrder(order.id);
        } catch (err) {
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const finalizePayment = async (paymentData) => {
        if (!order || isLoading) return;
        setIsLoading(true);
        setError(null);

        try {
            const data = {
                order_id: order.id,
                ...paymentData
            };
            await paymentService.create(data);

            const updatedOrderResponse = await orderService.getById(order.id);
            setOrder(updatedOrderResponse);

            return true;
        } catch (err) {
            setError(err.message || 'Error al registrar el pago.');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const getOrder = async (id) => {
        try {
            const order = await orderService.getById(id);
            setOrder(order);
            setProducts(order.details);
        } catch (err) {
            const msg = err?.error ?? err?.message ?? '';
            if (msg === "Pedido no encontrado") {
                navigate('/ventas');
            }
        }
    }

    const contextValue = {
        order,
        products,
        isLoading,
        error,
        addProduct,
        removeProduct,
        updateProduct,
        finalizePayment,
        getOrder
    };

    return (
        <OrderContext.Provider value={contextValue}>
            {children}
        </OrderContext.Provider>
    );
}