import { useEffect, useState } from "react";

// Fallback fijos por listing_type_id (% sobre precio de venta)
const COMMISSION_FALLBACK = {
    free:         { rate: 0,     },
    gold_special: { rate: 0.135  },
    gold_pro:     { rate: 0.165  },
};

// Umbral de envío gratis obligatorio en MLA (ARS)
export const FREE_SHIPPING_THRESHOLD = 33000;

/**
 * Hook que calcula comisiones + costo de envío ML.
 *
 * - Intenta API real de comisiones; si falla usa fallback.
 * - Solo busca costo de envío si mode === "me2".
 * - free_shipping es obligatorio si price >= FREE_SHIPPING_THRESHOLD.
 */
export function useMLFees(mlService, categoryId, listingTypeId, price, shippingMode, freeShipping, dimensions = {}) {
    const [fees, setFees]       = useState(null);
    const [loading, setLoading] = useState(false);
    const [source, setSource]   = useState(null);

    // free_shipping obligatorio si supera el umbral
    const effectiveFreeShipping = price >= FREE_SHIPPING_THRESHOLD ? true : freeShipping;

    useEffect(() => {
        if (!price || price <= 0 || !listingTypeId) {
            setFees(null);
            setSource(null);
            return;
        }

        let cancelled = false;
        setLoading(true);

        const timer = setTimeout(async () => {
            // ── 1. Comisión ──────────────────────────────────────────────
            let commissionAmount  = null;
            let commissionRate    = null;
            let percentageFee     = null;
            let fixedFee          = 0;
            let financingFee      = 0;
            let listingFeeAmount  = 0;
            let listingTypeName   = null;
            let fetchedFromApi    = false;
            let meliPercentageFee = 0;

            if (categoryId) {
                try {
                    const params = new URLSearchParams({
                        category_id:     categoryId,
                        listing_type_id: listingTypeId,
                        price,
                    });
                    if (dimensions?.weight) params.set('billable_weight', dimensions.weight);
                    const data = await mlService.getListingTypesFees(params);

                    if (data?.sale_fee_amount != null) {
                        commissionAmount = parseFloat(data.sale_fee_amount);
                        commissionRate   = price > 0 ? commissionAmount / price : 0;
                        percentageFee    = data.percentage_fee ?? null;
                        fixedFee         = parseFloat(data.fixed_fee ?? 0);
                        financingFee     = parseFloat(data.financing_add_on_fee ?? 0);
                        listingFeeAmount = parseFloat(data.listing_fee_amount ?? 0);
                        listingTypeName  = data.listing_type_name ?? null;
                        fetchedFromApi   = true;
                        meliPercentageFee = parseFloat(data.meli_percentage_fee ?? 0);
                    }
                } catch { /* fallback */ }
            }

            if (!fetchedFromApi) {
                const fb     = COMMISSION_FALLBACK[listingTypeId] ?? COMMISSION_FALLBACK.gold_special;
                commissionRate   = fb.rate;
                commissionAmount = price * commissionRate;
                percentageFee    = commissionRate * 100;
            }

            // ── 2. Costo de envío ─────────────────────────────────────────
            let shippingCost = 0;

            if (shippingMode === "me2" && categoryId) {
                try {
                    const { height = 10, width = 10, length = 10, weight = 500 } = dimensions;
                    const dims = `${height}x${width}x${length},${weight}`;
                    const params = new URLSearchParams({
                        price,
                        category_id:     categoryId,
                        listing_type_id: listingTypeId,
                        mode:            "me2",
                        logistic_type:   "drop_off",
                        free_shipping:   effectiveFreeShipping,
                        dimensions:      dims,
                    });

                    const data = await mlService.getUserShippingCost(params);

                   // list_cost = costo real al vendedor (ya con descuento aplicado)
                    // promoted_amount = precio base antes del descuento (referencia)
                    const allCountry = data?.coverage?.all_country;
                    if (allCountry?.list_cost != null) {
                        shippingCost = parseFloat(allCountry.list_cost);
                    }
                } catch { /* sin costo de envío */ }
            }

            if (cancelled) return;

            const totalDeductions = commissionAmount + listingFeeAmount + (effectiveFreeShipping ? shippingCost : 0);
            const netAmount       = price - totalDeductions;

            setFees({
                price,
                // Comisión
                commissionAmount,
                commissionRate,
                percentageFee,
                fixedFee,
                financingFee,
                meliPercentageFee,
                // Publicación
                listingFeeAmount,
                listingTypeName,
                // Envío
                shippingCost,
                freeShipping:          effectiveFreeShipping,
                freeShippingMandatory: price >= FREE_SHIPPING_THRESHOLD,
                // Totales
                totalDeductions,
                netAmount,
            });

            setSource(fetchedFromApi ? "api" : "fallback");
            setLoading(false);
        }, 400);

        return () => { cancelled = true; clearTimeout(timer); };
    }, [categoryId, listingTypeId, price, shippingMode, effectiveFreeShipping, dimensions?.height, dimensions?.width, dimensions?.length, dimensions?.weight]);

    return { fees, loading, source };
}