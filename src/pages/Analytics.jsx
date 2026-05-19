import { useState, useEffect } from 'react';
import api from '../services/api';
import { Loader2, Download, Users, BookOpen, ClipboardList } from 'lucide-react';

export default function Analytics() {
  const [tab, setTab] = useState('overview');
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/classes'), api.get('/teachers')])
      .then(([c, t]) => { setClasses(c.data); setTeachers(t.data); })
      .catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[#7b1113]" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#7b1113]">Analytics & Management</h1>
          <p className="text-sm text-gray-500">School-wide insights and teacher assignments</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-[#7b1113]/5 rounded-xl p-1 mb-6 overflow-x-auto">
        {['overview', 'attendance', 'assignments', 'students', 'export'].map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${tab === t ? 'bg-[#7b1113] text-white shadow' : 'text-gray-600 hover:text-[#7b1113]'}`}>
            {t === 'overview' ? '📊 Overview' : t === 'attendance' ? '📋 Attendance' : t === 'assignments' ? '👨‍🏫 Teacher Assignments' : t === 'students' ? '🔍 Student Lookup' : '📥 Export Data'}
          </button>
        ))}
      </div>

      {tab === 'overview' && <OverviewTab classes={classes} teachers={teachers} />}
      {tab === 'attendance' && <AttendanceTab classes={classes} />}
      {tab === 'assignments' && <AssignmentsTab classes={classes} teachers={teachers} />}
      {tab === 'students' && <StudentLookupTab />}
      {tab === 'export' && <ExportTab classes={classes} />}
    </div>
  );
}

function OverviewTab({ classes, teachers }) {
  const [stats, setStats] = useState(null);
  useEffect(() => {
    api.get('/students').then(r => setStats({ students: r.data.length })).catch(() => setStats({ students: 0 }));
  }, []);

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 text-white">
          <Users className="w-6 h-6 mb-2 opacity-80" />
          <p className="text-3xl font-bold">{stats?.students || 0}</p>
          <p className="text-sm opacity-80">Total Students</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-5 text-white">
          <Users className="w-6 h-6 mb-2 opacity-80" />
          <p className="text-3xl font-bold">{teachers.length}</p>
          <p className="text-sm opacity-80">Total Teachers</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-5 text-white">
          <BookOpen className="w-6 h-6 mb-2 opacity-80" />
          <p className="text-3xl font-bold">{classes.length}</p>
          <p className="text-sm opacity-80">Total Classes</p>
        </div>
        <div className="bg-gradient-to-br from-[#7b1113] to-[#5c0d0f] rounded-2xl p-5 text-white">
          <ClipboardList className="w-6 h-6 mb-2 opacity-80" />
          <p className="text-3xl font-bold">{classes.length * 10}</p>
          <p className="text-sm opacity-80">Avg Students/Class</p>
        </div>
      </div>

      <h3 className="font-semibold text-[#7b1113] mb-3">Classes Overview</h3>
      <div className="bg-white border border-[#7b1113]/10 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#7b1113]/5"><tr><th className="text-left px-4 py-3 text-gray-600">Class</th><th className="text-left px-4 py-3 text-gray-600">Section</th><th className="text-left px-4 py-3 text-gray-600">Class Teacher</th><th className="text-left px-4 py-3 text-gray-600">Subjects</th></tr></thead>
          <tbody>
            {classes.map(c => {
              const teacher = teachers.find(t => t.id === c.classTeacherId);
              return (
                <tr key={c.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{c.className}</td>
                  <td className="px-4 py-3">{c.section}</td>
                  <td className="px-4 py-3">{teacher?.name || <span className="text-orange-500 text-xs">Not Assigned</span>}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{c.subjects || '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AttendanceTab({ classes }) {
  const [selectedClass, setSelectedClass] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [records, setRecords] = useState([]);
  const [attLoading, setAttLoading] = useState(false);

  const loadAttendance = async () => {
    if (!selectedClass) return;
    setAttLoading(true);
    try { const r = await api.get(`/attendance/class/${selectedClass}?date=${date}`); setRecords(r.data); }
    catch (e) { setRecords([]); } finally { setAttLoading(false); }
  };

  const exportCSV = () => {
    let csv = 'Student,Status\n';
    records.forEach(r => { csv += `"${r.studentName}",${r.present ? 'Present' : 'Absent'}\n`; });
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `Attendance_${date}.csv`; a.click();
  };

  const present = records.filter(r => r.present).length;
  const absent = records.filter(r => !r.present).length;

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-6">
        <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-xl text-sm">
          <option value="">Select Class</option>
          {classes.map(c => <option key={c.id} value={c.id}>Class {c.className} - {c.section}</option>)}
        </select>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-xl text-sm" />
        <button onClick={loadAttendance} className="px-4 py-2 bg-[#7b1113] text-white rounded-xl text-sm font-medium hover:bg-[#5c0d0f]">Load</button>
        {records.length > 0 && <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-medium"><Download className="w-4 h-4" />Export</button>}
      </div>

      {records.length > 0 && (
        <>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-blue-50 rounded-xl p-4 text-center"><p className="text-2xl font-bold text-blue-600">{records.length}</p><p className="text-xs text-gray-500">Total</p></div>
            <div className="bg-green-50 rounded-xl p-4 text-center"><p className="text-2xl font-bold text-green-600">{present}</p><p className="text-xs text-gray-500">Present</p></div>
            <div className="bg-red-50 rounded-xl p-4 text-center"><p className="text-2xl font-bold text-red-600">{absent}</p><p className="text-xs text-gray-500">Absent</p></div>
          </div>
          <div className="bg-white border border-[#7b1113]/10 rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[#7b1113]/5"><tr><th className="text-left px-4 py-3 text-gray-600">Student</th><th className="text-center px-4 py-3 text-gray-600">Status</th></tr></thead>
              <tbody>
                {records.map((r, i) => (
                  <tr key={i} className="border-t border-gray-100">
                    <td className="px-4 py-3 font-medium">{r.studentName}</td>
                    <td className="px-4 py-3 text-center"><span className={`px-2 py-1 rounded-full text-xs font-medium ${r.present ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{r.present ? 'Present' : 'Absent'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      {attLoading && <Loader2 className="w-6 h-6 animate-spin text-[#7b1113] mx-auto" />}
    </div>
  );
}

function AssignmentsTab({ classes, teachers }) {
  const [assignForm, setAssignForm] = useState({ classId: '', teacherId: '' });
  const [subjectForm, setSubjectForm] = useState({ classId: '', subject: '', teacherId: '' });
  const [subjectAssignments, setSubjectAssignments] = useState([]);
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [saving, setSaving] = useState(false);

  const assignClassTeacher = async () => {
    if (!assignForm.classId || !assignForm.teacherId) return;
    setSaving(true);
    try {
      const cls = classes.find(c => String(c.id) === assignForm.classId);
      await api.put(`/classes/${assignForm.classId}`, { classTeacherId: Number(assignForm.teacherId), className: cls?.className, section: cls?.section });
      alert('Class teacher assigned!'); window.location.reload();
    } catch (e) { alert('Error'); } finally { setSaving(false); }
  };

  const loadSubjectAssignments = async (classId) => {
    setSubjectForm({ ...subjectForm, classId });
    const cls = classes.find(c => String(c.id) === classId);
    setSubjectOptions(cls?.subjects ? cls.subjects.split(',').map(s => s.trim()) : []);
    if (classId) {
      try { const r = await api.get(`/classes/${classId}/subject-teachers`); setSubjectAssignments(r.data); } catch (e) { setSubjectAssignments([]); }
    } else { setSubjectAssignments([]); }
  };

  const assignSubjectTeacher = async () => {
    if (!subjectForm.classId || !subjectForm.subject || !subjectForm.teacherId) { alert('Select all fields'); return; }
    try {
      await api.post(`/classes/${subjectForm.classId}/subject-teachers`, { subject: subjectForm.subject, teacherId: Number(subjectForm.teacherId) });
      loadSubjectAssignments(subjectForm.classId);
      setSubjectForm({ ...subjectForm, subject: '', teacherId: '' });
    } catch (e) { alert('Error'); }
  };

  const removeAssignment = async (id) => {
    if (!confirm('Remove this assignment?')) return;
    try { await api.delete(`/classes/${subjectForm.classId}/subject-teachers/${id}`); loadSubjectAssignments(subjectForm.classId); } catch (e) {}
  };

  return (
    <div>
      {/* Assign Class Teacher */}
      <div className="bg-white border border-[#7b1113]/10 rounded-2xl shadow-sm p-6 mb-6">
        <h3 className="font-semibold text-[#7b1113] mb-4">Assign Class Teacher</h3>
        <div className="flex flex-wrap gap-3">
          <select value={assignForm.classId} onChange={e => setAssignForm({...assignForm, classId: e.target.value})} className="px-3 py-2 border border-gray-200 rounded-xl text-sm">
            <option value="">Select Class</option>
            {classes.map(c => <option key={c.id} value={c.id}>Class {c.className} - {c.section}</option>)}
          </select>
          <select value={assignForm.teacherId} onChange={e => setAssignForm({...assignForm, teacherId: e.target.value})} className="px-3 py-2 border border-gray-200 rounded-xl text-sm">
            <option value="">Select Teacher</option>
            {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <button onClick={assignClassTeacher} disabled={saving} className="px-5 py-2 bg-[#7b1113] text-white rounded-xl text-sm font-medium hover:bg-[#5c0d0f] disabled:opacity-50">Assign</button>
        </div>
      </div>

      {/* Assign Subject Teachers */}
      <div className="bg-white border border-[#7b1113]/10 rounded-2xl shadow-sm p-6 mb-6">
        <h3 className="font-semibold text-[#7b1113] mb-4">Assign Subject Teachers</h3>
        <div className="flex flex-wrap gap-3 mb-4">
          <select value={subjectForm.classId} onChange={e => loadSubjectAssignments(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-xl text-sm">
            <option value="">Select Class</option>
            {classes.map(c => <option key={c.id} value={c.id}>Class {c.className} - {c.section}</option>)}
          </select>
          {subjectForm.classId && (
            <>
              <select value={subjectForm.subject} onChange={e => setSubjectForm({...subjectForm, subject: e.target.value})} className="px-3 py-2 border border-gray-200 rounded-xl text-sm">
                <option value="">Select Subject</option>
                {subjectOptions.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <select value={subjectForm.teacherId} onChange={e => setSubjectForm({...subjectForm, teacherId: e.target.value})} className="px-3 py-2 border border-gray-200 rounded-xl text-sm">
                <option value="">Select Teacher</option>
                {teachers.map(t => <option key={t.id} value={t.id}>{t.name} ({t.subjects || t.subject || ''})</option>)}
              </select>
              <button onClick={assignSubjectTeacher} className="px-5 py-2 bg-[#d4a017] text-white rounded-xl text-sm font-medium hover:bg-[#b8891a]">Assign Subject</button>
            </>
          )}
        </div>

        {subjectAssignments.length > 0 && (
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[#7b1113]/5"><tr><th className="text-left px-4 py-2 text-gray-600">Subject</th><th className="text-left px-4 py-2 text-gray-600">Teacher</th><th className="text-left px-4 py-2 text-gray-600">Mobile</th><th className="text-center px-4 py-2 text-gray-600">Action</th></tr></thead>
              <tbody>
                {subjectAssignments.map(sa => (
                  <tr key={sa.id} className="border-t border-gray-100">
                    <td className="px-4 py-2 font-medium">{sa.subject}</td>
                    <td className="px-4 py-2">{sa.teacherName}</td>
                    <td className="px-4 py-2 text-gray-500">{sa.teacherMobile}</td>
                    <td className="px-4 py-2 text-center"><button onClick={() => removeAssignment(sa.id)} className="text-red-500 text-xs hover:underline">Remove</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Current Class Teacher Assignments */}
      <h3 className="font-semibold text-[#7b1113] mb-3">All Class Teacher Assignments</h3>
      <div className="bg-white border border-[#7b1113]/10 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#7b1113]/5"><tr><th className="text-left px-4 py-3 text-gray-600">Class</th><th className="text-left px-4 py-3 text-gray-600">Class Teacher</th><th className="text-left px-4 py-3 text-gray-600">Subjects</th><th className="text-left px-4 py-3 text-gray-600">Qualification</th></tr></thead>
          <tbody>
            {classes.map(c => {
              const teacher = teachers.find(t => t.id === c.classTeacherId);
              return (
                <tr key={c.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">Class {c.className} - {c.section}</td>
                  <td className="px-4 py-3">{teacher ? <span className="text-[#7b1113] font-medium">{teacher.name}</span> : <span className="text-orange-500 text-xs bg-orange-50 px-2 py-1 rounded">Unassigned</span>}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{teacher?.subjects || '—'}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{teacher?.qualification || '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StudentLookupTab() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => { api.get('/classes').then(r => setClasses(r.data)).catch(() => {}); }, []);

  useEffect(() => {
    if (!selectedClass) { setStudents([]); return; }
    api.get(`/classes/${selectedClass}/students`).then(r => setStudents(r.data)).catch(() => setStudents([]));
  }, [selectedClass]);

  const viewStudent = async (s) => {
    setSelectedStudent(s); setDetailLoading(true);
    try {
      const [feeRes, attRes, examRes, quizRes, blogRes] = await Promise.all([
        api.get(`/fees/student/${s.id}/summary`).catch(() => ({ data: null })),
        api.get(`/attendance/student/${s.id}/summary`).catch(() => ({ data: null })),
        api.get('/exams').then(async (exams) => {
          const results = await Promise.all(exams.data.map(e => api.get(`/exams/${e.id}/student/${s.id}`).then(r => r.data).catch(() => null)));
          return results.filter(r => r && r.subjects?.length > 0);
        }).catch(() => []),
        api.get(`/quizzes/class/${selectedClass}`).then(async (quizRes) => {
          const quizList = quizRes.data.filter(q => q.published);
          const withResults = await Promise.all(quizList.map(async q => {
            try { const r = await api.get(`/quizzes/${q.id}/results`); const attempt = r.data.find(a => a.studentName === s.name); return { ...q, score: attempt?.score, correct: attempt?.correct, total: attempt?.total }; }
            catch (e) { return q; }
          }));
          return withResults;
        }).catch(() => []),
        api.get('/blogs/approved').catch(() => ({ data: [] })),
      ]);
      // Filter blogs by this student's userId
      const studentBlogs = (blogRes.data || []).filter(b => b.authorName === s.name);
      setDetail({ fee: feeRes.data, attendance: attRes.data, exams: examRes, quizzes: quizRes || [], blogs: studentBlogs });
    } catch (e) { setDetail(null); }
    setDetailLoading(false);
  };

  return (
    <div>
      <div className="flex gap-3 mb-6">
        <select value={selectedClass} onChange={e => { setSelectedClass(e.target.value); setSelectedStudent(null); setDetail(null); }} className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm">
          <option value="">Select Class</option>
          {classes.map(c => <option key={c.id} value={c.id}>Class {c.className} - {c.section}</option>)}
        </select>
        {students.length > 0 && (
          <select onChange={e => { if (e.target.value) { const s = students.find(x => String(x.id) === e.target.value); if (s) viewStudent(s); } }} className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm flex-1">
            <option value="">Select Student</option>
            {students.map(s => <option key={s.id} value={s.id}>{s.name} (Roll {s.rollNo})</option>)}
          </select>
        )}
      </div>

      {detailLoading && <Loader2 className="w-6 h-6 animate-spin text-[#7b1113] mx-auto" />}

      {selectedStudent && detail && (
        <div className="space-y-4">
          {/* Student Info Header */}
          <div className="bg-gradient-to-r from-[#7b1113] to-[#5c0d0f] rounded-2xl p-5 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">{selectedStudent.name}</h3>
                <p className="text-white/70 text-sm">Class {selectedStudent.className} - {selectedStudent.section} • Roll {selectedStudent.rollNo}</p>
              </div>
              <div className="text-right">
                <span className="bg-[#d4a017] text-white text-xs font-bold px-3 py-1 rounded-full">{selectedStudent.studentUniqueId || `SVV${String(selectedStudent.classId).padStart(2,'0')}${selectedStudent.section}${String(selectedStudent.rollNo).padStart(3,'0')}`}</span>
                <button onClick={() => { setSelectedStudent(null); setDetail(null); }} className="block mt-2 text-xs text-white/60 hover:text-white">✕ Close</button>
              </div>
            </div>
          </div>

          {/* Attendance */}
          {detail.attendance && (
            <div className="bg-white border border-[#7b1113]/10 rounded-2xl shadow-sm p-5">
              <h4 className="font-semibold text-[#7b1113] mb-3">📋 Attendance</h4>
              <div className="grid grid-cols-4 gap-3">
                <div className="bg-blue-50 rounded-xl p-3 text-center"><p className="text-lg font-bold text-blue-600">{detail.attendance.totalDays || 0}</p><p className="text-[10px] text-gray-500">Total Days</p></div>
                <div className="bg-green-50 rounded-xl p-3 text-center"><p className="text-lg font-bold text-green-600">{detail.attendance.presentDays || 0}</p><p className="text-[10px] text-gray-500">Present</p></div>
                <div className="bg-red-50 rounded-xl p-3 text-center"><p className="text-lg font-bold text-red-600">{detail.attendance.absentDays || 0}</p><p className="text-[10px] text-gray-500">Absent</p></div>
                <div className="bg-[#7b1113]/5 rounded-xl p-3 text-center"><p className="text-lg font-bold text-[#7b1113]">{detail.attendance.attendancePercentage?.toFixed(1) || 0}%</p><p className="text-[10px] text-gray-500">Percentage</p></div>
              </div>
            </div>
          )}

          {/* Fee Details */}
          {detail.fee && (
            <div className="bg-white border border-[#7b1113]/10 rounded-2xl shadow-sm p-5">
              <h4 className="font-semibold text-[#7b1113] mb-3">💰 Fee Details</h4>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-gray-50 rounded-xl p-3"><p className="text-[10px] text-gray-500">Total Fee</p><p className="text-lg font-bold">₹{detail.fee.totalFee?.toLocaleString()}</p></div>
                <div className="bg-green-50 rounded-xl p-3"><p className="text-[10px] text-gray-500">Paid</p><p className="text-lg font-bold text-green-600">₹{detail.fee.totalPaid?.toLocaleString()}</p></div>
                <div className="bg-red-50 rounded-xl p-3"><p className="text-[10px] text-gray-500">Due</p><p className="text-lg font-bold text-red-600">₹{detail.fee.due?.toLocaleString()}</p></div>
              </div>
              {detail.fee.payments?.length > 0 && (
                <table className="w-full text-xs mt-3 border border-gray-100 rounded-lg overflow-hidden">
                  <thead className="bg-gray-50"><tr><th className="text-left px-3 py-1.5">Date</th><th className="text-right px-3 py-1.5">Amount</th><th className="text-left px-3 py-1.5">Mode</th></tr></thead>
                  <tbody>{detail.fee.payments.map(p => (<tr key={p.paymentId} className="border-t border-gray-100"><td className="px-3 py-1.5">{p.paidOn?.split('T')[0]}</td><td className="px-3 py-1.5 text-right">₹{p.amount?.toLocaleString()}</td><td className="px-3 py-1.5">{p.mode}</td></tr>))}</tbody>
                </table>
              )}
            </div>
          )}

          {/* Exam Results */}
          {detail.exams?.length > 0 && (
            <div className="bg-white border border-[#7b1113]/10 rounded-2xl shadow-sm p-5">
              <h4 className="font-semibold text-[#7b1113] mb-3">📝 Exam Results</h4>
              {detail.exams.map(r => (
                <div key={r.examId} className="mb-3 last:mb-0 border border-gray-100 rounded-xl p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-sm">{r.examName}</span>
                    <span className="text-xs font-bold text-[#7b1113]">{r.percentage?.toFixed(1)}% • {r.totalMarksObtained}/{r.totalMaxMarks}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {r.subjects?.map((s, i) => (
                      <span key={i} className={`text-[10px] px-2 py-0.5 rounded ${(s.marks/s.maxMarks)*100 >= 35 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{s.subject}: {s.marks}/{s.maxMarks}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quizzes */}
          {detail.quizzes?.length > 0 && (
            <div className="bg-white border border-[#7b1113]/10 rounded-2xl shadow-sm p-5">
              <h4 className="font-semibold text-[#7b1113] mb-3">🧠 Quizzes</h4>
              <div className="space-y-2">
                {detail.quizzes.map(q => (
                  <div key={q.id} className="flex justify-between items-center border border-gray-100 rounded-lg p-3">
                    <div><p className="text-sm font-medium">{q.title}</p><p className="text-[10px] text-gray-500">{q.subject} • {q.questionCount} questions</p></div>
                    <div className="text-right">
                      {q.score != null ? <><p className="text-sm font-bold text-[#7b1113]">{q.score}%</p><p className="text-[10px] text-gray-500">{q.correct}/{q.total} correct</p></> : <span className="text-[10px] text-gray-400">Not attempted</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Blogs */}
          {detail.blogs?.length > 0 && (
            <div className="bg-white border border-[#7b1113]/10 rounded-2xl shadow-sm p-5">
              <h4 className="font-semibold text-[#7b1113] mb-3">✍️ Published Blogs</h4>
              <div className="space-y-2">
                {detail.blogs.map(b => (
                  <div key={b.id} className="border border-gray-100 rounded-lg p-3">
                    <p className="text-sm font-medium">{b.title}</p>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{b.content}</p>
                    <p className="text-[10px] text-gray-400 mt-1">{b.createdAt?.split('T')[0]}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ExportTab({ classes }) {
  const [exporting, setExporting] = useState('');
  const [exportClass, setExportClass] = useState('');

  const downloadCSV = (csv, filename) => {
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = filename; a.click();
  };

  const exportStudents = async () => {
    setExporting('students');
    try {
      const url = exportClass ? `/students?classId=${exportClass}` : '/students';
      const r = await api.get(url);
      let csv = 'Student ID,Name,Roll,Class,Section,Father,Mother,Mobile,Email,Hosteller,Transport,IIT/NEET\n';
      r.data.forEach(s => { csv += `${s.studentUniqueId || ''},"${s.name}",${s.rollNo},"${s.className}","${s.section}","${s.fatherName || ''}","${s.motherName || ''}","${s.parentMobile || ''}","${s.email || ''}",${s.isHosteller ? 'Yes' : 'No'},${s.isTransportUser ? 'Yes' : 'No'},${s.iitNeetOpted ? 'Yes' : 'No'}\n`; });
      downloadCSV(csv, `Students${exportClass ? '_Class' + exportClass : '_All'}.csv`);
    } catch (e) { alert('Error'); } finally { setExporting(''); }
  };

  const exportAttendance = async () => {
    setExporting('attendance');
    try {
      const classIds = exportClass ? [exportClass] : classes.map(c => c.id);
      let csv = 'Student ID,Name,Class,Section,Total Days,Present,Absent,Percentage\n';
      for (const cid of classIds) {
        const students = await api.get(`/classes/${cid}/students`).then(r => r.data).catch(() => []);
        for (const s of students) {
          const att = await api.get(`/attendance/student/${s.id}/summary`).then(r => r.data).catch(() => null);
          if (att) csv += `${s.studentUniqueId || ''},"${s.name}","${s.className}","${s.section}",${att.totalDays || 0},${att.presentDays || 0},${att.absentDays || 0},${att.attendancePercentage?.toFixed(1) || 0}%\n`;
        }
      }
      downloadCSV(csv, `Attendance${exportClass ? '_Class' + exportClass : '_All'}.csv`);
    } catch (e) { alert('Error'); } finally { setExporting(''); }
  };

  const exportFees = async () => {
    setExporting('fees');
    try {
      const classIds = exportClass ? [exportClass] : classes.map(c => c.id);
      let csv = 'Student ID,Name,Class,Section,Total Fee,Paid,Due,Status\n';
      for (const cid of classIds) {
        const students = await api.get(`/classes/${cid}/students`).then(r => r.data).catch(() => []);
        for (const s of students) {
          const fee = await api.get(`/fees/student/${s.id}/summary`).then(r => r.data).catch(() => null);
          if (fee) csv += `${s.studentUniqueId || ''},"${s.name}","${fee.className}","${fee.section}",${fee.totalFee},${fee.totalPaid},${fee.due},${fee.due === 0 ? 'Paid' : 'Pending'}\n`;
        }
      }
      downloadCSV(csv, `Fees${exportClass ? '_Class' + exportClass : '_All'}.csv`);
    } catch (e) { alert('Error'); } finally { setExporting(''); }
  };

  const exportExamResults = async () => {
    setExporting('exams');
    try {
      const exams = await api.get('/exams').then(r => r.data).catch(() => []);
      const classIds = exportClass ? [exportClass] : classes.map(c => c.id);
      let csv = 'Student ID,Name,Class,Section,Exam,Total Marks,Max Marks,Percentage\n';
      for (const cid of classIds) {
        const students = await api.get(`/classes/${cid}/students`).then(r => r.data).catch(() => []);
        for (const s of students) {
          for (const exam of exams) {
            const result = await api.get(`/exams/${exam.id}/student/${s.id}`).then(r => r.data).catch(() => null);
            if (result && result.subjects?.length > 0) csv += `${s.studentUniqueId || ''},"${s.name}","${s.className}","${s.section}","${result.examName}",${result.totalMarksObtained},${result.totalMaxMarks},${result.percentage?.toFixed(1)}%\n`;
          }
        }
      }
      downloadCSV(csv, `ExamResults${exportClass ? '_Class' + exportClass : '_All'}.csv`);
    } catch (e) { alert('Error'); } finally { setExporting(''); }
  };

  const exportTeachers = async () => {
    setExporting('teachers');
    try {
      const r = await api.get('/teachers');
      let csv = 'Teacher ID,Name,Subjects,Qualification,Mobile,Email,Class Teacher Of\n';
      r.data.forEach(t => { csv += `${t.teacherUniqueId || ''},"${t.name}","${t.subjects || t.subject || ''}","${t.qualification || ''}","${t.mobile || ''}","${t.email || ''}","${t.classTeacherOfName || ''}"\n`; });
      downloadCSV(csv, 'Teachers.csv');
    } catch (e) { alert('Error'); } finally { setExporting(''); }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <select value={exportClass} onChange={e => setExportClass(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-xl text-sm">
          <option value="">All Classes</option>
          {classes.map(c => <option key={c.id} value={c.id}>Class {c.className} - {c.section}</option>)}
        </select>
        <p className="text-sm text-gray-500">Select a class or export all data</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: '📋 Attendance Report', desc: 'Student-wise attendance with present/absent/percentage', action: exportAttendance, key: 'attendance' },
          { label: '💰 Fee Report', desc: 'Student-wise fee summary with paid/due status', action: exportFees, key: 'fees' },
          { label: '📝 Exam Results', desc: 'Student-wise exam marks and percentage', action: exportExamResults, key: 'exams' },
          { label: '👨‍🎓 All Students', desc: 'Complete student database with personal details', action: exportStudents, key: 'students' },
          { label: '👨‍🏫 All Teachers', desc: 'Teacher profiles with subjects and assignments', action: exportTeachers, key: 'teachers' },
        ].map(item => (
          <div key={item.key} className="bg-white border border-[#7b1113]/10 rounded-2xl shadow-sm p-5">
            <h4 className="font-semibold text-gray-900 mb-1">{item.label}</h4>
            <p className="text-xs text-gray-500 mb-4">{item.desc}</p>
            <button onClick={item.action} disabled={exporting === item.key} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 disabled:opacity-50 w-full justify-center">
              {exporting === item.key ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              {exporting === item.key ? 'Exporting...' : 'Download CSV'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
