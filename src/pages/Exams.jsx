import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Plus, Loader2, FileText, Download, Upload } from 'lucide-react';
import { downloadResultsPDF } from '../utils/pdfGenerator';

// TS SSC Grading: A1(91-100), A2(81-90), B1(71-80), B2(61-70), C1(51-60), C2(41-50), D(35-40), E(<35 Fail)
function getGrade(pct) {
  if (pct >= 91) return { grade: 'A1', gp: 10 };
  if (pct >= 81) return { grade: 'A2', gp: 9 };
  if (pct >= 71) return { grade: 'B1', gp: 8 };
  if (pct >= 61) return { grade: 'B2', gp: 7 };
  if (pct >= 51) return { grade: 'C1', gp: 6 };
  if (pct >= 41) return { grade: 'C2', gp: 5 };
  if (pct >= 35) return { grade: 'D', gp: 4 };
  return { grade: 'E', gp: 0 };
}

function getCGPA(subjects) {
  if (!subjects || subjects.length === 0) return 0;
  const totalGP = subjects.reduce((sum, s) => sum + getGrade((s.marks / s.maxMarks) * 100).gp, 0);
  return (totalGP / subjects.length).toFixed(2);
}

export default function Exams() {
  const { user } = useAuth();
  if (user?.role === 'STUDENT') return <StudentResults />;
  return <ManageExams />;
}

