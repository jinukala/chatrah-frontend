import { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import { Loader2, Menu, Bell } from 'lucide-react';
import { useWebSocket } from '../hooks/useWebSocket';

export default function DashboardLayout() {
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const { notifications, connected, clearNotifications } = useWebSocket(user?.userId);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#7b1113]" /></div>;
  if (!user) return <Navigate to="/login" />;

  return (
    <div className="flex">
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <div className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-200 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      <main className="lg:ml-64 flex-1 min-h-screen">
        {/* Top bar */}
        <div className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100">
              <Menu className="w-5 h-5 text-[#7b1113]" />
            </button>
            <span className="lg:hidden font-bold text-[#7b1113]">Chatrah</span>
          </div>
          {/* Notification Bell */}
          <div className="relative">
            <button onClick={() => setShowNotifs(!showNotifs)} className="p-2 rounded-lg hover:bg-gray-100 relative">
              <Bell className="w-5 h-5 text-gray-600" />
              {notifications.length > 0 && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>}
            </button>
            {showNotifs && (
              <div className="absolute right-0 top-12 w-80 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden">
                <div className="px-4 py-3 bg-[#7b1113]/5 border-b flex items-center justify-between">
                  <span className="text-sm font-semibold text-[#7b1113]">Notifications</span>
                  <div className="flex items-center gap-2">
                    {connected && <span className="w-2 h-2 bg-green-500 rounded-full"></span>}
                    {notifications.length > 0 && <button onClick={clearNotifications} className="text-[10px] text-gray-400 hover:text-gray-600">Clear</button>}
                  </div>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="text-center py-6 text-gray-400 text-sm">No new notifications</p>
                  ) : notifications.map(n => (
                    <div key={n.id} className="px-4 py-3 border-b border-gray-100 hover:bg-gray-50">
                      <p className="text-sm text-gray-900">{n.message}</p>
                      <p className="text-[10px] text-gray-400 mt-1">{new Date(n.timestamp).toLocaleTimeString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="p-4 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
