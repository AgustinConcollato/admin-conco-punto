import { faCheck, faCircleNotch, faInfoCircle, faSearch, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useRef, useState } from "react";
import { useMLPublish } from "../../../hooks/useMLPublish";
import { AttrField } from "../../TypesAttributesInput/TypesAttributesInput";
import { StepNav } from "../StepNav/StepNav";
import styles from "./StepCategory.module.css";

// ─── Filtro de atributos visibles ─────────────────────────────────────────────
function isVisible(attr) {
    const t = attr.tags ?? {};
    if (t.hidden && t.read_only) return false;
    if (t.hidden && !t.required && !t.catalog_required && !t.conditional_required) return false;
    return true;
}

// ─── Grupos de jerarquía ──────────────────────────────────────────────────────
const HIERARCHY_LABEL = {
    PARENT_PK: "Identificación del producto",
    CHILD_PK: "Características principales",
    CHILD_DEPENDENT: "Dimensiones y variantes",
    FAMILY: "Características adicionales",
    PRODUCT_IDENTIFIER: "Códigos de identificación",
    ITEM: "Información de venta",
};

function groupAttributes(attrs) {
    const groups = {};
    for (const attr of attrs) {
        const key = attr.hierarchy ?? "ITEM";
        if (!groups[key]) groups[key] = [];
        groups[key].push(attr);
    }
    // Orden deseado
    const ORDER = ["PARENT_PK", "CHILD_PK", "FAMILY", "CHILD_DEPENDENT", "PRODUCT_IDENTIFIER", "ITEM"];
    return ORDER.filter(k => groups[k]).map(k => ({ key: k, label: HIERARCHY_LABEL[k] ?? k, attrs: groups[k] }));
}

// ─── Componente principal ─────────────────────────────────────────────────────
export function StepCategory() {
    const { form, updateForm, mlService, goNext, goBack, product } = useMLPublish();

    const [search, setSearch] = useState(form.category_name || "");
    const [results, setResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [attributes, setAttributes] = useState([]);
    const [loadingAttrs, setLoadingAttrs] = useState(false);
    const timeout = useRef(null);

    const barcodes = {
        values: product.barcodes.map(e => {
            return {
                id: e.id,
                name: e.barcode
            }
        })
    }

    useEffect(() => {
        if (form.category_id) loadAttributes(form.category_id);
    }, []);

    useEffect(() => {
        if (search.length < 2) { setResults([]); return; }
        clearTimeout(timeout.current);
        timeout.current = setTimeout(async () => {
            setSearching(true);
            try {
                const res = await mlService.searchCategories(search);
                setResults(Array.isArray(res) ? res : []);
            } catch { setResults([]); }
            finally { setSearching(false); }
        }, 400);
    }, [search]);

    const loadAttributes = async (categoryId) => {
        setLoadingAttrs(true);
        try {
            const attrs = await mlService.getCategoryAttributes(categoryId);
            const visible = Array.isArray(attrs) ? attrs.filter(isVisible) : [];
            setAttributes(visible);
        } catch { setAttributes([]); }
        finally { setLoadingAttrs(false); }
    };

    const selectCategory = async (cat) => {
        updateForm({ category_id: cat.category_id, category_name: cat.category_name, attributes: {} });
        // setSearch(cat.category_name);
        setResults([]);
        await loadAttributes(cat.category_id);
    };

    const clearCategory = () => {
        updateForm({ category_id: "", category_name: "", attributes: {} });
        setSearch("");
        setAttributes([]);
    };

    const handleAttr = (id, value) => {
        const patch = { ...form.attributes, [id]: value };
        updateForm({ attributes: patch });
    };

    const requiredFilled = attributes
        .filter(a => a.tags?.required || a.tags?.catalog_required)
        .every(a => {
            const v = form.attributes[a.id];
            return v !== undefined && v !== "" && v !== null && v !== "[]";
        });

    const canNext = !!form.category_id && requiredFilled;
    const groups = groupAttributes(attributes);

    return (
        <div>
            <h3 className={styles.title}>Categoría en Mercado Libre</h3>
            <p className={styles.subtitle}>Elegí la categoría que mejor describe tu producto.</p>

            {/* Búsqueda */}
            <div className={styles.search_wrap}>
                <FontAwesomeIcon icon={faSearch} className={styles.search_icon} />
                <input
                    className={styles.search_input}
                    type="text"
                    value={search}
                    onChange={e => { setSearch(e.target.value); if (form.category_id) clearCategory(); }}
                    placeholder="Ej: Zapatillas deportivas, Notebook..."
                    autoFocus
                />
                {searching && <FontAwesomeIcon icon={faCircleNotch} spin className={styles.spin} />}
                {search && !searching && (
                    <button type="button" className={styles.clear} onClick={clearCategory}>
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                )}
            </div>

            {results.length > 0 && (
                <ul className={styles.dropdown}>
                    {results.map(cat => (
                        <li key={cat.category_id} onClick={() => selectCategory(cat)}>
                            <span className={styles.cat_name}>{cat.category_name}</span>
                            <span className={styles.cat_domain}>{cat.domain_name}</span>
                            <code className={styles.cat_id}>{cat.category_id}</code>
                        </li>
                    ))}
                </ul>
            )}

            {form.category_id && (
                <div className={styles.selected_pill}>
                    <FontAwesomeIcon icon={faCheck} />
                    <span>{form.category_name}</span>
                    <code>{form.category_id}</code>
                </div>
            )}

            {loadingAttrs && (
                <div className={styles.loading_attrs}>
                    <FontAwesomeIcon icon={faCircleNotch} spin /> Cargando atributos...
                </div>
            )}

            {/* Atributos agrupados */}
            {groups.map(group => (
                <div key={group.key} className={styles.group}>
                    <p className={styles.group_title}>{group.label}</p>
                    <div className={styles.attrs_grid}>
                        {group.attrs.map(attr => {
                            const isRequired = attr.tags?.required || attr.tags?.catalog_required;
                            const isConditional = attr.tags?.conditional_required;
                            const isMultiLine = attr.tags?.multivalued || attr.type === "color" || attr.value_type === "boolean";
                            return (
                                <div
                                    key={attr.id}
                                    className={`${styles.field} ${isMultiLine ? styles.field_full : ""}`}
                                >
                                    <label className={styles.field_label}>
                                        {attr.name}
                                        {isRequired && <span className={styles.required}> *</span>}
                                        {isConditional && !isRequired && (
                                            <span className={styles.conditional}> (condicional)</span>
                                        )}
                                        {attr.tooltip && (
                                            <span className={styles.tooltip_wrap} title={attr.tooltip}>
                                                <FontAwesomeIcon icon={faInfoCircle} className={styles.tooltip_icon} />
                                            </span>
                                        )}
                                    </label>
                                    <AttrField
                                        attr={attr}
                                        value={form.attributes[attr.id]}
                                        onChange={val => handleAttr(attr.id, val)}
                                        barcodes={barcodes}
                                        from={'CATEGORY'}
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}

            <StepNav
                onBack={() => goBack("categoria")}
                onNext={() => goNext("categoria")}
                canNext={canNext}
            />
        </div>
    );
}