import { Navigate, Route, Routes } from 'react-router-dom';
import { NavBar } from '../../components/NavBar/NavBar';
import { NavBarMobile } from '../../components/NavBarMobile/NavBarMobile';
import { BtnOpenModal } from '../../features/search/components/BtnOpenModal/BtnOpenModal';
import { ProductSearch } from '../../features/search/components/ProductSearch/ProductSearch';
import { AnalyticsPage } from '../../pages/AnalyticsPage/AnalyticsPage';
import { CategoryListPage } from '../../pages/CategoryListPage/CategoryListPage';
import { ClientListPage } from '../../pages/ClientListPage/ClientListPage';
import { HomePage } from '../../pages/HomePage/HomePage';
import { ManageProductsPage } from '../../pages/ManageProductsPage/ManageProductsPage';
import { NewCategoryPage } from '../../pages/NewCategoryPage/NewCategoryPage';
import { NewClientPage } from '../../pages/NewClientPage/NewClientPage';
import { NewProductPage } from '../../pages/NewProductPage/NewProductPage';
import { NewSupplierPage } from '../../pages/NewSupplierPage/NewSupplierPage';
import { OrderPage } from '../../pages/OrderPage/OrderPage';
import { ProductDetailsPage } from '../../pages/ProductDetailsPage/ProductDetailsPAge';
import { ProductListPage } from '../../pages/ProductListPage/ProductListPage';
import { SalesPage } from '../../pages/SalesPage/SalesPage';
import { PromotionListPage } from '../../pages/PromotionListPage/PromotionListPage';
import { PromotionDetailPage } from '../../pages/PromotionDetailPage/PromotionDetailPage';
import { PaymentPage } from '../../pages/PaymentPage/PaymentPage';
import styles from './AppLayout.module.css';
import { MercadoLibrePage } from '../../pages/MercadoLibrePage/MercadoLibrePage';
import { MLPublishLayout } from '../MLPublishLayout/MLPublishLayout';
import { MLPublishPage } from '../../pages/MLPublishPage/MLPublishPage';
import { MLPublicationDetailPage } from '../../pages/MLPublicationDetailPage/MLPublicationDetailPage';

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
                    <Route path="/clientes/detalle/:id" element={'detalle'} />

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