export const normalizeStr = (str) =>
    (str ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
