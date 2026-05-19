export function generateBarcodeFromSKU(sku, prefix = "200") {
    // Convertir texto a número usando un hash simple (como crc32)
    let hash = 0;
    for (let i = 0; i < sku.length; i++) {
        hash = (hash << 5) - hash + sku.charCodeAt(i);
        hash |= 0; // convertir a 32 bits
    }
    hash = Math.abs(hash);

    // Crear base de 12 dígitos
    let base = (prefix + hash.toString().padStart(9, "0")).slice(0, 12);

    // Calcular dígito de control EAN-13
    let sum = 0;
    for (let i = 0; i < base.length; i++) {
        let num = parseInt(base[i]);
        sum += i % 2 === 0 ? num : num * 3;
    }
    let checksum = (10 - (sum % 10)) % 10;

    return base + checksum;
}