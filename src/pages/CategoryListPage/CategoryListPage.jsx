import { faChevronDown, faChevronRight, faEdit, faFolderOpen, faPlus, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { ConfirmModal } from "../../components/ConfirmModal/ConfirmModal";
import { EmptyState } from "../../components/EmptyState/EmptyState";
import { Loading } from "../../components/Loading/Loading";
import { Modal } from "../../components/Modal/Modal";
import { EditCategoryForm } from "../../features/category/editCategory/components/EditCategoryForm/EditCategoryForm";
import { CategoryService } from "../../services/category/categoryService";
import styles from "./CategoryListPage.module.css";

export function CategoryListPage() {
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [expandedCategories, setExpandedCategories] = useState(new Set());
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [pendingDeleteId, setPendingDeleteId] = useState(null);

    // Se memoiza el servicio para evitar re-instancias
    const categoryService = useMemo(() => new CategoryService(), []);

    const getCategories = async () => {
        setIsLoading(true);
        try {
            const data = await categoryService.getAll();
            setCategories(data);

            // Opción: Expandir todo al inicio (comentar si se prefiere todo colapsado)
            const allIds = new Set();
            const collectIds = (items) => {
                items.forEach(cat => {
                    if (cat.children && cat.children.length > 0) {
                        allIds.add(cat.id);
                        collectIds(cat.children);
                    }
                });
            };
            collectIds(data);
            setExpandedCategories(allIds);

        } catch (error) {
            console.error("Error al obtener categorías:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        getCategories();
    }, []);

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const toggleCategory = (categoryId) => {
        setExpandedCategories(prev => {
            const newSet = new Set(prev);
            if (newSet.has(categoryId)) newSet.delete(categoryId);
            else newSet.add(categoryId);
            return newSet;
        });
    };

    const filteredCategories = useMemo(() => {
        if (!searchTerm) return categories;
        const lower = searchTerm.trim().toLowerCase();
        const filterRecursive = (items) => {
            return items
                .map((cat) => ({
                    ...cat,
                    children: cat.children ? filterRecursive(cat.children) : [],
                }))
                .filter((cat) => {
                    const matches = cat.name.toLowerCase().includes(lower);
                    const hasChildren = cat.children && cat.children.length > 0;
                    return matches || hasChildren;
                });
        };
        return filterRecursive(categories);
    }, [categories, searchTerm]);

    const confirmDelete = async () => {
        if (!pendingDeleteId) return;
        try {
            await categoryService.delete(pendingDeleteId);
            const removeById = (items) => items
                .filter(cat => cat.id !== pendingDeleteId)
                .map(cat => ({ ...cat, children: removeById(cat.children || []) }));
            setCategories(prev => removeById(prev));
            toast.success("Categoría eliminada");
        } catch (error) {
            toast.error("Error al eliminar la categoría.");
        } finally {
            setPendingDeleteId(null);
        }
    };

    const handleEdit = (category) => {
        setEditingCategory(category);
        setShowEditModal(true);
    };

    const closeEditModal = () => {
        setShowEditModal(false);
        setEditingCategory(null);
    };

    const handleUpdate = async (updatedData) => {
        if (!editingCategory) return;
        try {
            const response = await categoryService.update(editingCategory.id, updatedData);
            if (response && response.categories) setCategories(response.categories);
            else await getCategories();
            closeEditModal();
            toast.success("Categoría actualizada");
        } catch (error) {
            toast.error("Error al actualizar la categoría.");
        }
    };

    // --- RENDERIZADO RECURSIVO ---
    const renderCategoryItem = (category, level = 0) => {
        const hasChildren = category.children && category.children.length > 0;
        const isExpanded = expandedCategories.has(category.id);
        const isRoot = level === 0;

        return (
            <li key={category.id} className={isRoot ? styles.root_item : ''}>
                {/* Tarjeta Principal de la Categoría */}
                <div
                    className={`${styles.category_card} ${isRoot ? styles.is_root : styles.is_child}`}
                    style={{ '--level': level }}
                >
                    <div className={styles.card_content_wrapper}>

                        {/* Botón Toggle (Flecha) */}
                        <div className={styles.toggle_area}>
                            {hasChildren ? (
                                <button
                                    type="button"
                                    className={styles.toggle_button}
                                    onClick={() => toggleCategory(category.id)}
                                >
                                    <FontAwesomeIcon
                                        icon={isExpanded ? faChevronDown : faChevronRight}
                                        className={styles.toggle_icon}
                                    />
                                </button>
                            ) : (
                                <span className={styles.toggle_spacer}></span>
                            )}
                        </div>

                        {/* Info Principal */}
                        <div className={styles.name_group}>
                            <span className={styles.category_name}>{category.name}</span>
                            <span className={styles.slug_text}>{category.slug}</span>
                        </div>

                        {/* Info Secundaria (Padre) - Se oculta en móvil por CSS */}
                        <span className={styles.parent_info}>
                            {category.parent ? <><small>Padre:</small> {category.parent.name}</> : "-"}
                        </span>

                        {/* Acciones */}
                        <div className={styles.card_actions}>
                            <button className={styles.icon_btn_edit} onClick={() => handleEdit(category)} title="Editar">
                                <FontAwesomeIcon icon={faEdit} />
                            </button>
                            <button className={styles.icon_btn_delete} onClick={() => setPendingDeleteId(category.id)} title="Eliminar">
                                <FontAwesomeIcon icon={faTrashAlt} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Cajón de Hijos (Drawer) */}
                {hasChildren && isExpanded && (
                    // Nuevo contenedor visual para los hijos
                    <div className={styles.children_drawer}>
                        <ul className={styles.children_list}>
                            {category.children.map((child) => renderCategoryItem(child, level + 1))}
                        </ul>
                    </div>
                )}
            </li>
        );
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2 className={styles.title}>Categorías</h2>
                <Link to="/categorias/nueva" className="btn btn_primary">
                    <FontAwesomeIcon icon={faPlus} /> <span className={styles.btn_text}>Nueva</span>
                </Link>
            </div>

            <div className={styles.search_container}>
                <input
                    type="text"
                    placeholder="Buscar categoría..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className={styles.search_input}
                />
            </div>

            {isLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                    <Loading />
                </div>
            ) : filteredCategories.length === 0 ? (
                <EmptyState
                    icon={faFolderOpen}
                    message={searchTerm ? 'No se encontraron categorías con ese criterio.' : 'Todavía no hay categorías creadas.'}
                />
            ) : (
                // En este diseño ya no necesitamos el header de tabla tradicional
                <ul className={styles.main_list}>
                    {filteredCategories.map((cat) => renderCategoryItem(cat))}
                </ul>
            )}

            {showEditModal && editingCategory && (
                <Modal onClose={closeEditModal} title={`Editar: ${editingCategory.name}`}>
                    <EditCategoryForm
                        category={editingCategory}
                        categories={categories}
                        onSave={handleUpdate}
                        onCancel={closeEditModal}
                    />
                </Modal>
            )}

            {pendingDeleteId && (
                <ConfirmModal
                    message="¿Estás seguro? Se eliminarán también todas las subcategorías."
                    onConfirm={confirmDelete}
                    onCancel={() => setPendingDeleteId(null)}
                />
            )}
        </div>
    );
}