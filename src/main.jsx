import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Shop from './pages/Shop.jsx'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import { CartProvider } from './state/CartContext.jsx'
import { UiProvider } from './state/UiContext.jsx'
import { AuthProvider } from './state/AuthContext.jsx'
import { ToastProvider } from './state/ToastContext.jsx'
import Cart from './pages/Cart.jsx'
import Search from './pages/Search.jsx'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import Contact from './pages/Contact.jsx'
import Checkout from './pages/Checkout.jsx'
import ProductDetails from './pages/ProductDetails.jsx'
import Rewards from './pages/Rewards.jsx'
import Orders from './pages/Orders.jsx'
import AdminOrders from './pages/AdminOrders.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import Wishlist from './pages/Wishlist.jsx'
import { WishlistProvider } from './state/WishlistContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <UiProvider>
          <WishlistProvider>
          <ToastProvider>
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<App />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/product/:id" element={<ProductDetails />} />
                <Route path="/rewards" element={<Rewards />} />
                <Route path="/search" element={<Search />} />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/orders" element={<AdminOrders />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
              </Route>
            </Routes>
          </ToastProvider>
          </WishlistProvider>
          </UiProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
