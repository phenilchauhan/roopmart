// src/pages/auth/RegisterPage.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/stores';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [form, setForm] = useState({ name:'',email:'',phone:'',password:'',password_confirmation:'' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.password_confirmation) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created successfully!');
      navigate('/');
    } catch (err) {
      const errors = err.response?.data?.errors;
      if (errors) Object.values(errors).forEach(e => toast.error(e[0]));
      else toast.error('Registration failed');
    }
    setLoading(false);
  };

  const fields = [
    { key:'name', label:'Full Name', type:'text', placeholder:'Your full name' },
    { key:'email', label:'Email', type:'email', placeholder:'you@example.com' },
    { key:'phone', label:'Phone Number', type:'tel', placeholder:'10-digit mobile number' },
    { key:'password', label:'Password', type:'password', placeholder:'Min 8 characters' },
    { key:'password_confirmation', label:'Confirm Password', type:'password', placeholder:'Repeat password' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center px-4 py-10">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-6">
          <div className="bg-yellow-400 text-blue-900 font-black text-2xl px-4 py-2 rounded-xl inline-block mb-3">RM</div>
          <h1 className="text-2xl font-black text-gray-800">Create Account</h1>
          <p className="text-gray-500 text-sm">Join millions of happy shoppers</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map(({key,label,type,placeholder}) => (
            <div key={key}>
              <label className="text-sm font-medium text-gray-700 mb-1 block">{label}</label>
              <input type={type} value={form[key]} onChange={e => setForm({...form,[key]:e.target.value})}
                placeholder={placeholder} required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition" />
            </div>
          ))}
          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition disabled:opacity-50">
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account? <Link to="/login" className="text-blue-600 font-semibold hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}


// src/pages/auth/StoreRegisterPage.jsx
export function StoreRegisterPage() {
  const [form, setForm] = useState({
    name:'',email:'',phone:'',password:'',password_confirmation:'',
    store_name:'',gst_number:'',pan_number:'',store_address:'',city:'',state:'',pincode:''
  });
  const [loading, setLoading] = useState(false);
  const { storeRegister } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await storeRegister(form);
      toast.success('Store registered! Awaiting admin approval.');
      navigate('/store');
    } catch (err) {
      const errors = err.response?.data?.errors;
      if (errors) Object.values(errors).forEach(e => toast.error(e[0]));
      else toast.error('Registration failed');
    }
    setLoading(false);
  };

  const input = (key, label, type='text', placeholder='') => (
    <div key={key}>
      <label className="text-sm font-medium text-gray-700 mb-1 block">{label}</label>
      <input type={type} value={form[key]} onChange={e => setForm({...form,[key]:e.target.value})}
        placeholder={placeholder}
        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-500 transition" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center px-4 py-10">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-8">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🏪</div>
          <h1 className="text-2xl font-black text-gray-800">Become a Seller</h1>
          <p className="text-gray-500 text-sm">Start selling on RoopMart today</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2">👤 Personal Details</h3>
            <div className="grid grid-cols-2 gap-3">
              {input('name','Full Name','text','Your name')}
              {input('email','Email','email','you@email.com')}
              {input('phone','Phone','tel','10-digit number')}
              {input('password','Password','password','Min 8 chars')}
              <div className="col-span-2">{input('password_confirmation','Confirm Password','password','Repeat password')}</div>
            </div>
          </div>
          <div>
            <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2">🏪 Store Details</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">{input('store_name','Store Name','text','Your store name')}</div>
              {input('gst_number','GST Number (optional)','text','22AAAAA0000A1Z5')}
              {input('pan_number','PAN Number (optional)','text','ABCDE1234F')}
              <div className="col-span-2">{input('store_address','Store Address','text','Full address')}</div>
              {input('city','City','text','Your city')}
              {input('state','State','text','Your state')}
              <div className="col-span-2">{input('pincode','Pincode','text','6-digit pincode')}</div>
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition disabled:opacity-50">
            {loading ? 'Submitting...' : 'Register as Seller →'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account? <Link to="/login" className="text-blue-600 font-semibold hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useAuthStore } from '../../store/stores';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';

export { StoreRegisterPage as default };
