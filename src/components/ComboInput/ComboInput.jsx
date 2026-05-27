import { useEffect, useRef, useState } from "react";
import styles from "./ComboInput.module.css";

export function ComboInput({ options = [], value, onChange, placeholder }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener("mousedown", h);
        return () => document.removeEventListener("mousedown", h);
    }, []);

    const filtered = options
        .filter(o => !value || o.toLowerCase().includes((value ?? "").toLowerCase()))
        .slice(0, 10);

    return (
        <div ref={ref} className={styles.wrap}>
            <input
                className="input"
                type="text"
                value={value ?? ""}
                onChange={e => { onChange(e.target.value); setOpen(true); }}
                onFocus={() => setOpen(true)}
                placeholder={placeholder ?? "Escribí o seleccioná..."}
            />
            {open && filtered.length > 0 && (
                <ul className={styles.dropdown}>
                    {filtered.map(o => (
                        <li key={o} onMouseDown={() => { onChange(o); setOpen(false); }}>
                            {o}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
