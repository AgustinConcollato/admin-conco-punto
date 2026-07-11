import { useState, useRef, useEffect } from 'react';
import { usePendingOrdersCount } from '../../hooks/usePendingOrdersCount';
import { NavLink, Link } from 'react-router-dom';
import {
    ProductIcon,
    OrderIcon,
    ClientIcon,
    HomeIcon,
    CategoryIcon,
    WalletIcon,
    AnalyticsIcon,
    CalendarIcon,
    PaymentIcon,
    ProviderIcon
} from '../../assets/icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faBars, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import styles from './NavBarMobile.module.css';

// 1. Definimos los items aquí (o los importamos)
const mainNavItems = [
    { to: "/productos", icon: <ProductIcon width={22} height={22} color="currentColor" />, label: "Productos" },
    { to: "/pedidos", icon: <OrderIcon width={22} height={22} color="currentColor" />, label: "Pedidos" },
    { to: "/clientes", icon: <ClientIcon width={22} height={22} color="currentColor" />, label: "Clientes" },
];

const AnalyticsItem = { to: "/reportes", icon: <AnalyticsIcon width={22} height={22} color="currentColor" />, label: "Reportes" };
const PaymentItem = { to: "/pagos", icon: <PaymentIcon width={22} height={22} color="currentColor" />, label: "Pagos" };

const extraNavItems = [
    { to: "/", icon: <HomeIcon width={18} height={18} />, label: "Inicio" },
    // { to: "/caja", icon: <WalletIcon width={18} height={18} />, label: "Caja" },
    { to: "/categorias", icon: <CategoryIcon width={18} height={18} />, label: "Categorí­as" },
    { to: "/promociones", icon: <CalendarIcon width={18} height={18} />, label: "Promos" },
    { to: "/proveedores/compras", icon: <WalletIcon width={18} height={18} />, label: "Cuentas por pagar" },
    // { to: "/reportes", icon: <AnalyticsIcon width={18} height={18} />, label: "Reportes" },
    // { to: "/pagos", icon: <PaymentIcon width={18} height={18} />, label: "Pagos" },
];

export function NavBarMobile() {
    const [showMore, setShowMore] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [reload, setReload] = useState(false);
    const pendingOrdersCount = usePendingOrdersCount(reload);
    const moreMenuRef = useRef(null);
    const newMenuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (moreMenuRef.current && !moreMenuRef.current.contains(event.target)) setShowMore(false);
            if (newMenuRef.current && !newMenuRef.current.contains(event.target)) setShowNew(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <nav className={styles.mobile_nav}>
            <div className={styles.tab_bar}>

                {/* 2. Mapeamos los items principales de la izquierda */}
                {mainNavItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) => isActive ? styles.tab_active : styles.tab_item}
                    >
                        <div className={styles.tab_icon_wrapper}>
                            {item.icon}
                            {item.to === '/pedidos' && pendingOrdersCount > 0 && (
                                <span className={styles.badge} onClick={(e) => {
                                    e.preventDefault();
                                    setReload(!reload);
                                }}>
                                    <span className={styles.badge_count}>{pendingOrdersCount > 99 ? '99+' : pendingOrdersCount}</span>
                                    <i className={`${styles.badge_icon} hgi hgi-stroke hgi-rounded hgi-reload`} />
                                </span>
                            )}
                        </div>
                        <span>{item.label}</span>
                    </NavLink>
                ))}

                {/* BOTÓN NUEVO (Central - Este suele ser estático) */}
                <div className={styles.tab_item_special}>
                    <button onClick={() => setShowNew(!showNew)} className={styles.btn_new}>
                        <FontAwesomeIcon icon={faPlus} />
                    </button>
                    {showNew && (
                        <div className={styles.floating_menu} ref={newMenuRef}>
                            <div className={styles.mnew_header}>Crear nuevo</div>

                            <Link to='/ventas' className={styles.mnew_item} onClick={() => setShowNew(false)}>
                                <span className={styles.mnew_icon}><OrderIcon width={18} height={18} color='currentColor' /></span>
                                <span className={styles.mnew_text}>
                                    <span className={styles.mnew_title}>Nuevo pedido</span>
                                    <span className={styles.mnew_sub}>Registrar una venta</span>
                                </span>
                            </Link>

                            <Link to='/productos/nuevo/1' className={styles.mnew_item} onClick={() => setShowNew(false)}>
                                <span className={styles.mnew_icon}><ProductIcon width={18} height={18} color='currentColor' /></span>
                                <span className={styles.mnew_text}>
                                    <span className={styles.mnew_title}>Nuevo producto</span>
                                    <span className={styles.mnew_sub}>Agregar al inventario</span>
                                </span>
                            </Link>

                            <Link to='/clientes/nuevo' className={styles.mnew_item} onClick={() => setShowNew(false)}>
                                <span className={styles.mnew_icon}><ClientIcon width={18} height={18} color='currentColor' /></span>
                                <span className={styles.mnew_text}>
                                    <span className={styles.mnew_title}>Nuevo cliente</span>
                                    <span className={styles.mnew_sub}>Crear ficha de cliente</span>
                                </span>
                            </Link>

                            <Link to='/proveedor/nuevo' className={styles.mnew_item} onClick={() => setShowNew(false)}>
                                <span className={styles.mnew_icon}><ProviderIcon width={18} height={18} color='currentColor' /></span>
                                <span className={styles.mnew_text}>
                                    <span className={styles.mnew_title}>Nuevo proveedor</span>
                                    <span className={styles.mnew_sub}>Registrar proveedor</span>
                                </span>
                            </Link>

                            <Link to='/pagos/nuevo' className={styles.mnew_item} onClick={() => setShowNew(false)}>
                                <span className={styles.mnew_icon}><PaymentIcon width={18} height={18} color='currentColor' /></span>
                                <span className={styles.mnew_text}>
                                    <span className={styles.mnew_title}>Agregar pago</span>
                                    <span className={styles.mnew_sub}>Registrar un pago</span>
                                </span>
                            </Link>
                        </div>
                    )}
                </div>

                {/* 3. El item de Clientes (para mantener simetrí­a con el botón "Más") */}
                <NavLink to={AnalyticsItem.to} className={({ isActive }) => isActive ? styles.tab_active : styles.tab_item}>
                    {AnalyticsItem.icon}
                    <span>{AnalyticsItem.label}</span>
                </NavLink>
                <NavLink to={PaymentItem.to} className={({ isActive }) => isActive ? styles.tab_active : styles.tab_item}>
                    {PaymentItem.icon}
                    <span>{PaymentItem.label}</span>
                </NavLink>

                {/* BOTÓN MÁS */}
                <button
                    className={showMore ? styles.tab_active : styles.tab_item}
                    onClick={() => setShowMore(!showMore)}
                >
                    <FontAwesomeIcon icon={faBars} style={{ fontSize: '20px' }} />
                    <span>Más</span>
                </button>

                {showMore && (
                    <div className={styles.floating_menu_more} ref={moreMenuRef}>
                        {/* 4. Mapeamos los items extra */}
                        {extraNavItems.map((item) => (
                            <Link key={item.to} to={item.to} onClick={() => setShowMore(false)}>
                                {item.icon} {item.label}
                            </Link>
                        ))}
                        <hr />
                        <button className={styles.logout_btn}>
                            <FontAwesomeIcon icon={faSignOutAlt} /> Cerrar Sesión
                        </button>
                    </div>
                )}
            </div>
        </nav>
    );
}
