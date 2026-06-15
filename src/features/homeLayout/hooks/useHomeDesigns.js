import { useCallback, useEffect, useMemo, useState } from 'react';
import { HomeLayoutService } from '../../../services/homeLayout/homeLayoutService';

const DEFAULT_SETTINGS = {
    banner: { slides: [], autoplayMs: 5000 },
    products: { title: '', source: 'new-arrivals', categoryId: null, keyword: '', viewAllHref: '', limit: 12 },
    promotions: { title: '', promotionId: null },
    text: { title: '', body: '' },
};

const OPEN_DESIGN_KEY = 'homeLayoutOpenDesignId';

export function useHomeDesigns() {
    const service = useMemo(() => new HomeLayoutService(), []);

    const [designs, setDesigns] = useState([]);
    const [publishedId, setPublishedId] = useState(null);
    const [publishedAt, setPublishedAt] = useState(null);

    const [openId, setOpenId] = useState(null);
    const [openName, setOpenName] = useState('');
    const [sections, setSections] = useState(null);
    const [dirty, setDirty] = useState(false);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const persistOpenId = (id) => {
        if (id) localStorage.setItem(OPEN_DESIGN_KEY, String(id));
        else localStorage.removeItem(OPEN_DESIGN_KEY);
    };

    const openFromData = useCallback((design) => {
        setOpenId(design.id);
        setOpenName(design.name);
        setSections(structuredClone(design.sections ?? []));
        setDirty(false);
        persistOpenId(design.id);
    }, []);

    const refreshState = useCallback(async () => {
        const res = await service.getDesigns();
        setDesigns(res.designs ?? []);
        setPublishedId(res.publishedId ?? null);
        setPublishedAt(res.publishedAt ?? null);
        return res;
    }, [service]);

    const load = useCallback(async () => {
        setLoading(true);
        setError(false);
        try {
            const res = await refreshState();
            const list = res.designs ?? [];

            const storedId = Number(localStorage.getItem(OPEN_DESIGN_KEY)) || null;
            const open =
                list.find(d => d.id === storedId) ??
                list.find(d => d.id === res.publishedId) ??
                list[0] ??
                null;

            if (open) {
                openFromData(open);
            } else {
                setOpenId(null);
                setOpenName('');
                setSections([]);
                setDirty(false);
                persistOpenId(null);
            }
        } catch {
            setError(true);
        } finally {
            setLoading(false);
        }
    }, [refreshState, openFromData]);

    useEffect(() => { load(); }, [load]);

    const openDesign = (design) => {
        openFromData(design);
    };

    const newDesign = async (name) => {
        const created = await service.savePreset(name, []);
        await refreshState();
        openFromData({ id: created.id, name: created.name, sections: [] });
    };

    const saveOpen = async () => {
        await service.updatePreset(openId, openName, sections);
        await refreshState();
        setDirty(false);
    };

    const publishOpen = async () => {
        if (dirty) await saveOpen();
        const res = await service.publishDesign(openId);
        setPublishedId(res.publishedId ?? openId);
        setPublishedAt(res.publishedAt ?? null);
        setDirty(false);
    };

    const deleteDesign = async (id) => {
        await service.deletePreset(id);
        const res = await refreshState();

        if (id === openId) {
            const list = res.designs ?? [];
            const next = list.find(d => d.id === res.publishedId) ?? list[0] ?? null;
            if (next) {
                openFromData(next);
            } else {
                setOpenId(null);
                setOpenName('');
                setSections([]);
                setDirty(false);
                persistOpenId(null);
            }
        }
    };

    const renameOpen = (name) => {
        setOpenName(name);
        setDirty(true);
    };

    const mutate = (updater) => {
        setSections(current => updater(current));
        setDirty(true);
    };

    const addSection = (type) => {
        mutate(current => [
            ...current,
            {
                id: crypto.randomUUID(),
                type,
                visible: true,
                settings: structuredClone(DEFAULT_SETTINGS[type]),
            },
        ]);
    };

    const removeSection = (id) => {
        mutate(current => current.filter(s => s.id !== id));
    };

    const moveSection = (fromIndex, toIndex) => {
        mutate(current => {
            const next = [...current];
            const [moved] = next.splice(fromIndex, 1);
            next.splice(toIndex, 0, moved);
            return next;
        });
    };

    const updateSettings = (id, patch) => {
        mutate(current => current.map(s =>
            s.id === id ? { ...s, settings: { ...s.settings, ...patch } } : s
        ));
    };

    const toggleVisible = (id) => {
        mutate(current => current.map(s =>
            s.id === id ? { ...s, visible: !s.visible } : s
        ));
    };

    return {
        designs,
        publishedId,
        publishedAt,
        openId,
        openName,
        sections,
        dirty,
        loading,
        error,
        reload: load,
        openDesign,
        newDesign,
        saveOpen,
        publishOpen,
        deleteDesign,
        renameOpen,
        addSection,
        removeSection,
        moveSection,
        updateSettings,
        toggleVisible,
    };
}
