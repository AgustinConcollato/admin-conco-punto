import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from './TypesAttributesInput.module.css'
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useRef, useState } from "react";

function AttrSelect({ attr, value, onChange, disabled }) {
    return (
        <select value={value ?? ""} onChange={e => onChange(e.target.value)} className={styles.input} disabled={disabled}>
            <option value="">Seleccionar...</option>
            {attr.values.map(v => <option key={v.id} value={v.name}>{v.name}</option>)}
        </select>
    );
}

function AttrCombo({ attr, value, onChange, GTIN = null, disabled = false }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    useEffect(() => {
        const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener("mousedown", h);
        return () => document.removeEventListener("mousedown", h);
    }, []);
    const filtered = (attr.values ?? []).filter(v =>
        !value || v.name.toLowerCase().includes((value ?? "").toLowerCase())
    ).slice(0, 10);
    return (
        <div ref={ref} className={styles.combo_wrap}>
            <input
                className={styles.input}
                type={GTIN ? 'number' : "text"}
                value={value ?? ""}
                onChange={e => { onChange(e.target.value); setOpen(true); }}
                onFocus={() => setOpen(true)}
                placeholder={attr.hint ?? "Escribí o seleccioná..."}
                disabled={disabled}
            />
            {open && filtered.length > 0 && (
                <ul className={styles.combo_dropdown}>
                    {filtered.map(v => (
                        <li key={v.id} onMouseDown={() => { onChange(v.name); setOpen(false); }}>
                            {v.name}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

function AttrNumberUnit({ attr, value, onChange, disabled }) {
    const parts = (value ?? "").split(" ");
    const num = parts[0] ?? "";
    const unit = parts[1] ?? attr.default_unit ?? attr.allowed_units?.[0]?.id ?? "";
    return (
        <div className={styles.number_unit_wrap}>
            <input
                className={styles.input}
                type="number"
                value={num}
                onChange={e => onChange(`${e.target.value} ${unit}`)}
                placeholder="0"
                min={0}
                disabled={disabled}
            />
            <select
                className={styles.unit_select}
                value={unit}
                onChange={e => onChange(`${num} ${e.target.value}`)}
                disabled={disabled}
            >
                {(attr.allowed_units ?? []).map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                ))}
            </select>
        </div>
    );
}

function AttrBoolean({ value, onChange, disabled }) {
    return (
        <div className={styles.bool_wrap}>
            {["Sí", "No"].map(opt => (
                <button
                    key={opt}
                    type="button"
                    className={`${styles.bool_btn} ${value === opt ? styles.bool_active : ""}`}
                    onClick={() => onChange(opt)}
                    disabled={disabled}
                >
                    {opt}
                </button>
            ))}
        </div>
    );
}

function AttrMulti({ attr, value, onChange }) {
    const selected = (() => { try { return JSON.parse(value ?? "[]"); } catch { return []; } })();
    const toggle = (name) => {
        const next = selected.includes(name)
            ? selected.filter(s => s !== name)
            : [...selected, name];
        onChange(JSON.stringify(next));
    };
    return (
        <div className={styles.multi_wrap}>
            {(attr.values ?? []).map(v => (
                <button
                    key={v.id}
                    type="button"
                    className={`${styles.chip} ${selected.includes(v.name) ? styles.chip_active : ""}`}
                    onClick={() => toggle(v.name)}
                >
                    {selected.includes(v.name) && <FontAwesomeIcon icon={faCheck} className={styles.chip_check} />}
                    {v.name}
                </button>
            ))}
        </div>
    );
}

function AttrColor({ attr, value, onChange }) {
    return (
        <div className={styles.color_grid}>
            {(attr.values ?? []).map(v => {
                const rgb = v.metadata?.rgb ?? "CCCCCC";
                const sel = value === v.name;
                return (
                    <button
                        key={v.id}
                        type="button"
                        title={v.name}
                        className={`${styles.swatch} ${sel ? styles.swatch_active : ""}`}
                        style={{ background: `#${rgb}` }}
                        onClick={() => onChange(sel ? "" : v.name)}
                    >
                        {sel && <FontAwesomeIcon icon={faCheck} className={styles.swatch_check} />}
                    </button>
                );
            })}
        </div>
    );
}

export function AttrField({ attr, value, onChange, from = null, barcodes = null, disabled = false }) {
    const isMulti = attr.tags?.multivalued;
    const isColor = attr.type === "color";

    if (isColor) return <AttrColor attr={attr} value={value} onChange={onChange} />;
    if (isMulti && attr.values?.length > 0) return <AttrMulti attr={attr} value={value} onChange={onChange} />;
    if (from == 'CATEGORY') {
        if (attr.id === "GTIN") return <AttrCombo attr={barcodes} value={value} onChange={onChange} GTIN={true} disabled={disabled} />;
    } else {
        if (attr.id === "GTIN") return <AttrCombo attr={attr} value={value} onChange={onChange} GTIN={true} disabled={disabled} />;
    }
    if (attr.value_type === "boolean") return <AttrBoolean value={value} onChange={onChange} disabled={disabled} />;
    if (attr.value_type === "number_unit") return <AttrNumberUnit attr={attr} value={value} onChange={onChange} disabled={disabled} />;
    if (attr.value_type === "number") return (
        <input className={styles.input} type="number" value={value ?? ""} min={0}
            onChange={e => onChange(e.target.value)} disabled={disabled} />
    );
    if (attr.value_type === "list") return <AttrSelect attr={attr} value={value} onChange={onChange} disabled={disabled} />;
    if (attr.value_type === "string" && attr.values?.length > 0)
        return <AttrCombo attr={attr} value={value} onChange={onChange} disabled={disabled} />;
    return (
        <input
            className={styles.input}
            type="text"
            value={value ?? ""}
            onChange={e => onChange(e.target.value)}
            placeholder={attr.hint ?? ""}
            maxLength={attr.value_max_length ?? undefined}
            disabled={disabled}
        />
    );
}
