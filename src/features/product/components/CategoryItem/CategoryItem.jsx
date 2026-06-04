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
            // Deseleccionar cualquier categoría hermana (mismo parent_id) ya seleccionada
            const conflictingId = selectedCategoryIds.find(id => {
                if (id === categoryId) return false;
                const c = categoryList.find(cat => cat.id === id);
                return c && c.parent_id === category.parent_id;
            });
            if (conflictingId) {
                currentIdsSet.delete(conflictingId);
                getDescendantIds(conflictingId, categoryList).forEach(id => currentIdsSet.delete(id));
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