import { useState, useEffect, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';
import { CategoryService } from '../../../../../services/category/categoryService';
import styles from './EditCategoryForm.module.css';

export function EditCategoryForm({ category, categories: propCategories, onSave, onCancel }) {
    const [formData, setFormData] = useState({
        name: category.name || '',
        parent_id: category.parent_id || '',
    });
    const [categories, setCategories] = useState(propCategories || []);
    const [isLoadingCategories, setIsLoadingCategories] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const categoryService = useMemo(() => new CategoryService(), []);

    useEffect(() => {
        // Si se pasan categorías como prop, usarlas directamente
        if (propCategories && propCategories.length > 0) {
            setCategories(propCategories);
            return;
        }

        // Si no, cargarlas desde la API
        const loadCategories = async () => {
            setIsLoadingCategories(true);
            try {
                const data = await categoryService.getAll();
                setCategories(data);
            } catch (error) {
                console.error("Error al cargar categorías:", error);
            } finally {
                setIsLoadingCategories(false);
            }
        };

        loadCategories();
    }, [propCategories]);

    // Función recursiva para encontrar una categoría por ID en el árbol
    const findCategoryInTree = (items, id) => {
        for (const item of items) {
            if (item.id === id) {
                return item;
            }
            if (item.children && item.children.length > 0) {
                const found = findCategoryInTree(item.children, id);
                if (found) return found;
            }
        }
        return null;
    };

    // Función para obtener todos los IDs de descendientes de una categoría
    const getDescendantIds = (category) => {
        const ids = [category.id];
        if (category.children && category.children.length > 0) {
            category.children.forEach(child => {
                ids.push(...getDescendantIds(child));
            });
        }
        return ids;
    };

    // Obtener todos los IDs a excluir (la categoría actual y todos sus descendientes)
    const excludeIds = useMemo(() => {
        if (categories.length === 0) return [category.id];

        const currentCategory = findCategoryInTree(categories, category.id);
        if (currentCategory) {
            return getDescendantIds(currentCategory);
        }
        return [category.id];
    }, [categories, category.id]);

    // Función para aplanar todas las categorías primero, luego filtrar
    const flattenCategories = (items, level = 0) => {
        const flattened = [];
        for (const cat of items) {
            flattened.push({ ...cat, level });
            if (cat.children && cat.children.length > 0) {
                flattened.push(...flattenCategories(cat.children, level + 1));
            }
        }
        return flattened;
    };

    // Primero aplanar todas las categorías, luego filtrar las excluidas
    const allFlatCategories = flattenCategories(categories, 0);
    const flatCategories = allFlatCategories.filter(cat => !excludeIds.includes(cat.id));

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value === '' ? null : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSave({
                name: formData.name.trim(),
                parent_id: formData.parent_id || null,
            });
        } catch (error) {
            setErrors(error[0]);
        } finally {
            setLoading(false);
        }

    };

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            <div className={'input_group'}>
                <span htmlFor="name">Nombre</span>
                <input
                    className='input'
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className={'input_group'}>
                <span htmlFor="parent_id">Categoría padre (opcional)</span>
                {isLoadingCategories ? (
                    <p>Cargando categorías...</p>
                ) : (
                    <select
                        className='input'
                        name="parent_id"
                        value={formData.parent_id || ''}
                        onChange={handleChange}
                    >
                        <option value="">Sin categoría padre</option>
                        {flatCategories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                                {"".padStart(cat.level * 4, "\u00a0")}
                                {cat.level > 0 && "→ "}
                                {cat.name}
                            </option>
                        ))}
                    </select>
                )}
            </div>

            <button
                type="submit"
                className="btn btn_solid"
                disabled={loading}
            >
                {loading ? <FontAwesomeIcon icon={faCircleNotch} spin /> : 'Guardar Cambios'}
            </button>
        </form>
    );
}
