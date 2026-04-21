// src/pages/user/ProfilePage.jsx
import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useAuthStore } from '../../store/stores';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiPhone, FiEdit2, FiSave } from 'react-icons/fi';

export default function ProfilePage() {
  const { user, fetchMe } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '' });

  useEffect(() => {
    if (user) setForm({ name: user.name || '', phone: user.phone || '' });
  }, [user]);

  const handleSave = async () => {
    await api.put('/profile', form);
    await fetchMe();
    toast.success('Profile updated');
    setEditing(false);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>
      <div className="bg-white rounded-2xl border shadow-sm p-6">
        {/* Avatar */}
        <div className="flex items-center gap-5 mb-6 pb-6 border-b">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white text-3xl font-black">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">{user?.name}</h2>
            <p className="text-gray-500 text-sm">{user?.email}</p>
            <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full capitalize mt-1 inline-block">{user?.role}</span>
          </div>
        </div>

        {/* Fields */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-600 flex items-center gap-2"><FiUser />Full Name</label>
            {editing ? (
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                className="mt-1 w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500" />
            ) : (
              <p className="mt-1 text-gray-800 font-medium">{user?.name}</p>
            )}
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600 flex items-center gap-2"><FiMail />Email</label>
            <p className="mt-1 text-gray-800 font-medium">{user?.email}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600 flex items-center gap-2"><FiPhone />Phone</label>
            {editing ? (
              <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                className="mt-1 w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500" />
            ) : (
              <p className="mt-1 text-gray-800 font-medium">{user?.phone || 'Not added'}</p>
            )}
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          {editing ? (
            <>
              <button onClick={handleSave} className="bg-blue-600 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 transition flex items-center gap-2">
                <FiSave /> Save Changes
              </button>
              <button onClick={() => setEditing(false)} className="border px-5 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 transition">Cancel</button>
            </>
          ) : (
            <button onClick={() => setEditing(true)} className="bg-gray-100 hover:bg-gray-200 px-5 py-2 rounded-xl text-sm font-medium transition flex items-center gap-2">
              <FiEdit2 /> Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
