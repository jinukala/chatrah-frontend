import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Loader2, CheckCircle, XCircle, Send, Download } from 'lucide-react';

export default function Attendance() {
  const { user } = useAuth();
  if (user?.role === 'STUDENT') return <StudentAttendance />;
  return <MarkAttendance />;
}

function StudentAttendance() {
  const [records, setRecords] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('monthly');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [leaveForm, setLeaveForm] = useState({ fromDate: '', toDate: '', reason: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchAttendance(); fetchLeaves(); }, [month, year]);

  const fetchAttendance = async () => {
    setLoading(true);
    try { const res = await api.get(`/attendance/student/me?month=${month}&year=${year}`); setRecords(res.data); }
    catch (e) {} finally { setLoading(false); }
  };
  const fetchLeaves = async () => { try { const res = await api.get('/leaves/my'); setLeaves(res.data); } catch (e) {} };

  const applyLeave = async (e) => {
    e.preventDefault(); setSubmitting(true);
    try { await api.post('/leaves', leaveForm); setShowLeaveForm(false); setLeaveForm({ fromDate: '', toDate: '', reason: '' }); fetchLeaves(); }
    catch (e) { alert(e.response?.data?.message || 'Error'); } finally { setSubmitting(false); }
  };

  const present = records.filter(r => r.present).length;
  const total = records.length;
  const pct = total > 0 ? ((present / total) * 100).toFixed(1) : 0;
  const weekStart = new Date(); weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const displayRecords = view === 'weekly' ? records.filter(r => new Date(r.date) >= weekStart) : records;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#7b1113]">My Attendance</h1>
        <button onClick={() => setShowLeaveForm(true)} className="flex items-center gap-2 px-4 py-2 bg-[#7b1113] text-white rounded-lg hover:bg-[#5c0d0f] text-sm font-medium"><Send className="w-4 h-4" />Apply Leave</button>
      </div>
      <div className="flex gap-3 mb-4">
        <select value={view} onChange={e => setView(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
          <option value="monthly">Monthly</option><option value="weekly">This Week</option>
        </select>
        {view === 'monthly' && (<>
          <select value={month} onChange={e => setMonth(Number(e.target.value))} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
            {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((m, i) => <option key={i} value={i+1}>{m}</option>)}
          </select>
          <select value={year} onChange={e => setYear(Number(e.target.value))} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
            {[2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </>)}
      </div>
      <div className="bg-white border border-[#7b1113]/10 rounded-xl shadow-sm p-6 mb-6">
        <div className="flex gap-8">
          <div><p className="text-sm text-gray-500">Total Days</p><p className="text-2xl font-bold">{total}</p></div>
          <div><p className="text-sm text-gray-500">Present</p><p className="text-2xl font-bold text-green-600">{present}</p></div>
          <div><p className="text-sm text-gray-500">Absent</p><p className="text-2xl font-bold text-red-500">{total - present}</p></div>
          <div><p className="text-sm text-gray-500">Percentage</p><p className="text-2xl font-bold">{pct}%</p></div>
        </div>
      </div>
      {loading ? <Loader2 className="w-6 h-6 animate-spin text-[#7b1113] mx-auto" /> : displayRecords.length > 0 && (
        <div className="bg-white border border-[#7b1113]/10 rounded-xl shadow-sm overflow-hidden mb-6">
          <table className="w-full text-sm">
            <thead className="bg-[#7b1113]/5 border-b"><tr><th className="text-left px-4 py-3 text-gray-600">Date</th><th className="text-center px-4 py-3 text-gray-600">Status</th></tr></thead>
            <tbody>{displayRecords.slice().reverse().map((r, i) => (
              <tr key={i} className="border-b border-gray-100"><td className="px-4 py-3">{r.date}</td><td className="px-4 py-3 text-center">{r.present ? <span className="text-green-600 font-medium">Present</span> : <span className="text-red-500 font-medium">Absent</span>}</td></tr>
            ))}</tbody>
          </table>
        </div>
      )}
      {leaves.length > 0 && (
        <div><h2 className="text-lg font-semibold mb-3">My Leave Applications</h2>
          <div className="bg-white border border-[#7b1113]/10 rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm"><thead className="bg-[#7b1113]/5 border-b"><tr><th className="text-left px-4 py-3 text-gray-600">From</th><th className="text-left px-4 py-3 text-gray-600">To</th><th className="text-left px-4 py-3 text-gray-600">Reason</th><th className="text-center px-4 py-3 text-gray-600">Status</th></tr></thead>
              <tbody>{leaves.map(l => (<tr key={l.id} className="border-b border-gray-100"><td className="px-4 py-3">{l.fromDate}</td><td className="px-4 py-3">{l.toDate}</td><td className="px-4 py-3">{l.reason}</td><td className="px-4 py-3 text-center"><span className={`px-2 py-1 rounded-full text-xs font-medium ${l.status === 'APPROVED' ? 'bg-green-100 text-green-700' : l.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{l.status}</span></td></tr>))}</tbody>
            </table></div></div>
      )}
      {showLeaveForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl p-6">
            <h2 className="text-lg font-bold mb-4">Apply for Leave</h2>
            <form onSubmit={applyLeave} className="space-y-3">
              <input type="date" required value={leaveForm.fromDate} onChange={e => setLeaveForm({...leaveForm, fromDate: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              <input type="date" required value={leaveForm.toDate} onChange={e => setLeaveForm({...leaveForm, toDate: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              <textarea required value={leaveForm.reason} onChange={e => setLeaveForm({...leaveForm, reason: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Reason" rows={3} />
              <div className="flex gap-2">
                <button type="submit" disabled={submitting} className="flex-1 py-2.5 bg-[#7b1113] text-white rounded-lg text-sm font-medium disabled:opacity-50">{submitting ? 'Submitting...' : 'Submit'}</button>
                <button type="button" onClick={() => setShowLeaveForm(false)} className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function MarkAttendance() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [tab, setTab] = useState('mark');
  const [saved, setSaved] = useState(false);

  useEffect(() => { api.get('/classes').then(r => setClasses(r.data)).catch(() => {}); fetchLeaves(); }, []);

  useEffect(() => {
    if (!selectedClass) { setStudents([]); return; }
    setLoading(true); setSaved(false);
    // Use large size to load ALL students in a class (classes rarely exceed 100)
    api.get(`/students?classId=${selectedClass}&page=0&size=200&sortBy=rollNo&sortDir=asc`).then(r => {
      setStudents(r.data);
      const att = {};
      r.data.forEach(s => att[s.id] = true);
      setAttendance(att);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [selectedClass]);

  const fetchLeaves = async () => { try { const r = await api.get('/leaves/pending'); setPendingLeaves(r.data); } catch (e) {} };

  const toggle = (id) => { setSaved(false); setAttendance(prev => ({ ...prev, [id]: !prev[id] })); };
  const markAll = (val) => { setSaved(false); const att = {}; students.forEach(s => att[s.id] = val); setAttendance(att); };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await api.post('/attendance/mark', {
        classId: Number(selectedClass), date, session: 'MORNING',
        students: students.map(s => ({ studentId: s.id, present: attendance[s.id] }))
      });
      setSaved(true);
    } catch (e) { alert(e.response?.data?.message || 'Error marking attendance'); }
    finally { setSubmitting(false); }
  };

  const exportToExcel = () => {
    const selectedClassObj = classes.find(c => String(c.id) === String(selectedClass));
    const className = selectedClassObj ? `Class_${selectedClassObj.className}_${selectedClassObj.section}` : 'Attendance';
    let csv = 'Roll No,Student Name,Status\n';
    students.forEach(s => {
      csv += `${s.rollNo},"${s.name}",${attendance[s.id] ? 'Present' : 'Absent'}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Attendance_${className}_${date}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLeaveAction = async (id, action) => {
    try { await api.put(`/leaves/${id}/${action}`, { remarks: '' }); fetchLeaves(); } catch (e) { alert('Error'); }
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-[#7b1113]">Attendance</h1>
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button onClick={() => setTab('mark')} className={`px-3 py-1.5 rounded-md text-sm font-medium ${tab === 'mark' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>Mark</button>
          <button onClick={() => setTab('leaves')} className={`px-3 py-1.5 rounded-md text-sm font-medium relative ${tab === 'leaves' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>
            Leaves {pendingLeaves.length > 0 && <span className="ml-1 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">{pendingLeaves.length}</span>}
          </button>
        </div>
      </div>

      {tab === 'mark' && (
        <>
          <div className="flex flex-wrap gap-4 mb-6">
            <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
              <option value="">Select Class</option>
              {classes.map(c => <option key={c.id} value={c.id}>Class {c.className} - {c.section}</option>)}
            </select>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            {students.length > 0 && (
              <button onClick={exportToExcel} className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700">
                <Download className="w-4 h-4" />Export CSV
              </button>
            )}
          </div>

          {loading && <Loader2 className="w-6 h-6 animate-spin text-[#7b1113] mx-auto" />}

          {!loading && students.length > 0 && (
            <div className="bg-white border border-[#7b1113]/10 rounded-xl shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-[#7b1113]/5 border-b">
                <span className="text-sm text-gray-600 font-medium">{students.length} Students</span>
                <div className="flex gap-2">
                  <button onClick={() => markAll(true)} className="px-4 py-2 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700 active:scale-95 transition-all shadow">✓ All Present</button>
                  <button onClick={() => markAll(false)} className="px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 active:scale-95 transition-all shadow">✗ All Absent</button>
                </div>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-[#7b1113]/5 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 w-16">Roll</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Student Name</th>
                    <th className="text-center px-4 py-3 font-medium text-gray-600 w-32">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(s => (
                    <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-600">
                        <span className="font-mono text-xs text-gray-400">{s.studentUniqueId || '—'}</span>
                        <span className="mx-1 text-gray-300">·</span>{s.rollNo}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">{s.name}</td>
                      <td className="px-4 py-3 text-center">
                        <div className="inline-flex rounded-lg overflow-hidden border border-gray-200">
                          <button onClick={() => { setSaved(false); setAttendance(prev => ({ ...prev, [s.id]: true })); }}
                            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-bold transition-all ${attendance[s.id] ? 'bg-green-600 text-white' : 'bg-white text-gray-400 hover:bg-green-50'}`}>
                            <CheckCircle className="w-3.5 h-3.5" />Present
                          </button>
                          <button onClick={() => { setSaved(false); setAttendance(prev => ({ ...prev, [s.id]: false })); }}
                            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-bold border-l border-gray-200 transition-all ${!attendance[s.id] ? 'bg-red-600 text-white' : 'bg-white text-gray-400 hover:bg-red-50'}`}>
                            <XCircle className="w-3.5 h-3.5" />Absent
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="p-4 border-t border-gray-200 flex items-center gap-4">
                <button onClick={handleSubmit} disabled={submitting} className="px-6 py-2.5 bg-[#7b1113] text-white rounded-lg text-sm font-medium hover:bg-[#5c0d0f] disabled:opacity-50 flex items-center gap-2">
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}Save Attendance
                </button>
              </div>

              {saved && (() => {
                const presentList = students.filter(s => attendance[s.id]);
                const absentList  = students.filter(s => !attendance[s.id]);
                return (
                  <div className="border-t border-gray-100 p-4 space-y-3">
                    <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Attendance saved — {presentList.length} Present, {absentList.length} Absent
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                        <p className="text-xs font-bold text-green-700 mb-2">✓ Present ({presentList.length})</p>
                        <div className="space-y-1 max-h-48 overflow-y-auto">
                          {presentList.map(s => (
                            <p key={s.id} className="text-xs text-green-800"><span className="font-mono text-green-600">{s.studentUniqueId || `Roll ${s.rollNo}`}</span> — {s.name}</p>
                          ))}
                          {presentList.length === 0 && <p className="text-xs text-green-400 italic">None</p>}
                        </div>
                      </div>
                      <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                        <p className="text-xs font-bold text-red-700 mb-2">✗ Absent ({absentList.length})</p>
                        <div className="space-y-1 max-h-48 overflow-y-auto">
                          {absentList.map(s => (
                            <p key={s.id} className="text-xs text-red-800"><span className="font-mono text-red-600">{s.studentUniqueId || `Roll ${s.rollNo}`}</span> — {s.name}</p>
                          ))}
                          {absentList.length === 0 && <p className="text-xs text-red-400 italic">None</p>}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </>
      )}

      {tab === 'leaves' && (
        <div className="bg-white border border-[#7b1113]/10 rounded-xl shadow-sm overflow-hidden">
          {pendingLeaves.length === 0 ? <p className="text-center py-8 text-gray-400">No pending leave requests</p> : (
            <table className="w-full text-sm">
              <thead className="bg-[#7b1113]/5 border-b"><tr><th className="text-left px-4 py-3 text-gray-600">Student</th><th className="text-left px-4 py-3 text-gray-600">Class</th><th className="text-left px-4 py-3 text-gray-600">From</th><th className="text-left px-4 py-3 text-gray-600">To</th><th className="text-left px-4 py-3 text-gray-600">Reason</th><th className="text-center px-4 py-3 text-gray-600">Action</th></tr></thead>
              <tbody>
                {pendingLeaves.map(l => (
                  <tr key={l.id} className="border-b border-gray-100">
                    <td className="px-4 py-3 font-medium">{l.studentName}</td>
                    <td className="px-4 py-3">{l.className}{l.section ? `-${l.section}` : ''}</td>
                    <td className="px-4 py-3">{l.fromDate}</td>
                    <td className="px-4 py-3">{l.toDate}</td>
                    <td className="px-4 py-3">{l.reason}</td>
                    <td className="px-4 py-3 text-center flex gap-1 justify-center">
                      <button onClick={() => handleLeaveAction(l.id, 'approve')} className="px-3 py-1.5 bg-green-100 text-green-700 rounded text-xs font-medium hover:bg-green-200">Approve</button>
                      <button onClick={() => handleLeaveAction(l.id, 'reject')} className="px-3 py-1.5 bg-red-100 text-red-700 rounded text-xs font-medium hover:bg-red-200">Reject</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
