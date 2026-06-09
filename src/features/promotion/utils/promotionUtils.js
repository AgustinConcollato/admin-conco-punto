const OVERRIDE_FIELDS = ['discount_type', 'discount_value', 'max_discount_amount', 'min_quantity'];

/**
 * Convierte un array de productos (con .pivot) al formato que espera PUT /promotions/{id}/products.
 * Solo incluye los campos de override que tienen valor no nulo en el pivot.
 *
 * @param {Array} products - Productos de la promo, cada uno con .id y opcionalmente .pivot
 * @returns {Array<{id: string, ...overrides}>}
 */
export function buildProductsPayload(products) {
    return products.map(p => {
        const entry = { id: p.id };
        OVERRIDE_FIELDS.forEach(field => {
            if (p.pivot?.[field] !== null && p.pivot?.[field] !== undefined) {
                entry[field] = p.pivot[field];
            }
        });
        return entry;
    });
}
