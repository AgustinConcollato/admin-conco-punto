import { useContext, useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'
import {
    AnalyticsIcon,
    CalendarIcon,
    CategoryIcon,
    ClientIcon,
    HomeIcon,
    MercadoLibreIcon,
    OrderIcon,
    PaymentIcon,
    ProductIcon,
    ProviderIcon,
    WalletIcon
} from '../../assets/icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleNotch, faPlus, faSignOutAlt } from '@fortawesome/free-solid-svg-icons'
import logo from '../../assets/img/logo-completo.png'
import { NavItem } from '../NavItem/NavItem'
import { usePendingOrdersCount } from '../../hooks/usePendingOrdersCount'
import styles from './NavBar.module.css'


// const navItems = [
//     {
//         to: '/',
//         icon: <HomeIcon width={18} height={18} color='currentColor' />,
//         label: 'Inicio'
//     },
//     {
//         to: '/productos',
//         icon: <ProductIcon width={18} height={18} color='currentColor' />,
//         label: 'Productos'
//     },
//     {
//         to: '/pedidos',
//         icon: <OrderIcon width={18} height={18} color='currentColor' />,
//         label: 'Pedidos'
//     },
//     {
//         to: '/clientes',
//         icon: <ClientIcon width={18} height={18} color='currentColor' />,
//         label: 'Clientes'
//     },
//     {
//         to: '/categorias',
//         icon: <CategoryIcon width={18} height={18} color='currentColor' />,
//         label: 'Categorias'
//     },
//     {
//         to: '/reportes',
//         icon: <AnalyticsIcon width={18} height={18} color='currentColor' />,
//         label: 'Reportes'
//     },
//     {
//         to: '/pagos',
//         icon: <PaymentIcon width={18} height={18} color='currentColor' />,
//         label: 'Pagos'
//     },
//     {
//         to: '/promociones',
//         icon: <CalendarIcon width={18} height={18} color='currentColor' />,
//         label: 'Promos'
//     }

// ]

const navItems = [
    {
        to: '/',
        icon: <HomeIcon width={18} height={18} color='currentColor' />,
        label: 'Inicio'
    },
    // Ejemplo de grupo: Gestión
    {
        label: 'Gestión',
        icon: <ProductIcon width={18} height={18} color='currentColor' />,
        children: [
            { to: '/productos', label: 'Productos' },
            { to: '/categorias', label: 'Categorí­as' },
        ]
    },
    {
        to: '/pedidos',
        icon: <OrderIcon width={18} height={18} color='currentColor' />,
        label: 'Pedidos'
    },
    {
        to: '/clientes',
        icon: <ClientIcon width={18} height={18} color='currentColor' />,
        label: 'Clientes'
    },
    // Ejemplo de grupo: Administración
    {
        label: 'Análisis',
        icon: <AnalyticsIcon width={18} height={18} color='currentColor' />,
        children: [
            { to: '/reportes', label: 'Reportes' },
            { to: '/pagos', label: 'Pagos' },
        ]
    },
    {
        to: '/promociones',
        icon: <CalendarIcon width={18} height={18} color='currentColor' />,
        label: 'Promos'
    },
    {
        to: '/diseno-home',
        icon: <HomeIcon width={18} height={18} color='currentColor' />,
        label: 'Diseño de inicio'
    },
    {
        to: '/mercado-libre/cuenta',
        icon: <MercadoLibreIcon width={18} height={18} />,
        label: 'Mercado Libre'
    }
];

export function NavBar() {

    const { logout } = useContext(AuthContext);
    const [pendingReload, setPendingReload] = useState(false);
    const pendingOrdersCount = usePendingOrdersCount(pendingReload);

    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const menuRef = useRef(null);

    const [showMenu, setShowMenu] = useState(false);

    const handleLogout = async () => {
        setLoading(true);

        try {
            await logout();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "F9") {
                e.preventDefault();
                navigate('/ventas');
                setShowMenu(false);
            }

            if (e.key === "F10") {
                e.preventDefault();

                if (location.pathname === '/productos/cargar') {
                    return navigate('/productos/nuevo/1');
                }

                navigate('/productos/cargar');
                setShowMenu(false);
            }

            if (e.key === "F11") {
                e.preventDefault();
                navigate('/clientes/nuevo');
                setShowMenu(false);
            }

        };

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowMenu(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        }
    }, []);


    return (
        <div className={styles.navbar_container}>
            <div>
                <img src={logo} alt="Logo" />
                <div className={styles.container_actions}>
                    <button
                        className='btn btn_solid'
                        onClick={() => setShowMenu(true)}
                    >
                        <FontAwesomeIcon icon={faPlus} />
                        <span>Nuevo</span>
                    </button>
                    {showMenu &&
                        <div className={styles.actions} ref={menuRef} onClick={() => setShowMenu(false)}>
                            <div className={styles.actions_header}>Crear nuevo</div>

                            <Link to='/ventas' className={styles.action_item}>
                                <span className={styles.action_icon}><OrderIcon width={18} height={18} color='currentColor' /></span>
                                <span className={styles.action_text}>
                                    <span className={styles.action_title}>Nuevo pedido</span>
                                    <span className={styles.action_sub}>Registrar una venta</span>
                                </span>
                                <span className={styles.action_kbd}>F9</span>
                            </Link>

                            <Link to='/productos/nuevo/1' className={styles.action_item}>
                                <span className={styles.action_icon}><ProductIcon width={18} height={18} color='currentColor' /></span>
                                <span className={styles.action_text}>
                                    <span className={styles.action_title}>Nuevo producto</span>
                                    <span className={styles.action_sub}>Agregar al inventario</span>
                                </span>
                                <span className={styles.action_kbd}>F10</span>
                            </Link>

                            <Link to='/clientes/nuevo' className={styles.action_item}>
                                <span className={styles.action_icon}><ClientIcon width={18} height={18} color='currentColor' /></span>
                                <span className={styles.action_text}>
                                    <span className={styles.action_title}>Nuevo cliente</span>
                                    <span className={styles.action_sub}>Crear ficha de cliente</span>
                                </span>
                                <span className={styles.action_kbd}>F11</span>
                            </Link>

                            <Link to='/proveedor/nuevo' className={styles.action_item}>
                                <span className={styles.action_icon}><ProviderIcon width={18} height={18} color='currentColor' /></span>
                                <span className={styles.action_text}>
                                    <span className={styles.action_title}>Nuevo proveedor</span>
                                    <span className={styles.action_sub}>Registrar proveedor</span>
                                </span>
                            </Link>

                            <Link to='/pagos/nuevo' className={styles.action_item}>
                                <span className={styles.action_icon}><PaymentIcon width={18} height={18} color='currentColor' /></span>
                                <span className={styles.action_text}>
                                    <span className={styles.action_title}>Agregar pago</span>
                                    <span className={styles.action_sub}>Registrar un pago</span>
                                </span>
                            </Link>
                        </div>
                    }
                </div>
                <nav className={styles.navbar}>
                    <ul>
                        {navItems.map((item) => (
                            <NavItem
                                key={item.to || item.label}
                                item={item}
                                badge={item.to === '/pedidos' ? pendingOrdersCount : 0}
                                onBadgeClick={item.to === '/pedidos' ? () => setPendingReload(r => !r) : undefined}
                            />
                        ))}
                    </ul>
                </nav>
            </div>
            <div>
                <button
                    className={`btn ${styles.btn_logout}`}
                    onClick={handleLogout}
                >
                    {loading ?
                        <FontAwesomeIcon icon={faCircleNotch} spin /> :
                        <>
                            <FontAwesomeIcon icon={faSignOutAlt} />
                            Cerrar sesión
                        </>
                    }
                </button>
            </div>
        </div>
    )
}

