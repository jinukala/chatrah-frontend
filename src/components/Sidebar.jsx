import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, LayoutDashboard, Users, BookOpen, ClipboardList, DollarSign, FileText, Calendar, BarChart3, LogOut, Send, UserCircle } from 'lucide-react';
import clsx from 'clsx';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['SYS_ADMIN','PRINCIPAL','CLERK','TEACHER','STUDENT'] },
  { to: '/students', icon: Users, label: 'My Class Students', roles: ['TEACHER'] },
  { to: '/students', icon: Users, label: 'Students', roles: ['SYS_ADMIN','PRINCIPAL','CLERK'] },
  { to: '/teachers', icon: Users, label: 'Teachers', roles: ['SYS_ADMIN','PRINCIPAL','CLERK'] },
  { to: '/classes', icon: BookOpen, label: 'Classes', roles: ['SYS_ADMIN','PRINCIPAL','CLERK'] },
  { to: '/attendance', icon: ClipboardList, label: 'Attendance', roles: ['SYS_ADMIN','PRINCIPAL','CLERK','TEACHER'] },
  { to: '/my-class', icon: BookOpen, label: 'My Class', roles: ['TEACHER','STUDENT'] },
  { to: '/quizzes', icon: FileText, label: 'Quizzes', roles: ['TEACHER','STUDENT'] },
  { to: '/attendance', icon: ClipboardList, label: 'My Attendance', roles: ['STUDENT'] },
  { to: '/exams', icon: FileText, label: 'Exams & Marks', roles: ['SYS_ADMIN','PRINCIPAL','CLERK','TEACHER'] },
  { to: '/exams', icon: FileText, label: 'My Results', roles: ['STUDENT'] },
  { to: '/fees', icon: DollarSign, label: 'Fees', roles: ['SYS_ADMIN','PRINCIPAL','CLERK'] },
  { to: '/fees', icon: DollarSign, label: 'My Fees', roles: ['STUDENT'] },
  { to: '/leaves', icon: Send, label: 'Leave Requests', roles: ['TEACHER'] },
  { to: '/leaves', icon: Send, label: 'Teacher Leaves', roles: ['SYS_ADMIN','PRINCIPAL'] },
  { to: '/leaves', icon: Send, label: 'My Leaves', roles: ['STUDENT'] },
  { to: '/events', icon: Calendar, label: 'Events', roles: ['SYS_ADMIN','PRINCIPAL','CLERK','TEACHER','STUDENT'] },
  { to: '/blogs', icon: FileText, label: 'Blogs', roles: ['SYS_ADMIN','PRINCIPAL','CLERK','TEACHER','STUDENT'] },
  { to: '/analytics', icon: BarChart3, label: 'Analytics', roles: ['SYS_ADMIN','PRINCIPAL'] },
  { to: '/activity', icon: ClipboardList, label: 'Activity Log', roles: ['SYS_ADMIN','PRINCIPAL','CLERK'] },
  { to: '/users', icon: Users, label: 'User Management', roles: ['SYS_ADMIN'] },
  { to: '/profile', icon: UserCircle, label: 'My Profile', roles: ['SYS_ADMIN','PRINCIPAL','CLERK','TEACHER','STUDENT'] },
];

export default function Sidebar({ onClose }) {
  const { user, logout } = useAuth();
  const role = user?.role;

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col">
      <div className="p-5 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#7b1113] rounded-lg flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg text-[#7b1113]">Chatrah</span>
        </div>
        {onClose && <button onClick={onClose} className="lg:hidden p-1 rounded hover:bg-gray-100"><span className="text-gray-400 text-xl">✕</span></button>}
      </div>
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.filter(item => item.roles.includes(role)).map((item, idx) => (
          <NavLink key={item.to + idx} to={item.to} onClick={onClose} className={({ isActive }) => clsx(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition',
            isActive ? 'bg-[#7b1113]/10 text-[#7b1113]' : 'text-gray-600 hover:bg-gray-100 hover:text-[#7b1113]'
          )}>
            <item.icon className="w-5 h-5" />{item.label}
          </NavLink>
        ))}
      </nav>
      <div className="p-3 border-t border-gray-200">
        <div className="px-3 py-2 text-xs text-gray-500 mb-1">{user?.displayName || user?.username}</div>
        <button onClick={logout} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 w-full transition">
          <LogOut className="w-5 h-5" />Sign Out
        </button>
      </div>
    </aside>
  );
}
