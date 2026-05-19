export function formatPrice(value) {
  if (typeof value === "string") {
    value = parseFloat(value.replace(",", "."));
  }

  // Verifico si tiene decimales distintos de 00
  const hasDecimals = Number(value) % 1 !== 0;

  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(value);
}