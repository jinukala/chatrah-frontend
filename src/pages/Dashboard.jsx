import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Users, BookOpen, ClipboardList, DollarSign, FileText, Send, Loader2 } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function Dashboard() {
  const { user } = useAuth();
  if (user?.role === 'STUDENT') return <StudentDashboard />;
  if (user?.role === 'TEACHER') return <TeacherDashboard />;
  return <AdminDashboard />;
}

function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ students: 0, teachers: 0, classes: 0, pendingLeaves: 0 });
  const [recentLeaves, setRecentLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studRes, teachRes, classRes, leavesRes, blogsRes] = await Promise.all([
          api.get('/students').catch(() => ({ data: [] })),
          api.get('/teachers').catch(() => ({ data: [] })),
          api.get('/classes').catch(() => ({ data: [] })),
          api.get('/leaves/pending').catch(() => ({ data: [] })),
          api.get('/blogs/pending').catch(() => ({ data: [] })),
        ]);
        // Build class-wise real student count
        const classData = await Promise.all(classRes.data.map(async c => {
          const s = await api.get(`/classes/${c.id}/students`).then(r => r.data.length).catch(() => 0);
          return { name: `${c.className}-${c.section}`, students: s };
        }));
        // Get today's attendance across all classes
        const today = new Date().toISOString().split('T')[0];
        let totalPresent = 0, totalAbsent = 0;
        for (const c of classRes.data.slice(0, 5)) {
          try { const att = await api.get(`/attendance/class/${c.id}?date=${today}`); totalPresent += att.data.filter(a => a.present).length; totalAbsent += att.data.filter(a => !a.present).length; } catch(e) {}
        }
        setStats({ students: studRes.data.length, teachers: teachRes.data.length, classes: classRes.data.length, pendingLeaves: leavesRes.data.length, pendingBlogs: blogsRes.data.length, classData, totalPresent, totalAbsent });
        setRecentLeaves(leavesRes.data.slice(0, 5));
      } catch (e) {}
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[#7b1113]" /></div>;

  return (
    <div>
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#7b1113] to-[#5c0d0f] rounded-2xl p-6 mb-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4"></div>
        <div className="absolute bottom-0 left-1/2 w-32 h-32 bg-[#d4a017]/10 rounded-full translate-y-1/2"></div>
        <h1 className="text-2xl font-bold relative">Welcome, {user?.displayName || 'Admin'}!</h1>
        <p className="text-white/70 mt-1 relative">Chatrah School — Admin Dashboard</p>
        <p className="text-white/50 text-xs mt-2 relative">{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-[#7b1113]/10 shadow-sm p-5">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mb-3"><Users className="w-5 h-5 text-blue-600" /></div>
          <p className="text-2xl font-bold text-gray-900">{stats.students}</p>
          <p className="text-xs text-gray-500">Total Students</p>
        </div>
        <div className="bg-white rounded-2xl border border-[#7b1113]/10 shadow-sm p-5">
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mb-3"><Users className="w-5 h-5 text-green-600" /></div>
          <p className="text-2xl font-bold text-gray-900">{stats.teachers}</p>
          <p className="text-xs text-gray-500">Total Teachers</p>
        </div>
        <div className="bg-white rounded-2xl border border-[#7b1113]/10 shadow-sm p-5">
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mb-3"><BookOpen className="w-5 h-5 text-purple-600" /></div>
          <p className="text-2xl font-bold text-gray-900">{stats.classes}</p>
          <p className="text-xs text-gray-500">Total Classes</p>
        </div>
        <div className="bg-white rounded-2xl border border-[#7b1113]/10 shadow-sm p-5 relative">
          {stats.pendingBlogs > 0 && <div className="absolute top-3 right-3 w-3 h-3 bg-orange-400 rounded-full animate-pulse"></div>}
          <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center mb-3"><Send className="w-5 h-5 text-orange-600" /></div>
          <p className="text-2xl font-bold text-gray-900">{stats.pendingBlogs}</p>
          <p className="text-xs text-gray-500">Pending Blogs</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Pie Chart */}
        <div className="bg-white border border-[#7b1113]/10 rounded-2xl shadow-sm p-5">
          <h3 className="font-semibold text-[#7b1113] mb-4">Today's School Attendance</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={[{name:'Present', value: stats.totalPresent || 0}, {name:'Absent', value: stats.totalAbsent || 0}]} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" label={({name, percent}) => `${name} ${(percent*100).toFixed(0)}%`}>
                  <Cell fill="#22c55e" /><Cell fill="#ef4444" />
                </Pie>
                <Tooltip /><Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Class-wise Bar Chart */}
        <div className="bg-white border border-[#7b1113]/10 rounded-2xl shadow-sm p-5">
          <h3 className="font-semibold text-[#7b1113] mb-4">Students per Class</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.classData || []}>
                <XAxis dataKey="name" tick={{fontSize: 11}} /><YAxis /><Tooltip />
                <Bar dataKey="students" fill="#7b1113" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Leaves */}
      {recentLeaves.length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold text-[#7b1113] mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></span>Pending Leave Requests
          </h2>
          <div className="bg-white border border-[#7b1113]/10 rounded-2xl shadow-sm overflow-hidden">
            {recentLeaves.length === 0 ? (
              <p className="text-center py-8 text-gray-400">No pending leave requests 🎉</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-[#7b1113]/5"><tr><th className="text-left px-4 py-3 text-gray-600">Student</th><th className="text-left px-4 py-3 text-gray-600">Class</th><th className="text-left px-4 py-3 text-gray-600">From</th><th className="text-left px-4 py-3 text-gray-600">To</th><th className="text-left px-4 py-3 text-gray-600">Reason</th></tr></thead>
                <tbody>
                  {recentLeaves.map(l => (
                    <tr key={l.id} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{l.studentName}</td>
                      <td className="px-4 py-3 text-gray-500">{l.className}-{l.section}</td>
                      <td className="px-4 py-3">{l.fromDate}</td>
                      <td className="px-4 py-3">{l.toDate}</td>
                      <td className="px-4 py-3 text-gray-500">{l.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
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
                    <td className="px-4 py-3">{s.rollNo}</td>
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
              {profile?.rollNo && <span>Roll No: {profile.rollNo}</span>}
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
