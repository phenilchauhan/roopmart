// src/pages/admin/Stores.jsx
import { useEffect, useState } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { StatusBadge } from './Dashboard';

export default function AdminStores() {
  const [stores, setStores] = useState([]);
  const [filter, setFilter] = useState('pending');

  const fetchStores = async () => {
    const res = await api.get(`/admin/stores?status=${filter}`);
    setStores(res.data.data || res.data);
  };

  useEffect(() => { fetchStores(); }, [filter]);

  const approve = async (id) => {
    await api.post(`/admin/stores/${id}/approve`);
    toast.success('Store approved');
    fetchStores();
  };
  const reject = async (id) => {
    await api.post(`/admin/stores/${id}/reject`);
    toast.success('Store rejected');
    fetchStores();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Stores Management</h1>
      <div className="flex gap-2 mb-4">
        {['pending','approved','rejected','all'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition ${filter===s?'bg-blue-600 text-white':'bg-white border text-gray-600 hover:bg-gray-50'}`}>
            {s}
          </button>
        ))}
      </div>
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>{['Store','Owner','Contact','Status','Registered','Actions'].map(h=><th key={h} className="text-left px-4 py-3 font-medium">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y">
            {stores.map(store => (
              <tr key={store.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <p className="font-semibold">{store.name}</p>
                  <p className="text-xs text-gray-400">{store.city}, {store.state}</p>
                </td>
                <td className="px-4 py-3">{store.user?.name}</td>
                <td className="px-4 py-3 text-gray-500">{store.user?.email}</td>
                <td className="px-4 py-3"><StatusBadge status={store.status} /></td>
                <td className="px-4 py-3 text-gray-400">{new Date(store.created_at).toLocaleDateString('en-IN')}</td>
                <td className="px-4 py-3 flex gap-2">
                  {store.status === 'pending' && (
                    <>
                      <button onClick={() => approve(store.id)} className="bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1 rounded-lg text-xs font-medium transition">Approve</button>
                      <button onClick={() => reject(store.id)} className="bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1 rounded-lg text-xs font-medium transition">Reject</button>
                    </>
                  )}
                  {store.status === 'approved' && (
                    <button onClick={() => reject(store.id)} className="bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1 rounded-lg text-xs font-medium transition">Suspend</button>
                  )}
                </td>
              </tr>
            ))}
            {stores.length === 0 && (
              <tr><td colSpan={6} className="text-center py-10 text-gray-400">No stores found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
