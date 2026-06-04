import { faCheck, faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Outlet, useParams } from "react-router-dom";
import { IMAGE_URL } from "../../../config/api";
import { MLPublishProvider, STEPS } from "../../../context/MLPublishContext";
import { useMLPublish } from "../../../features/mercadoLibre/hooks/useMLPublish";
import styles from "./MLPublishLayout.module.css";

function StepBar() {
    const { step } = useParams();
    const currentIdx = STEPS.findIndex(s => s.id === step);

    return (
        <nav className={styles.stepbar}>
            {STEPS.map((s, i) => {
                const done = i < currentIdx;
                const active = i === currentIdx;
                return (
                    <div key={s.id} className={styles.step_item}>
                        <div className={`${styles.step_dot} ${done ? styles.done : ""} ${active ? styles.active : ""}`}>
                            {done ? <FontAwesomeIcon icon={faCheck} /> : <span>{i + 1}</span>}
                        </div>
                        <span className={`${styles.step_label} ${active ? styles.label_active : ""}`}>{s.label}</span>
                        {i < STEPS.length - 1 && (
                            <div className={`${styles.step_line} ${done ? styles.line_done : ""}`} />
                        )}
                    </div>
                );
            })}
        </nav>
    );
}

function ProductRef() {
    const { product } = useMLPublish();
    if (!product) return null;
    return (
        <div className={styles.product_ref}>
            {product.images?.[0]?.thumbnail_path && (
                <img
                    src={`${IMAGE_URL}/${product.images[0].thumbnail_path}`}
                    alt={product.name}
                    className={styles.product_img}
                />
            )}
            <div>
                <span className={styles.product_label}>Publicando en Mercado Libre</span>
                <p className={styles.product_name}>{product.name}</p>
                <p className={styles.product_sku}>SKU: {product.sku}</p>
            </div>
        </div>
    );
}

function LayoutInner() {
    const { product, productLoading } = useMLPublish();

    if (productLoading) {
        return (
            <div className={styles.loading}>
                <FontAwesomeIcon icon={faCircleNotch} spin />
                <span>Cargando producto...</span>
            </div>
        );
    }

    return (
        <div className={styles.root}>
            <ProductRef />
            <StepBar />
            <div className={styles.content}>
                <Outlet />
            </div>
        </div>
    );
}

export function MLPublishLayout() {
    return (
        <MLPublishProvider>
            <LayoutInner />
        </MLPublishProvider>
    );
}


