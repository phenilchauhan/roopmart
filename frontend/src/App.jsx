// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/stores';

// Layouts
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import StoreLayout from './layouts/StoreLayout';

// Public Pages
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import SearchPage from './pages/SearchPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import StoreRegisterPage from './pages/auth/StoreRegisterPage';
import PaymentResultPage from './pages/PaymentResultPage';

// User Pages
import ProfilePage from './pages/user/ProfilePage';
import OrdersPage from './pages/user/OrdersPage';
import OrderDetailPage from './pages/user/OrderDetailPage';
import WishlistPage from './pages/user/WishlistPage';
import AddressPage from './pages/user/AddressPage';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/Products';
import AdminOrders from './pages/admin/Orders';
import AdminUsers from './pages/admin/Users';
import AdminStores from './pages/admin/Stores';
import AdminCategories from './pages/admin/Categories';
import AdminCoupons from './pages/admin/Coupons';
import AdminBanners from './pages/admin/Banners';

// Store Pages
import StoreDashboard from './pages/store/Dashboard';
import StoreProducts from './pages/store/Products';
import StoreOrders from './pages/store/Orders';
import StoreProfile from './pages/store/Profile';
import AddProduct from './pages/store/AddProduct';

const PrivateRoute = ({ children, roles }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user?.role)) return <Navigate to="/" replace />;
  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        {/* Public */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/payment/result" element={<PaymentResultPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/seller/register" element={<StoreRegisterPage />} />

          {/* User Protected */}
          <Route path="/checkout" element={<PrivateRoute><CheckoutPage /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
          <Route path="/orders" element={<PrivateRoute><OrdersPage /></PrivateRoute>} />
          <Route path="/orders/:id" element={<PrivateRoute><OrderDetailPage /></PrivateRoute>} />
          <Route path="/wishlist" element={<PrivateRoute><WishlistPage /></PrivateRoute>} />
          <Route path="/addresses" element={<PrivateRoute><AddressPage /></PrivateRoute>} />
        </Route>

        {/* Admin */}
        <Route path="/admin" element={<PrivateRoute roles={['admin']}><AdminLayout /></PrivateRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="stores" element={<AdminStores />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="coupons" element={<AdminCoupons />} />
          <Route path="banners" element={<AdminBanners />} />
        </Route>

        {/* Store */}
        <Route path="/store" element={<PrivateRoute roles={['store']}><StoreLayout /></PrivateRoute>}>
          <Route index element={<StoreDashboard />} />
          <Route path="products" element={<StoreProducts />} />
          <Route path="products/add" element={<AddProduct />} />
          <Route path="orders" element={<StoreOrders />} />
          <Route path="profile" element={<StoreProfile />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
