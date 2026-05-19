import { useState } from "react";
import { NavLink } from "react-router-dom";
import styles from './NavItem.module.css'

export function NavItem({ item }) {
    const [isOpen, setIsOpen] = useState(true);

    // Si no tiene hijos, renderiza un NavLink normal
    if (!item.children) {
        return (
            <li>
                <NavLink
                    to={item.to}
                    className={({ isActive }) => isActive ? styles.active : styles.item}
                >
                    {item.icon}
                    {item.label}
                </NavLink>
            </li>
        );
    }

    // Si tiene hijos, renderiza un botón que despliega el submenú
    return (
        <li className={styles.nav_group}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={styles.nav_group_trigger}
            >
                <div>
                    {item.icon}
                    <span>{item.label}</span>
                </div>
                <span className={`${styles.arrow} ${isOpen ? styles.arrow_open : ''}`}>▾</span>
            </button>

            {isOpen && (
                <ul className={styles.submenu}>
                    {item.children.map(child => (
                        <li key={child.to}>
                            <NavLink
                                to={child.to}
                                className={({ isActive }) => isActive ? styles.active : styles.item}
                            >
                                {child.label}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            )}
        </li>
    );
};