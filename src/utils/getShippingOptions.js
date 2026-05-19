import { FREE_SHIPPING_THRESHOLD } from "../features/mercadoLibre/hooks/useMLFees";

// Función para procesar las opciones según el JSON de ML
export const getShippingOptions = (prefs, price) => {
    if (!prefs) return [];
    const options = [];

    // 1. Si tiene ME2 (Mercado Envíos), es la opción principal
    if (prefs.modes.includes('me2')) {
        const isFreeShippingMandatory = price >= 33000; // Umbral actual en Argentina

        options.push({
            id: 'me2',
            title: 'Mercado Envíos',
            description: isFreeShippingMandatory
                ? `Envío gratis obligatorio para precios ≥ ${FREE_SHIPPING_THRESHOLD.toLocaleString("es-AR")}`
                : 'El comprador paga el envío o podés ofrecerlo gratis.',
            isFree: isFreeShippingMandatory
        });
    }

    // 2. Opción de Retiro en persona (local_pick_up)
    // En tu JSON viene false, pero podrías dejar que el usuario lo active
    options.push({
        id: 'local',
        title: 'Retiro en persona',
        description: 'El comprador retira por tu local.'
    });

    // 3. Envío personalizado (Custom)
    if (prefs.modes.includes('custom')) {
        options.push({
            id: 'custom',
            title: 'Envío propio / Entrega a convenir',
            description: 'Gestionás el envío por fuera de Mercado Libre.',
            isFree: false
        });
    }

    return options;
};