import {
    faArrowLeft, faCircleNotch, faExternalLinkAlt,
    faPause, faPlay, faTimes, faEdit, faCheck, faXmark,
    faInfoCircle, faTriangleExclamation,
    faDollarSign, faEye, faShoppingCart, faCalendarAlt,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ConfirmModal } from "../../components/ConfirmModal/ConfirmModal";
import { MercadoLibreService } from "../../services/mercadoLibre/mercadoLibreService";
import { PublicationImages } from "../../features/mercadoLibre/components/PublicationImages/PublicationImages";
import { PublicationPerformance } from "../../features/mercadoLibre/components/PublicationPerformance/PublicationPerformance";
import { PublicationAttributes } from "../../features/mercadoLibre/components/PublicationAttributes/PublicationAttributes";
import { PublicationVariations } from "../../features/mercadoLibre/components/PublicationVariations/PublicationVariations";
import { PriceBreakdown } from "../../features/mercadoLibre/components/PriceBreakdown/PriceBreakdown";
import { formatDate } from "../../utils/formatDate";
import styles from "./MLPublicationDetailPage.module.css";

const STATUS_BADGE = {
    active: { label: "Activa", cls: styles.badge_active },
    paused: { label: "Pausada", cls: styles.badge_paused },
    closed: { label: "Cerrada", cls: styles.badge_closed },
    under_review: { label: "En revisión", cls: styles.badge_review },
    inactive: { label: "Inactiva", cls: styles.badge_closed },
};

const LISTING_TYPE_LABEL = {
    gold_pro: "Premium",
    gold_special: "Clásica",
    free: "Gratuita",
};

const CAMPAIGN_TAGS = ['3x_campaign', '9x_campaign', '12x_campaign', 'pcj-co-funded'];

const ALL_CUOTAS_OPTIONS = [
    { value: 'none', listing: 'gold_special', tag: null, label: 'Sin cuotas sin interés (solo bancos)' },
    { value: 'pcj-co-funded', listing: 'gold_special', tag: 'pcj-co-funded', label: '3-12 cuotas con interés bajo' },
    { value: '3x', listing: 'gold_pro', tag: '3x_campaign', label: '3 cuotas sin interés' },
    { value: '6x', listing: 'gold_pro', tag: null, label: '6 cuotas sin interés (recomendado)' },
    { value: '9x', listing: 'gold_pro', tag: '9x_campaign', label: '9 cuotas sin interés' },
    { value: '12x', listing: 'gold_pro', tag: '12x_campaign', label: '12 cuotas sin interés' },
];

function getCurrentCuotasValue(pub) {
    if (pub.listing_type_id === 'gold_special') {
        return pub.tags?.includes('pcj-co-funded') ? 'pcj-co-funded' : 'none';
    }
    if (pub.listing_type_id === 'gold_pro') {
        if (pub.tags?.includes('3x_campaign')) return '3x';
        if (pub.tags?.includes('9x_campaign')) return '9x';
        if (pub.tags?.includes('12x_campaign')) return '12x';
        return '6x';
    }
    return 'none';
}

// Parsea peso (gramos) desde dimensions ML formato "AxBxC,W"
function parseBillableWeight(dimensions) {
    if (!dimensions || typeof dimensions !== 'string') return null;
    const w = parseInt(dimensions.split(',')[1], 10);
    return Number.isFinite(w) && w > 0 ? w : null;
}

