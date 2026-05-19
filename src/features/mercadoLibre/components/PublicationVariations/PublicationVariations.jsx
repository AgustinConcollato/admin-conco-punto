import { faCheck, faChevronDown, faChevronUp, faCircleNotch, faPen, faLayerGroup, faPlus, faTimes, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useRef, useState } from "react";
import { ConfirmModal } from "../../../../components/ConfirmModal/ConfirmModal";
import { AttrField } from "../TypesAttributesInput/TypesAttributesInput";
import styles from "./PublicationVariations.module.css";

function resolveValueId(attrDef, name) {
    const all = [...(attrDef?.values ?? []), ...(attrDef?.suggested_values ?? [])];
    return all.find(v => v.name === name);
}

function buildAttrPayload(id, value, attrDef) {
    if (value === "" || value === null || value === undefined || value === "[]") return null;
    try {
        const arr = JSON.parse(value);
        if (Array.isArray(arr)) {
            const values = arr.map(v => {
                const m = resolveValueId(attrDef, String(v));
                return m ? { id: m.id, name: m.name } : { name: String(v) };
            });
            return { id, values };
        }
    } catch { /* not JSON */ }
    const match = resolveValueId(attrDef, String(value));
    return match
        ? { id, value_id: match.id, value_name: match.name }
        : { id, value_name: String(value) };
}

