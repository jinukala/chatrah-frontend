import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Users, BookOpen, ClipboardList, DollarSign, FileText, Send, Loader2, UserPlus, Database, RefreshCw, ShieldCheck, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  if (user?.role === 'STUDENT') return <StudentDashboard />;
  if (user?.role === 'TEACHER') return <TeacherDashboard />;
  return <AdminDashboard />;
}

function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ students: 0, teachers: 0, classes: 0 });
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [pendingBlogs, setPendingBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create user form
  const [userForm, setUserForm] = useState({ username: '', password: '', role: 'PRINCIPAL' });
  const [userMsg, setUserMsg] = useState('');
  const [userErr, setUserErr] = useState('');
  const [userLoading, setUserLoading] = useState(false);

  // Cache state
  const [cacheMsg, setCacheMsg] = useState('');
  const [cacheLoading, setCacheLoading] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const [studRes, teachRes, classRes, leavesRes, blogsRes] = await Promise.all([
        api.get('/students').catch(() => ({ data: [] })),
        api.get('/teachers').catch(() => ({ data: [] })),
        api.get('/classes').catch(() => ({ data: [] })),
        api.get('/leaves/pending').catch(() => ({ data: [] })),
        api.get('/blogs/pending').catch(() => ({ data: [] })),
      ]);
      setStats({ students: studRes.data.length, teachers: teachRes.data.length, classes: classRes.data.length });
      setPendingLeaves(leavesRes.data.slice(0, 5));
      setPendingBlogs(blogsRes.data.slice(0, 5));
      setLoading(false);
    };
    fetchData();
  }, []);

  const createUser = async (e) => {
    e.preventDefault(); setUserErr(''); setUserMsg(''); setUserLoading(true);
    try {
      await api.post('/auth/create-user', userForm);
      setUserMsg(`User "${userForm.username}" created as ${userForm.role}`);
      setUserForm({ username: '', password: '', role: 'PRINCIPAL' });
    } catch (e) { setUserErr(e.response?.data?.message || 'Failed to create user'); }
    finally { setUserLoading(false); }
  };

  const clearCache = async (endpoint, label) => {
    setCacheLoading(label); setCacheMsg('');
    try {
      await api.post(`/cache/clear/${endpoint}`);
      setCacheMsg(`${label} cache cleared`);
    } catch (e) { setCacheMsg('Failed to clear cache'); }
    finally { setCacheLoading(''); }
  };

  const approveBlog = async (id) => {
    await api.put(`/blogs/${id}/approve`).catch(() => {});
    setPendingBlogs(prev => prev.filter(b => b.id !== id));
  };
  const rejectBlog = async (id) => {
    await api.put(`/blogs/${id}/reject`).catch(() => {});
    setPendingBlogs(prev => prev.filter(b => b.id !== id));
  };
  const approveLeave = async (id) => {
    await api.put(`/leaves/${id}/approve`, {}).catch(() => {});
    setPendingLeaves(prev => prev.filter(l => l.id !== id));
  };
  const rejectLeave = async (id) => {
    await api.put(`/leaves/${id}/reject`, {}).catch(() => {});
    setPendingLeaves(prev => prev.filter(l => l.id !== id));
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[#7b1113]" /></div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#7b1113] to-[#5c0d0f] rounded-2xl p-6 text-white flex items-center gap-4">
        <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-xl font-bold">System Admin — {user?.displayName || 'sysadmin'}</h1>
          <p className="text-white/60 text-sm mt-0.5">{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Students', value: stats.students, icon: Users, color: 'blue' },
          { label: 'Teachers', value: stats.teachers, icon: Users, color: 'green' },
          { label: 'Classes', value: stats.classes, icon: BookOpen, color: 'purple' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className={`w-9 h-9 bg-${color}-100 rounded-lg flex items-center justify-center mb-3`}>
              <Icon className={`w-4 h-4 text-${color}-600`} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Create User */}
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <UserPlus className="w-5 h-5 text-[#7b1113]" />
            <h2 className="font-semibold text-gray-900">Create User</h2>
          </div>
          {userErr && <div className="mb-3 p-2 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">{userErr}</div>}
          {userMsg && <div className="mb-3 p-2 bg-green-50 border border-green-200 text-green-700 text-xs rounded-lg flex items-center gap-1"><CheckCircle className="w-3 h-3" />{userMsg}</div>}
          <form onSubmit={createUser} className="space-y-3">
            <input placeholder="Username" required value={userForm.username} onChange={e => setUserForm({ ...userForm, username: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#7b1113] outline-none" />
            <input placeholder="Password" type="password" required value={userForm.password} onChange={e => setUserForm({ ...userForm, password: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#7b1113] outline-none" />
            <select value={userForm.role} onChange={e => setUserForm({ ...userForm, role: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#7b1113] outline-none">
              <option value="PRINCIPAL">Principal</option>
              <option value="CLERK">Clerk</option>
              <option value="SYS_ADMIN">System Admin</option>
            </select>
            <button type="submit" disabled={userLoading}
              className="w-full py-2.5 bg-[#7b1113] text-white rounded-lg text-sm font-medium hover:bg-[#5c0d0f] disabled:opacity-50 flex items-center justify-center gap-2">
              {userLoading && <Loader2 className="w-4 h-4 animate-spin" />} Create User
            </button>
          </form>
        </div>

        {/* Cache Management */}
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <Database className="w-5 h-5 text-[#7b1113]" />
            <h2 className="font-semibold text-gray-900">Cache Management</h2>
          </div>
          {cacheMsg && <div className="mb-3 p-2 bg-blue-50 border border-blue-200 text-blue-700 text-xs rounded-lg">{cacheMsg}</div>}
          <div className="space-y-2">
            {[
              { key: 'all', label: 'All Caches' },
              { key: 'fee', label: 'Fee Summary' },
              { key: 'attendance', label: 'Attendance' },
              { key: 'class-students', label: 'Class Students' },
              { key: 'school-profile', label: 'School Profile' },
            ].map(({ key, label }) => (
              <button key={key} onClick={() => clearCache(key, label)} disabled={!!cacheLoading}
                className="w-full flex items-center justify-between px-4 py-2.5 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50">
                <span className="text-gray-700">{label}</span>
                {cacheLoading === label
                  ? <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                  : <RefreshCw className="w-4 h-4 text-gray-400" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Pending Leaves */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          {pendingLeaves.length > 0 && <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />}
          <h2 className="font-semibold text-gray-900">Pending Leave Requests</h2>
          <span className="ml-auto text-xs text-gray-400">{pendingLeaves.length} pending</span>
        </div>
        {pendingLeaves.length === 0 ? (
          <p className="text-center py-8 text-sm text-gray-400">No pending leave requests</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Student</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Class</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Dates</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Reason</th>
                <th className="text-center px-4 py-3 text-gray-500 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {pendingLeaves.map(l => (
                <tr key={l.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{l.studentName}</td>
                  <td className="px-4 py-3 text-gray-500">{l.className}-{l.section}</td>
                  <td className="px-4 py-3 text-gray-500">{l.fromDate} → {l.toDate}</td>
                  <td className="px-4 py-3 text-gray-500">{l.reason}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 justify-center">
                      <button onClick={() => approveLeave(l.id)} className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium hover:bg-green-200">
                        <CheckCircle className="w-3 h-3" /> Approve
                      </button>
                      <button onClick={() => rejectLeave(l.id)} className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium hover:bg-red-200">
                        <XCircle className="w-3 h-3" /> Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pending Blogs */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          {pendingBlogs.length > 0 && <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />}
          <h2 className="font-semibold text-gray-900">Pending Blog Approvals</h2>
          <span className="ml-auto text-xs text-gray-400">{pendingBlogs.length} pending</span>
        </div>
        {pendingBlogs.length === 0 ? (
          <p className="text-center py-8 text-sm text-gray-400">No pending blog approvals</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Title</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Author</th>
                <th className="text-center px-4 py-3 text-gray-500 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {pendingBlogs.map(b => (
                <tr key={b.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{b.title}</td>
                  <td className="px-4 py-3 text-gray-500">{b.authorName || b.author || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 justify-center">
                      <button onClick={() => approveBlog(b.id)} className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium hover:bg-green-200">
                        <CheckCircle className="w-3 h-3" /> Approve
                      </button>
                      <button onClick={() => rejectBlog(b.id)} className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium hover:bg-red-200">
                        <XCircle className="w-3 h-3" /> Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function TeacherDashboard() {
  const { user } = useAuth();
  const [classInfo, setClassInfo] = useState(null);
  const [students, setStudents] = useState([]);
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [todayPresent, setTodayPresent] = useState(0);
  const [todayAbsent, setTodayAbsent] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const classesRes = await api.get('/classes');
        const myClass = classesRes.data.find(c => c.classTeacherId === user?.teacherId);
        if (myClass) {
          setClassInfo(myClass);
          const studRes = await api.get(`/classes/${myClass.id}/students`);
          setStudents(studRes.data);
          // Fetch today's attendance for this class
          try {
            const today = new Date().toISOString().split('T')[0];
            const attRes = await api.get(`/attendance/class/${myClass.id}?date=${today}`);
            const records = attRes.data || [];
            setTodayPresent(records.filter(r => r.present).length);
            setTodayAbsent(records.filter(r => !r.present).length);
          } catch (e) {
            // If no attendance marked yet today
            setTodayPresent(0);
            setTodayAbsent(0);
          }
        }
        const leavesRes = await api.get('/leaves/pending');
        setPendingLeaves(leavesRes.data);
      } catch (e) {}
      setLoading(false);
    };
    fetchData();
  }, [user]);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[#7b1113]" /></div>;

  return (
    <div>
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-[#7b1113] to-[#5c0d0f] rounded-2xl p-6 mb-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">
            {(user?.displayName || 'T')[0]}
          </div>
          <div>
            <h1 className="text-xl font-bold">{user?.displayName || user?.username}</h1>
            <p className="text-white/70 text-sm">Class Teacher {classInfo ? `• Class ${classInfo.className} - ${classInfo.section}` : ''}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-[#7b1113]/10 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-2"><div className="w-9 h-9 bg-purple-100 rounded-lg flex items-center justify-center"><BookOpen className="w-4 h-4 text-purple-600" /></div><span className="text-xs text-gray-500">My Class</span></div>
          <p className="text-lg font-bold text-gray-900">{classInfo ? `${classInfo.className} - ${classInfo.section}` : '—'}</p>
        </div>
        <div className="bg-white rounded-2xl border border-[#7b1113]/10 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-2"><div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center"><Users className="w-4 h-4 text-blue-600" /></div><span className="text-xs text-gray-500">Students</span></div>
          <p className="text-lg font-bold text-gray-900">{students.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-[#7b1113]/10 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-2"><div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center"><ClipboardList className="w-4 h-4 text-green-600" /></div><span className="text-xs text-gray-500">Present</span></div>
          <p className="text-lg font-bold text-green-600">{todayPresent}</p>
        </div>
        <div className="bg-white rounded-2xl border border-[#7b1113]/10 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-2"><div className="w-9 h-9 bg-red-100 rounded-lg flex items-center justify-center"><ClipboardList className="w-4 h-4 text-red-500" /></div><span className="text-xs text-gray-500">Absent</span></div>
          <p className="text-lg font-bold text-red-500">{todayAbsent}</p>
        </div>
        <div className="bg-white rounded-2xl border border-[#7b1113]/10 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-2"><div className="w-9 h-9 bg-orange-100 rounded-lg flex items-center justify-center"><Send className="w-4 h-4 text-orange-600" /></div><span className="text-xs text-gray-500">Leaves</span></div>
          <p className="text-lg font-bold text-orange-600">{pendingLeaves.length}</p>
        </div>
      </div>

      {pendingLeaves.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-[#7b1113] mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></span>Pending Leave Requests
          </h2>
          <div className="bg-white border border-[#7b1113]/10 rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[#7b1113]/5 border-b"><tr><th className="text-left px-4 py-3 text-gray-600">Student</th><th className="text-left px-4 py-3 text-gray-600">From</th><th className="text-left px-4 py-3 text-gray-600">To</th><th className="text-left px-4 py-3 text-gray-600">Reason</th><th className="text-center px-4 py-3 text-gray-600">Action</th></tr></thead>
              <tbody>
                {pendingLeaves.slice(0, 5).map(l => (
                  <tr key={l.id} className="border-b border-gray-100">
                    <td className="px-4 py-3 font-medium">{l.studentName}</td>
                    <td className="px-4 py-3">{l.fromDate}</td>
                    <td className="px-4 py-3">{l.toDate}</td>
                    <td className="px-4 py-3">{l.reason}</td>
                    <td className="px-4 py-3 text-center flex gap-1 justify-center">
                      <button onClick={() => api.put(`/leaves/${l.id}/approve`, {}).then(() => setPendingLeaves(prev => prev.filter(x => x.id !== l.id)))} className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">Approve</button>
                      <button onClick={() => api.put(`/leaves/${l.id}/reject`, {}).then(() => setPendingLeaves(prev => prev.filter(x => x.id !== l.id)))} className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">Reject</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {students.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-[#7b1113] mb-3">My Class Students</h2>
          <div className="bg-white border border-[#7b1113]/10 rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[#7b1113]/5 border-b"><tr><th className="text-left px-4 py-3 text-gray-600">Roll</th><th className="text-left px-4 py-3 text-gray-600">Name</th><th className="text-left px-4 py-3 text-gray-600">Father</th><th className="text-left px-4 py-3 text-gray-600">Mobile</th></tr></thead>
              <tbody>
                {students.map(s => (
                  <tr key={s.id} className="border-b border-gray-100">
                    <td className="px-4 py-3">{s.studentUniqueId && <span className="font-mono text-xs text-gray-400 mr-1">{s.studentUniqueId} ·</span>}{s.rollNo}</td>
                    <td className="px-4 py-3 font-medium">{s.name}</td>
                    <td className="px-4 py-3">{s.fatherName}</td>
                    <td className="px-4 py-3">{s.parentMobile}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function StudentDashboard() {
  const { user } = useAuth();
  const [feeSummary, setFeeSummary] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [classInfo, setClassInfo] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [feeRes, attRes, leaveRes, classesRes, teachersRes, profileRes] = await Promise.all([
          api.get('/fees/me/summary').catch(() => ({ data: null })),
          api.get('/attendance/student/me').catch(() => ({ data: [] })),
          api.get('/leaves/my').catch(() => ({ data: [] })),
          api.get('/classes').catch(() => ({ data: [] })),
          api.get('/teachers').catch(() => ({ data: [] })),
          user?.studentId ? api.get(`/students/${user.studentId}`).catch(() => ({ data: null })) : { data: null },
        ]);
        setFeeSummary(feeRes.data);
        setAttendance(attRes.data || []);
        setLeaves(leaveRes.data || []);
        setTeachers(teachersRes.data || []);
        setProfile(profileRes.data);
        if (feeRes.data?.className) {
          const cls = classesRes.data.find(c => c.className === feeRes.data.className && c.section === feeRes.data.section);
          setClassInfo(cls);
        }
      } catch (e) {}
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[#7b1113]" /></div>;

  const present = attendance.filter(r => r.present).length;
  const total = attendance.length;
  const pct = total > 0 ? ((present / total) * 100).toFixed(1) : '0';
  const pendingLeaves = leaves.filter(l => l.status === 'PENDING').length;
  const subjects = classInfo?.subjects ? classInfo.subjects.split(',').map(s => s.trim()) : [];

  return (
    <div>
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-[#7b1113] to-[#5c0d0f] rounded-2xl p-6 mb-6 text-white">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">
            {(profile?.name || feeSummary?.studentName || user?.displayName || 'S')[0]}
          </div>
          <div>
            <h1 className="text-xl font-bold">Welcome, {profile?.name || feeSummary?.studentName || user?.displayName || 'Student'}!</h1>
            <div className="flex items-center gap-3 mt-1 text-white/70 text-sm">
              {profile?.studentUniqueId && <span className="bg-white/20 px-2 py-0.5 rounded text-xs font-medium">{profile.studentUniqueId}</span>}
              {(profile?.className || feeSummary?.className) && <span>Class {profile?.className || feeSummary?.className} - {profile?.section || feeSummary?.section}</span>}
              {profile?.rollNo && <span>Roll No: {profile.rollNo}{profile?.studentUniqueId ? ` · ${profile.studentUniqueId}` : ''}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-[#7b1113]/10 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-2"><div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center"><ClipboardList className="w-4 h-4 text-green-600" /></div><span className="text-sm text-gray-500">Attendance</span></div>
          <p className="text-2xl font-bold text-gray-900">{pct}%</p>
          <p className="text-xs text-gray-400">{present}/{total} days present</p>
        </div>
        <div className="bg-white rounded-2xl border border-[#7b1113]/10 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-2"><div className="w-9 h-9 bg-red-100 rounded-lg flex items-center justify-center"><DollarSign className="w-4 h-4 text-red-600" /></div><span className="text-sm text-gray-500">Fee Due</span></div>
          <p className="text-2xl font-bold text-gray-900">₹{feeSummary?.due?.toLocaleString() ?? '—'}</p>
          <p className="text-xs text-gray-400">of ₹{feeSummary?.totalFee?.toLocaleString() ?? '—'}</p>
        </div>
        <div className="bg-white rounded-2xl border border-[#7b1113]/10 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-2"><div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center"><DollarSign className="w-4 h-4 text-green-600" /></div><span className="text-sm text-gray-500">Fee Paid</span></div>
          <p className="text-2xl font-bold text-gray-900">₹{feeSummary?.totalPaid?.toLocaleString() ?? '—'}</p>
        </div>
        <div className="bg-white rounded-2xl border border-[#7b1113]/10 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-2"><div className="w-9 h-9 bg-orange-100 rounded-lg flex items-center justify-center"><Send className="w-4 h-4 text-orange-600" /></div><span className="text-sm text-gray-500">Pending Leaves</span></div>
          <p className="text-2xl font-bold text-gray-900">{pendingLeaves}</p>
        </div>
      </div>

      {subjects.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">My Subjects & Teachers</h2>
          <div className="bg-white border border-[#7b1113]/10 rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[#7b1113]/5 border-b"><tr><th className="text-left px-4 py-3 text-gray-600">Subject</th><th className="text-left px-4 py-3 text-gray-600">Teacher</th><th className="text-left px-4 py-3 text-gray-600">Phone</th></tr></thead>
              <tbody>
                {subjects.map((sub, i) => {
                  const teacher = teachers.find(t => t.subjects?.toLowerCase().includes(sub.toLowerCase()) || t.subject?.toLowerCase() === sub.toLowerCase());
                  return (
                    <tr key={i} className="border-b border-gray-100">
                      <td className="px-4 py-3 font-medium">{sub}</td>
                      <td className="px-4 py-3">{teacher?.name || '—'}</td>
                      <td className="px-4 py-3 text-gray-500">{teacher?.mobile || '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {leaves.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Recent Leave Applications</h2>
          <div className="bg-white border border-[#7b1113]/10 rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[#7b1113]/5 border-b"><tr><th className="text-left px-4 py-3 text-gray-600">From</th><th className="text-left px-4 py-3 text-gray-600">To</th><th className="text-left px-4 py-3 text-gray-600">Reason</th><th className="text-center px-4 py-3 text-gray-600">Status</th></tr></thead>
              <tbody>
                {leaves.slice(0, 5).map(l => (
                  <tr key={l.id} className="border-b border-gray-100">
                    <td className="px-4 py-3">{l.fromDate}</td>
                    <td className="px-4 py-3">{l.toDate}</td>
                    <td className="px-4 py-3">{l.reason}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${l.status === 'APPROVED' ? 'bg-green-100 text-green-700' : l.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{l.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
