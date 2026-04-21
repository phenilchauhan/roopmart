// src/pages/admin/Dashboard.jsx
import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { FiUsers, FiPackage, FiShoppingBag, FiDollarSign, FiStore, FiClock } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const StatCard = ({ icon: Icon, title, value, color, link }) => (
  <Link to={link || '#'} className={`bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition flex items-center gap-4`}>
    <div className={`p-3 rounded-xl ${color}`}><Icon className="text-xl text-white" /></div>
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-black text-gray-800">{value}</p>
    </div>
  </Link>
);

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/admin/dashboard').then(res => setStats(res.data));
  }, []);

  if (!stats) return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="text-gray-500 text-sm">Welcome back! Here's what's happening.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard icon={FiUsers} title="Total Users" value={stats.total_users} color="bg-blue-500" link="/admin/users" />
        <StatCard icon={FiStore} title="Stores" value={stats.total_stores} color="bg-green-500" link="/admin/stores" />
        <StatCard icon={FiPackage} title="Products" value={stats.total_products} color="bg-purple-500" link="/admin/products" />
        <StatCard icon={FiShoppingBag} title="Orders" value={stats.total_orders} color="bg-orange-500" link="/admin/orders" />
        <StatCard icon={FiDollarSign} title="Revenue" value={`₹${Number(stats.revenue||0).toLocaleString('en-IN')}`} color="bg-emerald-500" />
        <StatCard icon={FiClock} title="Pending" value={stats.pending_orders} color="bg-red-500" link="/admin/orders" />
      </div>

      {/* Alert Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {stats.pending_stores > 0 && (
          <Link to="/admin/stores" className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center gap-3 hover:bg-yellow-100 transition">
            <span className="text-2xl">🏪</span>
            <div>
              <p className="font-semibold text-yellow-800">{stats.pending_stores} Store(s) Awaiting Approval</p>
              <p className="text-xs text-yellow-600">Click to review and approve stores</p>
            </div>
          </Link>
        )}
        {stats.pending_orders > 0 && (
          <Link to="/admin/orders" className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-center gap-3 hover:bg-orange-100 transition">
            <span className="text-2xl">📦</span>
            <div>
              <p className="font-semibold text-orange-800">{stats.pending_orders} Orders Pending</p>
              <p className="text-xs text-orange-600">Click to manage orders</p>
            </div>
          </Link>
        )}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="font-bold text-gray-800">Recent Orders</h2>
          <Link to="/admin/orders" className="text-blue-600 text-sm hover:underline">View All</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                {['Order#','Customer','Amount','Status','Date'].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {stats.recent_orders?.map(order => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-blue-600">{order.order_number}</td>
                  <td className="px-4 py-3">{order.user?.name}</td>
                  <td className="px-4 py-3 font-semibold">₹{Number(order.total).toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-3 text-gray-400">{new Date(order.created_at).toLocaleDateString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function StatusBadge({ status }) {
  const colors = {
    pending:    'bg-yellow-100 text-yellow-700',
    confirmed:  'bg-blue-100 text-blue-700',
    processing: 'bg-indigo-100 text-indigo-700',
    shipped:    'bg-purple-100 text-purple-700',
    delivered:  'bg-green-100 text-green-700',
    cancelled:  'bg-red-100 text-red-700',
    returned:   'bg-gray-100 text-gray-700',
    paid:       'bg-green-100 text-green-700',
    failed:     'bg-red-100 text-red-700',
    approved:   'bg-green-100 text-green-700',
    rejected:   'bg-red-100 text-red-700',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${colors[status] || 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  );
}
