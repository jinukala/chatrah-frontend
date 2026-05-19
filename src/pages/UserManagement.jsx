import { useState } from 'react';
import api from '../services/api';
import { UserPlus, Loader2, CheckCircle } from 'lucide-react';

export default function UserManagement() {
  const [form, setForm] = useState({ username: '', password: '', role: 'PRINCIPAL' });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setMsg(''); setLoading(true);
    try {
      await api.post('/auth/create-user', form);
      setMsg(`User "${form.username}" created as ${form.role}`);
      setForm({ username: '', password: '', role: 'PRINCIPAL' });
    } catch (e) { setError(e.response?.data?.message || 'Error creating user'); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-[#7b1113] mb-6">User Management</h1>
      <div className="bg-white border border-[#7b1113]/10 rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <UserPlus className="w-5 h-5 text-[#7b1113]" />
          <h2 className="font-semibold text-gray-900">Create Admin User</h2>
        </div>
        {error && <div className="mb-3 p-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div>}
        {msg && <div className="mb-3 p-2 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg flex items-center gap-2"><CheckCircle className="w-4 h-4" />{msg}</div>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <input placeholder="Username" required value={form.username} onChange={e => setForm({...form, username: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          <input placeholder="Password" type="password" required value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          <select value={form.role} onChange={e => setForm({...form, role: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
            <option value="PRINCIPAL">Principal</option>
            <option value="CLERK">Clerk</option>
            <option value="SYS_ADMIN">System Admin</option>
          </select>
          <button type="submit" disabled={loading} className="w-full py-2.5 bg-[#7b1113] text-white rounded-lg text-sm font-medium hover:bg-[#5c0d0f] disabled:opacity-50 flex items-center justify-center gap-2">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}Create User
          </button>
        </form>
      </div>
    </div>
  );
}
