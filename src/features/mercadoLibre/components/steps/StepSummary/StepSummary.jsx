import { faImage, faPen } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IMAGE_URL } from "../../../../../config/api";
import { useMLPublish } from "../../../hooks/useMLPublish";
import { useMLFees } from "../../../hooks/useMLFees";
import { PriceBreakdown } from "../../PriceBreakdown/PriceBreakdown";
import { StepNav } from "../StepNav/StepNav";
import styles from "./StepSummary.module.css";

function Row({ label, value, step, onEdit }) {
    return (
        <div className={styles.row}>
            <span className={styles.row_label}>{label}</span>
            <span className={styles.row_value}>{value || <em className={styles.empty}>—</em>}</span>
            <button type="button" className={styles.edit_btn} onClick={() => onEdit(step)}>
                <FontAwesomeIcon icon={faPen} />
            </button>
        </div>
    );
}

export function StepSummary() {
    const { form, listingTypes, goBack, goToStep, handleSubmit, submitting, submitError, mlService } = useMLPublish();

    const { fees, loading: feesLoading, source: feesSource } = useMLFees(
        mlService,
        form.category_id,
        form.listing_type_id,
        parseFloat(form.price) || 0,
        form.shipping_mode,
        form.free_shipping,
        { height: form.dim_height, width: form.dim_width, length: form.dim_length, weight: form.billable_weight },
    );

    const listingName = listingTypes.find(t => t.id === form.listing_type_id)?.name ?? form.listing_type_id;
    const shippingLabel = form.shipping_mode === "me2"
        ? `Mercado Envíos${form.free_shipping ? " (gratis al comprador)" : ""}`
        : form.shipping_mode === "not_specified" ? "Retiro en persona" : "Envío propio";

    return (
        <div>
            <h3 className={styles.title}>Revisá antes de publicar</h3>
            <p className={styles.subtitle}>Verificá que todo esté correcto. Podés editar cualquier sección.</p>

            {/* Fotos preview */}
            {form.selectedImages.length > 0 && (
                <div className={styles.photos_row}>
                    {form.selectedImages.slice(0, 5).map((path, i) => (
                        <img key={i} src={`${IMAGE_URL}/${path}`} alt="" className={styles.thumb} />
                    ))}
                    {form.selectedImages.length > 5 && (
                        <div className={styles.thumb_more}>+{form.selectedImages.length - 5}</div>
                    )}
                    <button className={styles.edit_photos} onClick={() => goToStep("media")}>
                        <FontAwesomeIcon icon={faPen} /> Editar fotos
                    </button>
                </div>
            )}
            {form.selectedImages.length === 0 && (
                <div className={styles.no_photos}>
                    <FontAwesomeIcon icon={faImage} /> Sin fotos seleccionadas
                    <button onClick={() => goToStep("media")}>Agregar fotos</button>
                </div>
            )}

            {/* Datos */}
            <div className={styles.table}>
                <Row label="Categoría"     value={form.category_name}                      step="categoria"   onEdit={goToStep} />
                <Row label="Condición"     value={form.condition === "new" ? "Nuevo" : "Usado"} step="condicion" onEdit={goToStep} />
                <Row label="Título"        value={form.title}                               step="descripcion" onEdit={goToStep} />
                <Row label="Stock"         value={form.available_quantity}                  step="media"       onEdit={goToStep} />
                <Row label="SKU"           value={form.sku}                                 step="media"       onEdit={goToStep} />
                <Row label="Cód. barras"   value={form.barcode}                             step="media"       onEdit={goToStep} />
                <Row label="Precio"        value={`$ ${parseFloat(form.price || 0).toLocaleString("es-AR", { minimumFractionDigits: 2 })}`} step="precio" onEdit={goToStep} />
                <Row label="Tipo pub."     value={listingName}                              step="precio"      onEdit={goToStep} />
                <Row label="Envío"         value={shippingLabel}                            step="envio"       onEdit={goToStep} />
                {form.billable_weight && (
                    <Row label="Peso paquete" value={`${form.billable_weight}g`}            step="envio"       onEdit={goToStep} />
                )}
            </div>

            {/* Comisiones */}
            <div className={styles.fees_section}>
                <PriceBreakdown
                    fees={fees}
                    loading={feesLoading}
                    source={feesSource}
                    listingTypeLabel={listingName}
                />
            </div>

            {submitError && (
                <div className={styles.error}>
                    {submitError}
                </div>
            )}

            <StepNav
                onBack={() => goBack("resumen")}
                onNext={handleSubmit}
                canNext={!submitting}
                loading={submitting}
                nextLabel="Publicar en Mercado Libre"
                isSubmit
            />
        </div>
    );
}



