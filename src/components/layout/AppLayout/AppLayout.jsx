import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { NavBar } from '../../../components/NavBar/NavBar';
import { NavBarMobile } from '../../../components/NavBarMobile/NavBarMobile';
import { BtnOpenModal } from '../../../features/search/components/BtnOpenModal/BtnOpenModal';
import { ProductSearch } from '../../../features/search/components/ProductSearch/ProductSearch';
import { Loading } from '../../../components/Loading/Loading';
import styles from './AppLayout.module.css';

const HomePage = lazy(() => import('../../../features/home/pages/HomePage/HomePage').then(m => ({ default: m.HomePage })));
const ProductListPage = lazy(() => import('../../../features/product/pages/ProductListPage/ProductListPage').then(m => ({ default: m.ProductListPage })));
const NewProductPage = lazy(() => import('../../../features/product/pages/NewProductPage/NewProductPage').then(m => ({ default: m.NewProductPage })));
const ManageProductsPage = lazy(() => import('../../../features/product/pages/ManageProductsPage/ManageProductsPage').then(m => ({ default: m.ManageProductsPage })));
const ProductDetailsPage = lazy(() => import('../../../features/product/pages/ProductDetailsPage/ProductDetailsPage').then(m => ({ default: m.ProductDetailsPage })));
const ClientListPage = lazy(() => import('../../../features/client/pages/ClientListPage/ClientListPage').then(m => ({ default: m.ClientListPage })));
const NewClientPage = lazy(() => import('../../../features/client/pages/NewClientPage/NewClientPage').then(m => ({ default: m.NewClientPage })));
const ClientDetailPage = lazy(() => import('../../../features/client/pages/ClientDetailPage/ClientDetailPage').then(m => ({ default: m.ClientDetailPage })));
const SalesPage = lazy(() => import('../../../features/sales/pages/SalesPage/SalesPage').then(m => ({ default: m.SalesPage })));
const OrderPage = lazy(() => import('../../../features/order/pages/OrderPage/OrderPage').then(m => ({ default: m.OrderPage })));
const NewSupplierPage = lazy(() => import('../../../features/supplier/pages/NewSupplierPage/NewSupplierPage').then(m => ({ default: m.NewSupplierPage })));
const CategoryListPage = lazy(() => import('../../../features/category/pages/CategoryListPage/CategoryListPage').then(m => ({ default: m.CategoryListPage })));
const NewCategoryPage = lazy(() => import('../../../features/category/pages/NewCategoryPage/NewCategoryPage').then(m => ({ default: m.NewCategoryPage })));
const AnalyticsPage = lazy(() => import('../../../features/analytics/pages/AnalyticsPage/AnalyticsPage').then(m => ({ default: m.AnalyticsPage })));
const PromotionListPage = lazy(() => import('../../../features/promotion/pages/PromotionListPage/PromotionListPage').then(m => ({ default: m.PromotionListPage })));
const PromotionDetailPage = lazy(() => import('../../../features/promotion/pages/PromotionDetailPage/PromotionDetailPage').then(m => ({ default: m.PromotionDetailPage })));
const PaymentPage = lazy(() => import('../../../features/payment/pages/PaymentPage/PaymentPage').then(m => ({ default: m.PaymentPage })));
const CreateClientPaymentPage = lazy(() => import('../../../features/payment/pages/CreateClientPaymentPage/CreateClientPaymentPage').then(m => ({ default: m.CreateClientPaymentPage })));
const MercadoLibrePage = lazy(() => import('../../../features/mercadoLibre/pages/MercadoLibrePage/MercadoLibrePage').then(m => ({ default: m.MercadoLibrePage })));
const MLPublicationDetailPage = lazy(() => import('../../../features/mercadoLibre/pages/MLPublicationDetailPage/MLPublicationDetailPage').then(m => ({ default: m.MLPublicationDetailPage })));
const MLPublishLayout = lazy(() => import('../MLPublishLayout/MLPublishLayout').then(m => ({ default: m.MLPublishLayout })));
const MLPublishPage = lazy(() => import('../../../features/mercadoLibre/pages/MLPublishPage/MLPublishPage').then(m => ({ default: m.MLPublishPage })));
const HomeDesignPage = lazy(() => import('../../../features/homeLayout/pages/HomeDesignPage/HomeDesignPage').then(m => ({ default: m.HomeDesignPage })));

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
                <Suspense fallback={<Loading />}>
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

                        <Route path="/diseno-home" element={<HomeDesignPage />} />

                        <Route path="/promociones" element={<PromotionListPage />} />
                        <Route path="/promociones/:id" element={<PromotionDetailPage />} />

                        <Route path="/pagos" element={<PaymentPage />} />
                        <Route path="/pagos/nuevo" element={<CreateClientPaymentPage />} />

                        <Route path="/mercado-libre" element={<Navigate to="/mercado-libre/cuenta" replace />} />
                        <Route path="/mercado-libre/cuenta" element={<MercadoLibrePage />} />
                        <Route path="/mercado-libre/publicaciones" element={<MercadoLibrePage />} />
                        <Route path="/mercado-libre/publicaciones/:mlItemId" element={<MLPublicationDetailPage />} />

                        <Route path="/mercado-libre/publicar/:productId" element={<MLPublishLayout />}>
                            <Route path=":step" element={<MLPublishPage />} />
                        </Route>
                    </Routes>
                </Suspense>
            </main>
        </div>
    );
}
