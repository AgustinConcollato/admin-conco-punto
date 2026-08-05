import { useContext } from "react";
import { OrderContext } from "../../../../context/OrderContext";
import { Product } from "../Product/Product";
import styles from './ProductList.module.css';

function ProductGroup({ title, products }) {
    if (products.length === 0) return null;

    return (
        <div className={styles.table_wrapper}>
            {title && <h3 className={styles.group_title}>{title}</h3>}
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
}

export function ProductList() {

    const { products } = useContext(OrderContext);

    if (!Array.isArray(products) || products.length === 0) {
        return <p className={styles.no_products}>No hay products en este pedido.</p>;
    }

    const dropshipProducts = products.filter((p) => p.product?.is_dropshipping);
    const normalProducts = products.filter((p) => !p.product?.is_dropshipping);

    return (
        <div className={styles.groups}>
            <ProductGroup products={normalProducts} />
            <ProductGroup title="Productos dropshipping" products={dropshipProducts} />
        </div>
    );
};
