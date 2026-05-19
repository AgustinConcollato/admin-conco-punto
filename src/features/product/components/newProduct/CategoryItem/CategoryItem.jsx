import styles from './CategoryItem.module.css'

export function CategoryItem({
    category,
    selectedCategoryIds,
    setSelectedCategoryIds,
    categoryList,
    getDescendantIds
}) {
    const isChecked = selectedCategoryIds.includes(category.id);

    const handleCheck = () => {
        const categoryId = category.id;
        let currentIdsSet = new Set(selectedCategoryIds);

        if (isChecked) {
            currentIdsSet.delete(categoryId);

            const descendantsToDeselect = getDescendantIds(categoryId, categoryList);
            descendantsToDeselect.forEach(id => currentIdsSet.delete(id));

        } else {
            // Regla de selección única para categorías de nivel superior (parent_id: null)
            if (category.parent_id === null) {
                const currentlySelectedTopLevelId = selectedCategoryIds.find(id => {
                    const selectedCategory = categoryList.find(c => c.id === id);
                    return selectedCategory && selectedCategory.parent_id === null;
                });

                if (currentlySelectedTopLevelId && currentlySelectedTopLevelId !== categoryId) {
                    currentIdsSet.delete(currentlySelectedTopLevelId);
                    const descendantsToDeselect = getDescendantIds(currentlySelectedTopLevelId, categoryList);
                    descendantsToDeselect.forEach(id => currentIdsSet.delete(id));
                }
            }

            currentIdsSet.add(categoryId);

            if (category.parent_id) {
                currentIdsSet.add(category.parent_id);
            }
        }

        setSelectedCategoryIds(Array.from(currentIdsSet));
    };

    return (
        <li>
            <label>
                <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={handleCheck}
                />
                {category.name}
            </label>

            {category.children && category.children.length > 0 && isChecked && (
                <ul className={styles.subcategories}>
                    {category.children.map(child => (
                        <CategoryItem
                            key={child.id}
                            category={child}
                            selectedCategoryIds={selectedCategoryIds}
                            setSelectedCategoryIds={setSelectedCategoryIds}
                            categoryList={categoryList}
                            getDescendantIds={getDescendantIds}
                        />
                    ))}
                </ul>
            )}
        </li>
    );
};