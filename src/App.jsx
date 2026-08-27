import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { SettingsProvider } from './context/SettingsContext'
import { isFirebaseConfigured } from './firebase'
import StoreLayout from './components/StoreLayout'
import AdminLayout from './components/AdminLayout'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/store/Home'
import Cart from './pages/store/Cart'
import Checkout from './pages/store/Checkout'
import OrderSuccess from './pages/store/OrderSuccess'
import Login from './pages/Login'
import Orders from './pages/admin/Orders'
import Products from './pages/admin/Products'
import Settings from './pages/admin/Settings'
import Users from './pages/admin/Users'

function ConfigMissing() {
  return (
    <div className="flex min-h-dvh items-center justify-center p-6">
      <div className="card max-w-lg p-8 text-center">
        <p className="text-5xl">🥖</p>
        <h1 className="mt-4 font-serif text-2xl font-bold text-amber-900">Falta configurar Firebase</h1>
        <p className="mt-3 text-stone-600">
          Copia el archivo <code className="rounded bg-stone-100 px-1.5 py-0.5">.env.example</code> a{' '}
          <code className="rounded bg-stone-100 px-1.5 py-0.5">.env.local</code> y llena los datos de tu
          proyecto de Firebase. Las instrucciones completas están en el <strong>README.md</strong>.
        </p>
      </div>
    </div>
  )
}

export default function App() {
  if (!isFirebaseConfigured) {
    return <ConfigMissing />
  }

  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AuthProvider>
        <SettingsProvider>
          <CartProvider>
            <Routes>
              <Route element={<StoreLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/carrito" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/pedido/:orderId" element={<OrderSuccess />} />
              </Route>
              <Route path="/login" element={<Login />} />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Orders />} />
                <Route path="productos" element={<Products />} />
                <Route path="configuracion" element={<Settings />} />
                <Route path="usuarios" element={<Users />} />
              </Route>
            </Routes>
          </CartProvider>
        </SettingsProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
