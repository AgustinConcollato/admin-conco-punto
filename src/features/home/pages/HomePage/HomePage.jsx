import { Link } from 'react-router-dom';
import { ClientIcon, OrderIcon, ProductIcon, SuppliersIcon } from '../../../../assets/icons';
import styles from './HomePage.module.css';
import { useEffect } from 'react';

export function HomePage() {

    useEffect(() => {
        document.title = 'Panel administrativo Conco y Punto - Inicio'
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        })
    }, []);

    return (
        <div className={styles.page}>
            <h2 className={styles.title}>Accesos rápidos</h2>
            <div className={styles.grid}>
                <Link to={'/productos/nuevo/1'} className={styles.card}>
                    <ProductIcon width={36} height={36} color='currentColor' />
                    Nuevo Producto
                </Link>
                <Link to={'/ventas'} className={styles.card}>
                    <OrderIcon width={36} height={36} color='currentColor' />
                    Nuevo Pedido
                </Link>
                <Link to={'/clientes/nuevo'} className={styles.card}>
                    <ClientIcon width={36} height={36} color='currentColor' />
                    Nuevo Cliente
                </Link>
                <Link to={'/proveedor/nuevo'} className={styles.card}>
                    <SuppliersIcon width={36} height={36} color='currentColor' />
                    Nuevo Proveedor
                </Link>
            </div>
        </div>
    );
}


