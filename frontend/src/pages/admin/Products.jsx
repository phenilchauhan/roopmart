// src/pages/admin/Products.jsx
import { useEffect, useState } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { StatusBadge } from './Dashboard';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [filter, setFilter] = useState('pending');
  const fetch = () => api.get(`/admin/products?status=${filter}`).then(r=>setProducts(r.data.data||r.data));
  useEffect(()=>{fetch();},[filter]);
  const approve = async id => { await api.post(`/admin/products/${id}/approve`); toast.success('Approved'); fetch(); };
  const del = async id => { if(window.confirm('Delete?')){ await api.delete(`/admin/products/${id}`); fetch(); }};

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Products Management</h1>
      <div className="flex gap-2 mb-4">
        {['pending','all'].map(s=><button key={s} onClick={()=>setFilter(s)} className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition border ${filter===s?'bg-blue-600 text-white':'bg-white text-gray-600'}`}>{s==='pending'?'Pending Approval':'All Products'}</button>)}
      </div>
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500"><tr>{['Product','Store','Price','Stock','Status','Actions'].map(h=><th key={h} className="text-left px-4 py-3 font-medium">{h}</th>)}</tr></thead>
          <tbody className="divide-y">
            {products.map(p=>(
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <img src={(Array.isArray(p.images)?p.images[0]:p.images)||`https://picsum.photos/seed/${p.id}/40/40`} alt="" className="w-10 h-10 rounded-lg object-contain bg-gray-50 border" />
                    <div>
                      <p className="font-medium line-clamp-1">{p.name}</p>
                      <p className="text-xs text-gray-400">{p.category?.name}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-500">{p.store?.name}</td>
                <td className="px-4 py-3 font-bold">₹{Number(p.sale_price||p.price).toLocaleString('en-IN')}</td>
                <td className="px-4 py-3">{p.stock}</td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.is_approved?'bg-green-100 text-green-700':'bg-yellow-100 text-yellow-700'}`}>{p.is_approved?'Approved':'Pending'}</span></td>
                <td className="px-4 py-3 flex gap-2">
                  {!p.is_approved&&<button onClick={()=>approve(p.id)} className="bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1 rounded text-xs font-medium transition">Approve</button>}
                  <button onClick={()=>del(p.id)} className="bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1 rounded text-xs font-medium transition">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
