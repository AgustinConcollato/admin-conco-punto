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

    const goToNext = () => setCurrentIndex((currentIndex + 1) % images.length);
    const goToPrev = () => setCurrentIndex((currentIndex - 1 + images.length) % images.length);
    const closeModal = () => setCurrentIndex(null);
    const currentImage = isModalOpen ? images[currentIndex] : null;

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

    const handleDragStart = (e, id) => {
        setDraggingId(id);
        e.dataTransfer.effectAllowed = "move";
    };
    const handleDragOver = (e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; };
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

    const mainImage = images[0] || null;
    const thumbImages = images.slice(1);

    return (
        <>
            <div className={styles.card}>
                <div className={styles.header}>
                    <span className={styles.label}>Imágenes</span>
                    <button className={styles.action_btn} onClick={() => setIsAdding(true)}>
                        + Agregar
                    </button>
                </div>

                {/* Main image */}
                <div className={styles.main_wrap}>
                    {mainImage ? (
                        <div
                            className={styles.main_image}
                            onClick={() => setCurrentIndex(0)}
                            draggable
                            onDragStart={(e) => handleDragStart(e, mainImage.id)}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, mainImage.id)}
                            onDragEnd={handleDragEnd}
                        >
                            <img src={`${IMAGE_URL}/${mainImage.thumbnail_path}`} alt="Principal" />
                            <div className={styles.badge_principal}>PRINCIPAL</div>
                        </div>
                    ) : (
                        <div className={styles.main_empty} onClick={() => setIsAdding(true)}>
                            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                                <rect x="3" y="5" width="26" height="22" rx="3" stroke="#A5B4FC" strokeWidth="2" />
                                <circle cx="11" cy="12" r="3" stroke="#A5B4FC" strokeWidth="2" />
                                <path d="M3 22L10 15L15 20L21 13L29 22" stroke="#A5B4FC" strokeWidth="2" strokeLinejoin="round" />
                            </svg>
                            <span>Sin imágenes</span>
                        </div>
                    )}
                </div>

                {/* Thumbnails */}
                {(thumbImages.length > 0 || mainImage) && (
                    <div className={styles.thumbs}>
                        {thumbImages.map((img, i) => (
                            <div
                                key={img.id}
                                className={`${styles.thumb} ${draggingId === img.id ? styles.dragging : ''}`}
                                draggable
                                onDragStart={(e) => handleDragStart(e, img.id)}
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, img.id)}
                                onDragEnd={handleDragEnd}
                            >
                                <img
                                    src={`${IMAGE_URL}/${img.thumbnail_path}`}
                                    alt={`Imagen ${i + 2}`}
                                    onClick={() => setCurrentIndex(i + 1)}
                                />
                                {images.length > 1 && (
                                    <button
                                        className={styles.btn_remove}
                                        onClick={() => handleDelete(img.id)}
                                        title="Eliminar"
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                        ))}
                        <div className={styles.thumb_add} onClick={() => setIsAdding(true)}>
                            <span>+</span>
                        </div>
                    </div>
                )}
            </div>

            {isModalOpen && currentImage && (
                <Modal onClose={closeModal}>
                    <div className={styles.gallery_content}>
                        <img
                            src={`${IMAGE_URL}/${currentImage.path}`}
                            className={styles.modal_image}
                            alt={`Imagen ${currentIndex + 1}`}
                        />
                        {images.length > 1 && (
                            <div className={styles.nav}>
                                <button onClick={goToPrev} className={styles.nav_button} aria-label="Anterior">
                                    <FontAwesomeIcon icon={faChevronLeft} />
                                </button>
                                <button onClick={goToNext} className={styles.nav_button} aria-label="Siguiente">
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
