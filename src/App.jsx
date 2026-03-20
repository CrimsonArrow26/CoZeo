import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { QueryProvider } from './providers/QueryProvider';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './CartContext.jsx';
import { useLenis, scrollToTop } from './hooks/useLenis';
import { initEmailJS } from './services/email.service';
import ChatWidget from './components/ChatWidget';
import GoToTop from './components/GoToTop';
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
import InvoicePage from './pages/InvoicePage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import RefundPage from './pages/RefundPage';
import ShippingPage from './pages/ShippingPage';

// Scroll to top on route change using Lenis
function ScrollToTop() {
  const { pathname } = useLocation();
  
  useEffect(() => {
    scrollToTop();
  }, [pathname]);
  
  return null;
}

function AppContent() {
  const location = useLocation();
  useLenis();
  
  // Initialize EmailJS on app load
  useEffect(() => {
    initEmailJS();
  }, []);
  
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
      <Route path="/orders/:id/invoice" element={<InvoicePage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/giveaway" element={<GiveawayPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/refund" element={<RefundPage />} />
      <Route path="/shipping" element={<ShippingPage />} />
      
      {/* Admin Routes */}
      <Route path="/admin" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
      <Route path="/admin/products" element={<AdminRoute><AdminProductsPage /></AdminRoute>} />
      <Route path="/admin/products/new" element={<AdminRoute><AdminProductEditPage /></AdminRoute>} />
      <Route path="/admin/products/:id/edit" element={<AdminRoute><AdminProductEditPage /></AdminRoute>} />
      <Route path="/admin/orders" element={<AdminRoute><AdminOrdersPage /></AdminRoute>} />
      <Route path="/admin/coupons" element={<AdminRoute><AdminCouponsPage /></AdminRoute>} />
    </Routes>
    <GoToTop />
    <ChatWidget />
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