// ─── Fee Breakdown ────────────────────────────────────────────────────────────
function FeeBreakdown({ price, cuotasValue, categoryId, billableWeight }) {
    const mlService = useMemo(() => new MercadoLibreService(), []);
    const [apiData, setApiData] = useState(null);
    const [loading, setLoading] = useState(false);

    const cuotaOption = ALL_CUOTAS_OPTIONS.find(o => o.value === cuotasValue);
    const listingTypeId = cuotaOption?.listing ?? 'gold_special';
    const tag = cuotaOption?.tag ?? null;

    useEffect(() => {
        if (!price || price <= 0 || !categoryId) return;
        setLoading(true);
        const timer = setTimeout(async () => {
            try {
                const params = new URLSearchParams({
                    price: String(price),
                    listing_type_id: listingTypeId,
                    category_id: categoryId,
                    ...(tag && { tags: tag }),
                    ...(billableWeight && { billable_weight: String(billableWeight) }),
                });
                const data = await mlService.getListingTypesFees(params.toString());
                setApiData(data);
            } catch {
                setApiData(null);
            } finally {
                setLoading(false);
            }
        }, 450);
        return () => clearTimeout(timer);
    }, [price, cuotasValue, categoryId, billableWeight]);

    const numPrice = parseFloat(price) || 0;

    const fees = apiData ? {
        price: numPrice,
        commissionAmount: apiData.sale_fee_amount,
        meliPercentageFee: apiData.meli_percentage_fee,
        fixedFee: apiData.fixed_fee,
        financingFee: apiData.financing_add_on_fee,
        listingFeeAmount: apiData.listing_fee_amount,
        listingTypeName: apiData.listing_type_name,
        shippingCost: 0,
        freeShipping: false,
        netAmount: numPrice - apiData.sale_fee_amount - apiData.listing_fee_amount,
    } : null;

    return (
        <div className={styles.fee_wrap}>
            <PriceBreakdown fees={fees} loading={loading} source="api" />
        </div>
    );
}

// ─── Editable field ───────────────────────────────────────────────────────────
function EditableField({ label, value, type = "text", onSave, saving, prefix, onDraftChange }) {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(value);

    useEffect(() => {
        if (!editing) setDraft(value);
    }, [value, editing]);

    const endEdit = () => { setEditing(false); onDraftChange?.(null); };

    const handleSave = async () => {
        if (String(draft) === String(value)) { endEdit(); return; }
        await onSave(draft);
        endEdit();
    };

    const handleKey = e => {
        if (e.key === "Enter") handleSave();
        if (e.key === "Escape") { setDraft(value); endEdit(); }
    };

    const handleChange = val => { setDraft(val); onDraftChange?.(val); };

    return (
        <div className={styles.ef_wrap}>
            <span className={styles.ef_label}>{label}</span>
            {editing ? (
                <div className={styles.ef_row}>
                    {prefix && <span className={styles.ef_prefix}>{prefix}</span>}
                    <input
                        className={`${styles.ef_input}${prefix ? ` ${styles.ef_input_prefixed}` : ''}`}
                        type={type}
                        value={draft}
                        onChange={e => handleChange(e.target.value)}
                        onKeyDown={handleKey}
                        autoFocus
                    />
                    <button className={styles.ef_btn_ok} onClick={handleSave} disabled={saving}>
                        {saving ? <FontAwesomeIcon icon={faCircleNotch} spin /> : <FontAwesomeIcon icon={faCheck} />}
                    </button>
                    <button className={styles.ef_btn_cancel} onClick={() => { setDraft(value); endEdit(); }}>
                        <FontAwesomeIcon icon={faXmark} />
                    </button>
                </div>
            ) : (
                <div className={styles.ef_row}>
                    <span className={styles.ef_value}>
                        {prefix && <span className={styles.ef_prefix_static}>{prefix} </span>}
                        {value ?? <em className={styles.ef_empty}>—</em>}
                    </span>
                    <button className={styles.ef_edit} onClick={() => { setDraft(value); setEditing(true); }}>
                        <FontAwesomeIcon icon={faEdit} />
                    </button>
                </div>
            )}
        </div>
    );
}

