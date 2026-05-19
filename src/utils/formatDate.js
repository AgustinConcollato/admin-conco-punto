/**
 * 
 * @param {Date} dateInput 
 * @param {"long"|"short"|"numeric"|"full"} format 
 * @param {boolean} time 
 * @returns 
 */

export function formatDate(dateInput, format = "long", time = null) {
  const date = new Date(dateInput);

  const options = {
    long: { day: "numeric", month: "long", year: "numeric" }, // 4 de diciembre de 2025
    short: { day: "numeric", month: "short", year: "numeric" }, // 4 dic 2025
    numeric: { day: "2-digit", month: "2-digit", year: "2-digit" }, // 04/12/25
    full: { weekday: "long", day: "numeric", month: "long", year: "numeric" }, // jueves, 4 de diciembre de 2025
  };

  const baseOptions = options[format] || options.long;

  let finalOptions = baseOptions;

  if (time) {
    finalOptions = {
      ...baseOptions,
      hour: "2-digit",
      minute: "2-digit",
    };
  }

  return new Intl.DateTimeFormat("es-ES", finalOptions).format(date);
}