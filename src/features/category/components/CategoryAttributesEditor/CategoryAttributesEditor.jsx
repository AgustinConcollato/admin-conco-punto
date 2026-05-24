import { faCircleNotch, faGripVertical, faPlus, faTimes, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { ConfirmModal } from "../../../../components/ConfirmModal/ConfirmModal";
import { CategoryAttributeService } from "../../../../services/category/categoryAttributeService";
import styles from "./CategoryAttributesEditor.module.css";

const TYPE_LABELS = { text: "Texto", number: "Número", select: "Opciones", boolean: "Sí / No" };

const emptyForm = () => ({ name: '', type: 'text', required: false, options: [] });

export function CategoryAttributesEditor({ category }) {
    const service = useMemo(() => new CategoryAttributeService(), []);

    const [attributes, setAttributes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingAttr, setEditingAttr] = useState(null);
    const [form, setForm] = useState(emptyForm());
    const [newOption, setNewOption] = useState('');
    const [saving, setSaving] = useState(false);
    const [pendingDeleteId, setPendingDeleteId] = useState(null);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        load();
    }, [category.id]);

    const load = async () => {
        setIsLoading(true);
        try {
            const data = await service.getAll(category.id);
            setAttributes(data);
        } catch {
            toast.error("Error al cargar atributos.");
        } finally {
            setIsLoading(false);
        }
    };

    const openCreate = () => {
        setEditingAttr(null);
        setForm(emptyForm());
        setErrors({});
        setShowForm(true);
    };

    const openEdit = (attr) => {
        setEditingAttr(attr);
        setForm({
            name: attr.name,
            type: attr.type,
            required: attr.required,
            options: attr.options?.map(o => o.value) ?? [],
        });
        setErrors({});
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setErrors({});
        try {
            const payload = { ...form };
            if (payload.type !== 'select') delete payload.options;

            if (editingAttr) {
                const updated = await service.update(category.id, editingAttr.id, payload);
                setAttributes(prev => prev.map(a => a.id === updated.id ? updated : a));
                toast.success("Atributo actualizado");
            } else {
                const created = await service.create(category.id, payload);
                setAttributes(prev => [...prev, created]);
                toast.success("Atributo creado");
            }
            setShowForm(false);
        } catch (err) {
            if (Array.isArray(err) && err[0]) setErrors(err[0]);
            else toast.error("Error al guardar el atributo.");
        } finally {
            setSaving(false);
        }
    };

    const confirmDelete = async () => {
        try {
            await service.delete(category.id, pendingDeleteId);
            setAttributes(prev => prev.filter(a => a.id !== pendingDeleteId));
            toast.success("Atributo eliminado");
        } catch {
            toast.error("Error al eliminar el atributo.");
        } finally {
            setPendingDeleteId(null);
        }
    };

    const addOption = () => {
        const val = newOption.trim();
        if (!val || form.options.includes(val)) return;
        setForm(f => ({ ...f, options: [...f.options, val] }));
        setNewOption('');
    };

    const removeOption = (val) => {
        setForm(f => ({ ...f, options: f.options.filter(o => o !== val) }));
    };

    return (
        <div className={styles.editor}>
            <div className={styles.header}>
                <p className={styles.subtitle}>
                    Atributos de <strong>{category.name}</strong> — se usan como campos de variantes.
                </p>
                <button className="btn btn_primary" onClick={openCreate}>
                    <FontAwesomeIcon icon={faPlus} /> Agregar
                </button>
            </div>

            {isLoading ? (
                <div className={styles.loading_wrap}><FontAwesomeIcon icon={faCircleNotch} spin /></div>
            ) : attributes.length === 0 ? (
                <p className={styles.empty}>No hay atributos definidos para esta categoría.</p>
            ) : (
                <ul className={styles.attr_list}>
                    {attributes.map(attr => (
                        <li key={attr.id} className={styles.attr_item}>
                            <FontAwesomeIcon icon={faGripVertical} className={styles.grip} />
                            <div className={styles.attr_info}>
                                <span className={styles.attr_name}>{attr.name}</span>
                                <span className={styles.attr_meta}>
                                    {TYPE_LABELS[attr.type]}
                                    {attr.required && <span className={styles.badge_required}>Requerido</span>}
                                </span>
                                {attr.type === 'select' && attr.options?.length > 0 && (
                                    <div className={styles.options_preview}>
                                        {attr.options.map(o => (
                                            <span key={o.id} className={styles.option_pill}>{o.value}</span>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className={styles.attr_actions}>
                                <button className={styles.btn_edit} onClick={() => openEdit(attr)} title="Editar">
                                    Editar
                                </button>
                                <button className={styles.btn_delete} onClick={() => setPendingDeleteId(attr.id)} title="Eliminar">
                                    <FontAwesomeIcon icon={faTrashAlt} />
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {showForm && (
                <div className={styles.form_section}>
                    <h4 className={styles.form_title}>{editingAttr ? 'Editar atributo' : 'Nuevo atributo'}</h4>
                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className="input_group">
                            <span>Nombre</span>
                            <input
                                className="input"
                                type="text"
                                value={form.name}
                                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                placeholder="Ej: Color, Tamaño, Diseño"
                            />
                            {errors.name && <p className={styles.error}>{errors.name[0]}</p>}
                        </div>

                        <div className="input_group">
                            <span>Tipo</span>
                            <select
                                className="input"
                                value={form.type}
                                onChange={e => setForm(f => ({ ...f, type: e.target.value, options: [] }))}
                            >
                                <option value="text">Texto libre</option>
                                <option value="number">Número</option>
                                <option value="select">Lista de opciones</option>
                                <option value="boolean">Sí / No</option>
                            </select>
                        </div>

                        <label className={styles.required_toggle}>
                            <input
                                type="checkbox"
                                checked={form.required}
                                onChange={e => setForm(f => ({ ...f, required: e.target.checked }))}
                            />
                            Requerido al crear variante
                        </label>

                        {form.type === 'select' && (
                            <div className={styles.options_section}>
                                <span className={styles.options_label}>Opciones</span>
                                <div className={styles.option_input_row}>
                                    <input
                                        className="input"
                                        type="text"
                                        value={newOption}
                                        onChange={e => setNewOption(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addOption())}
                                        placeholder="Ej: Rojo, Azul, Verde…"
                                    />
                                    <button type="button" className="btn btn_regular" onClick={addOption}>
                                        <FontAwesomeIcon icon={faPlus} />
                                    </button>
                                </div>
                                <div className={styles.options_preview}>
                                    {form.options.map(o => (
                                        <span key={o} className={styles.option_pill}>
                                            {o}
                                            <button type="button" onClick={() => removeOption(o)}>
                                                <FontAwesomeIcon icon={faTimes} />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                                {errors.options && <p className={styles.error}>{errors.options[0]}</p>}
                            </div>
                        )}

                        <div className={styles.form_actions}>
                            <button type="button" className="btn btn_regular" onClick={() => setShowForm(false)}>
                                Cancelar
                            </button>
                            <button type="submit" className="btn btn_solid" disabled={saving}>
                                {saving ? <FontAwesomeIcon icon={faCircleNotch} spin /> : editingAttr ? 'Guardar' : 'Crear'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {pendingDeleteId && (
                <ConfirmModal
                    message="¿Eliminar este atributo? Se borrarán también todos los valores de variantes asociados."
                    onConfirm={confirmDelete}
                    onCancel={() => setPendingDeleteId(null)}
                />
            )}
        </div>
    );
}
