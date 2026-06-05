import { Navigate, Route, Routes } from 'react-router-dom';
import { NavBar } from '../../../components/NavBar/NavBar';
import { NavBarMobile } from '../../../components/NavBarMobile/NavBarMobile';
import { BtnOpenModal } from '../../../features/search/components/BtnOpenModal/BtnOpenModal';
import { ProductSearch } from '../../../features/search/components/ProductSearch/ProductSearch';
import { AnalyticsPage } from '../../../features/analytics/pages/AnalyticsPage/AnalyticsPage';
import { CategoryListPage } from '../../../features/category/pages/CategoryListPage/CategoryListPage';
import { ClientListPage } from '../../../features/client/pages/ClientListPage/ClientListPage';
import { HomePage } from '../../../features/home/pages/HomePage/HomePage';
import { ManageProductsPage } from '../../../features/product/pages/ManageProductsPage/ManageProductsPage';
import { NewCategoryPage } from '../../../features/category/pages/NewCategoryPage/NewCategoryPage';
import { NewClientPage } from '../../../features/client/pages/NewClientPage/NewClientPage';
import { ClientDetailPage } from '../../../features/client/pages/ClientDetailPage/ClientDetailPage';
import { NewProductPage } from '../../../features/product/pages/NewProductPage/NewProductPage';
import { NewSupplierPage } from '../../../features/supplier/pages/NewSupplierPage/NewSupplierPage';
import { OrderPage } from '../../../features/order/pages/OrderPage/OrderPage';
import { ProductDetailsPage } from '../../../features/product/pages/ProductDetailsPage/ProductDetailsPAge';
import { ProductListPage } from '../../../features/product/pages/ProductListPage/ProductListPage';
import { SalesPage } from '../../../features/sales/pages/SalesPage/SalesPage';
import { PromotionListPage } from '../../../features/promotion/pages/PromotionListPage/PromotionListPage';
import { PromotionDetailPage } from '../../../features/promotion/pages/PromotionDetailPage/PromotionDetailPage';
import { PaymentPage } from '../../../features/payment/pages/PaymentPage/PaymentPage';
import styles from './AppLayout.module.css';
import { MercadoLibrePage } from '../../../features/mercadoLibre/pages/MercadoLibrePage/MercadoLibrePage';
import { MLPublishLayout } from '../MLPublishLayout/MLPublishLayout';
import { MLPublishPage } from '../../../features/mercadoLibre/pages/MLPublishPage/MLPublishPage';
import { MLPublicationDetailPage } from '../../../features/mercadoLibre/pages/MLPublicationDetailPage/MLPublicationDetailPage';

export function AppLayout() {
    return (
        <div className={styles.layout}>
            <header className={styles.header}>
                <ProductSearch />
                <BtnOpenModal />
            </header>
            <aside className={styles.aside_container}>
                <div className={styles.desktop_nav}>
                    <NavBar />
                </div>
                <div className={styles.mobile_nav}>
                    <NavBarMobile />
                </div>
            </aside>
            <main>
                <Routes>
                    <Route path="/" element={<HomePage />} />

                    <Route path="/productos" element={<ProductListPage />} />
                    <Route path="/productos/nuevo/:step/:id?" element={<NewProductPage />} />
                    <Route path="/productos/cargar" element={<ManageProductsPage />} />
                    <Route path="/productos/:id" element={<ProductDetailsPage />} />

                    <Route path="/clientes" element={<ClientListPage />} />
                    <Route path="/clientes/nuevo" element={<NewClientPage />} />
                    <Route path="/clientes/detalle/:id" element={<ClientDetailPage />} />

                    <Route path="/ventas" element={<SalesPage />} />
                    <Route path="/ventas/:id" element={<SalesPage />} />

                    <Route path="/pedidos" element={<OrderPage />} />

                    <Route path="/proveedor/nuevo" element={<NewSupplierPage />} />

                    <Route path="/categorias" element={<CategoryListPage />} />
                    <Route path="/categorias/nueva" element={<NewCategoryPage />} />

                    <Route path="/reportes" element={<AnalyticsPage />} />

                    <Route path="/promociones" element={<PromotionListPage />} />
                    <Route path="/promociones/:id" element={<PromotionDetailPage />} />

                    <Route path="/pagos" element={<PaymentPage />} />

                    <Route path="/mercado-libre" element={<Navigate to="/mercado-libre/cuenta" replace />} />
                    <Route path="/mercado-libre/cuenta" element={<MercadoLibrePage />} />
                    <Route path="/mercado-libre/publicaciones" element={<MercadoLibrePage />} />
                    <Route path="/mercado-libre/publicaciones/:mlItemId" element={<MLPublicationDetailPage />} />

                    <Route path="/mercado-libre/publicar/:productId" element={<MLPublishLayout />}>
                        <Route path=":step" element={<MLPublishPage />} />
                    </Route>
                </Routes>
            </main>
        </div>
    );
}
