// src/pages/user/OrdersPage.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { FiPackage } from 'react-icons/fi';

const STATUS_COLORS = {
  pending:'bg-yellow-100 text-yellow-700',confirmed:'bg-blue-100 text-blue-700',
  processing:'bg-indigo-100 text-indigo-700',shipped:'bg-purple-100 text-purple-700',
  delivered:'bg-green-100 text-green-700',cancelled:'bg-red-100 text-red-700',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders').then(r => setOrders(r.data.data || r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"/></div>;

  if (orders.length === 0) return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <FiPackage className="text-6xl text-gray-300 mx-auto mb-4" />
      <h2 className="text-2xl font-bold mb-2">No Orders Yet</h2>
      <p className="text-gray-500 mb-6">Start shopping and your orders will appear here</p>
      <Link to="/products" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition">Shop Now</Link>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>
      <div className="space-y-4">
        {orders.map(order => (
          <Link key={order.id} to={`/orders/${order.id}`}
            className="block bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="font-mono text-blue-600 font-semibold">{order.order_number}</span>
                <span className="text-gray-400 text-sm ml-3">{new Date(order.created_at).toLocaleDateString('en-IN')}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[order.status]||'bg-gray-100 text-gray-600'}`}>{order.status}</span>
                <span className="font-bold text-gray-900">₹{Number(order.total).toLocaleString('en-IN')}</span>
              </div>
            </div>
            <div className="flex gap-3">
              {order.items?.slice(0,3).map(item => (
                <div key={item.id} className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
                  <img src={item.image||`https://picsum.photos/seed/${item.product_id}/40/40`} alt="" className="w-10 h-10 object-contain" />
                  <div>
                    <p className="text-xs font-medium line-clamp-1">{item.name}</p>
                    <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                  </div>
                </div>
              ))}
              {order.items?.length > 3 && <div className="flex items-center text-xs text-gray-400">+{order.items.length-3} more</div>}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
