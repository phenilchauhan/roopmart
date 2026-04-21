// src/layouts/StoreLayout.jsx
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/stores';
import { FiGrid, FiPackage, FiShoppingBag, FiUser, FiLogOut, FiPlusCircle } from 'react-icons/fi';

const navItems = [
  { path: '/store', label: 'Dashboard', icon: FiGrid, exact: true },
  { path: '/store/products', label: 'My Products', icon: FiPackage },
  { path: '/store/products/add', label: 'Add Product', icon: FiPlusCircle },
  { path: '/store/orders', label: 'Orders', icon: FiShoppingBag },
  { path: '/store/profile', label: 'Store Profile', icon: FiUser },
];

export default function StoreLayout() {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => { await logout(); navigate('/'); };

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-60 bg-green-900 text-white flex flex-col">
        <div className="p-4 border-b border-green-700">
          <p className="font-bold text-yellow-400">🏪 Seller Hub</p>
          <p className="text-xs text-green-300 mt-1">{user?.store?.name || user?.name}</p>
        </div>
        <nav className="flex-1 py-4">
          {navItems.map(({ path, label, icon: Icon, exact }) => {
            const active = exact ? location.pathname === path : location.pathname.startsWith(path);
            return (
              <Link key={path} to={path}
                className={`flex items-center gap-3 px-4 py-3 text-sm transition hover:bg-green-700 ${active ? 'bg-green-600' : 'text-green-200'}`}>
                <Icon className="text-lg" />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>
        <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-green-400 hover:text-white hover:bg-green-700 border-t border-green-700 text-sm">
          <FiLogOut className="text-lg" />
          <span>Logout</span>
        </button>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow px-6 py-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-700">Seller Dashboard</h1>
          <Link to="/" className="text-sm text-blue-600 hover:underline">← Back to Store</Link>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
