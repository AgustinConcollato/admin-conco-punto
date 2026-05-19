import { faCheckCircle, faCircle, faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IMAGE_URL } from "../../../../../config/api";
import { useMLPublish } from "../../../hooks/useMLPublish";
import { StepNav } from "../StepNav/StepNav";
import styles from "./StepMedia.module.css";

export function StepMedia() {
    const { form, updateForm, product, goNext, goBack } = useMLPublish();

    const toggleImage = (path) => {
        const selected = form.selectedImages;
        if (selected.includes(path)) {
            updateForm({ selectedImages: selected.filter(p => p !== path) });
        } else if (selected.length < 10) {
            updateForm({ selectedImages: [...selected, path] });
        }
    };

    const canNext = form.selectedImages.length > 0 && form.available_quantity > 0;

    return (
        <div>
            <h3 className={styles.title}>Fotos, stock e identificación</h3>

            {/* Fotos */}
            <section className={styles.section}>
                <div className={styles.section_header}>
                    <p className={styles.section_label}>Fotos del producto</p>
                    <span className={styles.count_badge}>
                        {form.selectedImages.length}/10 seleccionadas
                    </span>
                </div>

                {product?.images?.length === 0 ? (
                    <div className={styles.no_images}>
                        <FontAwesomeIcon icon={faInfoCircle} />
                        El producto no tiene imágenes cargadas.
                    </div>
                ) : (
                    <div className={styles.photos_grid}>
                        {product?.images?.map((img) => {
                            const isSelected = form.selectedImages.includes(img.path);
                            const isDisabled = !isSelected && form.selectedImages.length >= 10;
                            return (
                                <div
                                    key={img.id}
                                    className={`${styles.photo_card} ${isSelected ? styles.photo_selected : ""} ${isDisabled ? styles.photo_disabled : ""}`}
                                    onClick={() => !isDisabled && toggleImage(img.path)}
                                >
                                    <img src={`${IMAGE_URL}/${img.path}`} alt="Producto" />
                                    <div className={styles.photo_overlay}>
                                        <FontAwesomeIcon
                                            icon={isSelected ? faCheckCircle : faCircle}
                                            className={isSelected ? styles.icon_active : styles.icon_inactive}
                                        />
                                    </div>
                                    {isSelected && (
                                        <div className={styles.photo_order}>
                                            {form.selectedImages.indexOf(img.path) + 1}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* Stock y datos */}
            <section className={styles.section}>
                <p className={styles.section_label}>Stock e identificación</p>
                <div className={styles.fields_grid}>
                    <div className={styles.field}>
                        <label>Stock a publicar <span className={styles.required}>*</span></label>
                        <input
                            type="number"
                            min={1}
                            value={form.available_quantity}
                            onChange={e => updateForm({ available_quantity: e.target.value })}
                            placeholder="1"
                        />
                        {product?.stock && (
                            <span className={styles.hint}>Stock disponible: {product.stock}</span>
                        )}
                    </div>

                    <div className={styles.field}>
                        <label>SKU</label>
                        <input
                            type="text"
                            value={form.sku}
                            onChange={e => updateForm({ sku: e.target.value })}
                            placeholder="Código interno del producto"
                        />
                    </div>
                </div>
            </section>

            {/* Variantes — placeholder futuro */}
            <div className={styles.variants_placeholder}>
                <FontAwesomeIcon icon={faInfoCircle} />
                <span>La opción de <strong>variantes</strong> estará disponible próximamente.</span>
            </div>

            <StepNav
                onBack={() => goBack("media")}
                onNext={() => goNext("media")}
                canNext={canNext}
            />
        </div>
    );
}