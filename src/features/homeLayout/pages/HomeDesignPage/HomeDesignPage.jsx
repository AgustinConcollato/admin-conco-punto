import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';
import { useHomeDesigns } from '../../hooks/useHomeDesigns';
import { SectionList } from '../../components/SectionList/SectionList';
import { SavedDesigns } from '../../components/SavedDesigns/SavedDesigns';
import { PreviewFrame } from '../../components/PreviewFrame/PreviewFrame';
import { Loading } from '../../../../components/Loading/Loading';
import styles from './HomeDesignPage.module.css';

const PRICE_LISTS = [
    { id: 2, label: 'Minorista' },
    { id: 3, label: 'Mayorista' },
];

export function HomeDesignPage() {
    const {
        designs,
        publishedId,
        openId,
        openName,
        sections,
        dirty,
        loading,
        error,
        reload,
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
    } = useHomeDesigns();

    const [priceListId, setPriceListId] = useState(2);
    const [saving, setSaving] = useState(false);
    const [publishing, setPublishing] = useState(false);
    const [confirmPublish, setConfirmPublish] = useState(false);

    useEffect(() => {
        if (!dirty) return;
        const handler = (e) => { e.preventDefault(); e.returnValue = ''; };
        window.addEventListener('beforeunload', handler);
        return () => window.removeEventListener('beforeunload', handler);
    }, [dirty]);

    const isLive = openId !== null && openId === publishedId;

    const handleSave = async () => {
        setSaving(true);
        try {
            await saveOpen();
            toast.success('Diseño guardado.');
        } catch (err) {
            toast.error(err?.error ?? err?.message ?? 'No se pudo guardar el diseño.');
        } finally {
            setSaving(false);
        }
    };

    const handlePublish = async () => {
        setConfirmPublish(false);
        setPublishing(true);
        try {
            await publishOpen();
            toast.success('Diseño publicado. Ya está visible en la web.');
        } catch (err) {
            toast.error(err?.error ?? err?.message ?? 'No se pudo publicar el diseño.');
        } finally {
            setPublishing(false);
        }
    };

    if (loading) return <Loading />;

    if (error) {
        return (
            <div className={styles.error_state}>
                <p>No se pudo cargar el diseño del home.</p>
                <button className="btn btn_solid" onClick={reload}>Reintentar</button>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <div className={styles.toolbar}>
                <div className={styles.toolbar_left}>
                    <h1>Diseño de inicio</h1>
                    {openId !== null && (
                        <>
                            <input
                                className={styles.name_input}
                                value={openName}
                                onChange={e => renameOpen(e.target.value)}
                                placeholder="Nombre del diseño"
                                aria-label="Nombre del diseño"
                            />
                            <span className={isLive ? styles.live_badge : styles.draft_badge}>
                                {isLive ? 'En vivo' : 'No publicado'}
                            </span>
                            {dirty && <span className={styles.dirty_badge}>Cambios sin guardar</span>}
                        </>
                    )}
                </div>
                <div className={styles.toolbar_right}>
                    <select
                        value={priceListId}
                        onChange={e => setPriceListId(Number(e.target.value))}
                        className={styles.price_select}
                        title="Lista de precios para la vista previa"
                    >
                        {PRICE_LISTS.map(pl => (
                            <option key={pl.id} value={pl.id}>{pl.label}</option>
                        ))}
                    </select>
                    <button
                        className={`btn ${styles.btn_save}`}
                        onClick={handleSave}
                        disabled={openId === null || saving || publishing || !dirty || !openName.trim()}
                    >
                        {saving ? <FontAwesomeIcon icon={faCircleNotch} spin /> : 'Guardar'}
                    </button>
                    <button
                        className="btn btn_solid"
                        onClick={() => setConfirmPublish(true)}
                        disabled={openId === null || saving || publishing}
                    >
                        {publishing ? <FontAwesomeIcon icon={faCircleNotch} spin /> : 'Publicar'}
                    </button>
                </div>
            </div>

            <div className={styles.content}>
                <div className={styles.editor}>
                    <SavedDesigns
                        designs={designs}
                        openId={openId}
                        publishedId={publishedId}
                        dirty={dirty}
                        onOpen={openDesign}
                        onNew={newDesign}
                        onDelete={deleteDesign}
                    />
                    {openId !== null ? (
                        <SectionList
                            sections={sections}
                            onAdd={addSection}
                            onRemove={removeSection}
                            onMove={moveSection}
                            onUpdateSettings={updateSettings}
                            onToggleVisible={toggleVisible}
                        />
                    ) : (
                        <div className={styles.empty_editor}>
                            <p>Creá un diseño nuevo o abrí uno existente para empezar a editar.</p>
                        </div>
                    )}
                </div>
                <div className={styles.preview}>
                    <PreviewFrame sections={sections ?? []} priceListId={priceListId} />
                </div>
            </div>

            {confirmPublish && (
                <div className={styles.modal_overlay} onClick={() => setConfirmPublish(false)}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <h3>Publicar diseño</h3>
                        <p>Se va a publicar "{openName}". Los cambios van a quedar visibles para todos los visitantes de la web. ¿Continuar?</p>
                        <div className={styles.modal_actions}>
                            <button className="btn" onClick={() => setConfirmPublish(false)}>Cancelar</button>
                            <button className="btn btn_solid" onClick={handlePublish}>Publicar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
