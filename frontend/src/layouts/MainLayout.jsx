// src/layouts/MainLayout.jsx
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuthStore, useCartStore } from '../store/stores';
import {
  FiSearch, FiShoppingCart, FiHeart, FiUser,
  FiMenu, FiX, FiPackage, FiLogOut, FiChevronDown
} from 'react-icons/fi';

export default function MainLayout() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const { count, fetchCart } = useCartStore();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) fetchCart();
  }, [isAuthenticated]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/search?q=${encodeURIComponent(search)}`);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const categories = ['Electronics', 'Fashion', 'Home', 'Beauty', 'Sports', 'Books', 'Toys', 'Grocery'];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Top Bar */}
      <div className="bg-gray-900 text-gray-300 text-xs py-1 px-4 flex justify-between">
        <span>Free delivery on orders above ₹500 | 📞 1800-RoopMart</span>
        <div className="flex gap-4">
          <Link to="/seller/register" className="hover:text-white">Sell on RoopMart</Link>
          <Link to="/orders" className="hover:text-white">Track Order</Link>
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-[#1a73e8] shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="bg-yellow-400 text-blue-900 font-black text-xl px-3 py-1 rounded-lg">RM</div>
            <span className="text-white font-bold text-xl hidden md:block">RoopMart</span>
          </Link>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 flex">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search for products, brands and more..."
              className="w-full px-4 py-2.5 text-sm rounded-l-lg outline-none border-0"
            />
            <button type="submit" className="bg-yellow-400 hover:bg-yellow-500 px-5 rounded-r-lg transition">
              <FiSearch className="text-gray-800 text-lg" />
            </button>
          </form>

          {/* Right Nav */}
          <div className="flex items-center gap-4 text-white shrink-0">
            {/* User */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-1 hover:text-yellow-300 text-sm"
                >
                  <FiUser className="text-xl" />
                  <span className="hidden md:block">{user?.name?.split(' ')[0]}</span>
                  <FiChevronDown className="text-sm" />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-10 bg-white text-gray-700 rounded-lg shadow-xl w-48 z-50 overflow-hidden">
                    <div className="px-4 py-3 bg-blue-50 border-b">
                      <p className="font-semibold text-sm text-blue-700">{user?.name}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    <Link to="/profile" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 hover:bg-gray-100 text-sm">
                      <FiUser /> My Profile
                    </Link>
                    <Link to="/orders" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 hover:bg-gray-100 text-sm">
                      <FiPackage /> My Orders
                    </Link>
                    <Link to="/wishlist" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 hover:bg-gray-100 text-sm">
                      <FiHeart /> Wishlist
                    </Link>
                    {user?.role === 'admin' && (
                      <Link to="/admin" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 hover:bg-gray-100 text-sm text-red-600">
                        🛡 Admin Panel
                      </Link>
                    )}
                    {user?.role === 'store' && (
                      <Link to="/store" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 hover:bg-gray-100 text-sm text-green-600">
                        🏪 Seller Panel
                      </Link>
                    )}
                    <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2.5 hover:bg-gray-100 text-sm text-red-500 w-full border-t">
                      <FiLogOut /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="flex items-center gap-1 hover:text-yellow-300 text-sm">
                <FiUser className="text-xl" />
                <span className="hidden md:block">Login</span>
              </Link>
            )}

            {/* Wishlist */}
            <Link to="/wishlist" className="hover:text-yellow-300 hidden md:block">
              <FiHeart className="text-xl" />
            </Link>

            {/* Cart */}
            <Link to="/cart" className="relative flex items-center gap-1 hover:text-yellow-300">
              <FiShoppingCart className="text-2xl" />
              {count > 0 && (
                <span className="absolute -top-2 -right-2 bg-yellow-400 text-gray-900 text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {count}
                </span>
              )}
              <span className="hidden md:block text-sm">Cart</span>
            </Link>
          </div>
        </div>

        {/* Category Nav */}
        <div className="bg-blue-800 hidden md:block">
          <div className="max-w-7xl mx-auto px-4 flex gap-6 py-1.5 text-sm text-white overflow-x-auto">
            {categories.map(cat => (
              <Link key={cat} to={`/search?q=${cat}`} className="hover:text-yellow-300 whitespace-nowrap transition">
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </header>

      {/* Page Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="bg-yellow-400 text-blue-900 font-black text-xl px-3 py-1 rounded-lg inline-block mb-3">RM</div>
            <p className="text-sm">India's trusted eCommerce platform. Shop smarter, live better.</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Shop</h4>
            {['Electronics', 'Fashion', 'Home & Garden', 'Beauty', 'Sports'].map(c => (
              <Link key={c} to={`/search?q=${c}`} className="block text-sm hover:text-white py-0.5">{c}</Link>
            ))}
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Account</h4>
            {['My Profile', 'My Orders', 'Wishlist', 'Addresses'].map((item, i) => (
              <Link key={i} to={`/${item.toLowerCase().replace(' ', '-').replace('my-', '')}`} className="block text-sm hover:text-white py-0.5">{item}</Link>
            ))}
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Help</h4>
            <p className="text-sm">📞 1800-ROOPMART</p>
            <p className="text-sm">✉ support@roopmart.in</p>
            <p className="text-sm mt-2">Mon-Sat: 9AM - 6PM</p>
            <div className="mt-4">
              <Link to="/seller/register" className="bg-yellow-400 text-gray-900 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-yellow-300 transition">
                Sell on RoopMart
              </Link>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 text-center py-4 text-xs text-gray-500">
          © 2025 RoopMart. All rights reserved. | Made with ❤️ in India
        </div>
      </footer>
    </div>
  );
}
