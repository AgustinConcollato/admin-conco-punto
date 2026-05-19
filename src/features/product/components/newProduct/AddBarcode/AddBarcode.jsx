import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Loading } from '../../../../../components/Loading/Loading';
import { ProductService } from '../../../../../services/product/productService';
import { generateBarcodeFromSKU } from '../../../../../utils/generateBarcodeFromSKU';
import { ProductSummary } from '../ProductSummary/ProductSummary';
import styles from './AddBarcode.module.css';

export function AddBarcode() {

    const productService = useMemo(() => new ProductService(), []);

    const { id } = useParams();
    const navigate = useNavigate();

    const [errors, setErrors] = useState({});
    const [barcodeValue, setBarcodeValue] = useState('');
    const [pendingBarcode, setPendingBarcode] = useState(sessionStorage.getItem('pendingBarcode') || null);
    const [loading, setLoading] = useState(false);
    const [product, setProduct] = useState(() => {
        const sessionProduct = sessionStorage.getItem('product');
        return sessionProduct ? JSON.parse(sessionProduct) : null;
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        const formData = new FormData(e.target);
        const isPrimaryChecked = !!e.target.is_primary?.checked;
        formData.set('is_primary', isPrimaryChecked ? '1' : '0');

        try {
            if (!product) {
                throw new Error('Producto no encontrado');
            }
            await productService.addBarcode(formData, product.id);

            e.target.reset();
            setBarcodeValue('');
            sessionStorage.removeItem('pendingBarcode');

        } catch (error) {
            setErrors(error[0]);
        } finally {
            setLoading(false);
        }
    }

    const getProductDetail = async () => {
        try {
            const productData = await productService.getById(id);
            setProduct(productData);
            sessionStorage.setItem('product', JSON.stringify(productData));
        } catch (error) {
            console.log(error);
        }
    }

    const generateBarcode = () => {
        if (!product?.sku) return;
        const barcode = generateBarcodeFromSKU(product.sku);
        setBarcodeValue(barcode);
    }

    const handleAcceptPending = () => {
        setBarcodeValue(pendingBarcode);
        setPendingBarcode(null);
        sessionStorage.removeItem('pendingBarcode');
    };

    const handleDiscardPending = () => {
        setPendingBarcode(null);
        sessionStorage.removeItem('pendingBarcode');
    };

    useEffect(() => {
        if (!id && !product) {
            navigate('/productos/nuevo/1');
        }

        if (!product && id) {
            getProductDetail();
        }

    }, []);

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            <h1 className='title'>Agregar código de barras</h1>
            {product ?
                <>
                    <ProductSummary product={product} />

                    {pendingBarcode && (
                        <div className={styles.alert_pending}>
                            <p>Tienes un código pendiente: <strong>{pendingBarcode}</strong></p>
                            <div className={styles.alert_buttons}>
                                <button type="button" onClick={handleAcceptPending} className="btn btn_solid">
                                    Usar este código
                                </button>
                                <button type="button" onClick={handleDiscardPending} className="btn btn_regular">
                                    Descartar
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="input_group">
                        <span>Código de barras</span>
                        <input
                            type="text"
                            className="input"
                            name='barcode'
                            placeholder='Código de barras'
                            value={barcodeValue}
                            onChange={(e) => setBarcodeValue(e.target.value)}
                            autoComplete='off'
                            autoFocus
                        />
                        <button
                            type='button'
                            className={`btn btn_regular ${styles.btn_generate_barcode}`}
                            onClick={generateBarcode}
                        >
                            Generar código
                        </button>
                        {errors.barcode && <p className={styles.error}>{errors.barcode[0]}</p>}
                    </div>

                    <label className={styles.primary_barcode}>
                        <input type="checkbox" name="is_primary" />
                        Código de barra principal
                    </label>

                    <button type="submit" className="btn btn_solid" disabled={loading}>
                        {loading ? <FontAwesomeIcon icon={faCircleNotch} spin /> : 'Agregar código'}
                    </button>
                </> :
                <Loading />
            }
            {product &&
                <div className={styles.buttons}>
                    <Link to={`/productos/${product.id}`} className="btn btn_regular">Ver producto</Link>
                    <Link to={`/productos/nuevo/1`} className="btn btn_regular">Agregar otro producto</Link>
                </div>
            }
        </form>
    )
}