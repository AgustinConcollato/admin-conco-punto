import { useEffect, useRef, useState } from "react";
import { CategoryService } from "../../../../services/category/categoryService";
import { Loading } from "../../../../components/Loading/Loading";
import styles from "./CategoryList.module.css";

const LEVEL_LABELS = ["Seleccioná una categorí­a", "Seleccioná una subcategoría", "Seleccioná una opción"];

export function CategoryList({ setCategories, selectedIds = null, onDeepestCategoryChange }) {
    const [categoryList, setCategoryList] = useState(null);
    const [path, setPath] = useState([]);

    const notifyRef = useRef(onDeepestCategoryChange);
    useEffect(() => { notifyRef.current = onDeepestCategoryChange; });

    const pathInitialized = useRef(!selectedIds?.length);

    useEffect(() => {
        const categoryService = new CategoryService();
        categoryService.getAll()
            .then(data => setCategoryList(data))
            .catch(console.error);
    }, []);

    useEffect(() => {
        if (!categoryList) return;
        if (!selectedIds?.length) {
            pathInitialized.current = true;
            return;
        }

        const findById = (id, cats) => {
            for (const cat of cats) {
                if (cat.id === id) return cat;
                if (cat.children?.length) {
                    const found = findById(id, cat.children);
                    if (found) return found;
                }
            }
            return null;
        };

        const root = selectedIds.map(id => findById(id, categoryList)).find(c => c && !c.parent_id);
        if (!root) {
            pathInitialized.current = true;
            return;
        }

        const pathArr = [root];
        let cur = root;
        while (true) {
            const child = selectedIds
                .map(id => findById(id, categoryList))
                .find(c => c && c.parent_id === cur.id);
            if (!child) break;
            pathArr.push(child);
            cur = child;
        }

        pathInitialized.current = true;
        setPath(pathArr);
    }, [categoryList]);

    useEffect(() => {
        if (!pathInitialized.current) return;
        if (path.length === 0) {
            setCategories([]);
            notifyRef.current?.(null);
            return;
        }
        const last = path[path.length - 1];
        setCategories(path.map(c => c.id));
        notifyRef.current?.(last);
    }, [path]);

    const currentOptions = () => {
        if (path.length === 0) return categoryList ?? [];
        return path[path.length - 1].children ?? [];
    };

    const isComplete = path.length > 0 && currentOptions().length === 0;

    const selectCategory = (cat) => setPath(prev => [...prev, cat]);
    const truncatePath = (index) => setPath(prev => prev.slice(0, index + 1));
    const resetPath = () => setPath([]);

    if (!categoryList) return <Loading />;

    return (
        <div className={styles.container}>
            {path.length > 0 && (
                <div className={styles.breadcrumb}>
                    {path.map((cat, i) => (
                        <span key={cat.id} className={styles.crumb_item}>
                            <button
                                type="button"
                                className={styles.crumb_btn}
                                onClick={() => truncatePath(i)}
                            >
                                {cat.name}
                            </button>
                            {i < path.length - 1 && <span className={styles.crumb_sep}>›</span>}
                        </span>
                    ))}
                    <button type="button" className={styles.change_btn} onClick={resetPath}>
                        Cambiar
                    </button>
                </div>
            )}

            {!isComplete && (
                <div className={styles.level_section}>
                    <p className={styles.level_label}>
                        {LEVEL_LABELS[Math.min(path.length, LEVEL_LABELS.length - 1)]}
                    </p>
                    <div className={styles.options_grid}>
                        {currentOptions().map(cat => (
                            <button
                                key={cat.id}
                                type="button"
                                className={styles.option_btn}
                                onClick={() => selectCategory(cat)}
                            >
                                <span className={styles.option_name}>{cat.name}</span>
                                {cat.children?.length > 0 && (
                                    <span className={styles.option_arrow}>›</span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}



