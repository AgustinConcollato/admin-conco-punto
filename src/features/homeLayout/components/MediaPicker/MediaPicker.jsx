import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNotch, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { ConfirmModal } from '../../../../components/ConfirmModal/ConfirmModal';
import { Modal } from '../../../../components/Modal/Modal';
import { HomeLayoutService } from '../../../../services/homeLayout/homeLayoutService';
import styles from './MediaPicker.module.css';

export function MediaPicker({ onSelect, onClose }) {
    const service = useMemo(() => new HomeLayoutService(), []);
    const fileInputRef = useRef(null);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [pendingDelete, setPendingDelete] = useState(null);

    const load = () => {
        setLoading(true);
        service.getMedia()
            .then(list => setItems(list ?? []))
            .catch(() => toast.error('No se pudo cargar la biblioteca de medios.'))
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    const handleUpload = async (event) => {
        const files = Array.from(event.target.files).filter(f => f.type.startsWith('image/'));
        event.target.value = '';
        if (!files.length) return;

        setUploading(true);
        for (const file of files) {
            try {
                const item = await service.uploadMedia(file);
                setItems(current => [item, ...current]);
            } catch (error) {
                toast.error(error?.error ?? `No se pudo subir ${file.name}.`);
            }
        }
        setUploading(false);
    };

    const confirmDelete = async () => {
        try {
            await service.deleteMedia(pendingDelete.id);
            setItems(current => current.filter(i => i.id !== pendingDelete.id));
        } catch (error) {
            toast.error(error?.error ?? 'No se pudo eliminar la imagen.');
        } finally {
            setPendingDelete(null);
        }
    };

    return (
        <Modal title="Biblioteca de medios" onClose={onClose}>
            <div className={styles.picker}>
                <button
                    className={styles.upload_btn}
                    onClick={() => fileInputRef.current.click()}
                    disabled={uploading}
                >
                    {uploading
                        ? <FontAwesomeIcon icon={faCircleNotch} spin />
                        : <><FontAwesomeIcon icon={faPlus} /> Subir imagen</>}
                </button>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    multiple
                    onChange={handleUpload}
                    style={{ display: 'none' }}
                />

                {!loading && items.length === 0 && (
                    <p className={styles.empty}>No hay imágenes en la biblioteca.</p>
                )}

                {items.length > 0 && (
                    <div className={styles.grid}>
                        {items.map(item => (
                            <div key={item.id} className={styles.item}>
                                <button
                                    className={styles.item_select}
                                    onClick={() => onSelect({ path: item.path, url: item.url })}
                                    title={item.name}
                                >
                                    <img src={item.url} alt={item.name} className={styles.item_img} />
                                </button>
                                <button
                                    onClick={() => setPendingDelete(item)}
                                    className={styles.item_delete}
                                    aria-label="Eliminar de la biblioteca"
                                >
                                    <FontAwesomeIcon icon={faTrash} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {pendingDelete && (
                <ConfirmModal
                    message={`¿Eliminar "${pendingDelete.name}" de la biblioteca?`}
                    onConfirm={confirmDelete}
                    onCancel={() => setPendingDelete(null)}
                />
            )}
        </Modal>
    );
}
