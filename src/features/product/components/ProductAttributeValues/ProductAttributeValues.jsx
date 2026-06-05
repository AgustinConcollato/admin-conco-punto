import { faCircleNotch, faEdit } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { CategoryAttributeService } from "../../../../services/category/categoryAttributeService";
import { ProductService } from "../../../../services/product/productService";
import { ComboInput } from "../../../../components/ComboInput/ComboInput";
import styles from "./ProductAttributeValues.module.css";

export function ProductAttributeValues({ productId, deepestCategoryId, initialAttributeValues }) {
    const productService = useMemo(() => new ProductService(), []);
    const categoryAttrService = useMemo(() => new CategoryAttributeService(), []);

    const [categoryAttributes, setCategoryAttributes] = useState([]);
    const [values, setValues] = useState({});
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        if (!deepestCategoryId) { setLoading(false); return; }
        setLoading(true);
        categoryAttrService.getAll(deepestCategoryId)
            .then(attrs => { setCategoryAttributes(attrs); setLoading(false); })
            .catch(() => setLoading(false));
    }, [deepestCategoryId]);

    useEffect(() => {
        if (!initialAttributeValues?.length) return;
        const map = {};
        initialAttributeValues.forEach(av => { map[av.category_attribute_id] = av.value; });
        setValues(map);
    }, [initialAttributeValues]);

    const setVal = (attrId, value) => setValues(prev => ({ ...prev, [attrId]: value }));

    const handleSave = async () => {
        setSaving(true);
        try {
            const payload = Object.entries(values)
                .filter(([, v]) => v !== '')
                .map(([attrId, value]) => ({
                    category_attribute_id: parseInt(attrId),
                    value,
                }));
            await productService.updateAttributeValues(productId, payload);
            toast.success('Propiedades actualizadas');
            setEditing(false);
        } catch {
            toast.error('Error al guardar propiedades.');
        } finally {
            setSaving(false);
        }
    };

    if (!deepestCategoryId || (!loading && !categoryAttributes.length)) return null;

    return (
        <div className={styles.section}>
            <div className={styles.header}>
                <h3>Propiedades</h3>
                {!editing ? (
                    <button className="btn btn_regular" onClick={() => setEditing(true)}>
                        <FontAwesomeIcon icon={faEdit} /> Editar
                    </button>
                ) : (
                    <div className={styles.edit_actions}>
                        <button className="btn btn_regular" onClick={() => setEditing(false)}>Cancelar</button>
                        <button className="btn btn_solid" onClick={handleSave} disabled={saving}>
                            {saving ? <FontAwesomeIcon icon={faCircleNotch} spin /> : 'Guardar'}
                        </button>
                    </div>
                )}
            </div>

            {loading ? (
                <div className={styles.loading}><FontAwesomeIcon icon={faCircleNotch} spin /></div>
            ) : (
                <div className={styles.attrs_list}>
                    {categoryAttributes.map(attr => {
                        const val = values[attr.id] ?? '';
                        return (
                            <div key={attr.id} className={styles.attr_row}>
                                <span className={styles.attr_name}>{attr.name}</span>
                                {editing ? (
                                    attr.type === 'select' ? (
                                        <select className="input" value={val} onChange={e => setVal(attr.id, e.target.value)}>
                                            <option value="">— Seleccionar —</option>
                                            {attr.options?.map(opt => (
                                                <option key={opt.id} value={opt.value}>{opt.value}</option>
                                            ))}
                                        </select>
                                    ) : attr.type === 'combo' ? (
                                        <ComboInput
                                            options={attr.options?.map(o => o.value) ?? []}
                                            value={val}
                                            onChange={v => setVal(attr.id, v)}
                                            placeholder={attr.name}
                                        />
                                    ) : attr.type === 'boolean' ? (
                                        <label className={styles.bool_toggle}>
                                            <input
                                                type="checkbox"
                                                checked={val === 'true'}
                                                onChange={e => setVal(attr.id, e.target.checked ? 'true' : 'false')}
                                            />
                                            {val === 'true' ? 'Sí' : 'No'}
                                        </label>
                                    ) : (
                                        <input
                                            className="input"
                                            type={attr.type === 'number' ? 'number' : 'text'}
                                            value={val}
                                            onChange={e => setVal(attr.id, e.target.value)}
                                            placeholder={attr.name}
                                        />
                                    )
                                ) : (
                                    <span className={styles.attr_value}>
                                        {attr.type === 'boolean'
                                            ? (val === 'true' ? 'Sí' : 'No')
                                            : val || <span className={styles.empty_val}>—</span>}
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}



