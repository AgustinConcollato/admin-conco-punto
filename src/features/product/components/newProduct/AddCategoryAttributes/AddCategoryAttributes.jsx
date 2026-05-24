import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Loading } from "../../../../../components/Loading/Loading";
import { CategoryAttributeService } from "../../../../../services/category/categoryAttributeService";
import { ProductService } from "../../../../../services/product/productService";
import { CategoryList } from "../CategoryList/CategoryList";
import { ProductSummary } from "../ProductSummary/ProductSummary";
import styles from "./AddCategoryAttributes.module.css";

export function AddCategoryAttributes() {
    const productService = useMemo(() => new ProductService(), []);
    const categoryAttrService = useMemo(() => new CategoryAttributeService(), []);

    const { id } = useParams();
    const navigate = useNavigate();

    const [product, setProduct] = useState(() => {
        const s = sessionStorage.getItem('product');
        return s ? JSON.parse(s) : null;
    });

    const [categories, setCategories] = useState([]);
    const [categoryAttributes, setCategoryAttributes] = useState([]);
    const [attributeValues, setAttributeValues] = useState({});
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const handleDeepestCategoryChange = async (category) => {
        if (!category) {
            setCategoryAttributes([]);
            setAttributeValues({});
            return;
        }
        try {
            const attrs = await categoryAttrService.getAll(category.id);
            setCategoryAttributes(attrs);
            setAttributeValues(prev => {
                const next = {};
                attrs.forEach(attr => {
                    next[attr.id] = prev[attr.id] ?? (attr.type === 'boolean' ? 'false' : '');
                });
                return next;
            });
        } catch {
            setCategoryAttributes([]);
        }
    };

    const setAttrValue = (attrId, value) => {
        setAttributeValues(prev => ({ ...prev, [attrId]: value }));
    };

    const getProductDetail = async () => {
        try {
            const data = await productService.getById(id);
            setProduct(data);
            sessionStorage.setItem('product', JSON.stringify(data));
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (!id && !product) {
            navigate('/productos/nuevo/1');
        }
        if (!product && id) {
            getProductDetail();
        }
    }, []);

    useEffect(() => {
        if (product && product?.categories?.length > 0) {
            navigate(`/productos/nuevo/3/${product.id}`);
        }
    }, [product])

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!product) return;

        if (!categories.length) {
            setErrors({ categories: ['Seleccioná al menos una categoría.'] });
            return;
        }

        setLoading(true);
        setErrors({});

        try {
            const syncResult = await productService.syncCategories({ categories }, product.id);

            let updatedProduct = { ...product, sku: syncResult.sku, categories: syncResult.categories };
            setProduct(updatedProduct);
            sessionStorage.setItem('product', JSON.stringify(updatedProduct));

            const avEntries = Object.entries(attributeValues).filter(([, v]) => v !== '');
            if (avEntries.length > 0) {
                const payload = avEntries.map(([attrId, value]) => ({
                    category_attribute_id: parseInt(attrId),
                    value,
                }));
                const p = await productService.updateAttributeValues(product.id, payload);
                updatedProduct = { ...updatedProduct, categories: p.categories };
                sessionStorage.setItem('product', JSON.stringify(updatedProduct));
            }

            navigate(`/productos/nuevo/3/${product.id}`);
        } catch (error) {
            setErrors(error[0] ?? {});
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            <h1 className="title">Categoría y Propiedades</h1>

            {product ? (
                <>
                    <ProductSummary product={product} />

                    <CategoryList
                        setCategories={setCategories}
                        selectedIds={product.categories?.map(c => c.id) ?? []}
                        onDeepestCategoryChange={handleDeepestCategoryChange}
                    />
                    {errors.categories && <p className={styles.error}>{errors.categories[0]}</p>}

                    {categoryAttributes.length > 0 && (
                        <div className={styles.attributes_section}>
                            <p className={styles.attributes_label}>Propiedades del producto</p>
                            {categoryAttributes.map(attr => {
                                const val = attributeValues[attr.id] ?? '';
                                return (
                                    <div key={attr.id} className="input_group">
                                        <span>
                                            {attr.name}
                                            {attr.required && <span className={styles.required_mark}> *</span>}
                                        </span>
                                        {attr.type === 'select' ? (
                                            <select className="input" value={val} onChange={e => setAttrValue(attr.id, e.target.value)}>
                                                <option value="">— Seleccionar —</option>
                                                {attr.options?.map(opt => (
                                                    <option key={opt.id} value={opt.value}>{opt.value}</option>
                                                ))}
                                            </select>
                                        ) : attr.type === 'boolean' ? (
                                            <label className={styles.bool_toggle}>
                                                <input
                                                    type="checkbox"
                                                    checked={val === 'true'}
                                                    onChange={e => setAttrValue(attr.id, e.target.checked ? 'true' : 'false')}
                                                />
                                                {val === 'true' ? 'Sí' : 'No'}
                                            </label>
                                        ) : (
                                            <input
                                                className="input"
                                                type={attr.type === 'number' ? 'number' : 'text'}
                                                value={val}
                                                onChange={e => setAttrValue(attr.id, e.target.value)}
                                                placeholder={attr.name}
                                            />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    <button type="submit" className="btn btn_solid" disabled={loading}>
                        {loading ? <FontAwesomeIcon icon={faCircleNotch} spin /> : 'Siguiente'}
                    </button>
                </>
            ) : (
                <Loading />
            )}
            {/* 
            {product && (
                <Link to={`/productos/nuevo/3/${product.id}`} className="btn btn_regular">
                    Omitir este paso
                </Link>
            )} */}
        </form>
    );
}
