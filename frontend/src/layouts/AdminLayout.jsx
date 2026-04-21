// src/layouts/AdminLayout.jsx
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/stores';
import {
  FiGrid, FiPackage, FiShoppingBag, FiUsers, FiStore,
  FiTag, FiImage, FiLogOut, FiPercent, FiMenu, FiX
} from 'react-icons/fi';
import { useState } from 'react';

const navItems = [
  { path: '/admin', label: 'Dashboard', icon: FiGrid, exact: true },
  { path: '/admin/products', label: 'Products', icon: FiPackage },
  { path: '/admin/orders', label: 'Orders', icon: FiShoppingBag },
  { path: '/admin/users', label: 'Users', icon: FiUsers },
  { path: '/admin/stores', label: 'Stores', icon: FiStore },
  { path: '/admin/categories', label: 'Categories', icon: FiTag },
  { path: '/admin/coupons', label: 'Coupons', icon: FiPercent },
  { path: '/admin/banners', label: 'Banners', icon: FiImage },
];

export default function AdminLayout() {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = async () => { await logout(); navigate('/'); };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-gray-900 text-white flex flex-col transition-all duration-300`}>
        <div className="p-4 flex items-center justify-between border-b border-gray-700">
          {sidebarOpen && <span className="font-bold text-yellow-400 text-lg">RoopMart Admin</span>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-400 hover:text-white">
            {sidebarOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
        <nav className="flex-1 py-4">
          {navItems.map(({ path, label, icon: Icon, exact }) => {
            const active = exact ? location.pathname === path : location.pathname.startsWith(path);
            return (
              <Link key={path} to={path}
                className={`flex items-center gap-3 px-4 py-3 text-sm transition hover:bg-gray-700 ${active ? 'bg-blue-600 text-white' : 'text-gray-300'}`}>
                <Icon className="text-lg shrink-0" />
                {sidebarOpen && <span>{label}</span>}
              </Link>
            );
          })}
        </nav>
        <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-700 border-t border-gray-700 text-sm">
          <FiLogOut className="text-lg shrink-0" />
          {sidebarOpen && <span>Logout</span>}
        </button>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow px-6 py-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-700">Admin Panel</h1>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
              {user?.name?.[0]}
            </div>
            <span>{user?.name}</span>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