// ─── Editable select ──────────────────────────────────────────────────────────
function EditableSelect({ label, value, options, onSave, saving, disabled, onDraftChange }) {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(value);

    useEffect(() => {
        if (!editing) setDraft(value);
    }, [value, editing]);

    const endEdit = () => { setEditing(false); onDraftChange?.(null); };

    const handleSave = async () => {
        if (draft === value) { endEdit(); return; }
        await onSave(draft);
        endEdit();
    };

    const handleChange = val => { setDraft(val); onDraftChange?.(val); };

    const currentLabel = options.find(o => o.value === value)?.label ?? value;

    return (
        <div className={styles.ef_wrap}>
            <span className={styles.ef_label}>{label}</span>
            {editing ? (
                <div className={styles.ef_row}>
                    <select className={styles.ef_input} value={draft} onChange={e => handleChange(e.target.value)} autoFocus>
                        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    <button className={styles.ef_btn_ok} onClick={handleSave} disabled={saving}>
                        {saving ? <FontAwesomeIcon icon={faCircleNotch} spin /> : <FontAwesomeIcon icon={faCheck} />}
                    </button>
                    <button className={styles.ef_btn_cancel} onClick={() => { setDraft(value); endEdit(); }}>
                        <FontAwesomeIcon icon={faXmark} />
                    </button>
                </div>
            ) : (
                <div className={styles.ef_row}>
                    <span className={styles.ef_value}>{currentLabel}</span>
                    {!disabled && (
                        <button className={styles.ef_edit} onClick={() => { setDraft(value); setEditing(true); }}>
                            <FontAwesomeIcon icon={faEdit} />
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

// ─── Alertas ML ───────────────────────────────────────────────────────────────
function CausesSection({ causes }) {
    if (!causes?.length) return null;
    return (
        <div className={styles.causes}>
            <p className={styles.causes_title}>
                <FontAwesomeIcon icon={faTriangleExclamation} /> Alertas de Mercado Libre
            </p>
            {causes.map((c, i) => (
                <div key={i} className={`${styles.cause} ${c.type === "error" ? styles.cause_error : styles.cause_warn}`}>
                    {c.message}
                </div>
            ))}
        </div>
    );
}

// ─── Página principal ─────────────────────────────────────────────────────────
export function MLPublicationDetailPage() {
    const mlService = useMemo(() => new MercadoLibreService(), []);
    const { mlItemId } = useParams();
    const navigate = useNavigate();

    const [pub, setPub] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [saving, setSaving] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [saveError, setSaveError] = useState(null);
    const [reload, setReload] = useState(false);
    const [pendingClose, setPendingClose] = useState(false);
    const [previewPrice, setPreviewPrice] = useState(null);
    const [previewCuotas, setPreviewCuotas] = useState(null);

    const load = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await mlService.getPublication(mlItemId);
            setPub(data);
        } catch (e) {
            setError(e.message ?? "No se pudo cargar la publicación.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, [mlItemId, reload]);

    const save = async (field, value) => {
        setSaving(field);
        setSaveError(null);
        try {
            const updated = await mlService.updatePublication(mlItemId, { [field]: value });
            setPub(prev => ({ ...prev, ...updated.ml_item }));
        } catch (e) {
            setSaveError(e.message ?? "Error al guardar.");
        } finally {
            setSaving(null);
        }
    };

    const saveCuotas = async (newValue) => {
        const option = ALL_CUOTAS_OPTIONS.find(o => o.value === newValue);
        if (!option) return;
        setSaving("cuotas");
        setSaveError(null);
        try {
            if (option.listing !== pub.listing_type_id) {
                const typeUpdated = await mlService.changeListingType(mlItemId, option.listing);
                if (typeUpdated?.ml_item) setPub(prev => ({ ...prev, ...typeUpdated.ml_item }));
            }
            const otherTags = (pub.tags ?? []).filter(t => !CAMPAIGN_TAGS.includes(t));
            const newTags = option.tag ? [...otherTags, option.tag] : otherTags;
            const updated = await mlService.updatePublication(mlItemId, { tags: newTags });
            setPub(prev => ({ ...prev, ...updated.ml_item }));
        } catch (e) {
            setSaveError(e.message ?? "Error al guardar cuotas.");
        } finally {
            setSaving(null);
        }
    };

    const onReload = () => setTimeout(() => setReload(r => !r), 300);

    const ACTIONS = {
        pause:      () => mlService.pausePublication(mlItemId),
        reactivate: () => mlService.reactivatePublication(mlItemId),
        close:      () => mlService.closePublication(mlItemId),
    };

    const handleAction = async (action) => {
        if (action === "close") { setPendingClose(true); return; }
        await executeAction(action);
    };

    const executeAction = async (action) => {
        setActionLoading(true);
        setSaveError(null);
        try {
            await ACTIONS[action]?.();
            await load();
        } catch (e) {
            setSaveError(e.message ?? "Error al ejecutar la acción.");
        } finally {
            setActionLoading(false);
            setPendingClose(false);
        }
    };

    if (loading) return (
        <div className={styles.center}>
            <FontAwesomeIcon icon={faCircleNotch} spin className={styles.spinner} />
        </div>
    );

    if (error) return (
        <div className={styles.center}>
            <p className={styles.error_msg}>{error}</p>
            <button className={styles.btn_back} onClick={() => navigate(-1)}>Volver</button>
        </div>
    );

    const badge = STATUS_BADGE[pub.status] ?? { label: pub.status, cls: styles.badge_closed };
    const listingLabel = LISTING_TYPE_LABEL[pub.listing_type_id] ?? pub.listing_type_id;
    const isClosed = pub.status === "closed";
    const isActive = pub.status === "active";
    const isPaused = pub.status === "paused";
    const activeCuotas = previewCuotas ?? getCurrentCuotasValue(pub);
    const activePrice = previewPrice ?? pub.price;

    return (
        <div className={styles.page}>

            {/* ── Header ── */}
            <div className={styles.header}>
                <button className={styles.btn_back} onClick={() => window.history.back() || navigate('/mercado-libre/publicaciones')}>
                    <FontAwesomeIcon icon={faArrowLeft} />
                </button>
                <h1 className={styles.header_title} title={pub.title}>{pub.title}</h1>
                <div className={styles.header_actions}>
                    <span className={`${styles.badge} ${badge.cls}`}>{badge.label}</span>
                    {pub.permalink && (
                        <a href={pub.permalink} target="_blank" rel="noreferrer" className={styles.btn_ml}>
                            <FontAwesomeIcon icon={faExternalLinkAlt} /> Ver en ML
                        </a>
                    )}
                    {isActive && (
                        <button className={styles.btn_warning} onClick={() => handleAction("pause")} disabled={actionLoading}>
                            {actionLoading ? <FontAwesomeIcon icon={faCircleNotch} spin /> : <><FontAwesomeIcon icon={faPause} /> Pausar</>}
                        </button>
                    )}
                    {isPaused && (
                        <button className={styles.btn_success} onClick={() => handleAction("reactivate")} disabled={actionLoading}>
                            {actionLoading ? <FontAwesomeIcon icon={faCircleNotch} spin /> : <><FontAwesomeIcon icon={faPlay} /> Reactivar</>}
                        </button>
                    )}
                    {!isClosed && (
                        <button className={styles.btn_danger} onClick={() => handleAction("close")} disabled={actionLoading}>
                            <FontAwesomeIcon icon={faTimes} /> Cerrar
                        </button>
                    )}
                </div>
            </div>

            {saveError && (
                <div className={styles.save_error}>
                    <FontAwesomeIcon icon={faInfoCircle} /> {saveError}
                </div>
            )}
            <CausesSection causes={pub.warnings ?? pub.causes} />

            <div className={styles.grid}>

                {/* ── Columna izquierda ── */}
                <div className={styles.col_left}>
                    <PublicationImages
                        pictures={pub.pictures}
                        mlItemId={pub.id}
                        mlService={mlService}
                        onUpdate={pics => { setPub(prev => ({ ...prev, pictures: pics })); onReload(); }}
                    />

                    <div className={styles.card}>
                        <div className={styles.stat_row}>
                            <span className={styles.stat_lbl}><FontAwesomeIcon icon={faEye} /> Visitas</span>
                            <span className={styles.stat_val}>{(pub.views ?? pub.visits ?? 0).toLocaleString('es-AR')}</span>
                        </div>
                        <div className={styles.stat_row}>
                            <span className={styles.stat_lbl}><FontAwesomeIcon icon={faShoppingCart} /> Vendidos</span>
                            <span className={styles.stat_val}>{(pub.sold_quantity ?? 0).toLocaleString('es-AR')}</span>
                        </div>
                        <div className={styles.stat_row}>
                            <span className={styles.stat_lbl}>Tipo</span>
                            <span className={`${styles.listing_badge} ${pub.listing_type_id === 'gold_pro' ? styles.listing_pro : styles.listing_classic}`}>
                                {listingLabel}
                            </span>
                        </div>
                        <div className={styles.stat_row}>
                            <span className={styles.stat_lbl}>Condición</span>
                            <span className={styles.stat_val}>{pub.condition === "new" ? "Nuevo" : "Usado"}</span>
                        </div>
                        {pub.shipping?.mode && (
                            <div className={styles.stat_row}>
                                <span className={styles.stat_lbl}>Envío</span>
                                <span className={styles.stat_val}>
                                    {pub.shipping.mode === "me2" ? "Mercado Envíos" : pub.shipping.mode}
                                    {pub.shipping.free_shipping && " · Gratis"}
                                </span>
                            </div>
                        )}
                        <div className={styles.stat_row}>
                            <span className={styles.stat_lbl}>Categoría</span>
                            <code className={styles.stat_code}>{pub.category_id}</code>
                        </div>
                        {pub.date_created && (
                            <div className={styles.stat_row}>
                                <span className={styles.stat_lbl}><FontAwesomeIcon icon={faCalendarAlt} /> Creada</span>
                                <span className={styles.stat_val}>{formatDate(pub.date_created, 'short')}</span>
                            </div>
                        )}
                        <div className={styles.stat_row}>
                            <span className={styles.stat_lbl}>ID ML</span>
                            <code className={styles.stat_code}>{pub.id}</code>
                        </div>
                    </div>
                </div>

                {/* ── Columna derecha ── */}
                <div className={styles.col_right}>

                    {/* Precio y comisiones */}
                    <div className={styles.card}>
                        <p className={styles.card_title}>
                            <FontAwesomeIcon icon={faDollarSign} /> Precio y comisiones
                        </p>
                        <EditableField
                            label="Precio de venta"
                            value={pub.price}
                            type="number"
                            prefix="$"
                            onSave={v => save("price", parseFloat(v))}
                            saving={saving === "price"}
                            onDraftChange={v => setPreviewPrice(v ? parseFloat(v) : null)}
                        />
                        <FeeBreakdown
                            price={activePrice}
                            cuotasValue={activeCuotas}
                            categoryId={pub.category_id}
                            billableWeight={parseBillableWeight(pub.shipping?.dimensions)}
                        />
                    </div>

                    {/* Datos editables */}
                    <div className={styles.card}>
                        <p className={styles.card_title}>
                            <FontAwesomeIcon icon={faEdit} /> Información de la publicación
                        </p>
                        <EditableField
                            label="Título"
                            value={pub.title}
                            onSave={v => save("title", v)}
                            saving={saving === "title"}
                        />
                        <EditableField
                            label="Stock disponible"
                            value={pub.available_quantity}
                            type="number"
                            onSave={v => save("available_quantity", parseInt(v))}
                            saving={saving === "available_quantity"}
                        />
                        <EditableSelect
                            label="Cuotas sin interés"
                            value={getCurrentCuotasValue(pub)}
                            options={ALL_CUOTAS_OPTIONS}
                            onSave={saveCuotas}
                            saving={saving === "cuotas"}
                            disabled={isClosed}
                            onDraftChange={v => setPreviewCuotas(v)}
                        />
                    </div>

                    {/* Calidad */}
                    <PublicationPerformance mlItemId={pub.id} mlService={mlService} reload={reload} />

                    {/* Variantes */}
                    <PublicationVariations
                        pub={pub}
                        mlService={mlService}
                        onUpdate={updated => {
                            const item = updated?.ml_item ?? updated;
                            if (item && item.id) setPub(prev => ({ ...prev, ...item }));
                            else onReload();
                        }}
                    />

                    {/* Atributos */}
                    <PublicationAttributes
                        pub={pub}
                        mlService={mlService}
                        onUpdate={updated => {
                            const item = updated?.ml_item ?? updated;
                            if (item && item.id) setPub(prev => ({ ...prev, ...item }));
                            else onReload();
                        }}
                    />
                </div>
            </div>

            {pendingClose && (
                <ConfirmModal
                    message="¿Cerrar esta publicación? Esta acción no se puede revertir."
                    onConfirm={() => executeAction("close")}
                    onCancel={() => setPendingClose(false)}
                />
            )}
        </div>
    );
}
