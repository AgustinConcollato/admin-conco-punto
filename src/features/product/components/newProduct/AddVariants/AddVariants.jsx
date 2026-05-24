import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Loading } from "../../../../../components/Loading/Loading";
import { Variants } from "../../detail/Variants/Variants";
import { ProductService } from "../../../../../services/product/productService";
import { ProductSummary } from "../ProductSummary/ProductSummary";
import styles from "./AddVariants.module.css";

export function AddVariants() {
    const productService = useMemo(() => new ProductService(), []);

    const { id } = useParams();
    const navigate = useNavigate();

    const [product, setProduct] = useState(() => {
        const s = sessionStorage.getItem('product');
        return s ? JSON.parse(s) : null;
    });

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

    return (
        <div className={styles.container}>
            <h1 className="title">Variantes</h1>

            {product ? (
                <>
                    <ProductSummary product={product} />

                    <Variants productId={product.id} productSku={product.sku} />

                    <Link to={`/productos/${product.id}`} className="btn btn_solid">
                        Finalizar
                    </Link>
                    <Link to="/productos/nuevo/1" className="btn btn_regular">
                        Agregar otro producto
                    </Link>
                    <Link to={`/productos/${product.id}`} className="btn btn_thins">
                        Ver producto
                    </Link>
                </>
            ) : (
                <Loading />
            )}
        </div>
    );
}
