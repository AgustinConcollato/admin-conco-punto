import { useEffect, useState } from 'react';
import { normalizeStr } from '../../../../utils/normalizeStr';
import { Loading } from '../../../../components/Loading/Loading';
import { SupplierService } from '../../../../services/supplier/supplierService';
import styles from './SupplierList.module.css';

export function SupplierList({ suppliers, setSuppliers, errors, currentSuppliers: currentSupplierList = null }) {

    const [supplierList, setSupplierList] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    const handleSearch = (e) => {
        const term = e.target.value;
        setSearchTerm(term);

        if (supplierList) {
            if (term.length > 1) {
                setSearchResults(supplierList.filter(s =>
                    normalizeStr(s.name).includes(normalizeStr(term))
                ));
            } else {
                setSearchResults(supplierList.filter(s =>
                    !suppliers.some(sel => sel.supplier_id === s.id)
                ));
            }
        }
    };

    const addSupplier = (supplier) => {
        const isDuplicate = suppliers.some(s => s.supplier_id === supplier.id);

        if (isDuplicate) {
            return removeSupplier(supplier.id);
        }

        // Pre-fill with existing pivot data if already associated
        const existing = currentSupplierList?.find(s => s.id === supplier.id);

        const newSupplierEntry = {
            supplier_id: supplier.id,
            name: supplier.name,
            purchase_price: existing?.pivot?.purchase_price ?? '',
            supplier_product_url: existing?.pivot?.supplier_product_url ?? '',
        };

        setSuppliers([newSupplierEntry]);
        setSearchTerm('');
        setSearchResults(current => current.filter(s => s.id !== supplier.id));
    };

    const removeSupplier = (supplierId) => {
        setSuppliers(current => current.filter(s => s.supplier_id !== supplierId));

        if (supplierList) {
            const unselected = supplierList.filter(s =>
                !suppliers.filter(s_sel => s_sel.supplier_id !== supplierId).some(sel => sel.supplier_id === s.id)
            );

            if (searchTerm.length > 1) {
                setSearchResults(unselected.filter(s => normalizeStr(s.name).includes(normalizeStr(searchTerm))));
            } else {
                setSearchResults(unselected);
            }
        }
    };

    const handleChange = (supplierId, field, value) => {
        setSuppliers(current => current.map(s =>
            s.supplier_id === supplierId ? { ...s, [field]: value } : s
        ));
    };

    const getSupplierError = (index, field) => {
        return errors?.[`suppliers.${index}.${field}`]?.[0] ?? null;
    };

    const getSuppliers = async () => {
        const supplierService = new SupplierService();
        try {
            const response = await supplierService.getAll();
            setSupplierList(response);
            setSearchResults(response.filter(s => !suppliers.some(sel => sel.supplier_id === s.id)));
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        getSuppliers();
    }, []);

    const listToRender = searchTerm.length > 1 ? searchResults : supplierList;

    const isAlreadyAssociated = (supplierId) =>
        currentSupplierList?.some(s => s.id === supplierId) ?? false;

    return (
        <div className={styles.suppliers}>
            <h3 className={styles.h3}>Proveedores y Precios de Compra</h3>
            <input
                type="text"
                className="input"
                placeholder="Buscar y seleccionar proveedor..."
                value={searchTerm}
                onChange={handleSearch}
            />
            {!supplierList ? (
                <Loading />
            ) : (
                <ul className={styles.search_results}>
                    {listToRender && listToRender.length > 0 ? (
                        listToRender
                            .map(supplier => {
                                const associated = isAlreadyAssociated(supplier.id);
                                return (
                                    <li
                                        key={supplier.id}
                                        className={[
                                            suppliers.some(s => s.supplier_id === supplier.id) ? styles.selected : '',
                                            associated ? styles.associated : '',
                                        ].filter(Boolean).join(' ')}
                                        onClick={() => addSupplier(supplier)}
                                        title={associated ? 'Ya asociado â€” hacer click para editar' : undefined}
                                    >
                                        {supplier.name}
                                        {associated && <span className={styles.associated_badge}>Asociado</span>}
                                    </li>
                                );
                            })
                    ) : (
                        <p className={styles.no_results}>
                            {searchTerm.length > 1
                                ? 'No se encontraron proveedores que coincidan.'
                                : 'No hay mÃ¡s proveedores disponibles.'}
                        </p>
                    )}
                </ul>
            )}

            {suppliers.map((supplier, index) => {
                const associated = isAlreadyAssociated(supplier.supplier_id);
                const errorIndex = currentSupplierList
                    ? (currentSupplierList.length - 1)
                    : index;

                return (
                    <div key={supplier.supplier_id} className={styles.supplier_item}>
                        <div className={styles.supplier_header}>
                            <strong>{supplier.name}</strong>
                            {associated && <span className={styles.editing_badge}>Editando</span>}
                            <button
                                type="button"
                                onClick={() => removeSupplier(supplier.supplier_id)}
                                className={`btn btn_error_regular ${styles.btn_remove}`}
                            >
                                Quitar
                            </button>
                        </div>
                        <div className={styles.suppliers_input}>
                            <div className="input_group">
                                <span>Precio de compra</span>
                                <input
                                    type="number"
                                    placeholder="Precio de compra"
                                    value={supplier.purchase_price}
                                    onChange={(e) => handleChange(supplier.supplier_id, 'purchase_price', e.target.value)}
                                    step="0.01"
                                    className="input"
                                />
                                {getSupplierError(errorIndex, 'purchase_price') && (
                                    <p className={styles.error}>{getSupplierError(errorIndex, 'purchase_price')}</p>
                                )}
                            </div>
                            <div className="input_group">
                                <span>URL Producto Proveedor</span>
                                <input
                                    type="text"
                                    placeholder="URL Producto Proveedor (Opcional)"
                                    value={supplier.supplier_product_url}
                                    onChange={(e) => handleChange(supplier.supplier_id, 'supplier_product_url', e.target.value)}
                                    className="input"
                                />
                                {getSupplierError(index, 'supplier_product_url') && (
                                    <p className={styles.error}>{getSupplierError(index, 'supplier_product_url')}</p>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}

            {errors?.suppliers && <p className={styles.error}>{errors.suppliers[0]}</p>}
        </div>
    );
}


