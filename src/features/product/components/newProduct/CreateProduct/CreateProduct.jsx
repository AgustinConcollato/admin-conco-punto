import { faCircleNotch, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DragAndDrop } from "../../../../../components/DragAndDrop/DragAndDrop";
import { ProductService } from "../../../../../services/product/productService";
import { CategoryList } from "../CategoryList/CategoryList";
import styles from './CreateProduct.module.css';

export function CreateProduct() {

    const navigate = useNavigate();

    const [draggedImageIndex, setDraggedImageIndex] = useState(null);
    const [images, setImages] = useState([]);
    const [categories, setCategories] = useState([]);

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    function removeImage(setImages, index) {
        setImages(current => current.filter((_, i) => i !== index));
    }

    const handleDragStart = (e, index) => {
        setDraggedImageIndex(index);
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    };

    const handleDrop = (e, targetIndex) => {
        e.preventDefault();
        if (draggedImageIndex === null || draggedImageIndex === targetIndex) return;

        const reorderedImages = [...images];
        const [draggedItem] = reorderedImages.splice(draggedImageIndex, 1);
        reorderedImages.splice(targetIndex, 0, draggedItem);

        setImages(reorderedImages);
        setDraggedImageIndex(null);
    };

    const handleDragEnd = () => {
        setDraggedImageIndex(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        const productService = new ProductService();
        const formData = new FormData(e.target);

        // 1. Enviar categorías
        categories.forEach(categoryId => {
            formData.append('categories[]', categoryId);
        });

        // 3. Enviar imágenes y posiciones
        images.forEach((image, i) => {
            formData.append(`images[]`, image);
            formData.append('image_positions[]', i);
        });

        try {
            const product = await productService.createProduct(formData);

            sessionStorage.setItem('product', JSON.stringify(product));

            navigate(`/productos/nuevo/2/${product.id}`);

        } catch (error) {
            setErrors(error[0]);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        sessionStorage.removeItem('product');
    }, []);

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            <h1 className="title">Agregar producto</h1>
            <div className="input_group">
                <DragAndDrop setImages={setImages} />
                {images.length > 0 &&
                    <div className={styles.preview_images}>
                        {images.map((img, i) =>
                            <div
                                key={i}
                                className={`${styles.image} ${draggedImageIndex === i ? styles.dragging : ''}`}
                                draggable="true"
                                onDragStart={(e) => handleDragStart(e, i)}
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, i)}
                                onDragEnd={handleDragEnd}
                            >
                                <span onClick={() => removeImage(setImages, i)}><FontAwesomeIcon icon={faXmark} /></span>
                                <img src={URL.createObjectURL(img)} />
                                {i === 0 && <pre>Principal</pre>}
                                {errors[`images.${i}`] && <p className={styles.error}>{errors[`images.${i}`]}</p>}
                            </div>
                        )}
                    </div>
                }
                {errors.images && <p className={styles.error}>{errors.images[0]}</p>}
            </div>
            <div className="input_group">
                <span>Nombre</span>
                <input className="input" type="text" name="name" placeholder="Nombre" />
                {errors.name && <p className={styles.error}>{errors.name[0]}</p>}
            </div>

            <div className="input_group">
                <span>Descripción</span>
                <textarea className="input" name="description" placeholder="Descripción" />
            </div>

            <div className="input_group">
                <span>Stock</span>
                <input className="input" type="number" name="stock" placeholder="Stock" />
                {errors.stock && <p className={styles.error}>{errors.stock[0]}</p>}
            </div>

            <CategoryList setCategories={setCategories} />
            {errors.categories && <p className={styles.error}>{errors.categories[0]}</p>}

            <button type="submit" className="btn btn_solid" disabled={loading}>
                {loading ? <FontAwesomeIcon icon={faCircleNotch} spin /> : 'Siguiente'}
            </button>
        </form>
    )
}