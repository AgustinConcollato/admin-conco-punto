import { faCircleNotch, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import { ConfirmModal } from "../../../../../components/ConfirmModal/ConfirmModal";
import { DragAndDrop } from "../../../../../components/DragAndDrop/DragAndDrop";
import { IMAGE_URL } from "../../../../../config/api";
import { ProductService } from "../../../../../services/product/productService";
import styles from "./VariantImages.module.css";

export function VariantImages({ productId, variant, onImagesUpdated }) {
    const productService = useMemo(() => new ProductService(), []);

    const [images, setImages] = useState(variant.images ?? []);
    const [filesToUpload, setFilesToUpload] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [pendingDeleteId, setPendingDeleteId] = useState(null);

    const handleUpload = async () => {
        if (!filesToUpload.length) return;
        setUploading(true);
        try {
            const formData = new FormData();
            filesToUpload.forEach(f => formData.append('images[]', f));
            formData.append('variant_id', variant.id);

            const response = await productService.addImages(formData, productId);
            const newImages = response.images ?? [];
            setImages(newImages);
            onImagesUpdated?.(variant.id, newImages);
            setFilesToUpload([]);
            toast.success('Imágenes subidas');
        } catch {
            toast.error('Error al subir imágenes.');
        } finally {
            setUploading(false);
        }
    };

    const confirmDelete = async () => {
        try {
            await productService.deleteImages({ image_ids: [pendingDeleteId] }, productId);
            const updated = images.filter(img => img.id !== pendingDeleteId);
            setImages(updated);
            onImagesUpdated?.(variant.id, updated);
            toast.success('Imagen eliminada');
        } catch {
            toast.error('Error al eliminar la imagen.');
        } finally {
            setPendingDeleteId(null);
        }
    };

    const removeFile = (index) => {
        setFilesToUpload(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <div className={styles.container}>
            {/* Imágenes actuales */}
            {images.length > 0 && (
                <div className={styles.current_images}>
                    {images.map(img => (
                        <div key={img.id} className={styles.img_item}>
                            <img src={`${IMAGE_URL}/${img.thumbnail_path}`} alt="" />
                            <button
                                className={styles.btn_remove}
                                onClick={() => setPendingDeleteId(img.id)}
                                title="Eliminar imagen"
                            >
                                <FontAwesomeIcon icon={faXmark} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Upload nuevas */}
            <DragAndDrop setImages={setFilesToUpload} />

            {filesToUpload.length > 0 && (
                <div className={styles.preview_images}>
                    {filesToUpload.map((file, i) => (
                        <div key={i} className={styles.img_item}>
                            <img src={URL.createObjectURL(file)} alt="" />
                            <button className={styles.btn_remove} onClick={() => removeFile(i)}>
                                <FontAwesomeIcon icon={faXmark} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {filesToUpload.length > 0 && (
                <button
                    className="btn btn_solid"
                    onClick={handleUpload}
                    disabled={uploading}
                >
                    {uploading
                        ? <FontAwesomeIcon icon={faCircleNotch} spin />
                        : `Subir ${filesToUpload.length} imagen${filesToUpload.length !== 1 ? 'es' : ''}`}
                </button>
            )}

            {pendingDeleteId && (
                <ConfirmModal
                    message="¿Eliminar esta imagen de la variante?"
                    onConfirm={confirmDelete}
                    onCancel={() => setPendingDeleteId(null)}
                />
            )}
        </div>
    );
}
