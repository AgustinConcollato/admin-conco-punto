import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { ProductService } from '../../../../../services/product/ProductService';
import styles from '../Info/Info.module.css';

export function EditInfo({ product, onSuccess }) {
    const [name, setName] = useState(product.name);
    const [stock, setStock] = useState(product.stock);
    const [description, setDescription] = useState(product.description || '');
    const [isSaving, setIsSaving] = useState(false);

    const productService = useMemo(() => new ProductService(), []);

    const handleSave = async (e) => {
        e.preventDefault();

        if (isSaving || !name.trim()) return;

        setIsSaving(true);
        const payload = {
            name: name,
            stock: Number(stock),
            description: description
        };

        try {
            const response = await productService.updateProduct(payload, product.id);
            // Ejecutamos el callback pasando los nuevos datos
            onSuccess(response);
        } catch (error) {
            console.error("Error al guardar:", error);
            toast.error("No se pudo guardar la información.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <form onSubmit={handleSave} className={styles.edit}>
            <div className={'input_group'}>
                <span>Nombre</span>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className='input'
                />
            </div>

            <div className={'input_group'}>
                <span>Stock</span>
                <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    min="0"
                    className='input'
                />
            </div>

            <div className={'input_group'}>
                <span>Descripción</span>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows="4"
                    className='input'
                />
            </div>

            <button type='submit' disabled={isSaving} className="btn btn_solid">
                {isSaving ? <FontAwesomeIcon icon={faCircleNotch} spin /> : 'Guardar Cambios'}
            </button>
        </form>
    );
}