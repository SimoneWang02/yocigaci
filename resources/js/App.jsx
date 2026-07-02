import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
    NavLink,
    useLocation,
} from "react-router-dom";
import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider, Helmet } from "react-helmet-async";
import { Header } from "./components/layout/Header";
import { Footer } from "./components/layout/Footer";
import { CartDrawer } from "./components/cart/CartDrawer";
import { Toaster } from "./components/ui/Toaster";
import { useAuthStore } from "./store/authStore";

import Home from "./pages/Home";
import Catalog from "./pages/Catalog";
import ProductDetail from "./pages/ProductDetail";
import Checkout from "./pages/Checkout";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import OrderConfirmation from "./pages/OrderConfirmation";
import Login from "./pages/account/Login";
import Register from "./pages/account/Register";
import Orders from "./pages/account/Orders";
import OrderDetail from "./pages/account/OrderDetail";
import Profile from "./pages/account/Profile";
import ForgotPassword from "./pages/account/ForgotPassword";
import ResetPassword from "./pages/account/ResetPassword";
import AdminProducts from "./pages/admin/Products";
import ProductForm from "./pages/admin/ProductForm";
import AdminOrders from "./pages/admin/Orders";
import AdminGames from "./pages/admin/Games";
import AdminCategories from "./pages/admin/Categories";
import AdminHomepageSections from "./pages/admin/HomepageSections";
import AdminCatalogs from "./pages/admin/Catalogs";
import AdminPages from "./pages/admin/Pages";
import AdminCoupons from "./pages/admin/Coupons";
import AdminShippingMethods from "./pages/admin/ShippingMethods";
import AdminDashboard from "./pages/admin/Dashboard";
import StaticPage from "./pages/StaticPage";
import OrderTracking from "./pages/OrderTracking";

const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

function ScrollToTop() {
    const { pathname } = useLocation();
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);
    return null;
}

function ProtectedRoute({ children }) {
    const { user } = useAuthStore();
    return user ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
    const { user } = useAuthStore();
    if (!user) return <Navigate to="/login" replace />;
    if (user.role !== "admin") return <Navigate to="/" replace />;
    return children;
}

function Layout({ children }) {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <CartDrawer />
            <main className="flex-1">{children}</main>
            <Footer />
        </div>
    );
}

const ADMIN_LINKS = [
    { to: "/admin/dashboard", label: "Dashboard" },
    { to: "/admin/homepage", label: "Homepage" },
    { to: "/admin/giochi", label: "Giochi" },
    { to: "/admin/categorie", label: "Categorie" },
    { to: "/admin/prodotti", label: "Prodotti" },
    { to: "/admin/ordini", label: "Ordini" },
];

const ADMIN_MORE_LINKS = [
    { to: "/admin/coupon", label: "Coupon" },
    { to: "/admin/spedizioni", label: "Spedizioni" },
    { to: "/admin/pagine", label: "Pagine Legali" },
];

