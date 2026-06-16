import { faCircleNotch, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DragAndDrop } from "../../../../components/DragAndDrop/DragAndDrop";
import { ProductService } from "../../../../services/product/productService";
import { parseApiError } from "../../../../utils/parseApiError";
import styles from './CreateProduct.module.css';

export function CreateProduct() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [draggedImageIndex, setDraggedImageIndex] = useState(null);
    const [images, setImages] = useState([]);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [isDropship, setIsDropship] = useState(false);
    const [available, setAvailable] = useState(true);

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

    const handleDragEnd = () => setDraggedImageIndex(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        const productService = new ProductService();
        const formData = new FormData(e.target);

        images.forEach((image, i) => {
            formData.append('images[]', image);
            formData.append('image_positions[]', i);
        });

        // Dropshipping: el stock no se carga como número, es solo disponibilidad (1 / 0)
        formData.set('is_dropshipping', isDropship ? '1' : '0');
        if (isDropship) {
            formData.set('stock', available ? '1' : '0');
        }

        // categories required by backend — send empty array, will be filled in step 2
        // but backend validates categories as required, so we need at least a placeholder
        // Actually we need to relax the categories validation OR send them here
        // For now: categories will be synced in step 2, so we pass a dummy value
        // Better: remove categories required from step 1 validation — handled in step 2

        try {
            const product = await productService.createProduct(formData);
            sessionStorage.setItem('product', JSON.stringify(product));
            navigate(`/productos/nuevo/2/${product.id}`);
        } catch (error) {
            setErrors(parseApiError(error).fieldErrors ?? {});
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        id ?
            navigate(`/productos/nuevo/1`) :
            sessionStorage.removeItem('product');
    }, [id]);

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
                                <span onClick={() => setImages(prev => prev.filter((_, j) => j !== i))}>
                                    <FontAwesomeIcon icon={faXmark} />
                                </span>
                                <img src={URL.createObjectURL(img)} alt="" />
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
                <label className={styles.checkbox_row}>
                    <input
                        type="checkbox"
                        checked={isDropship}
                        onChange={(e) => setIsDropship(e.target.checked)}
                    />
                    <span>Producto del proveedor (dropshipping)</span>
                </label>
            </div>

            {isDropship ? (
                <div className="input_group">
                    <label className={styles.checkbox_row}>
                        <input
                            type="checkbox"
                            checked={available}
                            onChange={(e) => setAvailable(e.target.checked)}
                        />
                        <span>Disponible</span>
                    </label>
                </div>
            ) : (
                <div className="input_group">
                    <span>Stock</span>
                    <input className="input" type="number" name="stock" placeholder="Stock" />
                    {errors.stock && <p className={styles.error}>{errors.stock[0]}</p>}
                </div>
            )}

            <button type="submit" className="btn btn_solid" disabled={loading}>
                {loading ? <FontAwesomeIcon icon={faCircleNotch} spin /> : 'Siguiente'}
            </button>
        </form>
    );
}



