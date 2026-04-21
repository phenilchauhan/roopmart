// src/pages/store/Dashboard.jsx
import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { FiPackage, FiShoppingBag, FiDollarSign, FiClock } from 'react-icons/fi';
import { Link } from 'react-router-dom';

export default function StoreDashboard() {
  const [stats, setStats] = useState(null);
  useEffect(() => { api.get('/store/dashboard').then(r=>setStats(r.data)); }, []);
  if (!stats) return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full"/></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Seller Dashboard</h1>
        <p className="text-gray-500 text-sm">Manage your products and orders</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: FiPackage, label:'Products', val: stats.total_products, color:'bg-blue-500', link:'/store/products' },
          { icon: FiShoppingBag, label:'Orders', val: stats.total_orders, color:'bg-purple-500', link:'/store/orders' },
          { icon: FiDollarSign, label:'Revenue', val:`₹${Number(stats.total_revenue||0).toLocaleString('en-IN')}`, color:'bg-green-500' },
          { icon: FiClock, label:'Pending', val: stats.pending_orders, color:'bg-orange-500', link:'/store/orders' },
        ].map(({icon:Icon,label,val,color,link})=>(
          <Link to={link||'#'} key={label} className="bg-white rounded-xl p-5 border shadow-sm hover:shadow-md transition flex items-center gap-4">
            <div className={`p-3 rounded-xl ${color}`}><Icon className="text-xl text-white"/></div>
            <div><p className="text-sm text-gray-500">{label}</p><p className="text-xl font-black">{val}</p></div>
          </Link>
        ))}
      </div>
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b flex justify-between">
          <h2 className="font-bold">Recent Orders</h2>
          <Link to="/store/orders" className="text-blue-600 text-sm hover:underline">View All</Link>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500"><tr>{['Product','Customer','Qty','Amount','Status'].map(h=><th key={h} className="text-left px-4 py-3 font-medium">{h}</th>)}</tr></thead>
          <tbody className="divide-y">
            {stats.recent_orders?.map(item=>(
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">{item.product?.name}</td>
                <td className="px-4 py-3">{item.order?.user?.name}</td>
                <td className="px-4 py-3">{item.quantity}</td>
                <td className="px-4 py-3 font-bold">₹{Number(item.total).toLocaleString('en-IN')}</td>
                <td className="px-4 py-3"><span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full text-xs capitalize">{item.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


// src/pages/store/AddProduct.jsx
export function AddProductPage() {
  const [form, setForm] = useState({ name:'',category_id:'',price:'',sale_price:'',stock:'',description:'',brand:'',sku:'' });
  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { api.get('/categories').then(r=>setCategories(r.data)); },[]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/store/products', form);
      if (images.length > 0) {
        const fd = new FormData();
        images.forEach(img => fd.append('images[]', img));
        await api.post(`/store/products/${res.data.product.id}/images`, fd, { headers:{'Content-Type':'multipart/form-data'} });
      }
      toast.success('Product added! Awaiting admin approval.');
      navigate('/store/products');
    } catch (err) {
      const errors = err.response?.data?.errors;
      if (errors) Object.values(errors).forEach(e=>toast.error(e[0]));
      else toast.error('Failed to add product');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Add New Product</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border shadow-sm p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="text-sm font-medium text-gray-700 mb-1 block">Product Name *</label>
            <input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-500" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Category *</label>
            <select value={form.category_id} onChange={e=>setForm({...form,category_id:e.target.value})} required className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-500">
              <option value="">Select Category</option>
              {categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Brand</label>
            <input value={form.brand} onChange={e=>setForm({...form,brand:e.target.value})} className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-500" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Price (₹) *</label>
            <input type="number" value={form.price} onChange={e=>setForm({...form,price:e.target.value})} required className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-500" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Sale Price (₹)</label>
            <input type="number" value={form.sale_price} onChange={e=>setForm({...form,sale_price:e.target.value})} className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-500" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Stock *</label>
            <input type="number" value={form.stock} onChange={e=>setForm({...form,stock:e.target.value})} required className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-500" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">SKU</label>
            <input value={form.sku} onChange={e=>setForm({...form,sku:e.target.value})} className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-500" />
          </div>
          <div className="col-span-2">
            <label className="text-sm font-medium text-gray-700 mb-1 block">Description *</label>
            <textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} required rows={4} className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-500 resize-none" />
          </div>
          <div className="col-span-2">
            <label className="text-sm font-medium text-gray-700 mb-1 block">Product Images</label>
            <input type="file" multiple accept="image/*" onChange={e=>setImages(Array.from(e.target.files))}
              className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-500" />
            {images.length > 0 && <p className="text-xs text-gray-400 mt-1">{images.length} image(s) selected</p>}
          </div>
        </div>
        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-3 rounded-xl transition disabled:opacity-50">
            {loading ? 'Adding...' : 'Add Product'}
          </button>
          <button type="button" onClick={()=>navigate('/store/products')} className="border px-6 py-3 rounded-xl text-sm font-medium hover:bg-gray-50 transition">Cancel</button>
        </div>
      </form>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export { AddProductPage as default };