function StudentResults() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.get('/exams/my-results').then(r => setResults(r.data)).catch(() => {}).finally(() => setLoading(false)); }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-[#7b1113]" /></div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#7b1113] mb-6">My Exam Results</h1>
      {results.length === 0 ? <p className="text-gray-400 text-center py-8">No results available yet</p> : (
        <div className="space-y-6">
          {results.map(r => {
            const cgpa = getCGPA(r.subjects);
            const overallPct = r.totalMaxMarks > 0 ? (r.totalMarksObtained / r.totalMaxMarks) * 100 : 0;
            const overallGrade = getGrade(overallPct);
            const passed = r.subjects?.every(s => (s.marks / s.maxMarks) * 100 >= 35);
            return (
              <div key={r.examId} className="bg-white border border-[#7b1113]/10 rounded-2xl shadow-sm overflow-hidden">
                <div className="px-6 py-5 bg-gradient-to-r from-[#7b1113] to-[#5c0d0f] text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-bold text-xl tracking-wide">{r.examName}</h2>
                      <div className="flex gap-4 mt-2 text-sm text-white/80">
                        <span>Total: <b className="text-white">{r.totalMarksObtained}/{r.totalMaxMarks}</b></span>
                        <span>Percentage: <b className="text-white">{overallPct.toFixed(1)}%</b></span>
                        <span>Grade: <b className="text-[#d4a017]">{overallGrade.grade}</b></span>
                        <span>CGPA: <b className="text-[#d4a017]">{cgpa}</b></span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => downloadResultsPDF(r, r.studentName)} className="flex items-center gap-1 px-3 py-1.5 bg-white/20 backdrop-blur text-white rounded-lg text-xs font-medium hover:bg-white/30"><Download className="w-3 h-3" />PDF</button>
                      <span className={`px-3 py-1.5 rounded-lg text-sm font-bold ${passed ? 'bg-green-400/20 text-green-200' : 'bg-red-400/20 text-red-200'}`}>
                        {passed ? '✓ PASS' : '✗ FAIL'}
                      </span>
                    </div>
                  </div>
                </div>
                <table className="w-full text-sm">
                  <thead className="bg-[#7b1113]/5 border-b">
                    <tr>
                      <th className="text-left px-6 py-3 text-gray-600">Subject</th>
                      <th className="text-center px-4 py-3 text-gray-600">Marks</th>
                      <th className="text-center px-4 py-3 text-gray-600">Max</th>
                      <th className="text-center px-4 py-3 text-gray-600">%</th>
                      <th className="text-center px-4 py-3 text-gray-600">Grade</th>
                      <th className="text-center px-4 py-3 text-gray-600">GP</th>
                      <th className="text-center px-4 py-3 text-gray-600">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {r.subjects?.map((s, i) => {
                      const pct = (s.marks / s.maxMarks) * 100;
                      const g = getGrade(pct);
                      return (
                        <tr key={i} className="border-t border-gray-100">
                          <td className="px-6 py-2 font-medium">{s.subject}</td>
                          <td className="px-4 py-2 text-center">{s.marks}</td>
                          <td className="px-4 py-2 text-center text-gray-500">{s.maxMarks}</td>
                          <td className="px-4 py-2 text-center">{pct.toFixed(0)}%</td>
                          <td className="px-4 py-2 text-center font-medium">{g.grade}</td>
                          <td className="px-4 py-2 text-center">{g.gp}</td>
                          <td className="px-4 py-2 text-center">
                            <span className={`text-xs font-medium ${pct >= 35 ? 'text-green-600' : 'text-red-600'}`}>{pct >= 35 ? 'Pass' : 'Fail'}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ManageExams() {
  const { user } = useAuth();
  const canCreate = ['SYS_ADMIN', 'PRINCIPAL', 'CLERK'].includes(user?.role);
  const [exams, setExams] = useState([]);
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('exams');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [examForm, setExamForm] = useState({ name: '', academicYear: '2025-26', description: '' });

  const [uploadForm, setUploadForm] = useState({ examId: '', classId: '', subject: '' });
  const [examSummary, setExamSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [expandedClass, setExpandedClass] = useState(null);
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [marksStudents, setMarksStudents] = useState([]);
  const [marksData, setMarksData] = useState({});
  const [maxMarks, setMaxMarks] = useState(100);
  const [uploading, setUploading] = useState(false);

  const [viewExamId, setViewExamId] = useState('');
  const [viewClassId, setViewClassId] = useState('');
  const [viewResults, setViewResults] = useState([]);
  const [viewLoading, setViewLoading] = useState(false);

  const [trackingExamId, setTrackingExamId] = useState(null);
  const [uploadStatus, setUploadStatus] = useState([]);
  const [trackLoading, setTrackLoading] = useState(false);

  const loadUploadStatus = async (examId) => {
    if (trackingExamId === examId) { setTrackingExamId(null); return; }
    setTrackingExamId(examId); setTrackLoading(true);
    try { const r = await api.get(`/exams/${examId}/upload-status`); setUploadStatus(r.data); }
    catch (e) { setUploadStatus([]); } finally { setTrackLoading(false); }
  };

  useEffect(() => {
    Promise.all([api.get('/exams'), api.get('/classes'), api.get('/teachers')])
      .then(([e, c, t]) => { setExams(e.data); setClasses(c.data); setTeachers(t.data); })
      .catch(() => {}).finally(() => setLoading(false));
  }, []);

  const createExam = async (e) => {
    e.preventDefault();
    try { const res = await api.post('/exams', examForm); setExams([...exams, res.data]); setShowCreateForm(false); }
    catch (e) { alert(e.response?.data?.message || 'Error'); }
  };

  const loadExamSummary = async (examId) => {
    if (examSummary?.examId === examId) { setExamSummary(null); return; }
    setSummaryLoading(true);
    try {
      const classResults = [];
      const allStudentResults = [];
      const teacherStats = {};
      let totalStudents = 0, totalPass = 0, totalFail = 0;
      for (const cls of classes) {
        const students = await api.get(`/classes/${cls.id}/students`).then(r => r.data).catch(() => []);
        if (students.length === 0) continue;
        const results = await Promise.all(students.map(s => api.get(`/exams/${examId}/student/${s.id}`).then(r => r.data).catch(() => null)));
        const valid = results.filter(r => r && r.subjects?.length > 0);
        if (valid.length === 0) continue;
        const passed = valid.filter(r => r.subjects.every(s => (s.marks / s.maxMarks) * 100 >= 35));
        classResults.push({ className: cls.className, section: cls.section, total: valid.length, pass: passed.length, fail: valid.length - passed.length, passPct: ((passed.length / valid.length) * 100).toFixed(1), classTeacherId: cls.classTeacherId });
        valid.forEach(r => allStudentResults.push({ ...r, className: cls.className, section: cls.section, passed: r.subjects.every(s => (s.marks / s.maxMarks) * 100 >= 35) }));
        totalStudents += valid.length; totalPass += passed.length; totalFail += valid.length - passed.length;

        // Subject-wise teacher stats
        const subjectTeachers = await api.get(`/classes/${cls.id}/subject-teachers`).catch(() => ({ data: [] }));
        for (const st of (subjectTeachers.data || [])) {
          const key = `${st.teacherName}|||${st.subject}`;
          if (!teacherStats[key]) teacherStats[key] = { teacherName: st.teacherName, subject: st.subject, classes: [], appeared: 0, pass: 0, fail: 0 };
          // Count pass/fail for this subject
          let subPass = 0, subFail = 0, subAppeared = 0;
          valid.forEach(r => {
            const subMark = r.subjects?.find(s => s.subject === st.subject);
            if (subMark) { subAppeared++; if ((subMark.marks / subMark.maxMarks) * 100 >= 35) subPass++; else subFail++; }
          });
          teacherStats[key].appeared += subAppeared;
          teacherStats[key].pass += subPass;
          teacherStats[key].fail += subFail;
          teacherStats[key].classes.push(`${cls.className}-${cls.section}`);
        }
      }

      // Class teacher performance
      const classTeacherPerf = classResults.filter(cr => cr.classTeacherId).map(cr => {
        const teacher = teachers.find(t => t.id === cr.classTeacherId);
        return { ...cr, teacherName: teacher?.name || 'Unknown' };
      }).sort((a, b) => Number(b.passPct) - Number(a.passPct));

      const sorted = [...allStudentResults].sort((a, b) => b.percentage - a.percentage);
      const toppers = sorted.slice(0, 10);
      const failures = sorted.filter(s => !s.passed).sort((a, b) => a.percentage - b.percentage).slice(0, 10);
      const teacherStatsArr = Object.values(teacherStats).map(t => ({ ...t, passPct: t.appeared > 0 ? ((t.pass / t.appeared) * 100).toFixed(1) : '0' })).sort((a, b) => Number(b.passPct) - Number(a.passPct));

      setExamSummary({ examId, totalStudents, totalPass, totalFail, passPct: totalStudents > 0 ? ((totalPass / totalStudents) * 100).toFixed(1) : 0, classResults, toppers, failures, allStudentResults, classTeacherPerf, teacherStats: teacherStatsArr });
    } catch (e) {} finally { setSummaryLoading(false); }
  };

  // When class changes in upload, load subjects and students
  useEffect(() => {
    if (!uploadForm.classId) { setMarksStudents([]); setSubjectOptions([]); return; }
    const cls = classes.find(c => String(c.id) === String(uploadForm.classId));
    setSubjectOptions(cls?.subjects ? cls.subjects.split(',').map(s => s.trim()) : []);
    api.get(`/classes/${uploadForm.classId}/students`).then(r => {
      setMarksStudents(r.data);
      const md = {}; r.data.forEach(s => md[s.id] = ''); setMarksData(md);
    }).catch(() => {});
  }, [uploadForm.classId]);

  const uploadMarks = async () => {
    if (!uploadForm.examId || !uploadForm.classId || !uploadForm.subject) { alert('Select exam, class, and subject'); return; }
    setUploading(true);
    const rows = marksStudents.map(s => ({ studentId: s.id, marks: Number(marksData[s.id]) || 0, maxMarks }));
    try {
      await api.post('/exams/upload', { examId: Number(uploadForm.examId), classId: Number(uploadForm.classId), subject: uploadForm.subject, rows });
      alert('Marks uploaded successfully!');
    } catch (e) { alert(e.response?.data?.message || 'Error'); }
    finally { setUploading(false); }
  };

  const fetchResults = async () => {
    if (!viewExamId || !viewClassId) return;
    setViewLoading(true);
    try {
      const studRes = await api.get(`/classes/${viewClassId}/students`);
      const results = await Promise.all(studRes.data.map(s => api.get(`/exams/${viewExamId}/student/${s.id}`).then(r => r.data).catch(() => null)));
      setViewResults(results.filter(r => r && r.subjects?.length > 0));
    } catch (e) {} finally { setViewLoading(false); }
  };

  const exportResults = () => {
    let csv = 'Roll,Student Name,Total,Max,Percentage,Grade,CGPA,Status\n';
    viewResults.forEach(r => {
      const pct = r.totalMaxMarks > 0 ? (r.totalMarksObtained / r.totalMaxMarks) * 100 : 0;
      const g = getGrade(pct);
      const passed = r.subjects?.every(s => (s.marks / s.maxMarks) * 100 >= 35);
      csv += `${r.studentId},"${r.studentName}",${r.totalMarksObtained},${r.totalMaxMarks},${pct.toFixed(1)}%,${g.grade},${getCGPA(r.subjects)},${passed ? 'Pass' : 'Fail'}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `Results.csv`; a.click();
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-[#7b1113]" /></div>;

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-[#7b1113]">Exams & Marks</h1>
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button onClick={() => setTab('exams')} className={`px-3 py-1.5 rounded-md text-sm font-medium ${tab === 'exams' ? 'bg-white shadow' : 'text-gray-500'}`}>Exams</button>
          <button onClick={() => setTab('upload')} className={`px-3 py-1.5 rounded-md text-sm font-medium ${tab === 'upload' ? 'bg-white shadow' : 'text-gray-500'}`}>Upload Marks</button>
          <button onClick={() => setTab('view')} className={`px-3 py-1.5 rounded-md text-sm font-medium ${tab === 'view' ? 'bg-white shadow' : 'text-gray-500'}`}>View Results</button>
        </div>
      </div>

      {tab === 'exams' && (
        <div>
          {canCreate && !showCreateForm && <button onClick={() => setShowCreateForm(true)} className="flex items-center gap-2 px-4 py-2 bg-[#7b1113] text-white rounded-lg text-sm font-medium hover:bg-[#5c0d0f] mb-4"><Plus className="w-4 h-4" />Create Exam</button>}
          {showCreateForm && (
            <div className="bg-white border border-[#7b1113]/10 rounded-xl shadow-sm p-6 mb-4">
              <form onSubmit={createExam} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input placeholder="Exam Name" required value={examForm.name} onChange={e => setExamForm({...examForm, name: e.target.value})} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                <input placeholder="Academic Year" value={examForm.academicYear} onChange={e => setExamForm({...examForm, academicYear: e.target.value})} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                <input placeholder="Description" value={examForm.description} onChange={e => setExamForm({...examForm, description: e.target.value})} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                <div className="flex gap-2"><button type="submit" className="px-4 py-2 bg-[#7b1113] text-white rounded-lg text-sm">Save</button><button type="button" onClick={() => setShowCreateForm(false)} className="px-4 py-2 bg-gray-100 rounded-lg text-sm">Cancel</button></div>
              </form>
            </div>
          )}
          <div className="space-y-3">
            {exams.length === 0 ? <p className="text-gray-400 text-center py-8">No exams created yet</p> : exams.map(ex => (
              <div key={ex.id} className="bg-white border border-[#7b1113]/10 rounded-xl shadow-sm p-5 flex items-center justify-between">
                <div className={ex.createdBy === 1 ? 'cursor-pointer' : ''} onClick={() => ex.createdBy === 1 && loadExamSummary(ex.id)}>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{ex.name}</h3>
                    <span className="text-xs text-gray-400">{ex.academicYear}</span>
                    {ex.createdBy === 1 ? <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-[10px] font-medium">Published</span> : <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded text-[10px] font-medium">Draft</span>}
                  </div>
                  {ex.description && <p className="text-xs text-gray-500 mt-1">{ex.description}</p>}
                  {ex.createdBy === 1 && <p className="text-[10px] text-[#7b1113] mt-1">Click to view results summary</p>}
                </div>
                {canCreate && (
                  <div className="flex gap-2">
                    {ex.createdBy !== 1 && <button onClick={async () => { await api.put(`/exams/${ex.id}/publish`); const r = await api.get('/exams'); setExams(r.data); }} className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700">Publish Results</button>}
                    <button onClick={() => loadUploadStatus(ex.id)} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${trackingExamId === ex.id ? 'bg-[#7b1113] text-white' : 'bg-[#7b1113]/10 text-[#7b1113]'}`}>{trackingExamId === ex.id ? 'Hide Status' : 'Track Uploads'}</button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Upload Status Panel */}
          {trackingExamId && (
            <div className="mt-6 bg-white border border-[#7b1113]/10 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-5 py-3 bg-[#7b1113]/5 border-b flex items-center justify-between">
                <h3 className="font-semibold text-[#7b1113] text-sm">Upload Progress — {exams.find(e => e.id === trackingExamId)?.name}</h3>
                <div className="text-xs text-gray-500">
                  {uploadStatus.filter(s => s.uploaded).length}/{uploadStatus.length} completed
                </div>
              </div>
              {trackLoading ? <div className="p-6 text-center"><Loader2 className="w-5 h-5 animate-spin text-[#7b1113] mx-auto" /></div> : (
                <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                  {(() => {
                    const grouped = {};
                    uploadStatus.forEach(s => { const key = `${s.className}-${s.section}`; if (!grouped[key]) grouped[key] = []; grouped[key].push(s); });
                    return Object.entries(grouped).map(([cls, subjects]) => {
                      const allDone = subjects.every(s => s.uploaded);
                      const pending = subjects.filter(s => !s.uploaded);
                      return (
                        <div key={cls} className="px-5 py-3 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className={`w-2.5 h-2.5 rounded-full ${allDone ? 'bg-green-500' : 'bg-orange-400 animate-pulse'}`}></span>
                            <div>
                              <p className="text-sm font-medium text-gray-900">Class {cls}</p>
                              {!allDone && <p className="text-[10px] text-orange-600 mt-0.5">Waiting: {pending.map(p => p.subject).join(', ')}</p>}
                            </div>
                          </div>
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${allDone ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                            {allDone ? '✓ Complete' : `${subjects.filter(s => s.uploaded).length}/${subjects.length}`}
                          </span>
                        </div>
                      );
                    });
                  })()}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Exam Summary Panel */}
      {examSummary && (
        <div className="mt-6 bg-white border border-[#7b1113]/10 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-[#7b1113] to-[#5c0d0f] text-white">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg">Exam Results Summary</h3>
              <div className="flex gap-2">
                <button onClick={() => { let csv = 'Student,Class,Total,Max,Percentage,Status\n'; examSummary.allStudentResults.forEach(r => { csv += `"${r.studentName}","${r.className}-${r.section}",${r.totalMarksObtained},${r.totalMaxMarks},${r.percentage?.toFixed(1)}%,${r.passed ? 'Pass' : 'Fail'}\n`; }); const blob = new Blob([csv], {type:'text/csv'}); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'Exam_Results_Full.csv'; a.click(); }} className="px-3 py-1 bg-white/20 text-white rounded-lg text-xs hover:bg-white/30">📥 Download CSV</button>
                <button onClick={() => setExamSummary(null)} className="text-white/60 hover:text-white text-sm">✕</button>
              </div>
            </div>
          </div>
          {summaryLoading ? <div className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin text-[#7b1113] mx-auto" /></div> : (
            <>
              {/* Teacher's own performance highlight */}
              {user?.role === 'TEACHER' && examSummary.teacherStats?.length > 0 && (() => {
                const myName = user?.displayName || '';
                const myStats = examSummary.teacherStats.filter(t => t.teacherName.toLowerCase() === myName.toLowerCase());
                if (myStats.length === 0) return null;
                return (
                  <div className="px-6 pt-4">
                    <h4 className="font-semibold text-[#d4a017] mb-2">⭐ My Performance</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {myStats.map((t, i) => (
                        <div key={i} className="bg-[#d4a017]/10 rounded-xl p-3 text-center">
                          <p className="text-xs text-gray-500">{t.subject}</p>
                          <p className="text-xl font-bold text-[#7b1113]">{t.passPct}%</p>
                          <p className="text-[10px] text-gray-500">{t.pass}/{t.appeared} passed</p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              <div className="grid grid-cols-4 gap-4 p-6">
                <div className="bg-blue-50 rounded-xl p-4 text-center"><p className="text-2xl font-bold text-blue-600">{examSummary.totalStudents}</p><p className="text-xs text-gray-500">Students Appeared</p></div>
                <div className="bg-green-50 rounded-xl p-4 text-center"><p className="text-2xl font-bold text-green-600">{examSummary.totalPass}</p><p className="text-xs text-gray-500">Passed</p></div>
                <div className="bg-red-50 rounded-xl p-4 text-center"><p className="text-2xl font-bold text-red-600">{examSummary.totalFail}</p><p className="text-xs text-gray-500">Failed</p></div>
                <div className="bg-[#7b1113]/5 rounded-xl p-4 text-center"><p className="text-2xl font-bold text-[#7b1113]">{examSummary.passPct}%</p><p className="text-xs text-gray-500">Pass Percentage</p></div>
              </div>
              <div className="px-6 pb-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-[#7b1113]">Class-wise Results</h4>
                  <button onClick={() => { examSummary.classResults.forEach(cr => { const cs = examSummary.allStudentResults.filter(s => s.className === cr.className && s.section === cr.section); let csv = 'Student,Total,Max,%,Status\n'; cs.forEach(s => { csv += `"${s.studentName}",${s.totalMarksObtained},${s.totalMaxMarks},${s.percentage?.toFixed(1)}%,${s.passed?'Pass':'Fail'}\n`; }); const b = new Blob([csv],{type:'text/csv'}); const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = `Results_${cr.className}${cr.section}.csv`; a.click(); }); }} className="text-xs text-[#7b1113] hover:underline font-medium">📥 Download All (Separate CSVs)</button>
                </div>
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-[#7b1113]/5"><tr><th className="text-left px-4 py-2 text-gray-600">Class</th><th className="text-center px-4 py-2 text-gray-600">Appeared</th><th className="text-center px-4 py-2 text-gray-600">Pass</th><th className="text-center px-4 py-2 text-gray-600">Fail</th><th className="text-center px-4 py-2 text-gray-600">Pass %</th><th className="text-center px-4 py-2 text-gray-600"></th></tr></thead>
                    <tbody>
                      {examSummary.classResults.map((cr, i) => (
                        <tr key={i} className="border-t border-gray-100 cursor-pointer hover:bg-[#7b1113]/5" onClick={() => setExpandedClass(expandedClass === `${cr.className}-${cr.section}` ? null : `${cr.className}-${cr.section}`)}>
                          <td className="px-4 py-2 font-medium">Class {cr.className} - {cr.section}</td>
                          <td className="px-4 py-2 text-center">{cr.total}</td>
                          <td className="px-4 py-2 text-center text-green-600 font-medium">{cr.pass}</td>
                          <td className="px-4 py-2 text-center text-red-600 font-medium">{cr.fail}</td>
                          <td className="px-4 py-2 text-center"><span className={`px-2 py-0.5 rounded text-xs font-medium ${Number(cr.passPct) >= 80 ? 'bg-green-100 text-green-700' : Number(cr.passPct) >= 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{cr.passPct}%</span></td>
                          <td className="px-4 py-2 text-center text-[10px] text-[#7b1113]">{expandedClass === `${cr.className}-${cr.section}` ? '▲' : '▼'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {expandedClass && (() => {
                  const classStudents = examSummary.allStudentResults.filter(s => `${s.className}-${s.section}` === expandedClass).sort((a,b) => b.percentage - a.percentage);
                  if (classStudents.length === 0) return null;
                  return (
                    <div className="mt-3 border border-[#7b1113]/20 rounded-xl overflow-hidden">
                      <div className="px-4 py-2 bg-[#7b1113]/5 flex items-center justify-between">
                        <span className="font-semibold text-xs text-[#7b1113]">Class {expandedClass} — {classStudents.length} students</span>
                        <button onClick={() => { let csv = 'Student,' + (classStudents[0]?.subjects?.map(s=>s.subject).join(',') || '') + ',Total,Max,%,Status\n'; classStudents.forEach(s => { csv += `"${s.studentName}",${s.subjects?.map(sub=>sub.marks).join(',')},${s.totalMarksObtained},${s.totalMaxMarks},${s.percentage?.toFixed(1)}%,${s.passed?'Pass':'Fail'}\n`; }); const b = new Blob([csv],{type:'text/csv'}); const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = `Results_${expandedClass}.csv`; a.click(); }} className="text-[10px] bg-[#7b1113] text-white px-2 py-1 rounded">📥 CSV</button>
                      </div>
                      <table className="w-full text-xs">
                        <thead className="bg-gray-50"><tr><th className="text-left px-3 py-1.5">#</th><th className="text-left px-3 py-1.5">Student</th>{classStudents[0]?.subjects?.map((sub,j) => <th key={j} className="text-center px-2 py-1.5">{sub.subject}</th>)}<th className="text-center px-2 py-1.5">Total</th><th className="text-center px-2 py-1.5">%</th><th className="text-center px-2 py-1.5">Result</th></tr></thead>
                        <tbody>{classStudents.map((s,i) => (<tr key={i} className="border-t border-gray-100"><td className="px-3 py-1 text-gray-400">{i+1}</td><td className="px-3 py-1 font-medium">{s.studentName}</td>{s.subjects?.map((sub,j) => <td key={j} className={`text-center px-2 py-1 ${(sub.marks/sub.maxMarks)*100 < 35 ? 'text-red-600 font-bold' : ''}`}>{sub.marks}</td>)}<td className="text-center px-2 py-1 font-medium">{s.totalMarksObtained}</td><td className="text-center px-2 py-1 font-medium">{s.percentage?.toFixed(1)}%</td><td className="text-center px-2 py-1"><span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${s.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{s.passed ? 'PASS' : 'FAIL'}</span></td></tr>))}</tbody>
                      </table>
                    </div>
                  );
                })()}

                {/* Top Performers */}
                {examSummary.toppers?.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-semibold text-green-700 mb-3">🏆 Top 10 Performers (School)</h4>
                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-green-50"><tr><th className="text-left px-4 py-2">#</th><th className="text-left px-4 py-2">Student</th><th className="text-left px-4 py-2">Class</th><th className="text-center px-4 py-2">Marks</th><th className="text-center px-4 py-2">%</th></tr></thead>
                        <tbody>{examSummary.toppers.map((s, i) => (<tr key={i} className="border-t border-gray-100"><td className="px-4 py-2 font-bold text-[#d4a017]">{i+1}</td><td className="px-4 py-2 font-medium">{s.studentName}</td><td className="px-4 py-2 text-gray-500">{s.className}-{s.section}</td><td className="px-4 py-2 text-center">{s.totalMarksObtained}/{s.totalMaxMarks}</td><td className="px-4 py-2 text-center font-bold text-green-600">{s.percentage?.toFixed(1)}%</td></tr>))}</tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Failures */}
                {examSummary.failures?.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-semibold text-red-700 mb-3">⚠️ Students Needing Attention (Failed)</h4>
                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-red-50"><tr><th className="text-left px-4 py-2">Student</th><th className="text-left px-4 py-2">Class</th><th className="text-center px-4 py-2">Marks</th><th className="text-center px-4 py-2">%</th><th className="text-left px-4 py-2">Failed Subjects</th></tr></thead>
                        <tbody>{examSummary.failures.map((s, i) => (<tr key={i} className="border-t border-gray-100"><td className="px-4 py-2 font-medium">{s.studentName}</td><td className="px-4 py-2 text-gray-500">{s.className}-{s.section}</td><td className="px-4 py-2 text-center">{s.totalMarksObtained}/{s.totalMaxMarks}</td><td className="px-4 py-2 text-center font-bold text-red-600">{s.percentage?.toFixed(1)}%</td><td className="px-4 py-2 text-xs text-red-500">{s.subjects?.filter(sub => (sub.marks/sub.maxMarks)*100 < 35).map(sub => sub.subject).join(', ')}</td></tr>))}</tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Class Teacher Performance */}
                {examSummary.classTeacherPerf?.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-semibold text-[#7b1113] mb-3">👨‍🏫 Class Teacher Performance (Ranked by Pass %)</h4>
                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-[#7b1113]/5"><tr><th className="text-left px-4 py-2">#</th><th className="text-left px-4 py-2">Teacher</th><th className="text-left px-4 py-2">Class</th><th className="text-center px-4 py-2">Appeared</th><th className="text-center px-4 py-2">Pass</th><th className="text-center px-4 py-2">Fail</th><th className="text-center px-4 py-2">Pass %</th></tr></thead>
                        <tbody>{examSummary.classTeacherPerf.map((t, i) => (<tr key={i} className="border-t border-gray-100"><td className="px-4 py-2 font-bold text-[#d4a017]">{i+1}</td><td className="px-4 py-2 font-medium">{t.teacherName}</td><td className="px-4 py-2">{t.className}-{t.section}</td><td className="px-4 py-2 text-center">{t.total}</td><td className="px-4 py-2 text-center text-green-600">{t.pass}</td><td className="px-4 py-2 text-center text-red-600">{t.fail}</td><td className="px-4 py-2 text-center"><span className={`px-2 py-0.5 rounded text-xs font-bold ${Number(t.passPct) >= 80 ? 'bg-green-100 text-green-700' : Number(t.passPct) >= 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{t.passPct}%</span></td></tr>))}</tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Subject Teacher Performance */}
                {examSummary.teacherStats?.length > 0 && (
                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-[#7b1113]">📚 Subject Teacher Performance</h4>
                      <button onClick={() => { let csv = 'Teacher,Subject,Classes,Appeared,Pass,Fail,Pass%\n'; examSummary.teacherStats.forEach(t => { csv += `"${t.teacherName}","${t.subject}","${[...new Set(t.classes)].join('; ')}",${t.appeared},${t.pass},${t.fail},${t.passPct}%\n`; }); const blob = new Blob([csv],{type:'text/csv'}); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'Teacher_Performance.csv'; a.click(); }} className="text-xs text-[#7b1113] hover:underline">📥 Download</button>
                    </div>
                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-[#7b1113]/5"><tr><th className="text-left px-4 py-2">Teacher</th><th className="text-left px-4 py-2">Subject</th><th className="text-left px-4 py-2">Classes</th><th className="text-center px-4 py-2">Appeared</th><th className="text-center px-4 py-2">Pass</th><th className="text-center px-4 py-2">Fail</th><th className="text-center px-4 py-2">Pass %</th></tr></thead>
                        <tbody>{examSummary.teacherStats.map((t, i) => (<tr key={i} className="border-t border-gray-100"><td className="px-4 py-2 font-medium">{t.teacherName}</td><td className="px-4 py-2">{t.subject}</td><td className="px-4 py-2 text-xs text-gray-500">{[...new Set(t.classes)].join(', ')}</td><td className="px-4 py-2 text-center">{t.appeared}</td><td className="px-4 py-2 text-center text-green-600">{t.pass}</td><td className="px-4 py-2 text-center text-red-600">{t.fail}</td><td className="px-4 py-2 text-center"><span className={`px-2 py-0.5 rounded text-xs font-bold ${Number(t.passPct) >= 80 ? 'bg-green-100 text-green-700' : Number(t.passPct) >= 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{t.passPct}%</span></td></tr>))}</tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {tab === 'upload' && (
        <div>
          <div className="flex flex-wrap gap-4 mb-6">
            <select value={uploadForm.examId} onChange={e => setUploadForm({...uploadForm, examId: e.target.value})} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
              <option value="">Select Exam</option>
              {exams.map(e => <option key={e.id} value={e.id}>{e.name} ({e.academicYear})</option>)}
            </select>
            <select value={uploadForm.classId} onChange={e => setUploadForm({...uploadForm, classId: e.target.value, subject: ''})} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
              <option value="">Select Class</option>
              {classes.map(c => <option key={c.id} value={c.id}>Class {c.className} - {c.section}</option>)}
            </select>
            <select value={uploadForm.subject} onChange={e => setUploadForm({...uploadForm, subject: e.target.value})} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
              <option value="">Select Subject</option>
              {subjectOptions.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <input type="number" placeholder="Max Marks" value={maxMarks} onChange={e => setMaxMarks(Number(e.target.value))} className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-28" />
          </div>
          {marksStudents.length > 0 && uploadForm.subject && (
            <div className="bg-white border border-[#7b1113]/10 rounded-xl shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-[#7b1113]/5 border-b"><tr><th className="text-left px-4 py-3 text-gray-600 w-16">Roll</th><th className="text-left px-4 py-3 text-gray-600">Student</th><th className="text-center px-4 py-3 text-gray-600 w-32">Marks (/{maxMarks})</th></tr></thead>
                <tbody>
                  {marksStudents.map(s => (
                    <tr key={s.id} className="border-b border-gray-100">
                      <td className="px-4 py-3">{s.rollNo}</td>
                      <td className="px-4 py-3 font-medium">{s.name}</td>
                      <td className="px-4 py-3 text-center"><input type="number" min="0" max={maxMarks} value={marksData[s.id] || ''} onChange={e => setMarksData({...marksData, [s.id]: e.target.value})} className="w-20 px-2 py-1 border border-gray-300 rounded text-center text-sm" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="p-4 border-t"><button onClick={uploadMarks} disabled={uploading} className="px-6 py-2.5 bg-[#7b1113] text-white rounded-lg text-sm font-medium hover:bg-[#5c0d0f] disabled:opacity-50 flex items-center gap-2">{uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}Save Marks</button></div>
            </div>
          )}
        </div>
      )}

      {tab === 'view' && (
        <div>
          <div className="flex flex-wrap gap-4 mb-6">
            <select value={viewExamId} onChange={e => setViewExamId(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm"><option value="">Select Exam</option>{exams.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}</select>
            <select value={viewClassId} onChange={e => setViewClassId(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm"><option value="">Select Class</option>{classes.map(c => <option key={c.id} value={c.id}>Class {c.className} - {c.section}</option>)}</select>
            <button onClick={fetchResults} className="px-4 py-2 bg-[#7b1113] text-white rounded-lg text-sm font-medium">Load</button>
            {viewResults.length > 0 && <button onClick={exportResults} className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium"><Download className="w-4 h-4" />Export</button>}
          </div>
          {viewLoading && <Loader2 className="w-6 h-6 animate-spin text-[#7b1113] mx-auto" />}
          {!viewLoading && viewResults.length > 0 && (
            <div className="bg-white border border-[#7b1113]/10 rounded-xl shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-[#7b1113]/5 border-b"><tr><th className="text-left px-4 py-3 text-gray-600">Student</th><th className="text-center px-4 py-3 text-gray-600">Total</th><th className="text-center px-4 py-3 text-gray-600">Max</th><th className="text-center px-4 py-3 text-gray-600">%</th><th className="text-center px-4 py-3 text-gray-600">Grade</th><th className="text-center px-4 py-3 text-gray-600">CGPA</th><th className="text-center px-4 py-3 text-gray-600">Status</th></tr></thead>
                <tbody>
                  {viewResults.sort((a, b) => b.percentage - a.percentage).map(r => {
                    const pct = r.totalMaxMarks > 0 ? (r.totalMarksObtained / r.totalMaxMarks) * 100 : 0;
                    const g = getGrade(pct);
                    const passed = r.subjects?.every(s => (s.marks / s.maxMarks) * 100 >= 35);
                    return (
                      <tr key={r.studentId} className="border-b border-gray-100">
                        <td className="px-4 py-3 font-medium">{r.studentName}</td>
                        <td className="px-4 py-3 text-center">{r.totalMarksObtained}</td>
                        <td className="px-4 py-3 text-center text-gray-500">{r.totalMaxMarks}</td>
                        <td className="px-4 py-3 text-center">{pct.toFixed(1)}%</td>
                        <td className="px-4 py-3 text-center font-medium">{g.grade}</td>
                        <td className="px-4 py-3 text-center">{getCGPA(r.subjects)}</td>
                        <td className="px-4 py-3 text-center"><span className={`px-2 py-1 rounded-full text-xs font-medium ${passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{passed ? 'Pass' : 'Fail'}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
