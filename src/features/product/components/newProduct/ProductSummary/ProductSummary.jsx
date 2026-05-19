import { IMAGE_URL } from "../../../../../config/api";
import styles from './ProductSummary.module.css'

export const ProductSummary = ({ product }) => {
    return (
        <div className={styles.product_info}>
            <img src={`${IMAGE_URL}/${product.images[0]?.thumbnail_path}`} alt={product.name} />
            <div>
                <h3>{product.name}</h3>
                <p>{product.sku}</p>
            </div>
        </div>
    );
}