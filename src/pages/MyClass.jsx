import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Loader2, BookOpen, FileText, ClipboardList, Bell, Plus, Trash2, Calendar, Download } from 'lucide-react';

const TYPE_ICONS = { NOTES: BookOpen, HOMEWORK: ClipboardList, MATERIAL: FileText, QUIZ: Bell, ANNOUNCEMENT: Bell };
const TYPE_COLORS = { NOTES: 'bg-blue-100 text-blue-600', HOMEWORK: 'bg-orange-100 text-orange-600', MATERIAL: 'bg-purple-100 text-purple-600', QUIZ: 'bg-green-100 text-green-600', ANNOUNCEMENT: 'bg-red-100 text-red-600' };

const downloadFile = async (id) => {
  try {
    const r = await api.get(`/class-materials/${id}/file`);
    const a = document.createElement('a'); a.href = r.data.fileData; a.download = r.data.fileName; a.click();
  } catch (e) { alert('Error downloading file'); }
};

export default function MyClass() {
  const { user } = useAuth();
  if (user?.role === 'STUDENT') return <StudentClassView />;
  return <TeacherClassView />;
}

function StudentClassView() {
  const { user } = useAuth();
  const [subjectTeachers, setSubjectTeachers] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [classInfo, setClassInfo] = useState(null);
  const [filterSubject, setFilterSubject] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!user?.studentId) { setLoading(false); return; }
        const profile = await api.get(`/students/${user.studentId}`);
        const classId = profile.data.classId;
        if (!classId) { setLoading(false); return; }
        setClassInfo(profile.data);
        const [stRes, matRes] = await Promise.all([
          api.get(`/classes/${classId}/subject-teachers`),
          api.get(`/class-materials/class/${classId}`),
        ]);
        setSubjectTeachers(stRes.data);
        setMaterials(matRes.data);
      } catch (e) {}
      setLoading(false);
    };
    fetchData();
  }, [user]);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[#7b1113]" /></div>;

  const subjects = [...new Set(subjectTeachers.map(st => st.subject))];
  const filtered = filterSubject ? materials.filter(m => m.subject === filterSubject) : materials;

  return (
    <div>
      <div className="bg-gradient-to-r from-[#7b1113] to-[#5c0d0f] rounded-2xl p-6 mb-6 text-white">
        <h1 className="text-xl font-bold">My Class</h1>
        <p className="text-white/70 text-sm">{classInfo ? `Class ${classInfo.className} - ${classInfo.section}` : ''}</p>
      </div>

      {/* Subject Teachers */}
      <h2 className="text-lg font-semibold text-[#7b1113] mb-3">Subject Teachers</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
        {subjectTeachers.map(st => (
          <div key={st.id} className="bg-white border border-[#7b1113]/10 rounded-xl shadow-sm p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-[#7b1113]/10 rounded-lg flex items-center justify-center"><BookOpen className="w-5 h-5 text-[#7b1113]" /></div>
            <div>
              <p className="font-medium text-sm text-gray-900">{st.subject}</p>
              <p className="text-xs text-gray-500">{st.teacherName} • {st.teacherMobile}</p>
            </div>
          </div>
        ))}
        {subjectTeachers.length === 0 && <p className="text-gray-400 text-sm col-span-3">No subject teachers assigned yet</p>}
      </div>

      {/* Materials */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-[#7b1113]">Class Materials</h2>
        <select value={filterSubject} onChange={e => setFilterSubject(e.target.value)} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm">
          <option value="">All Subjects</option>
          {subjects.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-2xl"><FileText className="w-10 h-10 text-gray-300 mx-auto mb-2" /><p className="text-gray-400 text-sm">No materials posted yet</p></div>
      ) : (
        <div className="space-y-3">
          {filtered.map(m => {
            const Icon = TYPE_ICONS[m.type] || FileText;
            const color = TYPE_COLORS[m.type] || 'bg-gray-100 text-gray-600';
            return (
              <div key={m.id} className="bg-white border border-[#7b1113]/10 rounded-xl shadow-sm p-4">
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}><Icon className="w-4 h-4" /></div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-medium bg-[#7b1113]/10 text-[#7b1113] px-2 py-0.5 rounded">{m.type}</span>
                      <span className="text-[10px] text-gray-400">{m.subject}</span>
                      {m.dueDate && <span className="text-[10px] text-orange-500 flex items-center gap-0.5"><Calendar className="w-3 h-3" />Due: {m.dueDate}</span>}
                    </div>
                    <h4 className="font-medium text-gray-900 text-sm">{m.title}</h4>
                    {m.content && <p className="text-xs text-gray-500 mt-1 whitespace-pre-wrap">{m.content}</p>}
                    {m.hasFile && <button onClick={() => downloadFile(m.id)} className="mt-2 flex items-center gap-1 text-xs text-[#7b1113] font-medium hover:underline"><Download className="w-3 h-3" />{m.fileName || 'Download PDF'}</button>}
                    <p className="text-[10px] text-gray-400 mt-2">{m.createdAt?.split('T')[0]}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function TeacherClassView() {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [myClasses, setMyClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [materials, setMaterials] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ subject: '', type: 'NOTES', title: '', content: '', dueDate: '', fileData: '', fileName: '' });
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const [classRes, stRes] = await Promise.all([
          api.get('/classes'),
          api.get('/classes').then(async (r) => {
            // Find classes where this teacher is a subject teacher
            const allAssignments = await Promise.all(r.data.map(c => api.get(`/classes/${c.id}/subject-teachers`).then(res => res.data.map(st => ({...st, classId: c.id}))).catch(() => [])));
            return allAssignments.flat().filter(st => st.teacherId === user?.teacherId).map(st => st.classId);
          })
        ]);
        const allClasses = classRes.data;
        setClasses(allClasses);
        // Classes where teacher is class teacher OR subject teacher
        const classTeacherClasses = allClasses.filter(c => c.classTeacherId === user?.teacherId).map(c => c.id);
        const subjectTeacherClassIds = stRes;
        const myClassIds = [...new Set([...classTeacherClasses, ...subjectTeacherClassIds])];
        const myClassList = allClasses.filter(c => myClassIds.includes(c.id));
        setMyClasses(myClassList.length > 0 ? myClassList : allClasses);
        if (myClassList.length > 0) setSelectedClass(String(myClassList[0].id));
      } catch (e) {}
      setLoading(false);
    };
    fetchClasses();
  }, [user]);

  useEffect(() => {
    if (!selectedClass) return;
    const cls = classes.find(c => String(c.id) === selectedClass);
    setSubjectOptions(cls?.subjects ? cls.subjects.split(',').map(s => s.trim()) : []);
    api.get(`/class-materials/class/${selectedClass}`).then(r => setMaterials(r.data)).catch(() => setMaterials([]));
  }, [selectedClass]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/class-materials', { classId: Number(selectedClass), ...form, dueDate: form.dueDate || null, fileData: form.fileData || null, fileName: form.fileName || null });
      setShowForm(false); setForm({ subject: '', type: 'NOTES', title: '', content: '', dueDate: '', fileData: '', fileName: '' });
      const r = await api.get(`/class-materials/class/${selectedClass}`); setMaterials(r.data);
    } catch (e) { alert('Error'); }
  };

  const deleteMaterial = async (id) => {
    if (!confirm('Delete?')) return;
    try { await api.delete(`/class-materials/${id}`); setMaterials(materials.filter(m => m.id !== id)); } catch (e) {}
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[#7b1113]" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#7b1113]">My Class</h1>
          <p className="text-sm text-gray-500">Upload materials, homework, notes & quizzes</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-xl text-sm">
            {myClasses.map(c => <option key={c.id} value={c.id}>Class {c.className} - {c.section}</option>)}
          </select>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-[#7b1113] text-white rounded-xl text-sm font-medium hover:bg-[#5c0d0f] shadow-md"><Plus className="w-4 h-4" />Post</button>
        </div>
      </div>

      {/* Post Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl p-6">
            <h2 className="text-lg font-bold text-[#7b1113] mb-4">Post to Class</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <select required value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm">
                  <option value="">Subject</option>
                  {subjectOptions.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm">
                  <option value="NOTES">📝 Class Notes</option>
                  <option value="HOMEWORK">📋 Homework</option>
                  <option value="MATERIAL">📚 Study Material</option>
                  <option value="QUIZ">🧠 Quiz</option>
                  <option value="ANNOUNCEMENT">📢 Announcement</option>
                </select>
              </div>
              <input placeholder="Title" required value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm" />
              <textarea placeholder="Content / Instructions / Questions..." rows={4} value={form.content} onChange={e => setForm({...form, content: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm resize-none" />
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 px-4 py-2.5 border border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-[#7b1113] transition text-sm text-gray-500">
                  <FileText className="w-4 h-4" />{form.fileName || 'Attach PDF'}
                  <input type="file" accept=".pdf" onChange={e => { const f = e.target.files[0]; if (f) { const reader = new FileReader(); reader.onloadend = () => setForm({...form, fileData: reader.result, fileName: f.name}); reader.readAsDataURL(f); } }} className="hidden" />
                </label>
                {form.fileName && <button type="button" onClick={() => setForm({...form, fileData: '', fileName: ''})} className="text-xs text-red-500">Remove</button>}
              </div>
              {(form.type === 'HOMEWORK' || form.type === 'QUIZ') && (
                <input type="date" placeholder="Due Date" value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})} className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm" />
              )}
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-[#7b1113] text-white rounded-xl text-sm font-medium">Post</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Materials Feed */}
      {materials.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl"><FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" /><p className="text-gray-400">No posts yet. Click "Post" to share materials with your class.</p></div>
      ) : (
        <div className="space-y-3">
          {materials.map(m => {
            const Icon = TYPE_ICONS[m.type] || FileText;
            const color = TYPE_COLORS[m.type] || 'bg-gray-100 text-gray-600';
            return (
              <div key={m.id} className="bg-white border border-[#7b1113]/10 rounded-xl shadow-sm p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}><Icon className="w-4 h-4" /></div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-medium bg-[#7b1113]/10 text-[#7b1113] px-2 py-0.5 rounded">{m.type}</span>
                        <span className="text-[10px] text-gray-400">{m.subject}</span>
                        {m.dueDate && <span className="text-[10px] text-orange-500">Due: {m.dueDate}</span>}
                      </div>
                      <h4 className="font-medium text-gray-900 text-sm">{m.title}</h4>
                      {m.content && <p className="text-xs text-gray-500 mt-1 whitespace-pre-wrap line-clamp-3">{m.content}</p>}
                      {m.hasFile && <button onClick={() => downloadFile(m.id)} className="mt-2 flex items-center gap-1 text-xs text-[#7b1113] font-medium hover:underline"><Download className="w-3 h-3" />{m.fileName || 'Download PDF'}</button>}
                      <p className="text-[10px] text-gray-400 mt-2">{m.createdAt?.split('T')[0]}</p>
                    </div>
                  </div>
                  <button onClick={() => deleteMaterial(m.id)} className="p-1.5 text-gray-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
