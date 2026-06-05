import { faCircleNotch, faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { DragAndDrop } from "../../../../components/DragAndDrop/DragAndDrop";
import { ProductService } from '../../../../services/product/productService';
import styles from './AddImagesModal.module.css';

export function AddImagesModal({ productId, onClose, onUpdate }) {
    const [imagesToUpload, setImagesToUpload] = useState([]);
    const [draggingIndex, setDraggingIndex] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [errors, setErrors] = useState({});
    const productService = useMemo(() => new ProductService(), []);

    // ── Drag & Drop reordenar previews ──
    const handleDragStart = (e, index) => {
        setDraggingIndex(index);
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    };

    const handleDrop = (e, targetIndex) => {
        e.preventDefault();
        if (draggingIndex === null || draggingIndex === targetIndex) return;
        const reordered = [...imagesToUpload];
        const [moved] = reordered.splice(draggingIndex, 1);
        reordered.splice(targetIndex, 0, moved);
        setImagesToUpload(reordered);
        setDraggingIndex(null);
    };

    const handleDragEnd = () => setDraggingIndex(null);

    const removeImage = (index) => {
        setImagesToUpload(prev => prev.filter((_, i) => i !== index));
    };

    const handleUploadImages = async () => {
        if (imagesToUpload.length === 0) {
            toast.warning('Seleccioná al menos una imagen para subir.');
            return;
        }
        if (!productId) {
            toast.error('No se encontró el ID del producto.');
            return;
        }

        setIsUploading(true);
        try {
            const formData = new FormData();
            imagesToUpload.forEach(file => formData.append('images[]', file));
            const response = await productService.addImages(formData, productId);
            onUpdate(response.images);
            onClose();
        } catch (error) {
            setErrors(error[0]);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className={styles.add_image_modal}>
            <p className={styles.description}>Seleccioná una o varias imágenes. Podés reordenarlas arrastrando antes de subir.</p>

            <DragAndDrop setImages={setImagesToUpload} />

            {imagesToUpload.length > 0 && (
                <div className={styles.preview_images}>
                    {imagesToUpload.map((img, i) => (
                        <div
                            key={i}
                            className={`${styles.image} ${draggingIndex === i ? styles.dragging : ''}`}
                            draggable
                            onDragStart={(e) => handleDragStart(e, i)}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, i)}
                            onDragEnd={handleDragEnd}
                        >
                            <img src={URL.createObjectURL(img)} alt={`Preview ${i + 1}`} />
                            <button
                                className={styles.btn_remove}
                                onClick={() => removeImage(i)}
                                title="Quitar imagen"
                            >
                                <FontAwesomeIcon icon={faXmark} />
                            </button>
                            {errors[`images.${i}`] && (
                                <p className={styles.error}>{errors[`images.${i}`]}</p>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {errors.images && <p className={styles.error}>{errors.images[0]}</p>}

            <p className={styles.file_info}>Máx. 2MB por archivo (JPG, PNG, WEBP).</p>

            <button
                className="btn btn_solid"
                onClick={handleUploadImages}
                disabled={isUploading || imagesToUpload.length === 0}
            >
                {isUploading
                    ? <FontAwesomeIcon icon={faCircleNotch} spin />
                    : `Subir ${imagesToUpload.length} imagen${imagesToUpload.length !== 1 ? 'es' : ''}`}
            </button>
        </div>
    );
}



