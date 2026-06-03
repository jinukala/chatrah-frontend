import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';

export default function Students() {
  const { user } = useAuth();
  const isTeacher = user?.role === 'TEACHER';
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [filterClass, setFilterClass] = useState('');
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const pageSize = 20;
  const [form, setForm] = useState({ name: '', fatherName: '', motherName: '', rollNo: '', gender: '', dateOfBirth: '', parentMobile: '', email: '', classId: '', isHosteller: false, isTransportUser: false, iitNeetOpted: false, feeConcession: '' });

  useEffect(() => { fetchClasses(); }, []);
  useEffect(() => { fetchStudents(); }, [filterClass, page, search, sortBy, sortDir]);

  const fetchClasses = async () => {
    try {
      const res = await api.get('/classes');
      setClasses(res.data);
      if (isTeacher && user?.teacherId) {
        const myClass = res.data.find(c => c.classTeacherId === user.teacherId);
        if (myClass) setFilterClass(String(myClass.id));
      }
    } catch (e) {}
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const classParam = filterClass ? `&classId=${filterClass}` : '';
      const url = `/students?page=${page}&size=${pageSize}&search=${encodeURIComponent(search)}&sortBy=${sortBy}&sortDir=${sortDir}${classParam}`;
      const res = await api.get(url);
      setStudents(res.data);
      const total = res.headers['x-total-count'];
      if (total) setTotalCount(Number(total));
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, classId: form.classId ? Number(form.classId) : null, rollNo: form.rollNo ? Number(form.rollNo) : null, isHosteller: form.isHosteller, isTransportUser: form.isTransportUser, iitNeetOpted: form.iitNeetOpted, feeConcession: form.feeConcession ? Number(form.feeConcession) : 0 };
    try {
      if (editing) { await api.put(`/students/${editing}`, payload); }
      else { await api.post('/students', payload); }
      setShowForm(false); setEditing(null);
      setForm({ name: '', fatherName: '', motherName: '', rollNo: '', gender: '', dateOfBirth: '', parentMobile: '', email: '', classId: '', isHosteller: false, isTransportUser: false, iitNeetOpted: false });
      fetchStudents();
    } catch (e) { alert(e.response?.data?.message || 'Error saving student'); }
  };

  const handleEdit = (s) => {
    setEditing(s.id);
    setForm({ name: s.name || '', fatherName: s.fatherName || '', motherName: s.motherName || '', rollNo: s.rollNo || '', gender: s.gender || '', dateOfBirth: s.dateOfBirth || '', parentMobile: s.parentMobile || '', email: s.email || '', classId: s.classId || '', isHosteller: s.isHosteller || false, isTransportUser: s.isTransportUser || false, iitNeetOpted: s.iitNeetOpted || false, feeConcession: s.feeConcession || '' });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this student?')) {
      try { await api.delete(`/students/${id}`); fetchStudents(); } catch (e) { alert(e.response?.data?.message || 'Failed to delete'); }
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[#7b1113]" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-[#7b1113]">Students</h1>
        <div className="flex items-center gap-3">
          {!isTeacher && (
            <select value={filterClass} onChange={e => { setFilterClass(e.target.value); setPage(0); }} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
              <option value="">All Classes</option>
              {classes.map(c => <option key={c.id} value={c.id}>Class {c.className}{c.section ? ` - ${c.section}` : ''}</option>)}
            </select>
          )}
          {isTeacher && filterClass && <span className="text-sm text-gray-500 font-medium">Class {classes.find(c => String(c.id) === filterClass)?.className} - {classes.find(c => String(c.id) === filterClass)?.section}</span>}
          <button onClick={() => { setShowForm(true); setEditing(null); setForm({ name: '', fatherName: '', motherName: '', rollNo: '', gender: '', dateOfBirth: '', parentMobile: '', email: '', classId: '', isHosteller: false, isTransportUser: false, iitNeetOpted: false }); }}
            className="flex items-center gap-2 px-4 py-2 bg-[#7b1113] text-white rounded-lg hover:bg-[#5c0d0f] transition text-sm font-medium">
            <Plus className="w-4 h-4" />Add Student
          </button>
        </div>
      </div>

      {/* Search & Sort — always visible */}
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          placeholder="Search by name, roll no, or SVV ID..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(0); }}
          className="flex-1 min-w-[220px] px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#7b1113] outline-none"
        />
        <select value={sortBy} onChange={e => { setSortBy(e.target.value); setPage(0); }} className="px-3 py-2 border border-gray-200 rounded-xl text-sm">
          <option value="name">Sort: Name</option>
          <option value="rollNo">Sort: Roll No</option>
          <option value="studentUniqueId">Sort: Student ID</option>
          <option value="classRoom">Sort: Class</option>
        </select>
        <button onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')} className="px-3 py-2 border border-gray-200 rounded-xl text-sm hover:bg-gray-50 font-medium">
          {sortDir === 'asc' ? '↑ Asc' : '↓ Desc'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-[#7b1113]/10 rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">{editing ? 'Edit' : 'Add'} Student</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <input placeholder="Student Name *" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            <input placeholder="Father's Name" value={form.fatherName} onChange={e => setForm({ ...form, fatherName: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            <input placeholder="Mother's Name" value={form.motherName} onChange={e => setForm({ ...form, motherName: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            <input placeholder="Roll No" type="number" value={form.rollNo} onChange={e => setForm({ ...form, rollNo: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            <select value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
              <option value="">Select Gender</option><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option>
            </select>
            <input placeholder="Date of Birth" type="date" value={form.dateOfBirth} onChange={e => setForm({ ...form, dateOfBirth: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            <select value={form.classId} onChange={e => setForm({ ...form, classId: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
              <option value="">Select Class</option>
              {classes.map(c => <option key={c.id} value={c.id}>Class {c.className}{c.section ? ` - ${c.section}` : ''}</option>)}
            </select>
            <input placeholder="Parent Mobile" value={form.parentMobile} onChange={e => setForm({ ...form, parentMobile: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            <input placeholder="Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={form.isHosteller} onChange={e => setForm({ ...form, isHosteller: e.target.checked })} className="w-4 h-4 rounded border-gray-300 text-[#7b1113]" />
              Hosteller
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={form.isTransportUser} onChange={e => setForm({ ...form, isTransportUser: e.target.checked })} className="w-4 h-4 rounded border-gray-300 text-[#7b1113]" />
              Transport User
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={form.iitNeetOpted} onChange={e => setForm({ ...form, iitNeetOpted: e.target.checked })} className="w-4 h-4 rounded border-gray-300 text-[#7b1113]" />
              IIT/NEET Batch
            </label>
            <input type="number" placeholder="Fee Concession (₹)" value={form.feeConcession} onChange={e => setForm({ ...form, feeConcession: e.target.value })} className={`px-3 py-2 border border-gray-300 rounded-lg text-sm ${isTeacher ? 'hidden' : ''}`} />
            <div className="flex gap-2 lg:col-span-3">
              <button type="submit" className="px-4 py-2 bg-[#7b1113] text-white rounded-lg text-sm font-medium hover:bg-[#5c0d0f]">Save</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white border border-[#7b1113]/10 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#7b1113]/5 border-b border-[#7b1113]/10">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">ID</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Father</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Class</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Roll</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Mobile</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr><td colSpan="7" className="text-center py-8 text-gray-400">No students found</td></tr>
            ) : students.map(s => (
              <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 text-xs text-gray-400 font-mono">{s.studentUniqueId || '—'}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{s.name}</td>
                <td className="px-4 py-3 text-gray-600">{s.fatherName}</td>
                <td className="px-4 py-3 text-gray-600">{s.className}{s.section ? ` - ${s.section}` : ''}</td>
                <td className="px-4 py-3 text-gray-600">{s.rollNo}</td>
                <td className="px-4 py-3 text-gray-600">{s.parentMobile}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => handleEdit(s)} className="p-1.5 text-gray-400 hover:text-[#7b1113]"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(s.id)} className="p-1.5 text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Pagination — always show when there's data */}
      {totalCount > pageSize && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-gray-500">Showing {page * pageSize + 1}–{Math.min((page + 1) * pageSize, totalCount)} of {totalCount}</p>
          <div className="flex gap-2">
            <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50">← Previous</button>
            <button disabled={(page + 1) * pageSize >= totalCount} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50">Next →</button>
          </div>
        </div>
      )}
    </div>
  );
}
