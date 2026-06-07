import { useEffect, useState } from 'react';

export function useViewMode(storageKey, defaultMode = 'cards') {
    const [viewMode, setViewMode] = useState(() => localStorage.getItem(storageKey) ?? defaultMode);

    useEffect(() => {
        localStorage.setItem(storageKey, viewMode);
    }, [storageKey, viewMode]);

    return [viewMode, setViewMode];
}
