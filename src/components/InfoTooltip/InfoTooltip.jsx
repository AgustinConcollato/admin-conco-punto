import { useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import styles from './InfoTooltip.module.css';

export function InfoTooltip({ text, align = 'left' }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        if (!open) return;
        const onClickOutside = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', onClickOutside);
        return () => document.removeEventListener('mousedown', onClickOutside);
    }, [open]);

    return (
        <span className={styles.wrap} ref={ref}>
            <button
                type="button"
                className={styles.trigger}
                aria-label="Más información"
                aria-expanded={open}
                onClick={(e) => { e.stopPropagation(); setOpen(o => !o); }}
            >
                <FontAwesomeIcon icon={faCircleInfo} />
            </button>
            <span
                className={`${styles.popover} ${align === 'right' ? styles.right : styles.left} ${open ? styles.open : ''}`}
                role="tooltip"
            >
                {text}
            </span>
        </span>
    );
}
