import { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';

export default function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', subjects: '', qualification: '', phone: '', email: '', classTeacherOfId: '' });

  useEffect(() => { fetchTeachers(); fetchClasses(); }, []);
  const fetchTeachers = async () => { try { const res = await api.get('/teachers'); setTeachers(res.data); } catch (e) {} finally { setLoading(false); } };
  const fetchClasses = async () => { try { const res = await api.get('/classes'); setClasses(res.data); } catch (e) {} };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, mobile: form.phone, subject: form.subjects?.split(',')[0]?.trim(), classTeacherOfId: form.classTeacherOfId ? Number(form.classTeacherOfId) : null };
    try { editing ? await api.put(`/teachers/${editing}`, payload) : await api.post('/teachers', payload); setShowForm(false); setEditing(null); fetchTeachers(); } catch (e) { alert(e.response?.data?.message || 'Error'); }
  };

  const handleEdit = (t) => {
    setEditing(t.id);
    setForm({ name: t.name || '', subjects: t.subjects || t.subject || '', qualification: t.qualification || '', phone: t.mobile || '', email: t.email || '', classTeacherOfId: t.classTeacherOfId || '' });
    setShowForm(true);
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[#7b1113]" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#7b1113]">Teachers</h1>
        <button onClick={() => { setShowForm(true); setEditing(null); setForm({ name: '', subjects: '', qualification: '', phone: '', email: '', classTeacherOfId: '' }); }}
          className="flex items-center gap-2 px-4 py-2 bg-[#7b1113] text-white rounded-lg hover:bg-[#5c0d0f] transition text-sm font-medium"><Plus className="w-4 h-4" />Add Teacher</button>
      </div>
      {showForm && (
        <div className="bg-white border border-[#7b1113]/10 rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">{editing ? 'Edit' : 'Add'} Teacher</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <input placeholder="Full Name *" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            <input placeholder="Subjects (comma separated)" value={form.subjects} onChange={e => setForm({ ...form, subjects: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            <input placeholder="Qualification (e.g. M.Sc, B.Ed)" value={form.qualification} onChange={e => setForm({ ...form, qualification: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            <input placeholder="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            <input placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            <select value={form.classTeacherOfId} onChange={e => setForm({ ...form, classTeacherOfId: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
              <option value="">Class Teacher Of (optional)</option>
              {classes.map(c => <option key={c.id} value={c.id}>Class {c.className}{c.section ? ` - ${c.section}` : ''}</option>)}
            </select>
            <div className="flex gap-2 lg:col-span-3">
              <button type="submit" className="px-4 py-2 bg-[#7b1113] text-white rounded-lg text-sm font-medium">Save</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">Cancel</button>
            </div>
          </form>
        </div>
      )}
      <div className="bg-white border border-[#7b1113]/10 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#7b1113]/5 border-b border-[#7b1113]/10">
            <tr><th className="text-left px-4 py-3 font-medium text-gray-600">Name</th><th className="text-left px-4 py-3 font-medium text-gray-600">Subjects</th><th className="text-left px-4 py-3 font-medium text-gray-600">Qualification</th><th className="text-left px-4 py-3 font-medium text-gray-600">Class Teacher</th><th className="text-left px-4 py-3 font-medium text-gray-600">Phone</th><th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th></tr>
          </thead>
          <tbody>
            {teachers.length === 0 ? <tr><td colSpan="6" className="text-center py-8 text-gray-400">No teachers found</td></tr> : teachers.map(t => (
              <tr key={t.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{t.name}</td>
                <td className="px-4 py-3 text-gray-600">{t.subjects || t.subject}</td>
                <td className="px-4 py-3 text-gray-600">{t.qualification || '—'}</td>
                <td className="px-4 py-3 text-gray-600">{t.classTeacherOfName || '—'}</td>
                <td className="px-4 py-3 text-gray-600">{t.mobile}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => handleEdit(t)} className="p-1.5 text-gray-400 hover:text-[#7b1113]"><Pencil className="w-4 h-4" /></button>
                  <button onClick={async () => { if (confirm('Delete?')) { try { await api.delete(`/teachers/${t.id}`); fetchTeachers(); } catch (e) { alert(e.response?.data?.message || 'Failed to delete teacher'); } } }} className="p-1.5 text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