function AdminNav() {
    const location = useLocation();
    const [moreOpen, setMoreOpen] = useState(false);
    const isMoreActive = ADMIN_MORE_LINKS.some((link) =>
        location.pathname.startsWith(link.to),
    );

    return (
        <nav className="bg-white border-b border-gray-200">
            <div className="max-w-6xl mx-auto px-4 flex items-stretch">
                <div className="flex flex-1 min-w-0 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {ADMIN_LINKS.map((link) => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            className={({ isActive }) =>
                                `flex-shrink-0 px-4 md:flex-1 md:px-0 md:text-center py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                                    isActive
                                        ? "border-indigo-600 text-indigo-600"
                                        : "border-transparent text-gray-500 hover:text-gray-800"
                                }`
                            }
                        >
                            {link.label}
                        </NavLink>
                    ))}
                </div>
                <div className="relative flex-shrink-0">
                    <button
                        onClick={() => setMoreOpen((o) => !o)}
                        className={`flex items-center justify-center gap-1 h-full px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
                            isMoreActive
                                ? "border-indigo-600 text-indigo-600"
                                : "border-transparent text-gray-500 hover:text-gray-800"
                        }`}
                    >
                        Altro
                        <ChevronDown
                            className={`w-4 h-4 transition-transform ${moreOpen ? "rotate-180" : ""}`}
                        />
                    </button>
                    {moreOpen && (
                        <>
                            <div
                                className="fixed inset-0 z-40"
                                onClick={() => setMoreOpen(false)}
                            />
                            <div className="absolute right-0 top-full z-50 w-44 bg-white border border-gray-200 shadow-lg rounded-lg py-2">
                                {ADMIN_MORE_LINKS.map((link) => (
                                    <NavLink
                                        key={link.to}
                                        to={link.to}
                                        onClick={() => setMoreOpen(false)}
                                        className={({ isActive }) =>
                                            `block px-4 py-2 text-sm ${
                                                isActive
                                                    ? "text-indigo-600 font-medium"
                                                    : "text-gray-700 hover:bg-gray-50"
                                            }`
                                        }
                                    >
                                        {link.label}
                                    </NavLink>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}

function AdminLayout({ children }) {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <CartDrawer />
            <AdminNav />
            <main className="flex-1 bg-gray-50">{children}</main>
        </div>
    );
}

export default function App() {
    return (
        <HelmetProvider>
            <QueryClientProvider client={queryClient}>
                <BrowserRouter>
                    <ScrollToTop />
                    <Toaster />
                    <Helmet>
                        <title>Yocigaci - TCG Store a Carpi</title>
                        <meta
                            name="description"
                            content="Yocigaci è il negozio di carte collezionabili a Carpi. Magic: The Gathering, Pokémon, One Piece e molto altro. Acquista online o ritira in negozio."
                        />
                        <meta property="og:site_name" content="Yocigaci" />
                        <meta property="og:type" content="website" />
                        <meta
                            property="og:image"
                            content="https://yocigaci.com/images/square_logo.svg"
                        />
                    </Helmet>
                    <Routes>
                        <Route
                            path="/"
                            element={
                                <Layout>
                                    <Home />
                                </Layout>
                            }
                        />
                        <Route
                            path="/catalogo"
                            element={
                                <Layout>
                                    <Catalog />
                                </Layout>
                            }
                        />
                        <Route
                            path="/catalogo/:gameSlug"
                            element={
                                <Layout>
                                    <Catalog />
                                </Layout>
                            }
                        />
                        <Route
                            path="/catalogo/:gameSlug/:categorySlug"
                            element={
                                <Layout>
                                    <Catalog />
                                </Layout>
                            }
                        />
                        <Route
                            path="/prodotti/:slug"
                            element={
                                <Layout>
                                    <ProductDetail />
                                </Layout>
                            }
                        />
                        <Route
                            path="/checkout"
                            element={
                                <Layout>
                                    <Checkout />
                                </Layout>
                            }
                        />
                        <Route
                            path="/checkout/success"
                            element={
                                <Layout>
                                    <CheckoutSuccess />
                                </Layout>
                            }
                        />
                        <Route
                            path="/ordine-confermato/:orderNumber"
                            element={
                                <Layout>
                                    <OrderConfirmation />
                                </Layout>
                            }
                        />
                        <Route
                            path="/tracking"
                            element={
                                <Layout>
                                    <OrderTracking />
                                </Layout>
                            }
                        />
                        <Route path="/login" element={<Login />} />
                        <Route path="/registrati" element={<Register />} />
                        <Route
                            path="/recupera-password"
                            element={<ForgotPassword />}
                        />
                        <Route
                            path="/reimposta-password"
                            element={<ResetPassword />}
                        />
                        <Route
                            path="/account/ordini"
                            element={
                                <ProtectedRoute>
                                    <Layout>
                                        <Orders />
                                    </Layout>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/account/ordini/:orderNumber"
                            element={
                                <ProtectedRoute>
                                    <Layout>
                                        <OrderDetail />
                                    </Layout>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/account/profilo"
                            element={
                                <ProtectedRoute>
                                    <Layout>
                                        <Profile />
                                    </Layout>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin/giochi"
                            element={
                                <AdminRoute>
                                    <AdminLayout>
                                        <AdminGames />
                                    </AdminLayout>
                                </AdminRoute>
                            }
                        />
                        <Route
                            path="/admin/categorie"
                            element={
                                <AdminRoute>
                                    <AdminLayout>
                                        <AdminCategories />
                                    </AdminLayout>
                                </AdminRoute>
                            }
                        />
                        <Route
                            path="/admin/prodotti"
                            element={
                                <AdminRoute>
                                    <AdminLayout>
                                        <AdminProducts />
                                    </AdminLayout>
                                </AdminRoute>
                            }
                        />
                        <Route
                            path="/admin/prodotti/nuovo"
                            element={
                                <AdminRoute>
                                    <AdminLayout>
                                        <ProductForm />
                                    </AdminLayout>
                                </AdminRoute>
                            }
                        />
                        <Route
                            path="/admin/prodotti/:id/modifica"
                            element={
                                <AdminRoute>
                                    <AdminLayout>
                                        <ProductForm />
                                    </AdminLayout>
                                </AdminRoute>
                            }
                        />
                        <Route
                            path="/admin/ordini"
                            element={
                                <AdminRoute>
                                    <AdminLayout>
                                        <AdminOrders />
                                    </AdminLayout>
                                </AdminRoute>
                            }
                        />
                        <Route
                            path="/admin/dashboard"
                            element={
                                <AdminRoute>
                                    <AdminLayout>
                                        <AdminDashboard />
                                    </AdminLayout>
                                </AdminRoute>
                            }
                        />
                        <Route
                            path="/admin/homepage"
                            element={
                                <AdminRoute>
                                    <AdminLayout>
                                        <AdminHomepageSections />
                                    </AdminLayout>
                                </AdminRoute>
                            }
                        />
                        <Route
                            path="/admin/cataloghi"
                            element={
                                <AdminRoute>
                                    <AdminLayout>
                                        <AdminCatalogs />
                                    </AdminLayout>
                                </AdminRoute>
                            }
                        />
                        <Route
                            path="/admin/coupon"
                            element={
                                <AdminRoute>
                                    <AdminLayout>
                                        <AdminCoupons />
                                    </AdminLayout>
                                </AdminRoute>
                            }
                        />
                        <Route
                            path="/admin/spedizioni"
                            element={
                                <AdminRoute>
                                    <AdminLayout>
                                        <AdminShippingMethods />
                                    </AdminLayout>
                                </AdminRoute>
                            }
                        />
                        <Route
                            path="/admin/pagine"
                            element={
                                <AdminRoute>
                                    <AdminLayout>
                                        <AdminPages />
                                    </AdminLayout>
                                </AdminRoute>
                            }
                        />
                        <Route
                            path="/p/:slug"
                            element={
                                <Layout>
                                    <StaticPage />
                                </Layout>
                            }
                        />
                        <Route
                            path="*"
                            element={
                                <Layout>
                                    <div className="text-center py-32 text-gray-500">
                                        <p className="text-6xl mb-4">404</p>
                                        <p>Pagina non trovata</p>
                                    </div>
                                </Layout>
                            }
                        />
                    </Routes>
                </BrowserRouter>
            </QueryClientProvider>
        </HelmetProvider>
    );
}
