import { useEffect, useState } from "react"
import { CategoryService } from "../../../../../services/category/categoryService";
import { CategoryItem } from "../CategoryItem/CategoryItem";
import { Loading } from "../../../../../components/Loading/Loading";
import styles from "./CategoryList.module.css";

export function CategoryList({ setCategories, selectedIds = null }) {

    const [categoryList, setCategoryList] = useState(null);
    const [selectedCategoryIds, setSelectedCategoryIds] = useState(selectedIds || []);

    const getCategories = async () => {
        const categoryService = new CategoryService();

        try {
            const response = await categoryService.getAll();
            setCategoryList(response);
        } catch (error) {
            console.log(error);
        }
    }

    const getDescendantIds = (parentId, categories) => {
        let descendants = [];

        const collectIds = (children) => {
            for (const child of children) {
                descendants.push(child.id);
                if (child.children && child.children.length > 0) {
                    collectIds(child.children);
                }
            }
        };

        for (const category of categories) {
            if (category.id === parentId) {
                if (category.children) {
                    collectIds(category.children);
                }
                return descendants;
            }

            if (category.children && category.children.length > 0) {
                const foundDescendants = getDescendantIds(parentId, category.children);
                if (foundDescendants.length > 0) {
                    return foundDescendants;
                }
            }
        }
        return descendants;
    };

    useEffect(() => {
        getCategories();
        setSelectedCategoryIds(selectedIds || []);
    }, []);

    useEffect(() => {
        setCategories(selectedCategoryIds);
    }, [selectedCategoryIds, setCategories]);


    return (
        <div>
            <h3>Lista de Categorías</h3>
            <ul className={styles.categories}>
                {categoryList ?
                    categoryList.length > 0 &&
                    categoryList.map(category => (
                        <CategoryItem
                            key={category.id}
                            category={category}
                            selectedCategoryIds={selectedCategoryIds}
                            setSelectedCategoryIds={setSelectedCategoryIds}
                            categoryList={categoryList}
                            getDescendantIds={getDescendantIds}
                        />
                    ))
                    :
                    <Loading />
                }
            </ul>
        </div>
    )
}