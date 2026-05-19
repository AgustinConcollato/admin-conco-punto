import {
    faCheck,
    faChevronDown, faChevronUp,
    faCircleNotch, faInfoCircle,
    faPen
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { AttrField } from "../TypesAttributesInput/TypesAttributesInput";
import styles from "./PublicationAttributes.module.css";

// ─── Misma lógica de visibilidad que StepCategory ────────────────────────────
function isVisible(attr) {
    const t = attr.tags ?? {};
    if (t.hidden && t.read_only) return false;
    if (t.hidden && !t.required && !t.catalog_required && !t.conditional_required) return false;
    return true;
}

const HIERARCHY_LABEL = {
    PARENT_PK:          "Identificación del producto",
    CHILD_PK:           "Características principales",
    CHILD_DEPENDENT:    "Dimensiones y variantes",
    FAMILY:             "Características adicionales",
    PRODUCT_IDENTIFIER: "Códigos de identificación",
    ITEM:               "Información de venta",
};

const HIERARCHY_ORDER = ["PARENT_PK", "CHILD_PK", "FAMILY", "CHILD_DEPENDENT", "PRODUCT_IDENTIFIER", "ITEM"];

function groupAttributes(attrs) {
    const groups = {};
    for (const attr of attrs) {
        const key = attr.hierarchy ?? "ITEM";
        if (!groups[key]) groups[key] = [];
        groups[key].push(attr);
    }
    return HIERARCHY_ORDER.filter(k => groups[k]).map(k => ({
       label: HIERARCHY_LABEL[k] ?? k, attrs: groups[k],
    }));
}

// ─── Grupo colapsable ─────────────────────────────────────────────────────────
function AttributeGroup({ group, values, onChange, initialOpen = false, hasVariations = false }) {
    const [open, setOpen] = useState(initialOpen);
    const pendingCount = group.attrs.filter(a =>
        (a.tags?.required || a.tags?.catalog_required) && !values[a.id]
    ).length;

    return (
        <div className={styles.group}>
            <button className={styles.group_header} onClick={() => setOpen(o => !o)}>
                <div className={styles.group_left}>
                    <span className={styles.group_title}>{group.label}</span>
                    {pendingCount > 0 && (
                        <span className={styles.group_badge}>{pendingCount} requerido{pendingCount > 1 ? "s" : ""}</span>
                    )}
                </div>
                <FontAwesomeIcon icon={open ? faChevronUp : faChevronDown} className={styles.group_chevron} />
            </button>

            {open && (
                <div className={styles.group_body}>
                    <div className={styles.attrs_grid}>
                        {group.attrs.map(attr => {
                            const isRequired    = attr.tags?.required || attr.tags?.catalog_required;
                            const isConditional = attr.tags?.conditional_required;
                            const isFullWidth   = attr.tags?.multivalued || attr.type === "color" || attr.value_type === "boolean";
                            const isFixed       = attr.tags?.fixed || attr.tags?.read_only;
                            const isNA          = values[attr.id] === "__NA__";
                            return (
                                <div key={attr.id} className={`${styles.field} ${isFullWidth ? styles.field_full : ""}`}>
                                    <label className={styles.field_label}>
                                        {attr.name}
                                        {isRequired    && <span className={styles.required}> *</span>}
                                        {isConditional && !isRequired && (
                                            <span className={styles.conditional}> (condicional)</span>
                                        )}
                                        {isFixed && <span className={styles.fixed_badge}> (fijo)</span>}
                                        {attr.tooltip && (
                                            <span className={styles.tooltip_wrap} title={attr.tooltip}>
                                                <FontAwesomeIcon icon={faInfoCircle} className={styles.tooltip_icon} />
                                            </span>
                                        )}
                                    </label>
                                    <div className={styles.field_input_row}>
                                        <AttrField
                                            attr={attr}
                                            value={isNA ? "" : values[attr.id]}
                                            onChange={val => onChange(attr.id, val)}
                                            disabled={isFixed || isNA}
                                        />
                                        {!isFixed && !isRequired && !(hasVariations && attr.tags?.allow_variations) && (
                                            <button
                                                type="button"
                                                className={`${styles.na_btn} ${isNA ? styles.na_btn_active : ""}`}
                                                onClick={() => onChange(attr.id, isNA ? "" : "__NA__")}
                                                title={isNA ? "Restablecer valor" : "Marcar como no aplica"}
                                            >
                                                {isNA ? "↩" : "N/A"}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export function PublicationAttributes({ pub, mlService, onUpdate }) {
    const [categoryAttrs, setCategoryAttrs] = useState([]);
    const [loadingAttrs,  setLoadingAttrs]  = useState(true);

    // values: { [attr_id]: string }
    const [values,   setValues]   = useState({});
    const [original, setOriginal] = useState({});

    const [saving,   setSaving]   = useState(false);
    const [error,    setError]    = useState(null);
    const [saved,    setSaved]    = useState(false);

    // Cargar atributos de la categoría
    useEffect(() => {
        const load = async () => {
            setLoadingAttrs(true);
            try {
                const attrs = await mlService.getCategoryAttributes(pub.category_id);
                const visible = Array.isArray(attrs) ? attrs.filter(isVisible) : [];
                setCategoryAttrs(visible);
            } catch { setCategoryAttrs([]); }
            finally { setLoadingAttrs(false); }
        };
        if (pub.category_id) load();
    }, [pub.category_id]);

    // Pre-llenar con valores actuales de la publicación
    useEffect(() => {
        const initial = {};
        for (const attr of pub.attributes ?? []) {
            // Detectar N/A: value_id === "-1" con value_name null
            if (attr.value_id === "-1" && !attr.value_name) {
                initial[attr.id] = "__NA__";
                continue;
            }
            // Multivalued: ML devuelve values:[{id,name},...]
            if (Array.isArray(attr.values) && attr.values.length > 1) {
                const names = attr.values.map(v => v.name).filter(Boolean);
                if (names.length) initial[attr.id] = JSON.stringify(names);
                continue;
            }
            if (!attr.value_name) continue;
            // Fallback: múltiples entries con el mismo id (formato legacy)
            if (initial[attr.id] !== undefined) {
                try {
                    const arr = JSON.parse(initial[attr.id]);
                    initial[attr.id] = JSON.stringify([...arr, attr.value_name]);
                } catch {
                    initial[attr.id] = JSON.stringify([initial[attr.id], attr.value_name]);
                }
            } else {
                initial[attr.id] = attr.value_name;
            }
        }
        setValues(initial);
        setOriginal(initial);
    }, [pub.attributes]);

    const handleChange = (id, val) => {
        setSaved(false);
        // Auto-completar UNITS_PER_PACK
        if (id === "SALE_FORMAT") {
            setValues(v => ({ ...v, [id]: val, UNITS_PER_PACK: val === "Unidad" ? "1" : v.UNITS_PER_PACK }));
        } else {
            setValues(v => ({ ...v, [id]: val }));
        }
    };

    const hasChanges = Object.keys(values).some(k => values[k] !== original[k]) ||
                       Object.keys(original).some(k => original[k] !== values[k]);

    const handleSave = async () => {
        setSaving(true);
        setError(null);
        setSaved(false);
        try {
            const hasVariations = pub.variations?.length > 0;
            const nonEditableIds = new Set(
                categoryAttrs
                    .filter(a =>
                        a.tags?.fixed ||
                        a.tags?.read_only ||
                        (hasVariations && a.tags?.allow_variations) ||
                        (hasVariations && a.type === "product_identifier" && a.tags?.variation_attribute)
                    )
                    .map(a => a.id)
            );
            const attributes = Object.entries(values)
                .filter(([id]) => !nonEditableIds.has(id))
                .flatMap(([id, value]) => {
                    if (value === "__NA__") return [{ id, value_id: "-1", value_name: null }];
                    if (value === "" || value === null || value === undefined || value === "[]") return [];
                    const attrDef = categoryAttrs.find(a => a.id === id);
                    const resolveValueId = (name) => {
                        const all = [...(attrDef?.values ?? []), ...(attrDef?.suggested_values ?? [])];
                        return all.find(v => v.name === name);
                    };
                    try {
                        const arr = JSON.parse(value);
                        if (Array.isArray(arr)) {
                            const values = arr.map(v => {
                                const match = resolveValueId(String(v));
                                return match
                                    ? { id: match.id, name: match.name }
                                    : { name: String(v) };
                            });
                            return [{ id, values }];
                        }
                    } catch { /* not JSON */ }
                    const match = resolveValueId(String(value));
                    return match
                        ? [{ id, value_id: match.id, value_name: match.name }]
                        : [{ id, value_name: String(value) }];
                });

            const updated = await mlService.updatePublication(pub.id, { attributes });
            setOriginal(values);
            setSaved(true);
            onUpdate?.(updated);
            setTimeout(() => setSaved(false), 3000);
        } catch (e) {
            let msg = "Error al guardar atributos.";
            if (e?.cause?.length) {
                msg = e.cause.map(c => c.message).filter(Boolean).join(" / ");
            } else if (e?.message) {
                msg = e.message;
            }
            setError(msg);
        } finally {
            setSaving(false);
        }
    };

    const handleReset = () => { setValues(original); setError(null); setSaved(false); };

    const groups = groupAttributes(categoryAttrs);

    if (loadingAttrs) return (
        <div className={styles.card}>
            <p className={styles.card_title}><FontAwesomeIcon icon={faPen} /> Atributos</p>
            <div className={styles.loading}>
                <FontAwesomeIcon icon={faCircleNotch} spin /> Cargando atributos...
            </div>
        </div>
    );

    return (
        <div className={styles.card}>
            <div className={styles.card_header}>
                <p className={styles.card_title}><FontAwesomeIcon icon={faPen} /> Atributos</p>
                {hasChanges && (
                    <div className={styles.header_actions}>
                        <button className={styles.btn_reset} onClick={handleReset} disabled={saving}>
                            Descartar
                        </button>
                        <button className={styles.btn_save} onClick={handleSave} disabled={saving}>
                            {saving
                                ? <><FontAwesomeIcon icon={faCircleNotch} spin /> Guardando...</>
                                : <><FontAwesomeIcon icon={faCheck} /> Guardar cambios</>
                            }
                        </button>
                    </div>
                )}
                {saved && !hasChanges && (
                    <span className={styles.saved_badge}>
                        <FontAwesomeIcon icon={faCheck} /> Guardado
                    </span>
                )}
            </div>

            {error && <div className={styles.error}>{error}</div>}

            {groups.length === 0 ? (
                <p className={styles.no_attrs}>No hay atributos disponibles para esta categoría.</p>
            ) : (
                <div className={styles.groups}>
                    {groups.map((group, i) => (
                        <AttributeGroup
                            key={group.label}
                            group={group}
                            values={values}
                            onChange={handleChange}
                            initialOpen={i === 0}
                            hasVariations={pub.variations?.length > 0}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}