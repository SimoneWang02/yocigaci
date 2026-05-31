import { BrowserRouter, Routes, Route, Navigate, NavLink } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Header } from './components/layout/Header'
import { Footer } from './components/layout/Footer'
import { CartDrawer } from './components/cart/CartDrawer'
import { useAuthStore } from './store/authStore'

import Home from './pages/Home'
import Catalog from './pages/Catalog'
import ProductDetail from './pages/ProductDetail'
import Checkout from './pages/Checkout'
import OrderConfirmation from './pages/OrderConfirmation'
import Login from './pages/account/Login'
import Register from './pages/account/Register'
import Orders from './pages/account/Orders'
import OrderDetail from './pages/account/OrderDetail'
import AdminProducts from './pages/admin/Products'
import ProductForm from './pages/admin/ProductForm'
import AdminOrders from './pages/admin/Orders'
import AdminGames from './pages/admin/Games'
import AdminCategories from './pages/admin/Categories'
import AdminHomepageSections from './pages/admin/HomepageSections'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
})

function ProtectedRoute({ children }) {
  const { user } = useAuthStore()
  return user ? children : <Navigate to="/login" replace />
}

function AdminRoute({ children }) {
  const { user } = useAuthStore()
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'admin') return <Navigate to="/" replace />
  return children
}

function Layout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <CartDrawer />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}

const ADMIN_LINKS = [
  { to: '/admin/prodotti', label: 'Prodotti' },
  { to: '/admin/giochi', label: 'Giochi' },
  { to: '/admin/categorie', label: 'Categorie' },
  { to: '/admin/homepage', label: 'Homepage' },
  { to: '/admin/ordini', label: 'Ordini' },
]

function AdminNav() {
  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 flex gap-1 overflow-x-auto">
        {ADMIN_LINKS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `px-3 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                isActive
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

function AdminLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <AdminNav />
      <main className="flex-1 bg-gray-50">{children}</main>
    </div>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/catalogo" element={<Layout><Catalog /></Layout>} />
          <Route path="/prodotti/:slug" element={<Layout><ProductDetail /></Layout>} />
          <Route path="/checkout" element={<Layout><Checkout /></Layout>} />
          <Route path="/ordine-confermato/:orderNumber" element={<Layout><OrderConfirmation /></Layout>} />
          <Route path="/login" element={<Login />} />
          <Route path="/registrati" element={<Register />} />
          <Route path="/account/ordini" element={<ProtectedRoute><Layout><Orders /></Layout></ProtectedRoute>} />
          <Route path="/account/ordini/:orderNumber" element={<ProtectedRoute><Layout><OrderDetail /></Layout></ProtectedRoute>} />
          <Route path="/admin/giochi" element={<AdminRoute><AdminLayout><AdminGames /></AdminLayout></AdminRoute>} />
          <Route path="/admin/categorie" element={<AdminRoute><AdminLayout><AdminCategories /></AdminLayout></AdminRoute>} />
          <Route path="/admin/prodotti" element={<AdminRoute><AdminLayout><AdminProducts /></AdminLayout></AdminRoute>} />
          <Route path="/admin/prodotti/nuovo" element={<AdminRoute><AdminLayout><ProductForm /></AdminLayout></AdminRoute>} />
          <Route path="/admin/prodotti/:id/modifica" element={<AdminRoute><AdminLayout><ProductForm /></AdminLayout></AdminRoute>} />
          <Route path="/admin/ordini" element={<AdminRoute><AdminLayout><AdminOrders /></AdminLayout></AdminRoute>} />
          <Route path="/admin/homepage" element={<AdminRoute><AdminLayout><AdminHomepageSections /></AdminLayout></AdminRoute>} />
          <Route path="*" element={<Layout><div className="text-center py-32 text-gray-500"><p className="text-6xl mb-4">404</p><p>Pagina non trovata</p></div></Layout>} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
