import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { QueryProvider } from './providers/QueryProvider';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './CartContext.jsx';
import { useLenis } from './hooks/useLenis';
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import CategoryPage from './pages/CategoryPage';
import ShopPage from './pages/ShopPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import DashboardPage from './pages/DashboardPage';
import GiveawayPage from './pages/GiveawayPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminProductEditPage from './pages/admin/AdminProductEditPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminCouponsPage from './pages/admin/AdminCouponsPage';
import AdminRoute from './components/AdminRoute';
import { Toaster } from 'sonner';

import OrderTrackingPage from './pages/OrderTrackingPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  
  return null;
}

function AppContent() {
  useLenis();
  return (
    <>
      <ScrollToTop />
      <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/shop" element={<ShopPage />} />
      <Route path="/product/:slug" element={<ProductPage />} />
      <Route path="/category/:slug" element={<CategoryPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/order-confirmation/:id" element={<OrderConfirmationPage />} />
      <Route path="/orders/:id/track" element={<OrderTrackingPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/giveaway" element={<GiveawayPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      
      {/* Admin Routes */}
      <Route path="/admin" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
      <Route path="/admin/products" element={<AdminRoute><AdminProductsPage /></AdminRoute>} />
      <Route path="/admin/products/new" element={<AdminRoute><AdminProductEditPage /></AdminRoute>} />
      <Route path="/admin/products/:id/edit" element={<AdminRoute><AdminProductEditPage /></AdminRoute>} />
      <Route path="/admin/orders" element={<AdminRoute><AdminOrdersPage /></AdminRoute>} />
      <Route path="/admin/coupons" element={<AdminRoute><AdminCouponsPage /></AdminRoute>} />
    </Routes>
    </>
  );
}

function App() {
  return (
    <QueryProvider>
      <AuthProvider>
        <CartProvider>
          <Router>
            <AppContent />
            <Toaster position="top-right" richColors />
          </Router>
        </CartProvider>
      </AuthProvider>
    </QueryProvider>
  );
}

export default App;
