import { faChevronLeft, faChevronRight, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import { ConfirmModal } from "../../../../components/ConfirmModal/ConfirmModal";
import { Modal } from "../../../../components/Modal/Modal";
import { IMAGE_URL } from "../../../../config/api";
import { ProductService } from "../../../../services/product/ProductService";
import { AddImagesModal } from "../AddImagesModal/AddImagesModal";
import styles from './Images.module.css';

export function Images({ images: initialImages, productId }) {

    const [images, setImages] = useState(initialImages);
    const [currentIndex, setCurrentIndex] = useState(null);
    const [draggingId, setDraggingId] = useState(null);
    const [pendingDeleteId, setPendingDeleteId] = useState(null);
    const [isAdding, setIsAdding] = useState(false);

    const isModalOpen = currentIndex !== null;
    const productService = useMemo(() => new ProductService(), []);

    // ── Galería ──
    const goToNext = () => setCurrentIndex((currentIndex + 1) % images.length);
    const goToPrev = () => setCurrentIndex((currentIndex - 1 + images.length) % images.length);
    const closeModal = () => setCurrentIndex(null);
    const currentImage = isModalOpen ? images[currentIndex] : null;

    // ── Eliminar ──
    const handleDelete = (imageId) => {
        if (images.length <= 1) {
            toast.warning('No se puede eliminar la única imagen del producto.');
            return;
        }
        setPendingDeleteId(imageId);
    };

    const confirmDelete = async () => {
        try {
            await productService.deleteImages({ image_ids: [pendingDeleteId] }, productId);
            setImages(prev => prev.filter(e => e.id !== pendingDeleteId));
        } catch (error) {
            console.error("Error al eliminar imagen:", error);
            toast.error("No se pudo eliminar la imagen.");
        } finally {
            setPendingDeleteId(null);
        }
    };

    // ── Drag & Drop reordenar ──
    const handleDragStart = (e, id) => {
        setDraggingId(id);
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    };

    const handleDrop = (e, dropId) => {
        e.preventDefault();
        if (!draggingId || draggingId === dropId) return;

        const draggingIndex = images.findIndex(img => img.id === draggingId);
        const dropIndex = images.findIndex(img => img.id === dropId);
        if (draggingIndex === -1 || dropIndex === -1) return;

        const newImages = [...images];
        const [removed] = newImages.splice(draggingIndex, 1);
        newImages.splice(dropIndex, 0, removed);

        setImages(newImages);
        handleReorderPersist(newImages);
        setDraggingId(null);
    };

    const handleDragEnd = () => setDraggingId(null);

    const handleReorderPersist = async (reorderedList) => {
        const positions = reorderedList.map((img, index) => ({ id: img.id, position: index }));
        try {
            await productService.reorderImages({ positions }, productId);
        } catch (error) {
            console.error("Error al reordenar imágenes:", error);
            setImages(initialImages);
        }
    };

    return (
        <>
            <div className={styles.images_section}>
                <div className={styles.header}>
                    <h3>Imágenes</h3>
                    <button className="btn btn_regular" onClick={() => setIsAdding(true)}>
                        + Agregar
                    </button>
                </div>

                <div className={styles.images_grid}>
                    {images.map((img, index) => (
                        <div
                            key={img.id || index}
                            className={`${styles.image_item} ${draggingId === img.id ? styles.dragging : ''}`}
                            draggable
                            onDragStart={(e) => handleDragStart(e, img.id)}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, img.id)}
                            onDragEnd={handleDragEnd}
                        >
                            <img
                                src={`${IMAGE_URL}/${img.thumbnail_path}`}
                                onClick={() => setCurrentIndex(index)}
                                alt={`Imagen ${index + 1}`}
                            />
                            {index === 0 && (
                                <span className={styles.badge_principal}>Principal</span>
                            )}
                            {images.length > 1 && (
                                <button
                                    className={styles.btn_remove}
                                    onClick={() => handleDelete(img.id)}
                                    title="Eliminar imagen"
                                >
                                    <FontAwesomeIcon icon={faXmark} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {isModalOpen && currentImage && (
                <Modal onClose={closeModal}>
                    <div className={styles.gallery_content}>
                        <img
                            src={`${IMAGE_URL}/${currentImage.path}`}
                            className={styles.modal_image}
                            alt={`Imagen en modal ${currentIndex + 1}`}
                        />
                        {images.length > 1 && (
                            <div className={styles.nav}>
                                <button onClick={goToPrev} className={styles.nav_button} aria-label="Imagen anterior">
                                    <FontAwesomeIcon icon={faChevronLeft} />
                                </button>
                                <button onClick={goToNext} className={styles.nav_button} aria-label="Imagen siguiente">
                                    <FontAwesomeIcon icon={faChevronRight} />
                                </button>
                            </div>
                        )}
                    </div>
                </Modal>
            )}

            {isAdding && (
                <Modal onClose={() => setIsAdding(false)} title="Agregar imágenes">
                    <AddImagesModal
                        productId={productId}
                        onClose={() => setIsAdding(false)}
                        onUpdate={setImages}
                    />
                </Modal>
            )}

            {pendingDeleteId && (
                <ConfirmModal
                    message="¿Estás seguro de que querés eliminar esta imagen?"
                    onConfirm={confirmDelete}
                    onCancel={() => setPendingDeleteId(null)}
                />
            )}
        </>
    );
}



