export function usePlatform() {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  // Verificar si el userAgent contiene patrones comunes de dispositivos móviles
  return /android|iphone|ipad|ipod|windows phone/i.test(userAgent);
}
