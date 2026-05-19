import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import DashboardLayout from './layouts/DashboardLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Teachers from './pages/Teachers';
import Classes from './pages/Classes';
import Attendance from './pages/Attendance';
import Events from './pages/Events';
import Blogs from './pages/Blogs';
import Exams from './pages/Exams';
import Fees from './pages/Fees';
import Analytics from './pages/Analytics';
import ActivityLog from './pages/ActivityLog';
import MyClass from './pages/MyClass';
import Quizzes from './pages/Quizzes';
import Leaves from './pages/Leaves';
import Profile from './pages/Profile';
import UserManagement from './pages/UserManagement';

function Placeholder({ title }) {
  return <div><h1 className="text-2xl font-bold text-[#7b1113] mb-4">{title}</h1><p className="text-gray-500">This module is coming soon.</p></div>;
}

function RoleRoute({ roles, children }) {
  const { user } = useAuth();
  if (!user || !roles.includes(user.role)) return <Navigate to="/dashboard" />;
  return children;
}

function AppRoutes() {
  const { user, loading } = useAuth();
  if (loading) return null;

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />

      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/students" element={<RoleRoute roles={['SYS_ADMIN','PRINCIPAL','CLERK','TEACHER']}><Students /></RoleRoute>} />
        <Route path="/teachers" element={<RoleRoute roles={['SYS_ADMIN','PRINCIPAL','CLERK']}><Teachers /></RoleRoute>} />
        <Route path="/classes" element={<RoleRoute roles={['SYS_ADMIN','PRINCIPAL','CLERK','TEACHER']}><Classes /></RoleRoute>} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/my-class" element={<MyClass />} />
        <Route path="/quizzes" element={<Quizzes />} />
        <Route path="/fees" element={<Fees />} />
        <Route path="/exams" element={<Exams />} />
        <Route path="/leaves" element={<Leaves />} />
        <Route path="/events" element={<Events />} />
        <Route path="/blogs" element={<Blogs />} />
        <Route path="/analytics" element={<RoleRoute roles={['SYS_ADMIN','PRINCIPAL']}><Analytics /></RoleRoute>} />
        <Route path="/activity" element={<RoleRoute roles={['SYS_ADMIN','PRINCIPAL','CLERK']}><ActivityLog /></RoleRoute>} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/users" element={<RoleRoute roles={['SYS_ADMIN']}><UserManagement /></RoleRoute>} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
