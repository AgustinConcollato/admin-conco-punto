export const SEGMENT_META = {
    nuevo: { label: 'Nuevo', tone: 'blue' },
    recurrente: { label: 'Recurrente', tone: 'green' },
    inactivo: { label: 'Inactivo', tone: 'orange' },
    sin_pedidos: { label: 'Sin pedidos', tone: 'gray' },
};

export const ORDER_STATUS_META = {
    pending: { label: 'Pendiente', tone: 'amber' },
    processing: { label: 'En proceso', tone: 'blue' },
    confirmed: { label: 'Terminado', tone: 'green' },
    shipped: { label: 'Enviado', tone: 'purple' },
    delivered: { label: 'Entregado', tone: 'green' },
    cancelled: { label: 'Cancelado', tone: 'red' },
};

export const PRODUCT_STATUS_META = {
    published: { label: 'Publicado', tone: 'green' },
    archived: { label: 'Archivado', tone: 'orange' },
    incomplete: { label: 'Incompleto', tone: 'red' },
    draft: { label: 'Borrador', tone: 'indigo' },
};

const fallback = (value) => ({ label: value ?? '—', tone: 'gray' });

export const segmentBadge = (value) => SEGMENT_META[value] ?? fallback(value);
export const orderStatusBadge = (value) => ORDER_STATUS_META[value] ?? fallback(value);
export const productStatusBadge = (value) => PRODUCT_STATUS_META[value] ?? fallback(value);
