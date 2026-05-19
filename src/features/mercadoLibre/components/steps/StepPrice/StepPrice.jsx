import { useMLPublish } from "../../../hooks/useMLPublish";
import { useMLFees } from "../../../hooks/useMLFees";
import { PriceBreakdown } from "../../PriceBreakdown/PriceBreakdown";
import { StepNav } from "../StepNav/StepNav";
import styles from "./StepPrice.module.css";

export function StepPrice() {
    const { form, updateForm, listingTypes, mlService, goNext, goBack } = useMLPublish();

    const { fees, loading: feesLoading, source: feesSource } = useMLFees(
        mlService,
        form.category_id,
        form.listing_type_id,
        parseFloat(form.price) || 0,
        form.shipping_mode,
        form.free_shipping,
    );

    const canNext = parseFloat(form.price) > 0 && !!form.listing_type_id;

    return (
        <div>
            <h3 className={styles.title}>Precio y tipo de publicación</h3>

            <div className={styles.price_row}>
                <div className={styles.field}>
                    <label>Precio de venta (ARS) <span className={styles.required}>*</span></label>
                    <div className={styles.price_wrap}>
                        <span className={styles.prefix}>$</span>
                        <input
                            type="number"
                            min={0}
                            step="0.01"
                            value={form.price}
                            onChange={e => updateForm({ price: e.target.value })}
                            placeholder="0.00"
                            autoFocus
                        />
                    </div>
                </div>
            </div>

            <div className={styles.field}>
                <label>Tipo de publicación <span className={styles.required}>*</span></label>
                {listingTypes.length === 0 ? (
                    <p className={styles.loading_types}>Cargando tipos...</p>
                ) : (
                    <div className={styles.types_grid}>
                        {listingTypes.map(type => (
                            <button
                                key={type.id}
                                type="button"
                                className={`${styles.type_card} ${form.listing_type_id === type.id ? styles.type_selected : ""}`}
                                onClick={() => updateForm({ listing_type_id: type.id })}
                            >
                                <span className={styles.type_name}>{type.configuration.name}</span>
                                {type.id === "gold_pro" && (
                                    <span className={styles.type_badge}>6 cuotas sin interés</span>
                                )}
                                {type.id === "gold_special" && (
                                    <span className={styles.type_badge}>No tiene cuotas sin interés</span>
                                )}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <PriceBreakdown
                fees={fees}
                loading={feesLoading}
                source={feesSource}
                listingTypeLabel={listingTypes.find(t => t.id === form.listing_type_id)?.name ?? ""}
            />

            <StepNav
                onBack={() => goBack("precio")}
                onNext={() => goNext("precio")}
                canNext={canNext}
            />
        </div>
    );
}