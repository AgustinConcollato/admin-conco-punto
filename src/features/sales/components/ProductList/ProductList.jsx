import { useContext } from "react";
import { OrderContext } from "../../../../contexts/OrderContext";
import { Product } from "../Product/Product";
import styles from './ProductList.module.css';

export function ProductList() {

    const { products } = useContext(OrderContext);

    if (!Array.isArray(products) || products.length === 0) {
        return <p className={styles.no_products}>No hay products en este pedido.</p>;
    }

    return (
        <div className={styles.table_wrapper}>
            <div className={styles.table_header}>
                <span>Producto</span>
                <span></span>
                <span>Cantidad</span>
                <span>Precio unitario</span>
                <span>Descuento</span>
                <span>Subtotal</span>
                <span>Opciones</span>
            </div>
            <div className={styles.list}>
                {products.map((product) => (
                    <Product detail={product} key={product.id} />
                ))}
            </div>
        </div>
    );
};