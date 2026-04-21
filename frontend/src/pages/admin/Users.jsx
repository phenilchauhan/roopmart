// src/pages/admin/Users.jsx
import { useEffect, useState } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');

  const fetchUsers = () => api.get(`/admin/users${search?`?search=${search}`:''}`).then(r=>setUsers(r.data.data||r.data));
  useEffect(()=>{fetchUsers();},[]);

  const toggleBan = async (id) => {
    await api.post(`/admin/users/${id}/ban`);
    toast.success('User status updated');
    fetchUsers();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Users Management</h1>
      <div className="flex gap-3 mb-4">
        <input value={search} onChange={e=>setSearch(e.target.value)} onKeyDown={e=>e.key==='Enter'&&fetchUsers()}
          placeholder="Search by name or email..." className="border rounded-xl px-4 py-2 text-sm outline-none focus:border-blue-500 w-72" />
        <button onClick={fetchUsers} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition">Search</button>
      </div>
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500"><tr>{['Name','Email','Phone','Status','Joined','Action'].map(h=><th key={h} className="text-left px-4 py-3 font-medium">{h}</th>)}</tr></thead>
          <tbody className="divide-y">
            {users.map(user=>(
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-xs">{user.name?.[0]}</div>
                  {user.name}
                </td>
                <td className="px-4 py-3 text-gray-500">{user.email}</td>
                <td className="px-4 py-3 text-gray-500">{user.phone||'-'}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${user.is_active?'bg-green-100 text-green-700':'bg-red-100 text-red-700'}`}>
                    {user.is_active?'Active':'Banned'}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-400">{new Date(user.created_at).toLocaleDateString('en-IN')}</td>
                <td className="px-4 py-3">
                  <button onClick={()=>toggleBan(user.id)} className={`px-3 py-1 rounded-lg text-xs font-medium transition ${user.is_active?'bg-red-100 text-red-700 hover:bg-red-200':'bg-green-100 text-green-700 hover:bg-green-200'}`}>
                    {user.is_active?'Ban':'Unban'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
