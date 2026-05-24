import { faImage, faEdit, faPlus, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { ConfirmModal } from "../../../../../components/ConfirmModal/ConfirmModal";
import { Modal } from "../../../../../components/Modal/Modal";
import { ProductVariantService } from "../../../../../services/product/productVariantService";
import { VariantForm } from "../VariantForm/VariantForm";
import { VariantImages } from "../VariantImages/VariantImages";
import styles from "./Variants.module.css";

export function Variants({ productId, productSku }) {
    const service = useMemo(() => new ProductVariantService(), []);

    const [variants, setVariants] = useState([]);
    const [categoryAttributes, setCategoryAttributes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingVariant, setEditingVariant] = useState(null);
    const [imagesVariant, setImagesVariant] = useState(null);
    const [pendingDeleteId, setPendingDeleteId] = useState(null);

    useEffect(() => {
        load();
    }, [productId]);

    const load = async () => {
        setIsLoading(true);
        try {
            const data = await service.getAll(productId);
            setVariants(data.variants ?? []);
            setCategoryAttributes(data.category_attributes ?? []);
        } catch {
            toast.error("Error al cargar variantes.");
        } finally {
            setIsLoading(false);
        }
    };

    const openCreate = () => { setEditingVariant(null); setShowForm(true); };
    const openEdit = (variant) => { setEditingVariant(variant); setShowForm(true); };
    const closeForm = () => { setShowForm(false); setEditingVariant(null); };

    const handleSaved = (saved, isEdit) => {
        setVariants(prev => isEdit
            ? prev.map(v => v.id === saved.id ? saved : v)
            : [...prev, saved]
        );
        closeForm();
    };

    const handleImagesUpdated = (variantId, newImages) => {
        setVariants(prev => prev.map(v => v.id === variantId ? { ...v, images: newImages } : v));
        setImagesVariant(prev => prev ? { ...prev, images: newImages } : prev);
    };

    const confirmDelete = async () => {
        try {
            await service.delete(productId, pendingDeleteId);
            setVariants(prev => prev.filter(v => v.id !== pendingDeleteId));
            toast.success("Variante eliminada");
        } catch {
            toast.error("Error al eliminar la variante.");
        } finally {
            setPendingDeleteId(null);
        }
    };

    const getAttrValue = (variant, attrId, attrType) => {
        const val = variant.attribute_values?.find(av => av.category_attribute_id === attrId)?.value;
        if (!val) return null;
        if (attrType === 'boolean') return val === 'true' ? 'Sí' : 'No';
        return val;
    };

    return (
        <>
            <div className={styles.variants_section}>
                <div className={styles.header}>
                    <h3>Variantes</h3>
                    <button className="btn btn_regular" onClick={openCreate}>
                        <FontAwesomeIcon icon={faPlus} /> Agregar
                    </button>
                </div>

                {isLoading ? (
                    <p className={styles.state_text}>Cargando…</p>
                ) : variants.length === 0 && categoryAttributes.length === 0 ? (
                    <p className={styles.state_text}>
                        Esta categoría no tiene atributos. Definí atributos en la categoría primero.
                    </p>
                ) : variants.length === 0 ? (
                    <p className={styles.state_text}>Sin variantes. Hacé click en "Agregar" para crear la primera.</p>
                ) : (
                    <div className={styles.cards_grid}>
                        {variants.map(variant => (
                            <div key={variant.id} className={`${styles.variant_card} ${!variant.is_active ? styles.inactive : ''}`}>

                                {/* Thumbnail si tiene imágenes */}
                                {variant.images?.length > 0 && (
                                    <div className={styles.card_thumb} onClick={() => setImagesVariant(variant)}>
                                        <img
                                            src={`${import.meta.env.VITE_IMAGE_URL}/${variant.images[0].thumbnail_path}`}
                                            alt=""
                                        />
                                    </div>
                                )}

                                <div className={styles.card_body}>
                                    {/* Attribute pills */}
                                    {categoryAttributes.length > 0 && (
                                        <div className={styles.attr_pills}>
                                            {categoryAttributes.map(attr => {
                                                const val = getAttrValue(variant, attr.id, attr.type);
                                                return val ? (
                                                    <span key={attr.id} className={styles.attr_pill}>
                                                        <span className={styles.pill_label}>{attr.name}</span>
                                                        {val}
                                                    </span>
                                                ) : null;
                                            })}
                                        </div>
                                    )}

                                    <div className={styles.card_meta}>
                                        <span className={styles.stock_badge}>
                                            {variant.stock} uds.
                                        </span>
                                        {variant.sku && (
                                            <span className={styles.sku}>{variant.sku}</span>
                                        )}
                                        {!variant.is_active && (
                                            <span className={styles.inactive_badge}>Inactiva</span>
                                        )}
                                    </div>
                                    {variant.barcodes?.length > 0 && (
                                        <div className={styles.barcodes_list}>
                                            {variant.barcodes.map(bc => (
                                                <span key={bc.id} className={styles.barcode_chip}>{bc.barcode}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className={styles.card_actions}>
                                    <button
                                        className={styles.btn_action}
                                        onClick={() => setImagesVariant(variant)}
                                        title="Fotos"
                                    >
                                        <FontAwesomeIcon icon={faImage} />
                                        {variant.images?.length > 0 && (
                                            <span className={styles.img_count}>{variant.images.length}</span>
                                        )}
                                    </button>
                                    <button className={styles.btn_action} onClick={() => openEdit(variant)} title="Editar">
                                        <FontAwesomeIcon icon={faEdit} />
                                    </button>
                                    {/* <button className={`${styles.btn_action} ${styles.btn_delete}`} onClick={() => setPendingDeleteId(variant.id)} title="Eliminar">
                                        <FontAwesomeIcon icon={faTrashAlt} />
                                    </button> */}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {imagesVariant && (
                <Modal
                    onClose={() => setImagesVariant(null)}
                    title={`Fotos${imagesVariant.sku ? ` — ${imagesVariant.sku}` : ''}`}
                >
                    <VariantImages
                        productId={productId}
                        variant={imagesVariant}
                        onImagesUpdated={handleImagesUpdated}
                    />
                </Modal>
            )}

            {showForm && (
                <Modal onClose={closeForm} title={editingVariant ? 'Editar variante' : 'Nueva variante'}>
                    <VariantForm
                        productId={productId}
                        productSku={productSku}
                        categoryAttributes={categoryAttributes}
                        editingVariant={editingVariant}
                        onSaved={handleSaved}
                        onCancel={closeForm}
                    />
                </Modal>
            )}

            {pendingDeleteId && (
                <ConfirmModal
                    message="¿Eliminar esta variante? Se perderán sus datos y barcodes asociados."
                    onConfirm={confirmDelete}
                    onCancel={() => setPendingDeleteId(null)}
                />
            )}
        </>
    );
}
