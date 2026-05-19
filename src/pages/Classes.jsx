import { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';

export default function Classes() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ className: '', section: '', subjects: '' });

  useEffect(() => { fetch(); }, []);
  const fetch = async () => { try { const res = await api.get('/classes'); setClasses(res.data); } catch (e) {} finally { setLoading(false); } };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try { editing ? await api.put(`/classes/${editing}`, form) : await api.post('/classes', form); setShowForm(false); setEditing(null); fetch(); } catch (e) { alert('Error'); }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[#7b1113]" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#7b1113]">Classes</h1>
        <button onClick={() => { setShowForm(true); setEditing(null); setForm({ className: '', section: '', subjects: '' }); }}
          className="flex items-center gap-2 px-4 py-2 bg-[#7b1113] text-white rounded-lg hover:bg-[#5c0d0f] transition text-sm font-medium"><Plus className="w-4 h-4" />Add Class</button>
      </div>
      {showForm && (
        <div className="bg-white border border-[#7b1113]/10 rounded-xl shadow-sm p-6 mb-6">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input placeholder="Class Name (e.g. 10)" required value={form.className} onChange={e => setForm({ ...form, className: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            <input placeholder="Section (e.g. A)" value={form.section} onChange={e => setForm({ ...form, section: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            <input placeholder="Subjects (e.g. Telugu, Hindi, English, Maths, Science, Social)" value={form.subjects} onChange={e => setForm({ ...form, subjects: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm md:col-span-2" />
            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 bg-[#7b1113] text-white rounded-lg text-sm font-medium">Save</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">Cancel</button>
            </div>
          </form>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {classes.length === 0 ? <p className="text-gray-400 col-span-3 text-center py-8">No classes found</p> : classes.map(c => (
          <div key={c.id} className="bg-white border border-[#7b1113]/10 rounded-xl shadow-sm p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="font-semibold text-gray-900">Class {c.className}{c.section ? ` - ${c.section}` : ''}</p>
              <div className="flex gap-1">
                <button onClick={() => { setEditing(c.id); setForm({ className: c.className, section: c.section, subjects: c.subjects || '' }); setShowForm(true); }} className="p-1.5 text-gray-400 hover:text-[#7b1113]"><Pencil className="w-4 h-4" /></button>
                <button onClick={async () => { if (confirm('Delete?')) { try { await api.delete(`/classes/${c.id}`); fetch(); } catch (e) { alert(e.response?.data?.message || 'Failed'); } } }} className="p-1.5 text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
            {c.subjects && <p className="text-xs text-gray-500">{c.subjects}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
