export function parseApiError(error) {
    if (!error || typeof error !== 'object') {
        return { fieldErrors: null, message: String(error) };
    }
    return {
        fieldErrors: error.errors ?? null,
        message: error.error ?? error.message ?? 'Ocurrió un error inesperado.',
    };
}
