import {
    faCheck, faCircleNotch, faGripVertical, faPlus,
    faTimes, faTriangleExclamation, faImage, faXmark
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRef, useState } from "react";
import { ConfirmModal } from "../../../../components/ConfirmModal/ConfirmModal";
import { Modal } from "../../../../components/Modal/Modal";
import styles from "./PublicationImages.module.css";

const MAX_IMAGES = 10;
const ACCEPTED = "image/jpeg,image/jpg,image/png,image/webp";

const normalize = (pics) => (pics ?? []).map(p => ({
    id: p.id,
    url: p.secure_url ?? p.url ?? "",
}));

// ── Componente principal ──────────────────────────────────────────────────────
export function PublicationImages({ pictures: initialPictures, mlItemId, mlService, onUpdate }) {
    const [pictures, setPictures] = useState(normalize(initialPictures));
    const [original, setOriginal] = useState(normalize(initialPictures));
    const [main, setMain] = useState(0);
    const [pendingDeleteIdx, setPendingDeleteIdx] = useState(null);

    const [pendingFile, setPendingFile] = useState(null);
    const [pendingLocalUrl, setPendingLocalUrl] = useState(null);

    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(null);
    const [error, setError] = useState(null);

    const [dragIdx, setDragIdx] = useState(null);
    const [overIdx, setOverIdx] = useState(null);

    const inputRef = useRef(null);

    const orderChanged = pictures.some((p, i) => p.id !== original[i]?.id);

    // ── Selección de archivo ──────────────────────────────────────────────────
    const handleFileSelect = (files) => {
        const file = Array.from(files)[0];
        if (!file) return;
        setPendingFile(file);
        setPendingLocalUrl(URL.createObjectURL(file));
    };

    const cancelPreview = () => {
        if (pendingLocalUrl) URL.revokeObjectURL(pendingLocalUrl);
        setPendingFile(null);
        setPendingLocalUrl(null);
    };

    // ── Confirmar upload ──────────────────────────────────────────────────────
    const confirmUpload = async () => {
        if (!pendingFile) return;
        setUploading(true);
        setError(null);
        try {
            const res = await mlService.uploadPicture(pendingFile);
            const newPic = {
                id: res.id,
                url: res.secure_url
                    ?? res.variations?.find(v => v.size?.includes("500"))?.secure_url
                    ?? res.variations?.[0]?.secure_url
                    ?? pendingLocalUrl,
            };
            const next = [...pictures, newPic];
            const payload = next.map(p => ({ id: p.id }));
            const updated = await mlService.updatePublicationPictures(mlItemId, payload);
            const fresh = normalize(updated.pictures ?? next);
            setPictures(fresh);
            setOriginal(fresh);
            setMain(fresh.length - 1);
            onUpdate?.(fresh);
        } catch (e) {
            setError(e.message ?? "Error al subir imagen.");
        } finally {
            setUploading(false);
            cancelPreview();
        }
    };

    // ── Guardar orden ─────────────────────────────────────────────────────────
    const saveOrder = async () => {
        setSaving(true);
        setError(null);
        try {
            const payload = pictures.map(p => ({ id: p.id }));
            const updated = await mlService.updatePublicationPictures(mlItemId, payload);
            const fresh = normalize(updated.pictures ?? pictures);
            setPictures(fresh);
            setOriginal(fresh);
            onUpdate?.(fresh);
        } catch (e) {
            setError(e.message ?? "Error al guardar orden.");
        } finally {
            setSaving(false);
        }
    };

    // ── Eliminar ──────────────────────────────────────────────────────────────
    const handleDelete = async (idx) => {
        if (pictures.length <= 1) { setError("Debe haber al menos una imagen."); return; }
        setPendingDeleteIdx(idx);
    };

    const confirmDelete = async () => {
        const idx = pendingDeleteIdx;
        setPendingDeleteIdx(null);
        setDeleting(idx);
        setError(null);
        try {
            const next = pictures.filter((_, i) => i !== idx);
            const payload = next.map(p => ({ id: p.id }));
            const updated = await mlService.updatePublicationPictures(mlItemId, payload);
            const fresh = normalize(updated.pictures ?? next);
            setPictures(fresh);
            setOriginal(fresh);
            setMain(m => Math.min(m, fresh.length - 1));
            onUpdate?.(fresh);
        } catch (e) {
            setError(e.message ?? "Error al eliminar imagen.");
        } finally {
            setDeleting(null);
        }
    };

    // ── Drag & drop ───────────────────────────────────────────────────────────
    const onDragStart = (e, idx) => { setDragIdx(idx); e.dataTransfer.effectAllowed = "move"; };
    const onDragOver = (e, idx) => { e.preventDefault(); setOverIdx(idx); };
    const onDrop = (e, idx) => {
        e.preventDefault();
        if (dragIdx === null || dragIdx === idx) { resetDrag(); return; }
        const next = [...pictures];
        const [item] = next.splice(dragIdx, 1);
        next.splice(idx, 0, item);
        setPictures(next);
        if (main === dragIdx) setMain(idx);
        resetDrag();
    };
    const onDragEnd = () => resetDrag();
    const resetDrag = () => { setDragIdx(null); setOverIdx(null); };

    const busy = uploading || saving || deleting !== null;

    return (
        <div className={styles.wrap}>
            {/* Preview principal */}
            {pictures.length > 0 && (
                <div className={styles.main_wrap}>
                    <img src={pictures[main]?.url} alt="" className={styles.main_img} />
                </div>
            )}

            {/* Grid thumbnails con DnD */}
            <div className={styles.grid}>
                {pictures.map((pic, i) => (
                    <div
                        key={pic.id ?? i}
                        className={[
                            styles.thumb_wrap,
                            i === main ? styles.thumb_active : "",
                            dragIdx === i ? styles.thumb_dragging : "",
                            overIdx === i && dragIdx !== i ? styles.thumb_over : "",
                        ].join(" ")}
                        draggable
                        onDragStart={e => onDragStart(e, i)}
                        onDragOver={e => onDragOver(e, i)}
                        onDrop={e => onDrop(e, i)}
                        onDragEnd={onDragEnd}
                        onClick={() => setMain(i)}
                    >
                        <img src={pic.url} alt="" className={styles.thumb_img} />
                        <div className={styles.thumb_order}>{i + 1}</div>
                        <div className={styles.drag_handle} title="Arrastrar">
                            <FontAwesomeIcon icon={faGripVertical} />
                        </div>
                        {deleting === i && (
                            <div className={styles.thumb_overlay}>
                                <FontAwesomeIcon icon={faCircleNotch} spin />
                            </div>
                        )}
                        <button
                            className={styles.delete_btn}
                            onClick={e => { e.stopPropagation(); handleDelete(i); }}
                            disabled={busy}
                            title="Eliminar"
                        >
                            <FontAwesomeIcon icon={faTimes} />
                        </button>
                    </div>
                ))}

                {pictures.length < MAX_IMAGES && (
                    <div
                        className={`${styles.add_btn} ${busy ? styles.add_busy : ""}`}
                        onClick={() => !busy && inputRef.current?.click()}
                        onDragOver={e => e.preventDefault()}
                        onDrop={e => { e.preventDefault(); handleFileSelect(e.dataTransfer.files); }}
                    >
                        <FontAwesomeIcon icon={faPlus} className={styles.add_icon} />
                        <span className={styles.add_label}>Agregar</span>
                    </div>
                )}

                <input
                    ref={inputRef}
                    type="file"
                    accept={ACCEPTED}
                    className={styles.file_input}
                    onChange={e => { handleFileSelect(e.target.files); e.target.value = ""; }}
                />
            </div>

            {/* Footer */}
            <div className={styles.footer}>
                <p className={styles.info}>
                    <FontAwesomeIcon icon={faImage} />
                    {pictures.length}/{MAX_IMAGES} · JPG/PNG · máx. 10 MB
                </p>
                {orderChanged && (
                    <button className={styles.btn_save_order} onClick={saveOrder} disabled={saving}>
                        {saving
                            ? <><FontAwesomeIcon icon={faCircleNotch} spin /> Guardando...</>
                            : <><FontAwesomeIcon icon={faCheck} /> Guardar orden</>
                        }
                    </button>
                )}
            </div>

            {error && (
                <div className={styles.error}>
                    <FontAwesomeIcon icon={faTriangleExclamation} /> {error}
                </div>
            )}

            {pendingLocalUrl && (
                <Modal
                    title={'Vista previa'}
                    onClose={cancelPreview}
                >
                    <img src={pendingLocalUrl} alt="Preview" className={styles.modal_img} />
                    <p className={styles.modal_hint}>¿Querés subir esta imagen a la publicación?</p>
                    <div className={styles.modal_actions}>
                        <button className={styles.btn_cancel} onClick={cancelPreview} disabled={uploading}>
                            Cancelar
                        </button>
                        <button className={styles.btn_confirm} onClick={confirmUpload} disabled={uploading}>
                            {uploading
                                ? <><FontAwesomeIcon icon={faCircleNotch} spin /> Subiendo...</>
                                : <><FontAwesomeIcon icon={faCheck} /> Confirmar y subir</>
                            }
                        </button>
                    </div>
                </Modal>
            )}

            {pendingDeleteIdx !== null && (
                <ConfirmModal
                    message="¿Eliminar esta imagen de la publicación?"
                    onConfirm={confirmDelete}
                    onCancel={() => setPendingDeleteIdx(null)}
                />
            )}
        </div>
    );
}