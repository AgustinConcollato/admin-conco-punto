import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MercadoLibreService } from "../services/mercadoLibre/mercadoLibreService";
import { ProductService } from "../services/product/productService";
import { IMAGE_URL } from "../config/api";

export const MLPublishContext = createContext(null);

export const STEPS = [
    { id: "categoria", label: "Categoría" },
    { id: "condicion", label: "Condición" },
    { id: "media", label: "Fotos y stock" },
    { id: "descripcion", label: "Descripción" },
    { id: "precio", label: "Precio" },
    { id: "envio", label: "Envío" },
    { id: "resumen", label: "Resumen" },
];

const initialForm = {
    // Step 1 - categoría
    category_id: "",
    category_name: "",
    attributes: {},

    // Step 2 - condición
    condition: "new",

    // Step 3 - media/stock
    selectedImages: [],
    available_quantity: "",
    sku: "",
    barcode: "",

    // Step 4 - descripción
    title: "",
    description: "",

    // Step 5 - precio
    price: "",
    currency_id: "ARS",
    listing_type_id: "gold_special",
    buying_mode: "buy_it_now",

    // Step 6 - envío
    shipping_mode: "",
    logistic_type: "drop_off",
    free_shipping: false,
    billable_weight: "",
    dim_height: "",   // cm
    dim_width: "",    // cm
    dim_length: "",   // cm
};

export function MLPublishProvider({ children }) {
    const mlService = useMemo(() => new MercadoLibreService(), []);
    const productService = useMemo(() => new ProductService(), []);
    const { productId } = useParams();
    const navigate = useNavigate();

    const [product, setProduct] = useState(null);
    const [productLoading, setProductLoading] = useState(true);
    const [form, setForm] = useState(initialForm);
    const [listingTypes, setListingTypes] = useState([]);
    const [shippingPrefs, setShippingPrefs] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);

    // Cargar producto
    useEffect(() => {
        const load = async () => {
            setProductLoading(true);
            try {
                const data = await productService.getById(productId);
                setProduct(data);
                // Pre-llenar con datos del producto
                setForm(f => ({
                    ...f,
                    title: data.name ?? "",
                    available_quantity: data.stock ?? "",
                    sku: data.sku ?? "",
                    barcode: data.barcodes?.[0].barcode ?? "",
                    selectedImages: data.images?.map(img => img.path) ?? [],
                    price: data.price_lists?.find(e => e.id === 2)?.pivot?.price ?? "",
                }));
            } catch {
                navigate("/mercado-libre/cuenta");
            } finally {
                setProductLoading(false);
            }
        };
        if (productId) load();
    }, [productId]);

    // Cargar listing types y shipping prefs
    useEffect(() => {
        const loadMeta = async () => {
            try {
                const [types, prefs] = await Promise.all([
                    mlService.getListingTypesTypes(),
                    mlService.getUserShippingPreferences(),
                ]);
                setListingTypes(types);
                setShippingPrefs(prefs);
            } catch { /* no-op */ }
        };
        loadMeta();
    }, []);

    const updateForm = (patch) => setForm(f => ({ ...f, ...patch }));

    const goToStep = (stepId) => navigate(`/mercado-libre/publicar/${productId}/${stepId}`);

    const goNext = (currentStepId) => {
        const idx = STEPS.findIndex(s => s.id === currentStepId);
        if (idx < STEPS.length - 1) goToStep(STEPS[idx + 1].id);
    };

    const goBack = (currentStepId) => {
        const idx = STEPS.findIndex(s => s.id === currentStepId);
        if (idx === 0) navigate("/mercado-libre/cuenta");
        else goToStep(STEPS[idx - 1].id);
    };

    const handleSubmit = async () => {
        setSubmitError(null);
        setSubmitting(true);
        try {
            const pictures = form.selectedImages.map(path => ({
                source: `${IMAGE_URL}/${path}`,
            }));

            const attributes = Object.entries(form.attributes)
                .filter(([, v]) => v !== "" && v !== null && v !== undefined && v !== "[]")
                .flatMap(([id, value]) => {
                    // Multivalued: almacenado como JSON array de strings
                    try {
                        const arr = JSON.parse(value);
                        if (Array.isArray(arr)) {
                            return arr.map(v => ({ id, value_name: String(v) }));
                        }
                    } catch { /* no es JSON, seguir */ }
                    // number_unit: almacenado como "123 mL" → value_name directo
                    return [{ id, value_name: String(value) }];
                });

            if (form.barcode) {
                attributes.unshift({ id: "EAN", value_name: form.barcode });
                attributes.unshift({ id: "GTIN", value_name: form.barcode });
            }

            if (form.sku) {
                attributes.unshift({ id: "SELLER_SKU", value_name: form.sku });
            }

            const payload = {
                title: form.title,
                category_id: form.category_id,
                price: parseFloat(form.price),
                currency_id: form.currency_id,
                available_quantity: parseInt(form.available_quantity),
                buying_mode: form.buying_mode,
                listing_type_id: form.listing_type_id,
                condition: form.condition,
                shipping: {
                    mode: form.shipping_mode,
                    free_shipping: form.free_shipping,
                },
                attributes,
                ...(pictures.length > 0 && { pictures }),
                ...(form.description && { description: { plain_text: form.description } }),
            };

            await mlService.publish(payload);
            navigate("/mercado-libre/publicaciones?success=1");
        } catch (err) {
            setSubmitError(err?.message ?? "Error al publicar en Mercado Libre.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <MLPublishContext.Provider value={{
            product, productLoading,
            form, updateForm,
            listingTypes, shippingPrefs,
            submitting, submitError,
            goNext, goBack, goToStep,
            mlService, handleSubmit
        }}>
            {children}
        </MLPublishContext.Provider>
    );
}