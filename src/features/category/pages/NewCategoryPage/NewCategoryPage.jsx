import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { CategoryService } from "../../../../services/category/categoryService";
import styles from "./NewCategoryPage.module.css";

export function NewCategoryPage() {
    const [name, setName] = useState("");
    const [parentId, setParentId] = useState("");
    const [categories, setCategories] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    const categoryService = useMemo(() => new CategoryService(), []);

    const loadCategories = async () => {
        try {
            const data = await categoryService.getAll();
            setCategories(data);
        } catch (error) {
            console.error("Error al cargar categorías:", error);
        }
    };

    useEffect(() => {
        document.title = 'Nueva categoría'
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        })
        loadCategories();
    }, []);

    const flattenCategories = (items, level = 0) => {
        return items.flatMap((cat) => [
            { ...cat, level },
            ...(cat.children ? flattenCategories(cat.children, level + 1) : []),
        ]);
    };

    const flatCategories = flattenCategories(categories);

    const handleSubmit = async (event) => {
        event.preventDefault();
        // if (!name.trim()) return;

        setIsSubmitting(true);
        try {
            await categoryService.create({
                name: name.trim(),
                parent_id: parentId || null,
            });

            setName("");
            setParentId("");
            setErrors({});
            loadCategories();
            toast.success("Categoría creada");

        } catch (error) {
            setErrors(error[0]);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={styles.page}>
            <form className={styles.form} onSubmit={handleSubmit}>
                <h1 className="title">Agregar nueva categoría</h1>
                <div className='input_group'>
                    <span>Nombre de la categoría o subcategoría</span>
                    <input
                        className="input"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Nombre de la categoría o subcategoría"
                    />
                    {errors.name && <p className={styles.error}>{errors.name[0]}</p>}
                </div>

                <div className='input_group'>
                    <span>Categoría padre (opcional)</span>
                    <select
                        className="input"
                        value={parentId}
                        onChange={(e) => setParentId(e.target.value)}
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
                </div>
                <button
                    type="submit"
                    className="btn btn_solid"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? <FontAwesomeIcon icon={faCircleNotch} spin /> : "Guardar"}
                </button>
            </form>
        </div>
    );
}

