import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSort, faSortUp, faSortDown } from '@fortawesome/free-solid-svg-icons';
import { IMAGE_URL } from '../../../../config/api';
import { Badge } from '../../../../components/Badge/Badge';
import { productStatusBadge } from '../../../../constants/badges';
import { formatPrice } from '../../../../utils/formatPrice';
import { ProductActions } from '../ProductActions/ProductActions';
import styles from './ProductTable.module.css';

const COLUMNS = [
    { key: 'name', label: 'Producto', align: 'left', sortable: true },
    { key: 'sku', label: 'SKU', align: 'left', sortable: true },
    { key: 'stock', label: 'Stock', align: 'right', sortable: true },
    { key: 'price', label: 'Precio', align: 'right', sortable: true },
    { key: 'status', label: 'Estado', align: 'left', sortable: false },
];

function thumbUrl(product) {
    const imgs = product.images || [];
    if (imgs.length === 0) return null;
    const sorted = [...imgs].sort((a, b) => (a.position || 0) - (b.position || 0));
    const path = sorted[0].thumbnail_path || sorted[0].path;
    return `${IMAGE_URL}/${path}`;
}

export function ProductTable({ products, sortBy, sortOrder, onSort, onUpdated }) {
    const navigate = useNavigate();

    const sortIcon = (key) => {
        if (sortBy !== key) return faSort;
        return sortOrder === 'asc' ? faSortUp : faSortDown;
    };

    return (
        <div className={styles.table_wrapper}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th className={styles.th_img}></th>
                        {COLUMNS.map(col => (
                            <th
                                key={col.key}
                                className={`${col.align === 'right' ? styles.right : ''} ${col.sortable ? styles.th_sortable : ''}`}
                                onClick={col.sortable ? () => onSort(col.key) : undefined}
                            >
                                <span className={styles.th_inner}>
                                    {col.label}
                                    {col.sortable && (
                                        <FontAwesomeIcon
                                            icon={sortIcon(col.key)}
                                            className={`${styles.sort_icon} ${sortBy === col.key ? styles.sort_active : ''}`}
                                        />
                                    )}
                                </span>
                            </th>
                        ))}
                        <th className={styles.right}>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map(product => {
                        const img = thumbUrl(product);
                        const priceLists = product.price_lists || [];
                        const status = product.status;

                        return (
                            <tr
                                key={product.id}
                                className={styles.row}
                                onClick={() => navigate(`/productos/${product.id}`)}
                            >
                                <td className={styles.td_img}>
                                    {img ? (
                                        <img
                                            src={img}
                                            alt={product.name}
                                            className={styles.thumb}
                                            onError={(e) => { e.target.src = '/not-image.jpg'; }}
                                        />
                                    ) : (
                                        <div className={styles.thumb_placeholder}>—</div>
                                    )}
                                </td>
                                <td>
                                    <span className={styles.name}>{product.name}</span>
                                    {product.variants?.length > 0 && (
                                        <span className={styles.sub}>{product.variants.length} variantes</span>
                                    )}
                                </td>
                                <td className={styles.sku}>{product.sku || 'N/A'}</td>
                                <td className={styles.right}>{product.stock ?? 0}</td>
                                <td className={styles.right}>
                                    {priceLists.length > 0 ? (
                                        <div className={styles.price_list}>
                                            {priceLists.map(list => (
                                                <span key={list.id ?? list.name} className={styles.price_row}>
                                                    <span className={styles.price_name}>{list.name}</span>
                                                    <span className={styles.price_val}>{formatPrice(list.pivot.price)}</span>
                                                </span>
                                            ))}
                                        </div>
                                    ) : '—'}
                                </td>
                                <td>
                                    {(() => {
                                        const s = productStatusBadge(status);
                                        return <Badge tone={s.tone}>{s.label}</Badge>;
                                    })()}
                                </td>
                                <td className={styles.right} onClick={(e) => e.stopPropagation()}>
                                    <ProductActions
                                        product={product}
                                        onUpdated={(partial) => onUpdated(product.id, partial)}
                                    />
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
