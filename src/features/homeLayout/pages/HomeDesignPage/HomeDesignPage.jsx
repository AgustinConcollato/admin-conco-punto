import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';
import { useHomeDesigns } from '../../hooks/useHomeDesigns';
import { TopBar } from '../../components/TopBar/TopBar';
import { SavedDesigns } from '../../components/SavedDesigns/SavedDesigns';
import { SectionList } from '../../components/SectionList/SectionList';
import { PreviewFrame } from '../../components/PreviewFrame/PreviewFrame';
import { Loading } from '../../../../components/Loading/Loading';
import styles from './HomeDesignPage.module.css';

export function HomeDesignPage() {
    const navigate = useNavigate();

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

    const [priceListId, setPriceListId] = useState(3);
    const [viewport, setViewport] = useState('desktop');
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
        if (!dirty || !openName.trim() || openId === null) return;
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

    if (loading) {
        return (
            <div className={styles.loadingState}>
                <FontAwesomeIcon icon={faCircleNotch} spin />
                Cargando diseños...
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.errorState}>
                <p>No se pudo cargar el diseño del home.</p>
                <button className="btn btn_solid" onClick={reload}>Reintentar</button>
            </div>
        );
    }

    return (
        <div className={styles.fullscreen}>
            <TopBar
                designName={openName}
                isLive={isLive}
                dirty={dirty}
                saving={saving}
                publishing={publishing}
                canSave={openId !== null && dirty && !saving && !publishing && openName.trim() !== ''}
                viewport={viewport}
                priceListId={priceListId}
                onViewportChange={setViewport}
                onPriceListChange={setPriceListId}
                onSave={handleSave}
                onPublish={() => setConfirmPublish(true)}
                onBack={() => navigate('/')}
            />

            <div className={styles.body}>
                {/* Sidebar */}
                <div className={styles.sidebar}>
                    <div className={styles.sidebarInner}>
                        <div className={styles.sidebarSection}>
                            <SavedDesigns
                                designs={designs}
                                openId={openId}
                                publishedId={publishedId}
                                dirty={dirty}
                                onOpen={openDesign}
                                onNew={newDesign}
                                onDelete={deleteDesign}
                            />
                        </div>

                        <div className={styles.sidebarSection}>
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
                                <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                                    Creá un diseño nuevo o abrí uno existente para empezar a editar.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Preview */}
                <div className={styles.previewArea}>
                    <div className={styles.previewToolbar}>
                        <div className={styles.liveIndicator} />
                        <span className={styles.previewLabel}>Vista previa en vivo</span>
                        <div style={{ flex: 1 }} />
                        <span className={styles.previewBrand}>conco &amp; punto</span>
                    </div>
                    <div className={styles.previewContent}>
                        <PreviewFrame sections={sections ?? []} priceListId={priceListId} viewport={viewport} />
                    </div>
                </div>
            </div>

            {/* Confirm publish modal */}
            {confirmPublish && (
                <div className={styles.modalOverlay} onClick={() => setConfirmPublish(false)}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <h3>Publicar diseño</h3>
                        <p>Se va a publicar &ldquo;{openName}&rdquo;. Los cambios van a quedar visibles para todos los visitantes de la web. ¿Continuar?</p>
                        <div className={styles.modalActions}>
                            <button className="btn" onClick={() => setConfirmPublish(false)}>Cancelar</button>
                            <button className="btn btn_solid" onClick={handlePublish}>Publicar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
