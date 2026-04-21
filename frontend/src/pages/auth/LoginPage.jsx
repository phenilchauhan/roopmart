// src/pages/auth/LoginPage.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/stores';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(form.email, form.password);
      toast.success('Welcome back!');
      if (data.role === 'admin') navigate('/admin');
      else if (data.role === 'store') navigate('/store');
      else navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="bg-yellow-400 text-blue-900 font-black text-2xl px-4 py-2 rounded-xl inline-block mb-3">RM</div>
          <h1 className="text-2xl font-black text-gray-800">Welcome Back!</h1>
          <p className="text-gray-500 text-sm mt-1">Login to your RoopMart account</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Email</label>
            <input type="email" value={form.email} onChange={e => setForm({...form,email:e.target.value})}
              placeholder="you@example.com" required
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Password</label>
            <input type="password" value={form.password} onChange={e => setForm({...form,password:e.target.value})}
              placeholder="••••••••" required
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4" /> : null}
            Login
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-6">
          New to RoopMart?{' '}
          <Link to="/register" className="text-blue-600 font-semibold hover:underline">Create Account</Link>
        </p>
        <p className="text-center text-sm text-gray-500 mt-2">
          Want to sell?{' '}
          <Link to="/seller/register" className="text-green-600 font-semibold hover:underline">Become a Seller</Link>
        </p>
      </div>
    </div>
  );
}
