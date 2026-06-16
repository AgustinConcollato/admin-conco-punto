import { faCircleNotch, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import { ComboInput } from "../../../../components/ComboInput/ComboInput";
import { DragAndDrop } from "../../../../components/DragAndDrop/DragAndDrop";
import { IMAGE_URL } from "../../../../config/api";
import { ProductService } from "../../../../services/product/productService";
import { ProductVariantService } from "../../../../services/product/productVariantService";
import styles from "./VariantForm.module.css";

const emptyForm = (categoryAttributes) => ({
    sku: '',
    stock: 0,
    is_active: true,
    attribute_values: categoryAttributes.map(attr => ({
        category_attribute_id: attr.id,
        value: '',
    })),
});

export function VariantForm({ productId, productSku, categoryAttributes, editingVariant, isDropship = false, onSaved, onCancel }) {
    const service = useMemo(() => new ProductVariantService(), []);
    const productService = useMemo(() => new ProductService(), []);

    // Si categoryAttributes está vacío pero la variante ya tiene valores,
    // derivar los atributos del category_attribute anidado en cada valor
    const effectiveAttrs = categoryAttributes.length > 0
        ? categoryAttributes
        : (editingVariant?.attribute_values ?? [])
            .map(av => av.category_attribute)
            .filter(Boolean);

    const initForm = () => {
        if (editingVariant) {
            const attrMap = {};
            editingVariant.attribute_values?.forEach(av => {
                attrMap[av.category_attribute_id] = av.value;
            });
            const prefix = productSku ? `${productSku}-` : '';
            const rawSku = editingVariant.sku ?? '';
            const skuSuffix = prefix && rawSku.startsWith(prefix) ? rawSku.slice(prefix.length) : rawSku;
            return {
                sku: skuSuffix,
                stock: editingVariant.stock,
                is_active: editingVariant.is_active,
                attribute_values: effectiveAttrs.map(attr => ({
                    category_attribute_id: attr.id,
                    value: attrMap[attr.id] ?? '',
                })),
            };
        }
        return emptyForm(effectiveAttrs);
    };

    const [form, setForm] = useState(initForm);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});

    // Images
    const [existingImages, setExistingImages] = useState(editingVariant?.images ?? []);
    const [newImageFiles, setNewImageFiles] = useState([]);
    const [deletingImageId, setDeletingImageId] = useState(null);

    // Barcodes
    const [existingBarcodes, setExistingBarcodes] = useState(editingVariant?.barcodes ?? []);
    const [pendingBarcodes, setPendingBarcodes] = useState([]);
    const [barcodeInput, setBarcodeInput] = useState('');
    const [deletingBarcodeId, setDeletingBarcodeId] = useState(null);

    const setAttrValue = (attrId, value) => {
        setForm(f => ({
            ...f,
            attribute_values: f.attribute_values.map(av =>
                av.category_attribute_id === attrId ? { ...av, value } : av
            ),
        }));
    };

    // ── Images ──────────────────────────────────────────────────────────────

    const removeNewFile = (index) => {
        setNewImageFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleDeleteExistingImage = async (imageId) => {
        setDeletingImageId(imageId);
        try {
            await productService.deleteImages({ image_ids: [imageId] }, productId);
            setExistingImages(prev => prev.filter(img => img.id !== imageId));
        } catch {
            toast.error('Error al eliminar la imagen.');
        } finally {
            setDeletingImageId(null);
        }
    };

    const uploadImages = async (variantId) => {
        if (!newImageFiles.length) return [];
        const formData = new FormData();
        newImageFiles.forEach(f => formData.append('images[]', f));
        formData.append('variant_id', variantId);
        const response = await productService.addImages(formData, productId);
        return response.images ?? [];
    };

    // ── Barcodes ─────────────────────────────────────────────────────────────

    const handleAddPendingBarcode = () => {
        const val = barcodeInput.trim().toUpperCase();
        if (!val) return;
        if (pendingBarcodes.includes(val) || existingBarcodes.some(b => b.barcode === val)) {
            toast.error('Ese código ya está en la lista.');
            return;
        }
        setPendingBarcodes(prev => [...prev, val]);
        setBarcodeInput('');
    };

    const removePendingBarcode = (index) => {
        setPendingBarcodes(prev => prev.filter((_, i) => i !== index));
    };

    const handleDeleteExistingBarcode = async (barcodeId) => {
        setDeletingBarcodeId(barcodeId);
        try {
            await productService.destroyBarcode(barcodeId);
            prev.filter(b => b.id !== barcodeId);
            setExistingBarcodes(prev => prev.filter(b => b.id !== barcodeId));
        } catch {
            toast.error('Error al eliminar el código de barras.');
        } finally {
            setDeletingBarcodeId(null);
        }
    };

    const uploadBarcodes = async (variantId) => {
        const uploaded = [];
        for (const barcode of pendingBarcodes) {
            try {
                const bc = await service.addBarcode(productId, variantId, barcode);
                uploaded.push(bc);
            } catch (err) {
                const msg = err?.[0]?.barcode?.[0] ?? `No se pudo guardar: ${barcode}`;
                toast.error(msg);
            }
        }
        return uploaded;
    };

    // ── Submit ───────────────────────────────────────────────────────────────

    const handleSubmit = async (e) => {
        e.preventDefault();
        const skuSuffix = form.sku.trim();
        if (!skuSuffix) {
            setErrors({ sku: ['El SKU es obligatorio'] });
            return;
        }
        const fullSku = productSku ? `${productSku}-${skuSuffix}` : skuSuffix;
        setSaving(true);
        setErrors({});
        try {
            const payload = {
                ...form,
                sku: fullSku,
                stock: parseInt(form.stock) || 0,
                attribute_values: form.attribute_values.filter(av => av.value !== ''),
            };

            let saved;
            if (editingVariant) {
                saved = await service.update(productId, editingVariant.id, payload);
            } else {
                saved = await service.create(productId, payload);
            }

            const uploadedImages = newImageFiles.length ? await uploadImages(saved.id) : [];
            const uploadedBarcodes = pendingBarcodes.length ? await uploadBarcodes(saved.id) : [];

            saved = {
                ...saved,
                images: [...existingImages, ...uploadedImages],
                barcodes: [...existingBarcodes, ...uploadedBarcodes],
            };

            toast.success(editingVariant ? 'Variante actualizada' : 'Variante creada');
            onSaved(saved, !!editingVariant);
        } catch (err) {
            if (err?.error) toast.error(err.error);
            else if (Array.isArray(err) && err[0]) setErrors(err[0]);
            else toast.error('Error al guardar la variante.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.row}>
                <div className="input_group">
                    <span>SKU</span>
                    {productSku ? (
                        <div className={styles.sku_prefix_wrapper}>
                            <span className={styles.sku_prefix}>{productSku}-</span>
                            <input
                                className={`input ${styles.sku_suffix_input}`}
                                type="text"
                                value={form.sku}
                                onChange={e => setForm(f => ({ ...f, sku: e.target.value.toUpperCase() }))}
                                placeholder="ROJO-M"
                            />
                        </div>
                    ) : (
                        <input
                            className="input"
                            type="text"
                            value={form.sku}
                            onChange={e => setForm(f => ({ ...f, sku: e.target.value.toUpperCase() }))}
                            placeholder="Ej: SKU-001"
                        />
                    )}
                    {errors.sku && <p className={styles.error}>{errors.sku[0]}</p>}
                </div>
                {isDropship ? (
                    <div className="input_group">
                        <span>Disponibilidad</span>
                        <label className={styles.bool_toggle}>
                            <input
                                type="checkbox"
                                checked={Number(form.stock) > 0}
                                onChange={e => setForm(f => ({ ...f, stock: e.target.checked ? 1 : 0 }))}
                            />
                            {Number(form.stock) > 0 ? 'Disponible' : 'Sin stock'}
                        </label>
                    </div>
                ) : (
                    <div className="input_group">
                        <span>Stock</span>
                        <input
                            className="input"
                            type="number"
                            min="0"
                            value={form.stock}
                            onChange={e => setForm(f => ({ ...f, stock: e.target.value }))}
                        />
                        {errors.stock && <p className={styles.error}>{errors.stock[0]}</p>}
                    </div>
                )}
            </div>

            {effectiveAttrs.length > 0 && (
                <div className={styles.attrs_section}>
                    <p className={styles.attrs_label}>Atributos</p>
                    {effectiveAttrs.map(attr => {
                        const val = form.attribute_values.find(av => av.category_attribute_id === attr.id)?.value ?? '';
                        return (
                            <div key={attr.id} className="input_group">
                                <span>
                                    {attr.name}
                                    {attr.required && <span className={styles.required_mark}> *</span>}
                                </span>
                                {attr.type === 'select' ? (
                                    <select className="input" value={val} onChange={e => setAttrValue(attr.id, e.target.value)}>
                                        <option value="">— Seleccionar —</option>
                                        {attr.options?.map(opt => (
                                            <option key={opt.id} value={opt.value}>{opt.value}</option>
                                        ))}
                                    </select>
                                ) : attr.type === 'combo' ? (
                                    <ComboInput
                                        options={attr.options?.map(o => o.value) ?? []}
                                        value={val}
                                        onChange={v => setAttrValue(attr.id, v)}
                                        placeholder={attr.name}
                                    />
                                ) : attr.type === 'boolean' ? (
                                    <label className={styles.bool_toggle}>
                                        <input
                                            type="checkbox"
                                            checked={val === 'true'}
                                            onChange={e => setAttrValue(attr.id, e.target.checked ? 'true' : 'false')}
                                        />
                                        {val === 'true' ? 'Sí' : 'No'}
                                    </label>
                                ) : (
                                    <input
                                        className="input"
                                        type={attr.type === 'number' ? 'number' : 'text'}
                                        value={val}
                                        onChange={e => setAttrValue(attr.id, e.target.value)}
                                        placeholder={attr.name}
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Barcodes section */}
            <div className={styles.barcodes_section}>
                <p className={styles.attrs_label}>Códigos de barras <small className={styles.optional}>(opcional)</small></p>

                {existingBarcodes.map(bc => (
                    <div key={bc.id} className={styles.barcode_row}>
                        <span className={styles.barcode_val}>{bc.barcode}</span>
                        <button
                            type="button"
                            className={styles.btn_bc_remove}
                            onClick={() => handleDeleteExistingBarcode(bc.id)}
                            disabled={deletingBarcodeId === bc.id}
                        >
                            {deletingBarcodeId === bc.id
                                ? <FontAwesomeIcon icon={faCircleNotch} spin />
                                : <FontAwesomeIcon icon={faXmark} />}
                        </button>
                    </div>
                ))}

                {pendingBarcodes.map((bc, i) => (
                    <div key={i} className={`${styles.barcode_row} ${styles.barcode_pending}`}>
                        <span className={styles.barcode_val}>{bc}</span>
                        <button type="button" className={styles.btn_bc_remove} onClick={() => removePendingBarcode(i)}>
                            <FontAwesomeIcon icon={faXmark} />
                        </button>
                    </div>
                ))}

                <div className={styles.barcode_add_row}>
                    <input
                        className="input"
                        type="text"
                        value={barcodeInput}
                        onChange={e => setBarcodeInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddPendingBarcode(); } }}
                        placeholder="Ej: 7790001234567"
                    />
                    <button
                        type="button"
                        className="btn btn_regular"
                        onClick={handleAddPendingBarcode}
                        disabled={!barcodeInput.trim()}
                    >
                        Agregar
                    </button>
                </div>
            </div>

            {/* Images section */}
            <div className={styles.images_section}>
                <p className={styles.attrs_label}>Fotos <small className={styles.optional}>(opcional)</small></p>

                {existingImages.length > 0 && (
                    <div className={styles.images_row}>
                        {existingImages.map(img => (
                            <div key={img.id} className={styles.img_thumb}>
                                <img src={`${IMAGE_URL}/${img.thumbnail_path}`} alt="" />
                                <button
                                    type="button"
                                    className={styles.btn_img_remove}
                                    onClick={() => handleDeleteExistingImage(img.id)}
                                    disabled={deletingImageId === img.id}
                                >
                                    {deletingImageId === img.id
                                        ? <FontAwesomeIcon icon={faCircleNotch} spin />
                                        : <FontAwesomeIcon icon={faXmark} />}
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {newImageFiles.length > 0 && (
                    <div className={styles.images_row}>
                        {newImageFiles.map((file, i) => (
                            <div key={i} className={styles.img_thumb}>
                                <img src={URL.createObjectURL(file)} alt="" />
                                <button
                                    type="button"
                                    className={styles.btn_img_remove}
                                    onClick={() => removeNewFile(i)}
                                >
                                    <FontAwesomeIcon icon={faXmark} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <DragAndDrop setImages={setNewImageFiles} />
            </div>

            <label className={styles.active_toggle}>
                <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))}
                />
                Variante activa
            </label>

            <div className={styles.actions}>
                <button type="button" className="btn btn_regular" onClick={onCancel}>Cancelar</button>
                <button type="submit" className="btn btn_solid" disabled={saving}>
                    {saving ? <FontAwesomeIcon icon={faCircleNotch} spin /> : editingVariant ? 'Guardar' : 'Crear variante'}
                </button>
            </div>
        </form>
    );
}



