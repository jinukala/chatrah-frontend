import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Loader2, Send } from 'lucide-react';

export default function Leaves() {
  const { user } = useAuth();
  if (user?.role === 'STUDENT') return <StudentLeaves />;
  if (user?.role === 'TEACHER') return <TeacherLeaves />;
  return <AdminLeaves />;
}

function StudentLeaves() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ fromDate: '', toDate: '', reason: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchLeaves(); }, []);
  const fetchLeaves = async () => { try { const r = await api.get('/leaves/my'); setLeaves(r.data); } catch(e){} finally { setLoading(false); } };

  const applyLeave = async (e) => {
    e.preventDefault(); setSubmitting(true);
    try { await api.post('/leaves', form); setShowForm(false); setForm({ fromDate: '', toDate: '', reason: '' }); fetchLeaves(); }
    catch (e) { alert(e.response?.data?.message || 'Error'); }
    finally { setSubmitting(false); }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-[#7b1113]" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#7b1113]">My Leaves</h1>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-[#7b1113] text-white rounded-lg hover:bg-[#5c0d0f] text-sm font-medium"><Send className="w-4 h-4" />Apply Leave</button>
      </div>

      {showForm && (
        <div className="bg-white border border-[#7b1113]/10 rounded-xl shadow-sm p-6 mb-6">
          <form onSubmit={applyLeave} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input type="date" required value={form.fromDate} onChange={e => setForm({...form, fromDate: e.target.value})} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            <input type="date" required value={form.toDate} onChange={e => setForm({...form, toDate: e.target.value})} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            <input placeholder="Reason" required value={form.reason} onChange={e => setForm({...form, reason: e.target.value})} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            <div className="flex gap-2">
              <button type="submit" disabled={submitting} className="px-4 py-2 bg-[#7b1113] text-white rounded-lg text-sm font-medium">{submitting ? 'Submitting...' : 'Submit'}</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white border border-[#7b1113]/10 rounded-xl shadow-sm overflow-hidden">
        {leaves.length === 0 ? <p className="text-center py-8 text-gray-400">No leave applications yet</p> : (
          <table className="w-full text-sm">
            <thead className="bg-[#7b1113]/5 border-b"><tr><th className="text-left px-4 py-3 text-gray-600">From</th><th className="text-left px-4 py-3 text-gray-600">To</th><th className="text-left px-4 py-3 text-gray-600">Reason</th><th className="text-center px-4 py-3 text-gray-600">Status</th><th className="text-left px-4 py-3 text-gray-600">Remarks</th></tr></thead>
            <tbody>
              {leaves.map(l => (
                <tr key={l.id} className="border-b border-gray-100">
                  <td className="px-4 py-3">{l.fromDate}</td>
                  <td className="px-4 py-3">{l.toDate}</td>
                  <td className="px-4 py-3">{l.reason}</td>
                  <td className="px-4 py-3 text-center"><span className={`px-2 py-1 rounded-full text-xs font-medium ${l.status === 'APPROVED' ? 'bg-green-100 text-green-700' : l.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{l.status}</span></td>
                  <td className="px-4 py-3 text-gray-500">{l.remarks || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function TeacherLeaves() {
  const [leaves, setLeaves] = useState([]);
  const [myLeaves, setMyLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('student');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ fromDate: '', toDate: '', reason: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchAll(); }, []);
  const fetchAll = async () => {
    try { const [r1, r2] = await Promise.all([api.get('/leaves/pending'), api.get('/teacher-leaves/my')]); setLeaves(r1.data); setMyLeaves(r2.data); }
    catch(e) {} finally { setLoading(false); }
  };

  const handleAction = async (id, action) => {
    try { await api.put(`/leaves/${id}/${action}`, {}); setLeaves(prev => prev.filter(l => l.id !== id)); } catch(e) { alert('Error'); }
  };

  const applyLeave = async (e) => {
    e.preventDefault(); setSubmitting(true);
    try { await api.post('/teacher-leaves', form); setShowForm(false); setForm({ fromDate: '', toDate: '', reason: '' }); fetchAll(); }
    catch (e) { alert('Error'); } finally { setSubmitting(false); }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-[#7b1113]" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#7b1113]">Leave Management</h1>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-[#7b1113] text-white rounded-xl text-sm font-medium hover:bg-[#5c0d0f]"><Send className="w-4 h-4" />Apply My Leave</button>
      </div>
      <div className="flex bg-[#7b1113]/5 rounded-xl p-1 mb-6">
        <button onClick={() => setTab('student')} className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === 'student' ? 'bg-[#7b1113] text-white' : 'text-gray-600'}`}>Student Leaves {leaves.length > 0 && `(${leaves.length})`}</button>
        <button onClick={() => setTab('my')} className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === 'my' ? 'bg-[#7b1113] text-white' : 'text-gray-600'}`}>My Leaves</button>
      </div>
      {showForm && (
        <div className="bg-white border border-[#7b1113]/10 rounded-xl shadow-sm p-6 mb-6">
          <form onSubmit={applyLeave} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input type="date" required value={form.fromDate} onChange={e => setForm({...form, fromDate: e.target.value})} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            <input type="date" required value={form.toDate} onChange={e => setForm({...form, toDate: e.target.value})} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            <input placeholder="Reason" required value={form.reason} onChange={e => setForm({...form, reason: e.target.value})} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            <div className="flex gap-2"><button type="submit" disabled={submitting} className="px-4 py-2 bg-[#7b1113] text-white rounded-lg text-sm">{submitting ? 'Submitting...' : 'Submit'}</button><button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-100 rounded-lg text-sm">Cancel</button></div>
          </form>
        </div>
      )}
      {tab === 'student' && (
        <div className="bg-white border border-[#7b1113]/10 rounded-xl shadow-sm overflow-hidden">
          {leaves.length === 0 ? <p className="text-center py-8 text-gray-400">No pending student leaves</p> : (
            <table className="w-full text-sm"><thead className="bg-[#7b1113]/5"><tr><th className="text-left px-4 py-3 text-gray-600">Student</th><th className="text-left px-4 py-3 text-gray-600">Class</th><th className="text-left px-4 py-3 text-gray-600">From</th><th className="text-left px-4 py-3 text-gray-600">To</th><th className="text-left px-4 py-3 text-gray-600">Reason</th><th className="text-center px-4 py-3 text-gray-600">Action</th></tr></thead>
              <tbody>{leaves.map(l => (<tr key={l.id} className="border-b border-gray-100"><td className="px-4 py-3 font-medium">{l.studentName}</td><td className="px-4 py-3">{l.className}-{l.section}</td><td className="px-4 py-3">{l.fromDate}</td><td className="px-4 py-3">{l.toDate}</td><td className="px-4 py-3">{l.reason}</td><td className="px-4 py-3 text-center flex gap-1 justify-center"><button onClick={() => handleAction(l.id, 'approve')} className="px-3 py-1.5 bg-green-100 text-green-700 rounded text-xs font-medium">Approve</button><button onClick={() => handleAction(l.id, 'reject')} className="px-3 py-1.5 bg-red-100 text-red-700 rounded text-xs font-medium">Reject</button></td></tr>))}</tbody>
            </table>
          )}
        </div>
      )}
      {tab === 'my' && (
        <div className="bg-white border border-[#7b1113]/10 rounded-xl shadow-sm overflow-hidden">
          {myLeaves.length === 0 ? <p className="text-center py-8 text-gray-400">No leave applications</p> : (
            <table className="w-full text-sm"><thead className="bg-[#7b1113]/5"><tr><th className="text-left px-4 py-3 text-gray-600">From</th><th className="text-left px-4 py-3 text-gray-600">To</th><th className="text-left px-4 py-3 text-gray-600">Reason</th><th className="text-center px-4 py-3 text-gray-600">Status</th></tr></thead>
              <tbody>{myLeaves.map(l => (<tr key={l.id} className="border-b border-gray-100"><td className="px-4 py-3">{l.fromDate}</td><td className="px-4 py-3">{l.toDate}</td><td className="px-4 py-3">{l.reason}</td><td className="px-4 py-3 text-center"><span className={`px-2 py-1 rounded-full text-xs font-medium ${l.status === 'APPROVED' ? 'bg-green-100 text-green-700' : l.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{l.status}</span></td></tr>))}</tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}


function AdminLeaves() {
  const [studentLeaves, setStudentLeaves] = useState([]);
  const [teacherLeaves, setTeacherLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('teacher');

  useEffect(() => { fetchAll(); }, []);
  const fetchAll = async () => {
    try { const [r1, r2] = await Promise.all([api.get('/leaves/pending'), api.get('/teacher-leaves/pending')]); setStudentLeaves(r1.data); setTeacherLeaves(r2.data); }
    catch(e) {} finally { setLoading(false); }
  };

  const handleStudentAction = async (id, action) => { try { await api.put(`/leaves/${id}/${action}`, {}); setStudentLeaves(prev => prev.filter(l => l.id !== id)); } catch(e) {} };
  const handleTeacherAction = async (id, action) => { try { await api.put(`/teacher-leaves/${id}/${action}`); setTeacherLeaves(prev => prev.filter(l => l.id !== id)); } catch(e) {} };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-[#7b1113]" /></div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#7b1113] mb-6">Leave Approvals</h1>
      <div className="flex bg-[#7b1113]/5 rounded-xl p-1 mb-6">
        <button onClick={() => setTab('teacher')} className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === 'teacher' ? 'bg-[#7b1113] text-white' : 'text-gray-600'}`}>Teacher Leaves {teacherLeaves.length > 0 && `(${teacherLeaves.length})`}</button>
        <button onClick={() => setTab('student')} className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === 'student' ? 'bg-[#7b1113] text-white' : 'text-gray-600'}`}>Student Leaves {studentLeaves.length > 0 && `(${studentLeaves.length})`}</button>
      </div>

      {tab === 'teacher' && (
        <div className="bg-white border border-[#7b1113]/10 rounded-xl shadow-sm overflow-hidden">
          {teacherLeaves.length === 0 ? <p className="text-center py-8 text-gray-400">No pending teacher leaves</p> : (
            <table className="w-full text-sm"><thead className="bg-[#7b1113]/5"><tr><th className="text-left px-4 py-3 text-gray-600">Teacher</th><th className="text-left px-4 py-3 text-gray-600">From</th><th className="text-left px-4 py-3 text-gray-600">To</th><th className="text-left px-4 py-3 text-gray-600">Reason</th><th className="text-center px-4 py-3 text-gray-600">Action</th></tr></thead>
              <tbody>{teacherLeaves.map(l => (<tr key={l.id} className="border-b border-gray-100"><td className="px-4 py-3 font-medium">{l.teacherName}</td><td className="px-4 py-3">{l.fromDate}</td><td className="px-4 py-3">{l.toDate}</td><td className="px-4 py-3">{l.reason}</td><td className="px-4 py-3 text-center flex gap-1 justify-center"><button onClick={() => handleTeacherAction(l.id, 'approve')} className="px-3 py-1.5 bg-green-100 text-green-700 rounded text-xs font-medium">Approve</button><button onClick={() => handleTeacherAction(l.id, 'reject')} className="px-3 py-1.5 bg-red-100 text-red-700 rounded text-xs font-medium">Reject</button></td></tr>))}</tbody>
            </table>
          )}
        </div>
      )}

      {tab === 'student' && (
        <div className="bg-white border border-[#7b1113]/10 rounded-xl shadow-sm overflow-hidden">
          {studentLeaves.length === 0 ? <p className="text-center py-8 text-gray-400">No pending student leaves</p> : (
            <table className="w-full text-sm"><thead className="bg-[#7b1113]/5"><tr><th className="text-left px-4 py-3 text-gray-600">Student</th><th className="text-left px-4 py-3 text-gray-600">Class</th><th className="text-left px-4 py-3 text-gray-600">From</th><th className="text-left px-4 py-3 text-gray-600">To</th><th className="text-left px-4 py-3 text-gray-600">Reason</th><th className="text-center px-4 py-3 text-gray-600">Action</th></tr></thead>
              <tbody>{studentLeaves.map(l => (<tr key={l.id} className="border-b border-gray-100"><td className="px-4 py-3 font-medium">{l.studentName}</td><td className="px-4 py-3">{l.className}-{l.section}</td><td className="px-4 py-3">{l.fromDate}</td><td className="px-4 py-3">{l.toDate}</td><td className="px-4 py-3">{l.reason}</td><td className="px-4 py-3 text-center flex gap-1 justify-center"><button onClick={() => handleStudentAction(l.id, 'approve')} className="px-3 py-1.5 bg-green-100 text-green-700 rounded text-xs font-medium">Approve</button><button onClick={() => handleStudentAction(l.id, 'reject')} className="px-3 py-1.5 bg-red-100 text-red-700 rounded text-xs font-medium">Reject</button></td></tr>))}</tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
