import { useEffect, useMemo, useState } from 'react';
import { PRICE_LISTS } from '../../../../config/priceList';
import styles from './CreatePromotion.module.css'
import { PromotionService } from '../../../../services/promotion/promotionService';
import { parseApiError } from '../../../../utils/parseApiError';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';

export function CreatePromotion({ editingPromotion, onClose }) {
    const promotionService = useMemo(() => new PromotionService(), []);

    const [formErrors, setFormErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState(initialFormState());

    const priceLists = PRICE_LISTS || [];

    function initialFormState() {
        return {
            name: "",
            description: "",
            is_active: true,

            starts_at: "",
            ends_at: "",

            discount_type: "percentage",
            discount_value: "",
            max_discount_amount: "",
            min_quantity: 1,

            price_list_ids: [],
        };
    }

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handlePriceListChange = (e) => {
        const options = Array.from(e.target.selectedOptions);
        const ids = options.map((opt) => Number(opt.value));
        setForm((prev) => ({
            ...prev,
            price_list_ids: ids,
        }));
    };

    const buildPayload = () => {
        const {
            name,
            description,
            is_active,
            starts_at,
            ends_at,
            discount_type,
            discount_value,
            max_discount_amount,
            min_quantity,
            price_list_ids,
        } = form;

        const payload = {
            name: name.trim(),
            description: description.trim() || null,
            is_active,
            discount_type,
            discount_value: discount_value === "" ? null : Number(discount_value),
            max_discount_amount: max_discount_amount === "" ? null : Number(max_discount_amount),
            min_quantity: min_quantity ? Number(min_quantity) : 1,
        };

        if (starts_at) payload.starts_at = starts_at;
        if (ends_at) payload.ends_at = ends_at;

        if (price_list_ids && price_list_ids.length > 0) {
            payload.price_list_ids = price_list_ids;
        }

        return payload;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setFormErrors({});

        try {
            const payload = buildPayload();
            let savedPromotion;

            if (editingPromotion) {
                savedPromotion = await promotionService.update(editingPromotion.id, payload);
            } else {
                savedPromotion = await promotionService.create(payload);
            }

            onClose(savedPromotion, !!editingPromotion);
        } catch (error) {
            setFormErrors(parseApiError(error).fieldErrors ?? {});
        } finally {
            setSubmitting(false);
        }
    };

    useEffect(() => {
        editingPromotion && (
            setForm({
                name: editingPromotion.name || "",
                description: editingPromotion.description || "",
                is_active: Boolean(editingPromotion.is_active),
                starts_at: editingPromotion.starts_at ? editingPromotion.starts_at.substring(0, 10) : "",
                ends_at: editingPromotion.ends_at ? editingPromotion.ends_at.substring(0, 10) : "",
                discount_type: editingPromotion.discount_type || "percentage",
                discount_value: editingPromotion.discount_value ?? "",
                max_discount_amount: editingPromotion.max_discount_amount ?? "",
                min_quantity: editingPromotion.min_quantity ?? 1,
                price_list_ids: (editingPromotion.price_lists || []).map((pl) => pl.id),
                product_ids_text: (editingPromotion.products || []).map((p) => p.id).join(","),
            })
        )
    }, []);

    return (
        <form className={styles.form} onSubmit={handleSubmit}>
            <div className="input_group">
                <span>Nombre</span>
                <input
                    type="text"
                    className="input"
                    name="name"
                    value={form.name}
                    onChange={handleInputChange}
                    placeholder="Nombre de la promoción"
                />
                {formErrors.name && <p className={styles.error}>{formErrors.name}</p>}
            </div>

            <div className="input_group">
                <span>Descripción</span>
                <textarea
                    className="input"
                    name="description"
                    value={form.description}
                    onChange={handleInputChange}
                    placeholder="Descripción (opcional)"
                />
                {formErrors.description && <p className={styles.error}>{formErrors.description[0]}</p>}
            </div>

            <div className={styles.row}>
                <div className="input_group">
                    <span>Fecha inicio</span>
                    <input
                        type="date"
                        className="input"
                        name="starts_at"
                        value={form.starts_at}
                        onChange={handleInputChange}
                    />
                    {formErrors.starts_at && <p className={styles.error}>{formErrors.starts_at[0]}</p>}
                </div>
                <div className="input_group">
                    <span>Fecha fin</span>
                    <input
                        type="date"
                        className="input"
                        name="ends_at"
                        value={form.ends_at}
                        onChange={handleInputChange}
                    />
                    {formErrors.ends_at && <p className={styles.error}>{formErrors.ends_at[0]}</p>}
                </div>
            </div>

            <div className={styles.row}>
                <div className="input_group">
                    <span>Tipo de descuento</span>
                    <select
                        name="discount_type"
                        className="input"
                        value={form.discount_type}
                        onChange={handleInputChange}
                    >
                        <option value="percentage">Porcentaje (%)</option>
                        <option value="fixed_amount">Monto fijo</option>
                        <option value="second_unit_percentage">2da unidad (%)</option>
                    </select>
                    {formErrors.discount_type && (
                        <p className={styles.error}>{formErrors.discount_type[0]}</p>
                    )}
                </div>

                <div className="input_group">
                    <span>
                        Valor del descuento{" "}
                        {form.discount_type === "fixed_amount" ? "(monto)" : "(porcentaje)"}
                    </span>
                    <input
                        type="number"
                        className="input"
                        name="discount_value"
                        value={form.discount_value}
                        onChange={handleInputChange}
                        min="0"
                        step="0.01"
                    />
                    {formErrors.discount_value && (
                        <p className={styles.error}>{formErrors.discount_value[0]}</p>
                    )}
                </div>
            </div>

            <div className={styles.row}>
                <div className="input_group">
                    <span>Tope de descuento (monto máximo)</span>
                    <input
                        type="number"
                        className="input"
                        name="max_discount_amount"
                        value={form.max_discount_amount}
                        onChange={handleInputChange}
                        min="0"
                        step="0.01"
                    />
                    {formErrors.max_discount_amount && (
                        <p className={styles.error}>{formErrors.max_discount_amount[0]}</p>
                    )}
                </div>

                <div className="input_group">
                    <span>Cantidad mínima de unidades</span>
                    <input
                        type="number"
                        className="input"
                        name="min_quantity"
                        value={form.min_quantity}
                        onChange={handleInputChange}
                        min="1"
                    />
                    {formErrors.min_quantity && (
                        <p className={styles.error}>{formErrors.min_quantity[0]}</p>
                    )}
                </div>
            </div>

            <div className="input_group">
                <label className={styles.checkbox_label}>
                    <input
                        type="checkbox"
                        name="is_active"
                        checked={form.is_active}
                        onChange={handleInputChange}
                    />
                    <span>Promoción activa</span>
                </label>
                {formErrors.is_active && <p className={styles.error}>{formErrors.is_active[0]}</p>}
            </div>

            <div className="input_group">
                <span>Listas de precio a las que aplica</span>
                <select
                    multiple
                    className={styles.multiselect}
                    value={form.price_list_ids.map(String)}
                    onChange={handlePriceListChange}
                >
                    {priceLists.map((pl) => (
                        <option key={pl.id} value={pl.id}>
                            {pl.name}
                        </option>
                    ))}
                </select>
                <small className={styles.helper_text}>
                    Si no seleccionas ninguna lista, la promoción aplicará a todas.
                </small>
                {formErrors.price_list_ids && (
                    <p className={styles.error}>{formErrors.price_list_ids[0]}</p>
                )}
            </div>

            <button
                type="submit"
                className="btn btn_solid"
                disabled={submitting}
            >
                {submitting ? (
                    <FontAwesomeIcon icon={faCircleNotch} spin />
                ) : editingPromotion ? (
                    "Guardar cambios"
                ) : (
                    "Crear promoción"
                )}
            </button>
        </form>
    );
}