import { useState, useEffect } from 'react';
import api from '../services/api';
import { Loader2, Clock, User, FileText, DollarSign, Users, ClipboardList, X, ChevronRight } from 'lucide-react';

const ICONS = { Student: Users, Payment: DollarSign, Attendance: ClipboardList, Teacher: Users, Exam: FileText };
const COLORS = {
  CREATED: { badge: 'bg-green-100 text-green-700', icon: 'bg-green-50 text-green-600', border: 'border-green-200' },
  UPDATED: { badge: 'bg-blue-100 text-blue-700',  icon: 'bg-blue-50 text-blue-600',   border: 'border-blue-200'  },
  DELETED: { badge: 'bg-red-100 text-red-700',    icon: 'bg-red-50 text-red-600',     border: 'border-red-200'   },
};
const DEFAULT_COLOR = { badge: 'bg-gray-100 text-gray-700', icon: 'bg-gray-50 text-gray-600', border: 'border-gray-200' };

export default function ActivityLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    setLoading(true);
    api.get(`/audit-logs?page=${page}&size=30`)
      .then(r => setLogs(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page]);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-[#7b1113]" /></div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#7b1113] mb-2">Activity Log</h1>
      <p className="text-sm text-gray-500 mb-6">Click any entry to view full details</p>

      {logs.length === 0 ? (
        <p className="text-center py-12 text-gray-400">No activity recorded yet</p>
      ) : (
        <div className="space-y-2">
          {logs.map(log => {
            const Icon = ICONS[log.entity] || FileText;
            const c = COLORS[log.action] || DEFAULT_COLOR;
            return (
              <button key={log.id} onClick={() => setSelected(log)}
                className="w-full bg-white border border-gray-100 rounded-xl shadow-sm p-4 flex items-center gap-4 hover:border-[#7b1113]/30 hover:shadow-md transition text-left">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${c.icon}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${c.badge}`}>{log.action}</span>
                    <span className="text-xs text-gray-400">{log.entity}</span>
                  </div>
                  <p className="text-sm font-medium text-gray-900 truncate">{log.description}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                    <User className="w-3 h-3" />
                    <span className="font-medium text-gray-600">{log.performedBy || 'system'}</span>
                    {log.role && <span className="px-1.5 py-0.5 bg-gray-100 rounded text-[10px]">{log.role}</span>}
                    <span className="ml-auto flex items-center gap-1"><Clock className="w-3 h-3" />{getTimeAgo(log.createdAt)}</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
              </button>
            );
          })}
        </div>
      )}

      <div className="flex justify-center gap-3 mt-6">
        <button disabled={page === 0} onClick={() => setPage(p => p - 1)}
          className="px-4 py-2 border border-gray-200 rounded-xl text-sm disabled:opacity-40 hover:bg-gray-50">← Previous</button>
        <button onClick={() => setPage(p => p + 1)}
          className="px-4 py-2 border border-gray-200 rounded-xl text-sm hover:bg-gray-50">Next →</button>
      </div>

      {/* Detail Modal */}
      {selected && <DetailModal log={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function DetailModal({ log, onClose }) {
  const Icon = ICONS[log.entity] || FileText;
  const c = COLORS[log.action] || DEFAULT_COLOR;
  const date = new Date(log.createdAt);
  const [student, setStudent] = useState(null);
  const [fee, setFee] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [loadingExtra, setLoadingExtra] = useState(false);

  useEffect(() => {
    if (log.entity === 'Student' && log.entityId) {
      setLoadingExtra(true);
      Promise.all([
        api.get(`/students/${log.entityId}`).catch(() => null),
        api.get(`/fees/student/${log.entityId}/summary`).catch(() => null),
        api.get(`/attendance/student/${log.entityId}/summary`).catch(() => null),
      ]).then(([s, f, a]) => {
        setStudent(s?.data || null);
        setFee(f?.data || null);
        setAttendance(a?.data || null);
      }).finally(() => setLoadingExtra(false));
    }
  }, [log.entityId, log.entity]);

  const logFields = [
    { label: 'Action',       value: log.action },
    { label: 'Description',  value: log.description },
    { label: 'Performed By', value: log.performedBy || 'system', highlight: true },
    { label: 'Role',         value: log.role || '—', badge: true },
    { label: 'Date & Time',  value: `${date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} ${date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}` },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className={`flex items-center gap-3 p-5 border-b ${c.border} rounded-t-2xl sticky top-0 bg-white`}>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${c.icon}`}>
            <Icon className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded text-xs font-bold ${c.badge}`}>{log.action}</span>
              <span className="text-sm text-gray-500">{log.entity}</span>
            </div>
            <p className="text-sm font-semibold text-gray-900 mt-0.5 truncate">{log.description}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 flex-shrink-0">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Log meta */}
          <div className="space-y-2.5">
            {logFields.map(({ label, value, highlight, badge }) => (
              <div key={label} className="flex items-start gap-3">
                <span className="text-xs text-gray-400 w-28 flex-shrink-0 pt-0.5">{label}</span>
                <span className={`text-sm font-medium flex-1 ${highlight ? 'text-[#7b1113]' : 'text-gray-800'}`}>
                  {badge && value !== '—'
                    ? <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-medium">{value}</span>
                    : value}
                </span>
              </div>
            ))}
          </div>

          {/* Student details */}
          {log.entity === 'Student' && (
            loadingExtra ? (
              <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-[#7b1113]" /></div>
            ) : student ? (
              <>
                {/* Profile */}
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Student Profile</p>
                  <div className="bg-gray-50 rounded-xl p-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    {[
                      ['Name', student.name],
                      ['ID', student.studentUniqueId || '—'],
                      ['Class', student.className ? `${student.className} - ${student.section}` : '—'],
                      ['Roll No', student.rollNo ? `${student.rollNo}${student.studentUniqueId ? ` · ${student.studentUniqueId}` : ''}` : '—'],
                      ['Gender', student.gender || '—'],
                      ['DOB', student.dateOfBirth || '—'],
                      ['Father', student.fatherName || '—'],
                      ['Mother', student.motherName || '—'],
                      ['Mobile', student.parentMobile || '—'],
                      ['Email', student.email || '—'],
                      ['Hosteller', student.isHosteller ? 'Yes' : 'No'],
                      ['Transport', student.isTransportUser ? 'Yes' : 'No'],
                    ].map(([k, v]) => (
                      <div key={k}>
                        <span className="text-xs text-gray-400">{k}</span>
                        <p className="font-medium text-gray-800">{v}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Fee summary */}
                {fee && (
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Fee Summary</p>
                    <div className="bg-gray-50 rounded-xl p-4 grid grid-cols-3 gap-3 text-sm">
                      <div className="text-center">
                        <p className="text-xs text-gray-400">Total Fee</p>
                        <p className="font-bold text-gray-800">₹{fee.totalFee?.toLocaleString()}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-400">Paid</p>
                        <p className="font-bold text-green-600">₹{fee.totalPaid?.toLocaleString()}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-400">Due</p>
                        <p className={`font-bold ${fee.due > 0 ? 'text-red-500' : 'text-green-600'}`}>₹{fee.due?.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Attendance summary */}
                {attendance && (
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Attendance</p>
                    <div className="bg-gray-50 rounded-xl p-4 grid grid-cols-4 gap-3 text-sm">
                      <div className="text-center">
                        <p className="text-xs text-gray-400">Total</p>
                        <p className="font-bold text-gray-800">{attendance.totalDays}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-400">Present</p>
                        <p className="font-bold text-green-600">{attendance.presentDays}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-400">Absent</p>
                        <p className="font-bold text-red-500">{attendance.absentDays}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-400">%</p>
                        <p className={`font-bold ${attendance.attendancePercentage >= 75 ? 'text-green-600' : 'text-red-500'}`}>
                          {attendance.attendancePercentage?.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : null
          )}
        </div>

        <div className="px-5 pb-5">
          <button onClick={onClose} className="w-full py-2.5 bg-[#7b1113] text-white rounded-xl text-sm font-medium hover:bg-[#5c0d0f]">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function getTimeAgo(dateStr) {
  const d = new Date(dateStr);
  const diff = Math.floor((Date.now() - d) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}
