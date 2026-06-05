import { useEffect, useState, useMemo } from "react";
import { CategoryService } from "../../../../services/category/categoryService";
import { PriceListService } from "../../../../services/priceList/priceListService";
import { SupplierService } from "../../../../services/supplier/supplierService";
import styles from './Filters.module.css';

export function Filters({ resetFilters, handleFilterChange, filters }) {
    const [categories, setCategories] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [priceLists, setPriceLists] = useState([]);

    const categoryService = useMemo(() => new CategoryService(), []);
    const supplierService = useMemo(() => new SupplierService(), []);
    const priceListService = useMemo(() => new PriceListService(), []);

    // 1. Función recursiva para aplanar categorías y subcategorías
    const flattenCategories = (categoriesList, level = 0) => {
        let flatList = [];
        categoriesList.forEach((category) => {
            // Guardamos la categoría con su nivel de profundidad
            flatList.push({ 
                id: category.id, 
                name: category.name, 
                level: level 
            });
            
            // Si tiene hijos, los procesamos recursivamente
            // NOTA: Cambia 'children' por el nombre que use tu API (ej. 'subcategories')
            if (category.children && category.children.length > 0) {
                flatList = [...flatList, ...flattenCategories(category.children, level + 1)];
            }
        });
        return flatList;
    };

    // 2. Memorizamos la lista aplanada para mejorar el rendimiento
    const flatCategoriesList = useMemo(() => {
        return flattenCategories(categories);
    }, [categories]);

    const loadFiltersData = async () => {
        try {
            const [categoriesData, suppliersData] = await Promise.all([
                categoryService.getAll(),
                supplierService.getAll(),
            ]);
            setCategories(categoriesData || []);
            setSuppliers(suppliersData || []);
        } catch (error) {
            console.error('Error al cargar filtros:', error);
        }
    };

    const getPriceLists = async () => {
        try {
            const response = await priceListService.get();
            setPriceLists(response || []);
        } catch (error) {
            console.error('Error al cargar listas de precios:', error);
        }
    };

    useEffect(() => {
        loadFiltersData();
        getPriceLists();
    }, []);

    return (
        <div className={styles.filters}>
            <h3>Filtros</h3>

            {/* Búsqueda */}
            <div className={styles.filterGroup}>
                <label>Buscar</label>
                <input
                    type="text"
                    placeholder="Nombre, SKU, Código de barras"
                    value={filters.search || ''}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className={styles.input}
                />
            </div>

            {/* Categoría (Jerárquica) */}
            <div className={styles.filterGroup}>
                <label>Categoría</label>
                <select
                    value={filters.category_id || ''}
                    onChange={(e) => handleFilterChange('category_id', e.target.value)}
                    className={styles.select}
                >
                    <option value="">Todas</option>
                    {flatCategoriesList.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                            {/* Añade espacios según el nivel: \u00A0 es un espacio en blanco que HTML respeta */}
                            {'\u00A0'.repeat(cat.level * 3)} 
                            {cat.level > 0 ? '↳ ' : ''} 
                            {cat.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Proveedor */}
            <div className={styles.filterGroup}>
                <label>Proveedor</label>
                <select
                    value={filters.supplier_id || ''}
                    onChange={(e) => handleFilterChange('supplier_id', e.target.value)}
                    className={styles.select}
                >
                    <option value="">Todos</option>
                    {suppliers.map((supplier) => (
                        <option key={supplier.id} value={supplier.id}>
                            {supplier.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Stock */}
            <div className={styles.filterGroup}>
                <label>Stock Mínimo</label>
                <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={filters.stock_min || ''}
                    onChange={(e) => handleFilterChange('stock_min', e.target.value)}
                    className={styles.input}
                />
            </div>

            <div className={styles.filterGroup}>
                <label>Stock Máximo</label>
                <input
                    type="number"
                    min="0"
                    placeholder="Sin límite"
                    value={filters.stock_max || ''}
                    onChange={(e) => handleFilterChange('stock_max', e.target.value)}
                    className={styles.input}
                />
            </div>

            {/* Precio */}
            <div className={styles.filterGroup}>
                <label>Precio Mínimo</label>
                <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0"
                    value={filters.price_min || ''}
                    onChange={(e) => handleFilterChange('price_min', e.target.value)}
                    className={styles.input}
                />
            </div>

            <div className={styles.filterGroup}>
                <label>Precio Máximo</label>
                <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Sin límite"
                    value={filters.price_max || ''}
                    onChange={(e) => handleFilterChange('price_max', e.target.value)}
                    className={styles.input}
                />
            </div>

            {/* Lista de precios */}
            <div className={styles.filterGroup}>
                <label>Lista de Precios</label>
                <select
                    value={filters.price_list_id || ''}
                    onChange={(e) => handleFilterChange('price_list_id', e.target.value)}
                    className={styles.select}
                >
                    <option value="">Todos los precios</option>
                    {priceLists.map(list => (
                        <option key={list.id} value={list.id}>{list.name}</option>
                    ))}
                </select>
            </div>

            {/* Ordenamiento */}
            <div className={styles.filterGroup}>
                <label>Ordenar por</label>
                <select
                    value={filters.sort_by || 'created_at'}
                    onChange={(e) => handleFilterChange('sort_by', e.target.value)}
                    className={styles.select}
                >
                    <option value="created_at">Fecha de creación</option>
                    <option value="name">Nombre</option>
                    <option value="price">Precio</option>
                    <option value="stock">Stock</option>
                    <option value="sku">SKU</option>
                    <option value="updated_at">Fecha de actualización</option>
                </select>
            </div>

            <div className={styles.filterGroup}>
                <label>Orden</label>
                <select
                    value={filters.sort_order || 'desc'}
                    onChange={(e) => handleFilterChange('sort_order', e.target.value)}
                    className={styles.select}
                >
                    <option value="desc">Descendente</option>
                    <option value="asc">Ascendente</option>
                </select>
            </div>

            {/* Limpiar filtros */}
            <button
                type="button"
                onClick={() => resetFilters({})}
                className={styles.clearButton}
            >
                Limpiar filtros
            </button>
        </div>
    );
}


