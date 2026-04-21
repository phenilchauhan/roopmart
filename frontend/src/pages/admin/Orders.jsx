// src/pages/admin/Orders.jsx
import { useEffect, useState } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { StatusBadge } from './Dashboard';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('');

  const fetchOrders = () => api.get(`/admin/orders${filter?`?status=${filter}`:''}`).then(r=>setOrders(r.data.data||r.data));
  useEffect(() => { fetchOrders(); }, [filter]);

  const updateStatus = async (id, status) => {
    await api.put(`/admin/orders/${id}/status`, { status });
    toast.success('Status updated');
    fetchOrders();
  };

  const STATUSES = ['pending','confirmed','processing','shipped','delivered','cancelled'];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Orders Management</h1>
      <div className="flex gap-2 mb-4 flex-wrap">
        <button onClick={()=>setFilter('')} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${!filter?'bg-blue-600 text-white':'bg-white text-gray-600 hover:bg-gray-50'}`}>All</button>
        {STATUSES.map(s=>(
          <button key={s} onClick={()=>setFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium border capitalize transition ${filter===s?'bg-blue-600 text-white':'bg-white text-gray-600 hover:bg-gray-50'}`}>{s}</button>
        ))}
      </div>
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500"><tr>{['Order#','Customer','Items','Total','Payment','Status','Update'].map(h=><th key={h} className="text-left px-4 py-3 font-medium">{h}</th>)}</tr></thead>
          <tbody className="divide-y">
            {orders.map(order=>(
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-blue-600 text-xs">{order.order_number}</td>
                <td className="px-4 py-3">{order.user?.name}</td>
                <td className="px-4 py-3 text-gray-500">{order.items?.length} item(s)</td>
                <td className="px-4 py-3 font-bold">₹{Number(order.total).toLocaleString('en-IN')}</td>
                <td className="px-4 py-3"><StatusBadge status={order.payment_status} /></td>
                <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
                <td className="px-4 py-3">
                  <select value={order.status} onChange={e=>updateStatus(order.id,e.target.value)}
                    className="border rounded-lg px-2 py-1 text-xs outline-none focus:border-blue-500">
                    {STATUSES.map(s=><option key={s} value={s} className="capitalize">{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
            {orders.length===0&&<tr><td colSpan={7} className="text-center py-10 text-gray-400">No orders found</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
