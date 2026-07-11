/**
 * Helpers de cálculo de compras (espejo de la lógica del backend).
 * El descuento es por pronto pago: si la factura vence sin saldarse, se pierde.
 */

/** ¿Vencida y sin saldar? (due_date pasada y no cubrió el total con descuento). */
export function isOverdue(purchase) {
    if (!purchase.due_date) return false;
    const twd = parseFloat(purchase.total_with_discount) || 0;
    const paid = parseFloat(purchase.amount_paid) || 0;
    if (paid + 0.001 >= twd) return false; // descuento ya cubierto → saldada
    const due = new Date(String(purchase.due_date).split('T')[0]);
    const today = new Date(new Date().toISOString().split('T')[0]);
    return due < today;
}

/** Monto a pagar: vencida sin saldar paga el total (sin descuento). */
export function payableAmount(purchase) {
    const twd = parseFloat(purchase.total_with_discount) || 0;
    const total = parseFloat(purchase.total) || 0;
    const paid = parseFloat(purchase.amount_paid) || 0;
    if (paid + 0.001 >= twd) return twd;
    return isOverdue(purchase) ? total : twd;
}

/** Saldo pendiente = monto a pagar - pagado. */
export function balanceOf(purchase) {
    const paid = parseFloat(purchase.amount_paid) || 0;
    return Math.max(payableAmount(purchase) - paid, 0);
}

/**
 * Aporte de una compra a los totales (SE DEBE, PAGO TOTAL, vencidas).
 * Se usa para actualizar las stats por delta sin recargar toda la lista.
 */
export function contribution(purchase) {
    const paid = parseFloat(purchase.amount_paid) || 0;
    const debt = balanceOf(purchase);
    const overdue = isOverdue(purchase) && debt > 0;
    return {
        paid,
        debt,
        overdueAmount: overdue ? debt : 0,
        overdueCount: overdue ? 1 : 0,
    };
}

/** Aplica el delta (nueva - vieja) sobre el objeto de stats. */
export function applyStatsDelta(stats, oldPurchase, newPurchase) {
    const base = stats || { total_debt: 0, total_paid: 0, overdue_amount: 0, overdue_count: 0, count: 0 };
    const oldC = oldPurchase ? contribution(oldPurchase) : { paid: 0, debt: 0, overdueAmount: 0, overdueCount: 0 };
    const newC = newPurchase ? contribution(newPurchase) : { paid: 0, debt: 0, overdueAmount: 0, overdueCount: 0 };

    const round = (n) => Math.round(n * 100) / 100;

    return {
        total_debt: round(base.total_debt - oldC.debt + newC.debt),
        total_paid: round(base.total_paid - oldC.paid + newC.paid),
        overdue_amount: round(base.overdue_amount - oldC.overdueAmount + newC.overdueAmount),
        overdue_count: base.overdue_count - oldC.overdueCount + newC.overdueCount,
        count: base.count + (newPurchase ? 0 : -1) + (oldPurchase ? 0 : 1),
    };
}
