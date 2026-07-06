import { useEffect, useMemo, useRef, useState } from 'react';
import { ClientService } from '../../services/client/clientService';
import { normalizeStr } from '../../utils/normalizeStr';
import styles from './ClientSelect.module.css';

/**
 * Selector buscador de cliente reutilizable.
 * @param {string} value - id del cliente seleccionado
 * @param {(id: string, client: object|null) => void} onChange
 * @param {string} placeholder
 * @param {Array|null} clients - lista opcional; si no se pasa, la carga sola
 */
export function ClientSelect({ value = '', onChange, placeholder = 'Seleccionar cliente', clients: clientsProp = null }) {
    const clientService = useMemo(() => new ClientService(), []);
    const [clients, setClients] = useState(clientsProp ?? []);
    const [search, setSearch] = useState('');
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        if (clientsProp) {
            setClients(clientsProp);
            return;
        }
        let active = true;
        clientService.getAll({ per_page: 100 })
            .then(res => { if (active) setClients(res.data ?? []); })
            .catch(() => { });
        return () => { active = false; };
    }, [clientsProp, clientService]);

    useEffect(() => {
        const onClickOutside = (e) => {
            if (ref.current && !ref.current.contains(e.target)) {
                setOpen(false);
                setSearch('');
            }
        };
        document.addEventListener('click', onClickOutside);
        return () => document.removeEventListener('click', onClickOutside);
    }, []);

    const selected = clients.find(c => String(c.id) === String(value));

    const pick = (c) => {
        onChange?.(c ? String(c.id) : '', c ?? null);
        setOpen(false);
        setSearch('');
    };

    return (
        <div className={styles.searchable_select} ref={ref}>
            <div className={styles.search_input_wrapper}>
                <input
                    type="text"
                    className="input"
                    placeholder={placeholder}
                    value={open ? search : (selected?.name || '')}
                    onChange={(e) => { setSearch(e.target.value); setOpen(true); }}
                    onFocus={() => setOpen(true)}
                />
                {value && (
                    <button
                        type="button"
                        className={styles.clear_button}
                        onClick={() => pick(null)}
                        aria-label="Limpiar cliente"
                    >
                        ×
                    </button>
                )}
            </div>

            {open && (
                <div className={styles.options_list} role="listbox">
                    {clients
                        .filter(c => !search || normalizeStr(c.name).includes(normalizeStr(search)))
                        .slice(0, 50)
                        .map(c => (
                            <div
                                key={c.id}
                                className={styles.option}
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => pick(c)}
                            >
                                {c.name}
                            </div>
                        ))}
                    {clients.length === 0 && (
                        <div className={styles.option} aria-disabled="true">No hay clientes</div>
                    )}
                </div>
            )}
        </div>
    );
}
