import { useState, useEffect } from 'react';
import api from '../services/api';
import { Loader2, Clock, User, FileText, DollarSign, Users, ClipboardList } from 'lucide-react';

const ICONS = { Student: Users, Payment: DollarSign, Attendance: ClipboardList, Teacher: Users, Exam: FileText };
const COLORS = { CREATED: 'bg-green-100 text-green-700', UPDATED: 'bg-blue-100 text-blue-700', DELETED: 'bg-red-100 text-red-700' };

export default function ActivityLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  useEffect(() => { fetchLogs(); }, [page]);
  const fetchLogs = async () => {
    try { const r = await api.get(`/audit-logs?page=${page}&size=30`); setLogs(r.data); }
    catch (e) {} finally { setLoading(false); }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-[#7b1113]" /></div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#7b1113] mb-2">Activity Log</h1>
      <p className="text-sm text-gray-500 mb-6">Recent changes and entries in the system</p>

      {logs.length === 0 ? <p className="text-center py-12 text-gray-400">No activity recorded yet</p> : (
        <div className="space-y-3">
          {logs.map(log => {
            const Icon = ICONS[log.entity] || FileText;
            const color = COLORS[log.action] || 'bg-gray-100 text-gray-700';
            const timeAgo = getTimeAgo(log.createdAt);
            return (
              <div key={log.id} className="bg-white border border-[#7b1113]/10 rounded-xl shadow-sm p-4 flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${color}`}>{log.action}</span>
                    <span className="text-xs text-gray-400">{log.entity}</span>
                  </div>
                  <p className="text-sm font-medium text-gray-900">{log.description}</p>
                  <div className="flex items-center gap-3 mt-1 text-[10px] text-gray-400">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{timeAgo}</span>
                    <span className="flex items-center gap-1"><User className="w-3 h-3" />{log.performedBy}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex justify-center gap-3 mt-6">
        <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="px-4 py-2 border border-gray-200 rounded-xl text-sm disabled:opacity-40">Previous</button>
        <button onClick={() => setPage(p => p + 1)} className="px-4 py-2 border border-gray-200 rounded-xl text-sm">Next</button>
      </div>
    </div>
  );
}

function getTimeAgo(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}