function VariationCard({ variation, index, categoryAttrs, pub, onSave, onDelete }) {
    const [open, setOpen] = useState(false);
    const [combos, setCombos]       = useState({});
    const [varAttrs, setVarAttrs]   = useState({});
    const [qty, setQty]             = useState(variation.available_quantity);
    const [pictureIds, setPictureIds] = useState(variation.picture_ids ?? []);
    const [saving, setSaving]       = useState(false);
    const [deleting, setDeleting]   = useState(false);
    const [pendingDelete, setPendingDelete] = useState(false);
    const [error, setError]         = useState(null);
    const [saved, setSaved]         = useState(false);

    useEffect(() => {
        const c = {};
        for (const combo of variation.attribute_combinations ?? []) {
            c[combo.id] = combo.value_name;
        }
        setCombos(c);

        const a = {};
        for (const attr of variation.attributes ?? []) {
            if (Array.isArray(attr.values) && attr.values.length > 1) {
                const names = attr.values.map(v => v.name).filter(Boolean);
                if (names.length) a[attr.id] = JSON.stringify(names);
                continue;
            }
            if (attr.value_name) a[attr.id] = attr.value_name;
        }
        setVarAttrs(a);
        setQty(variation.available_quantity);
        setPictureIds(variation.picture_ids ?? []);
    }, [variation]);

    const togglePicture = (id) => {
        setPictureIds(prev =>
            prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
        );
    };

    const handleDelete = async () => {
        setDeleting(true);
        setError(null);
        try {
            await onDelete(variation.id);
        } catch (e) {
            let msg = "Error al eliminar variante.";
            if (e?.cause?.length) msg = e.cause.map(c => c.message).filter(Boolean).join(" / ");
            else if (e?.message) msg = e.message;
            setError(msg);
        } finally {
            setDeleting(false);
        }
    };

    const handleReset = () => {
        const c = {};
        for (const combo of variation.attribute_combinations ?? []) c[combo.id] = combo.value_name;
        setCombos(c);
        setQty(variation.available_quantity);
        setPictureIds(variation.picture_ids ?? []);
        setError(null);
        setOpen(false);
    };

    const handleSave = async () => {
        setSaving(true);
        setError(null);
        setSaved(false);
        try {
            const attribute_combinations = (variation.attribute_combinations ?? []).map(combo => {
                const catAttr = categoryAttrs.find(a => a.id === combo.id);
                const newName = combos[combo.id] ?? combo.value_name;
                const matched = catAttr?.values?.find(v => v.name === newName);
                return {
                    id: combo.id,
                    value_id: matched?.id ?? combo.value_id ?? null,
                    value_name: newName ?? null,
                };
            });

            const attributes = Object.entries(varAttrs)
                .map(([id, value]) => buildAttrPayload(id, value, categoryAttrs.find(a => a.id === id)))
                .filter(Boolean);

            await onSave({
                id: variation.id,
                attribute_combinations,
                available_quantity: parseInt(qty) || variation.available_quantity,
                price: variation.price,
                picture_ids: pictureIds,
                ...(attributes.length > 0 && { attributes }),
            });

            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (e) {
            let msg = "Error al guardar.";
            if (e?.cause?.length) msg = e.cause.map(c => c.message).filter(Boolean).join(" / ");
            else if (e?.message) msg = e.message;
            setError(msg);
        } finally {
            setSaving(false);
        }
    };

    // Solo mostrar product_identifier (EAN, UPC, GTIN, MPN) en variation-level attrs.
    const varAttrDefs = categoryAttrs.filter(a =>
        a.tags?.variation_attribute &&
        !a.tags?.allow_variations &&
        !a.tags?.read_only &&
        a.type === "product_identifier"
    );

    return (
        <div className={styles.variation_card}>
            <button className={styles.variation_header} onClick={() => setOpen(o => !o)}>
                <div className={styles.combos_row}>
                    <span className={styles.var_index}>#{index + 1}</span>
                    {(variation.attribute_combinations ?? []).map(combo => (
                        <span key={combo.id} className={styles.combo_chip}>
                            <span className={styles.combo_name}>{combo.name}:</span>
                            <span className={styles.combo_value}>{combo.value_name}</span>
                        </span>
                    ))}
                    <span className={styles.qty_badge}>Stock: {variation.available_quantity}</span>
                    {saved && <span className={styles.saved_badge}><FontAwesomeIcon icon={faCheck} /> Guardado</span>}
                </div>
                <FontAwesomeIcon icon={open ? faChevronUp : faChevronDown} className={styles.chevron} />
            </button>

            {open && (
                <div className={styles.variation_body}>
                    {error && <div className={styles.error}>{error}</div>}

                    <div className={styles.section_label}>Combinaciones</div>
                    <div className={styles.fields_grid}>
                        {(variation.attribute_combinations ?? []).map(combo => {
                            const catAttr = categoryAttrs.find(a => a.id === combo.id) ?? { id: combo.id, name: combo.name, value_type: "string" };
                            return (
                                <div key={combo.id} className={styles.field}>
                                    <label className={styles.field_label}>{combo.name}</label>
                                    <AttrField
                                        attr={catAttr}
                                        value={combos[combo.id]}
                                        onChange={val => setCombos(c => ({ ...c, [combo.id]: val }))}
                                    />
                                </div>
                            );
                        })}
                        <div className={styles.field}>
                            <label className={styles.field_label}>Stock</label>
                            <input
                                className={styles.input}
                                type="number"
                                min={0}
                                value={qty}
                                onChange={e => setQty(e.target.value)}
                            />
                        </div>
                    </div>

                    {varAttrDefs.length > 0 && (
                        <>
                            <div className={styles.section_label}>Códigos de identificación</div>
                            <div className={styles.fields_grid}>
                                {varAttrDefs.map(attrDef => (
                                    <div key={attrDef.id} className={styles.field}>
                                        <label className={styles.field_label}>{attrDef.name}</label>
                                        <AttrField
                                            attr={attrDef}
                                            value={varAttrs[attrDef.id] ?? ""}
                                            onChange={val => setVarAttrs(a => ({ ...a, [attrDef.id]: val }))}
                                        />
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {(pub.pictures ?? []).length > 0 && (
                        <>
                            <div className={styles.section_label}>Fotos de la variante</div>
                            <div className={styles.pictures_grid}>
                                {pub.pictures.map(pic => {
                                    const selected = pictureIds.includes(pic.id);
                                    return (
                                        <button
                                            key={pic.id}
                                            type="button"
                                            className={`${styles.picture_thumb} ${selected ? styles.picture_thumb_selected : ""}`}
                                            onClick={() => togglePicture(pic.id)}
                                            title={selected ? "Quitar foto" : "Asignar foto"}
                                        >
                                            <img src={pic.secure_url ?? pic.url} alt="" />
                                            {selected && (
                                                <span className={styles.picture_thumb_check}>
                                                    <FontAwesomeIcon icon={faCheck} />
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </>
                    )}

                    <div className={styles.actions}>
                        <button className={styles.btn_delete} onClick={() => setPendingDelete(true)} disabled={saving || deleting}>
                            {deleting
                                ? <FontAwesomeIcon icon={faCircleNotch} spin />
                                : <FontAwesomeIcon icon={faTrash} />
                            }
                        </button>
                        <button className={styles.btn_cancel} onClick={handleReset} disabled={saving || deleting}>
                            Cancelar
                        </button>
                        <button className={styles.btn_save} onClick={handleSave} disabled={saving || deleting}>
                            {saving
                                ? <><FontAwesomeIcon icon={faCircleNotch} spin /> Guardando...</>
                                : <><FontAwesomeIcon icon={faCheck} /> Guardar variante</>
                            }
                        </button>
                    </div>
                </div>
            )}

            {pendingDelete && (
                <ConfirmModal
                    message={`¿Eliminar variante #${index + 1}? Esta acción no se puede deshacer.`}
                    onConfirm={() => { setPendingDelete(false); handleDelete(); }}
                    onCancel={() => setPendingDelete(false)}
                />
            )}
        </div>
    );
}

// ─── Form nueva variante ──────────────────────────────────────────────────────
function NewVariationForm({ pub, variations, categoryAttrs, mlService, onDone, onCancel }) {
    // Derive which attribute_combinations to ask for from existing variations
    // (must match the same set). If no variations, use allow_variations attrs from category.
    const comboAttrIds = variations.length > 0
        ? (variations[0].attribute_combinations ?? [])
            .filter(c => c.value_id || c.value_name)
            .map(c => c.id)
        : categoryAttrs.filter(a => a.tags?.allow_variations).map(a => a.id);

    const initCombos = () => Object.fromEntries(comboAttrIds.map(id => [id, ""]));

    const [combos, setCombos]         = useState(initCombos);
    const [qty, setQty]               = useState(1);
    const [varAttrs, setVarAttrs]     = useState({});
    const [pictureIds, setPictureIds]       = useState(
        variations[0]?.picture_ids ?? (pub.pictures ?? []).map(p => p.id)
    );
    const [uploadedPics, setUploadedPics]   = useState([]);
    const [uploading, setUploading]         = useState(false);
    const [saving, setSaving]               = useState(false);
    const [error, setError]                 = useState(null);
    const fileInputRef                      = useRef(null);

    const togglePicture = (id) => {
        setPictureIds(prev =>
            prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
        );
    };

    const handleUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const localUrl = URL.createObjectURL(file);
        const tempId = `temp_${Date.now()}`;
        setUploadedPics(prev => [...prev, { id: tempId, url: localUrl, secure_url: localUrl }]);
        setPictureIds(prev => [...prev, tempId]);
        setUploading(true);
        try {
            const result = await mlService.uploadPicture(file);
            const mlId = result?.id;
            const mlUrl = result?.variations?.[0]?.secure_url
                ?? result?.variations?.[0]?.url
                ?? result?.secure_url
                ?? result?.url;
            if (!mlId) throw new Error(JSON.stringify(result));
            setUploadedPics(prev => prev.map(p =>
                p.id === tempId ? { id: mlId, url: mlUrl, secure_url: mlUrl } : p
            ));
            setPictureIds(prev => prev.map(id => id === tempId ? mlId : id));
        } catch (err) {
            setUploadedPics(prev => prev.filter(p => p.id !== tempId));
            setPictureIds(prev => prev.filter(id => id !== tempId));
            setError("Error al subir imagen: " + (err?.message ?? JSON.stringify(err)));
        } finally {
            setUploading(false);
            e.target.value = "";
        }
    };

    // Solo mostrar product_identifier (EAN, UPC, GTIN, MPN) en variation-level attrs.
    // Otros variation_attribute (MAIN_COLOR, etc.) generan conflictos con item.attributes.
    const varAttrDefs = categoryAttrs.filter(a =>
        a.tags?.variation_attribute &&
        !a.tags?.allow_variations &&
        !a.tags?.read_only &&
        a.type === "product_identifier"
    );

    const handleAdd = async () => {
        setSaving(true);
        setError(null);
        try {
            const attribute_combinations = comboAttrIds
                .map(id => {
                    const catAttr = categoryAttrs.find(a => a.id === id);
                    const name = catAttr?.name ?? id;
                    const valueName = combos[id];
                    const matched = catAttr?.values?.find(v => v.name === valueName);
                    return {
                        id,
                        name,
                        value_id: matched?.id ?? null,
                        value_name: valueName || null,
                    };
                })
                .filter(c => c.value_id || c.value_name);

            const attributes = Object.entries(varAttrs)
                .map(([id, value]) => buildAttrPayload(id, value, categoryAttrs.find(a => a.id === id)))
                .filter(Boolean);

            const conflictIds = new Set(
                categoryAttrs
                    .filter(a => a.tags?.allow_variations || a.tags?.variation_attribute)
                    .map(a => a.id)
            );
            // COLOR y otros allow_variations son `hidden` — no aparecen en pub.attributes
            // pero ML los mantiene internamente. Remover explícitamente con null + values array.
            const explicitRemovals = categoryAttrs
                .filter(a => a.tags?.allow_variations)
                .map(a => ({
                    id: a.id,
                    value_id: null,
                    value_name: null,
                    values: [{ id: null, name: null }],
                }));

            const cleanedAttrs = [
                ...(pub.attributes ?? [])
                    .filter(a => !conflictIds.has(a.id))
                    .map(a => ({
                        id: a.id,
                        value_id: a.value_id ?? null,
                        value_name: a.value_name ?? null,
                    })),
                ...explicitRemovals,
            ];

            const existingPicIds = new Set((pub.pictures ?? []).map(p => p.id));
            const newPicIds = uploadedPics.map(p => p.id).filter(id => !existingPicIds.has(id));
            const allPictures = newPicIds.length > 0
                ? [...(pub.pictures ?? []).map(p => ({ id: p.id })), ...newPicIds.map(id => ({ id }))]
                : null;

            const newVariation = {
                attribute_combinations,
                price: pub.price,
                available_quantity: parseInt(qty) || 1,
                picture_ids: pictureIds,
                ...(attributes.length > 0 && { attributes }),
            };

            if (variations.length === 0) {
                // Primera variante: ML valida picture_ids antes de aplicar pictures del mismo request.
                // PUT 1: limpiar attributes + agregar fotos nuevas
                await mlService.updatePublication(pub.id, {
                    attributes: cleanedAttrs,
                    ...(allPictures && { pictures: allPictures }),
                });
                // PUT 2: agregar variation + repetir attributes limpios por si PUT 1 no aplicó
                await mlService.updatePublication(pub.id, {
                    attributes: cleanedAttrs,
                    variations: [newVariation],
                });
            } else {
                // Variantes siguientes: item.attributes ya está limpio
                if (allPictures) {
                    await mlService.updatePublication(pub.id, { pictures: allPictures });
                }
                await mlService.addVariation(pub.id, newVariation);
            }

            onDone();
        } catch (e) {
            let msg = "Error al agregar variante.";
            if (e?.cause?.length) msg = e.cause.map(c => c.message).filter(Boolean).join(" / ");
            else if (e?.message) msg = e.message;
            setError(msg);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className={styles.new_form}>
            {error && <div className={styles.error}>{error}</div>}

            <div className={styles.section_label}>Combinaciones de la nueva variante</div>
            <div className={styles.fields_grid}>
                {comboAttrIds.map(id => {
                    const catAttr = categoryAttrs.find(a => a.id === id) ?? { id, name: id, value_type: "string" };
                    const label = catAttr?.name ?? id;
                    return (
                        <div key={id} className={styles.field}>
                            <label className={styles.field_label}>{label}</label>
                            <AttrField
                                attr={catAttr}
                                value={combos[id]}
                                onChange={val => setCombos(c => ({ ...c, [id]: val }))}
                            />
                        </div>
                    );
                })}
                <div className={styles.field}>
                    <label className={styles.field_label}>Stock</label>
                    <input className={styles.input} type="number" min={0} value={qty} onChange={e => setQty(e.target.value)} />
                </div>
            </div>

            {varAttrDefs.length > 0 && (
                <>
                    <div className={styles.section_label}>Códigos de identificación</div>
                    <div className={styles.fields_grid}>
                        {varAttrDefs.map(attrDef => (
                            <div key={attrDef.id} className={styles.field}>
                                <label className={styles.field_label}>{attrDef.name}</label>
                                <AttrField
                                    attr={attrDef}
                                    value={varAttrs[attrDef.id] ?? ""}
                                    onChange={val => setVarAttrs(a => ({ ...a, [attrDef.id]: val }))}
                                />
                            </div>
                        ))}
                    </div>
                </>
            )}

            <>
                <div className={styles.section_label}>Fotos de la variante</div>
                <div className={styles.pictures_grid}>
                    {[...(pub.pictures ?? []), ...uploadedPics].map(pic => {
                        const selected = pictureIds.includes(pic.id);
                        return (
                            <button
                                key={pic.id}
                                type="button"
                                className={`${styles.picture_thumb} ${selected ? styles.picture_thumb_selected : ""}`}
                                onClick={() => togglePicture(pic.id)}
                                title={selected ? "Quitar foto" : "Asignar foto"}
                            >
                                <img src={pic.secure_url ?? pic.url} alt="" />
                                {selected && (
                                    <span className={styles.picture_thumb_check}>
                                        <FontAwesomeIcon icon={faCheck} />
                                    </span>
                                )}
                            </button>
                        );
                    })}
                    <button
                        type="button"
                        className={styles.picture_upload_btn}
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        title="Subir nueva foto"
                    >
                        {uploading
                            ? <FontAwesomeIcon icon={faCircleNotch} spin />
                            : <FontAwesomeIcon icon={faPlus} />
                        }
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        style={{ display: "none" }}
                        onChange={handleUpload}
                    />
                </div>
            </>

            <div className={styles.actions}>
                <button className={styles.btn_cancel} onClick={onCancel} disabled={saving}>
                    <FontAwesomeIcon icon={faTimes} /> Cancelar
                </button>
                <button className={styles.btn_save} onClick={handleAdd} disabled={saving}>
                    {saving
                        ? <><FontAwesomeIcon icon={faCircleNotch} spin /> Guardando...</>
                        : <><FontAwesomeIcon icon={faPlus} /> Agregar variante</>
                    }
                </button>
            </div>
        </div>
    );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export function PublicationVariations({ pub, mlService, onUpdate }) {
    const [categoryAttrs, setCategoryAttrs] = useState([]);
    const [loading, setLoading]   = useState(true);
    const [showNew, setShowNew]   = useState(false);

    const variations = pub.variations ?? [];

    useEffect(() => {
        if (!pub.category_id) { setLoading(false); return; }
        const load = async () => {
            setLoading(true);
            try {
                const attrs = await mlService.getCategoryAttributes(pub.category_id);
                setCategoryAttrs(Array.isArray(attrs) ? attrs : []);
            } catch {
                setCategoryAttrs([]);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [pub.category_id]);

    // Show only if pub has variations OR category supports them
    const allowVariationAttrs = categoryAttrs.filter(a => a.tags?.allow_variations);
    if (!loading && variations.length === 0 && allowVariationAttrs.length === 0) return null;

    const handleDelete = async (variationId) => {
        const updated = await mlService.deleteVariation(pub.id, variationId);
        onUpdate?.(updated?.ml_item ?? updated);
    };

    const handleSave = async (variationData) => {
        const allVariations = variations.map(v =>
            v.id === variationData.id ? variationData : { id: v.id }
        );
        const updated = await mlService.updatePublication(pub.id, {
            variations: allVariations,
        });
        onUpdate?.(updated?.ml_item ?? updated);
    };

    const handleAdded = () => {
        setShowNew(false);
        onUpdate?.(null); // nueva variante: reload completo necesario
    };

    return (
        <div className={styles.card}>
            <div className={styles.card_header}>
                <p className={styles.card_title}>
                    <FontAwesomeIcon icon={faLayerGroup} /> Variantes ({variations.length})
                </p>
                {!showNew && (
                    <button className={styles.btn_add} onClick={() => setShowNew(true)}>
                        <FontAwesomeIcon icon={faPlus} /> Nueva variante
                    </button>
                )}
            </div>

            {loading ? (
                <div className={styles.loading}><FontAwesomeIcon icon={faCircleNotch} spin /></div>
            ) : (
                <>
                    {variations.length > 0 && (
                        <div className={styles.list}>
                            {variations.map((variation, i) => (
                                <VariationCard
                                    key={variation.id}
                                    index={i}
                                    variation={variation}
                                    categoryAttrs={categoryAttrs}
                                    pub={pub}
                                    onSave={handleSave}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </div>
                    )}

                    {showNew && (
                        <NewVariationForm
                            pub={pub}
                            variations={variations}
                            categoryAttrs={categoryAttrs}
                            mlService={mlService}
                            onDone={handleAdded}
                            onCancel={() => setShowNew(false)}
                        />
                    )}
                </>
            )}
        </div>
    );
}
