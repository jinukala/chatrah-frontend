import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Loader2, DollarSign, Plus, Download } from 'lucide-react';
import { downloadFeeReceiptPDF } from '../utils/pdfGenerator';

export default function Fees() {
  const { user } = useAuth();
  if (user?.role === 'STUDENT') return <StudentFees />;
  return <ManageFees />;
}

function StudentFees() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.get('/fees/me/summary').then(r => setSummary(r.data)).catch(() => {}).finally(() => setLoading(false)); }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-[#7b1113]" /></div>;
  if (!summary) return <p className="text-gray-400 text-center py-8">Fee information not available</p>;

  const paidPct = summary.totalFee > 0 ? (summary.totalPaid / summary.totalFee) * 100 : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#7b1113]">My Fees</h1>
          <p className="text-sm text-gray-500">{summary.studentName} • {summary.className ? `Class ${summary.className} - ${summary.section}` : ''}</p>
        </div>
        <button onClick={() => downloadFeeReceiptPDF(summary, summary.studentName || 'Student')} className="flex items-center gap-2 px-5 py-2.5 bg-[#7b1113] text-white rounded-xl text-sm font-medium hover:bg-[#5c0d0f] shadow-md"><Download className="w-4 h-4" />Download Receipt</button>
      </div>

      {/* Fee Summary Cards */}
      <div className="bg-gradient-to-r from-[#7b1113] to-[#5c0d0f] rounded-2xl p-6 mb-6 text-white">
        <div className="grid grid-cols-3 gap-6">
          <div>
            <p className="text-white/70 text-sm">Total Fee</p>
            <p className="text-3xl font-bold mt-1">₹{summary.totalFee?.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-white/70 text-sm">Paid</p>
            <p className="text-3xl font-bold mt-1 text-green-300">₹{summary.totalPaid?.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-white/70 text-sm">Due</p>
            <p className="text-3xl font-bold mt-1 text-[#d4a017]">₹{summary.due?.toLocaleString()}</p>
          </div>
        </div>
        {/* Progress bar */}
        <div className="mt-5">
          <div className="flex justify-between text-xs text-white/60 mb-1">
            <span>Payment Progress</span>
            <span>{paidPct.toFixed(0)}% paid</span>
          </div>
          <div className="h-2.5 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-[#d4a017] rounded-full transition-all" style={{ width: `${paidPct}%` }}></div>
          </div>
        </div>
      </div>

      {/* Payment History */}
      {summary.payments?.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Payment History</h2>
          <div className="space-y-3">
            {summary.payments.map(p => (
              <div key={p.paymentId} className="bg-white border border-[#7b1113]/10 rounded-xl shadow-sm p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">₹{p.amount?.toLocaleString()}</p>
                    <p className="text-xs text-gray-400">{p.paidOn?.split('T')[0]} • {p.mode}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${p.status === 'SUCCESS' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{p.status}</span>
                  <p className="text-[10px] text-gray-400 mt-1">{p.receiptNo}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {(!summary.payments || summary.payments.length === 0) && (
        <div className="text-center py-12 bg-gray-50 rounded-2xl">
          <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400">No payments recorded yet</p>
        </div>
      )}
    </div>
  );
}

function ManageFees() {
  const [tab, setTab] = useState('plans');
  const [classes, setClasses] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ classId: '', totalFee: '', hostelFee: '', transportFee: '', iitNeetFee: '' });

  // Student fee view
  const [selectedClass, setSelectedClass] = useState('');
  const [studentFees, setStudentFees] = useState([]);
  const [feesLoading, setFeesLoading] = useState(false);

  // Record payment
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentSummary, setStudentSummary] = useState(null);
  const [payForm, setPayForm] = useState({ amount: '', mode: 'CASH', remarks: '' });
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    Promise.all([api.get('/classes'), api.get('/fees/plans')])
      .then(([c, p]) => { setClasses(c.data); setPlans(p.data); })
      .catch(() => {}).finally(() => setLoading(false));
  }, []);

  const savePlan = async (e) => {
    e.preventDefault();
    try {
      await api.post('/fees/plans', { classId: Number(form.classId), totalFee: Number(form.totalFee) || 0, hostelFee: Number(form.hostelFee) || 0, transportFee: Number(form.transportFee) || 0, iitNeetFee: Number(form.iitNeetFee) || 0 });
      const p = await api.get('/fees/plans'); setPlans(p.data); setShowForm(false);
    } catch (e) { alert(e.response?.data?.message || 'Error'); }
  };

  const loadStudentFees = async () => {
    if (!selectedClass) return;
    setFeesLoading(true);
    try {
      const studRes = await api.get(`/classes/${selectedClass}/students`);
      const fees = await Promise.all(studRes.data.map(s => api.get(`/fees/student/${s.id}/summary`).then(r => r.data).catch(() => null)));
      setStudentFees(fees.filter(Boolean));
    } catch (e) {} finally { setFeesLoading(false); }
  };

  const searchStudent = async () => {
    if (!searchQuery.trim()) return;
    try { const r = await api.get(`/fees/search?q=${encodeURIComponent(searchQuery)}`); setSearchResults(r.data); } catch (e) {}
  };

  const selectStudent = async (s) => {
    setSelectedStudent({ id: s.id, name: s.name, className: s.className, section: s.section, rollNo: s.rollNo });
    setSearchResults([]);
    try { const r = await api.get(`/fees/student/${s.id}/summary`); setStudentSummary(r.data); } catch (e) {}
  };

  const recordPayment = async (e) => {
    e.preventDefault();
    if (!selectedStudent || !payForm.amount) return;
    setPaying(true);
    try {
      const r = await api.post(`/fees/student/${selectedStudent.id}/payment`, { amount: Number(payForm.amount), mode: payForm.mode, remarks: payForm.remarks });
      setStudentSummary(r.data);
      setPayForm({ amount: '', mode: 'CASH', remarks: '' });
      alert('Payment recorded successfully!');
    } catch (e) { alert(e.response?.data?.message || 'Error'); }
    finally { setPaying(false); }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-[#7b1113]" /></div>;

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-[#7b1113]">Fees Management</h1>
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button onClick={() => setTab('plans')} className={`px-3 py-1.5 rounded-md text-sm font-medium ${tab === 'plans' ? 'bg-white shadow' : 'text-gray-500'}`}>Fee Plans</button>
          <button onClick={() => setTab('students')} className={`px-3 py-1.5 rounded-md text-sm font-medium ${tab === 'students' ? 'bg-white shadow' : 'text-gray-500'}`}>Class Fees</button>
          <button onClick={() => setTab('payment')} className={`px-3 py-1.5 rounded-md text-sm font-medium ${tab === 'payment' ? 'bg-white shadow' : 'text-gray-500'}`}>Record Payment</button>
        </div>
      </div>

      {tab === 'plans' && (
        <div>
          {!showForm && <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-[#7b1113] text-white rounded-lg text-sm font-medium hover:bg-[#5c0d0f] mb-4"><Plus className="w-4 h-4" />Add/Update Fee Plan</button>}
          {showForm && (
            <div className="bg-white border border-[#7b1113]/10 rounded-xl shadow-sm p-6 mb-4">
              <form onSubmit={savePlan} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <select required value={form.classId} onChange={e => setForm({...form, classId: e.target.value})} className="px-3 py-2 border border-gray-300 rounded-lg text-sm"><option value="">Select Class</option>{classes.map(c => <option key={c.id} value={c.id}>Class {c.className} - {c.section}</option>)}</select>
                <input type="number" placeholder="Base Fee (₹)" required value={form.totalFee} onChange={e => setForm({...form, totalFee: e.target.value})} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                <input type="number" placeholder="Hostel Fee (₹)" value={form.hostelFee} onChange={e => setForm({...form, hostelFee: e.target.value})} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                <input type="number" placeholder="Transport Fee (₹)" value={form.transportFee} onChange={e => setForm({...form, transportFee: e.target.value})} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                <input type="number" placeholder="IIT/NEET Fee (₹)" value={form.iitNeetFee} onChange={e => setForm({...form, iitNeetFee: e.target.value})} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                <div className="flex gap-2"><button type="submit" className="px-4 py-2 bg-[#7b1113] text-white rounded-lg text-sm">Save</button><button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-100 rounded-lg text-sm">Cancel</button></div>
              </form>
            </div>
          )}
          <div className="bg-white border border-[#7b1113]/10 rounded-xl shadow-sm overflow-hidden">
            {plans.length === 0 ? <p className="text-center py-8 text-gray-400">No fee plans configured</p> : (
              <table className="w-full text-sm">
                <thead className="bg-[#7b1113]/5 border-b"><tr><th className="text-left px-4 py-3 text-gray-600">Class</th><th className="text-right px-4 py-3 text-gray-600">Base Fee</th><th className="text-right px-4 py-3 text-gray-600">Hostel</th><th className="text-right px-4 py-3 text-gray-600">Transport</th><th className="text-right px-4 py-3 text-gray-600">IIT/NEET</th></tr></thead>
                <tbody>{plans.map(p => (<tr key={p.id} className="border-b border-gray-100"><td className="px-4 py-3 font-medium">Class {p.className} - {p.section}</td><td className="px-4 py-3 text-right">₹{p.totalFee?.toLocaleString()}</td><td className="px-4 py-3 text-right">₹{p.hostelFee?.toLocaleString()}</td><td className="px-4 py-3 text-right">₹{p.transportFee?.toLocaleString()}</td><td className="px-4 py-3 text-right">₹{p.iitNeetFee?.toLocaleString()}</td></tr>))}</tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {tab === 'students' && (
        <div>
          <div className="flex gap-4 mb-6">
            <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm"><option value="">Select Class</option>{classes.map(c => <option key={c.id} value={c.id}>Class {c.className} - {c.section}</option>)}</select>
            <button onClick={loadStudentFees} className="px-4 py-2 bg-[#7b1113] text-white rounded-lg text-sm font-medium">Load</button>
          </div>
          {feesLoading && <Loader2 className="w-6 h-6 animate-spin text-[#7b1113] mx-auto" />}
          {!feesLoading && studentFees.length > 0 && (
            <div className="bg-white border border-[#7b1113]/10 rounded-xl shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-[#7b1113]/5 border-b"><tr><th className="text-left px-4 py-3 text-gray-600">Student</th><th className="text-right px-4 py-3 text-gray-600">Total Fee</th><th className="text-right px-4 py-3 text-gray-600">Paid</th><th className="text-right px-4 py-3 text-gray-600">Due</th><th className="text-center px-4 py-3 text-gray-600">Status</th></tr></thead>
                <tbody>{studentFees.map(f => (<tr key={f.studentId} className="border-b border-gray-100"><td className="px-4 py-3 font-medium">{f.studentName}</td><td className="px-4 py-3 text-right">₹{f.totalFee?.toLocaleString()}</td><td className="px-4 py-3 text-right text-green-600">₹{f.totalPaid?.toLocaleString()}</td><td className="px-4 py-3 text-right text-red-600">₹{f.due?.toLocaleString()}</td><td className="px-4 py-3 text-center"><span className={`px-2 py-1 rounded-full text-xs font-medium ${f.due === 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{f.due === 0 ? 'Paid' : 'Pending'}</span></td></tr>))}</tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === 'payment' && (
        <div>
          {/* Select Student by Class */}
          <div className="bg-white border border-[#7b1113]/10 rounded-xl shadow-sm p-6 mb-6">
            <h3 className="font-semibold mb-3">Select Student</h3>
            <div className="flex gap-3">
              <select value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setSelectedStudent(null); setStudentSummary(null); if (e.target.value) { api.get(`/classes/${e.target.value}/students`).then(r => setSearchResults(r.data)).catch(() => {}); } else { setSearchResults([]); } }} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                <option value="">Select Class</option>
                {classes.map(c => <option key={c.id} value={c.id}>Class {c.className} - {c.section}</option>)}
              </select>
              {searchResults.length > 0 && (
                <select onChange={e => { if (e.target.value) { const s = searchResults.find(x => String(x.id) === e.target.value); if (s) selectStudent(s); } }} className="px-3 py-2 border border-gray-300 rounded-lg text-sm flex-1">
                  <option value="">Select Student</option>
                  {searchResults.map(s => <option key={s.id} value={s.id}>{s.name} (Roll {s.rollNo})</option>)}
                </select>
              )}
            </div>
          </div>

          {/* Selected Student Summary */}
          {selectedStudent && studentSummary && (
            <div className="bg-white border border-[#7b1113]/10 rounded-xl shadow-sm p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{selectedStudent.name}</h3>
                  <p className="text-sm text-gray-500">Class {selectedStudent.className} - {selectedStudent.section} | ID: {selectedStudent.id}</p>
                </div>
                <button onClick={() => { setSelectedStudent(null); setStudentSummary(null); }} className="text-sm text-gray-400 hover:text-gray-600">✕ Clear</button>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-3"><p className="text-xs text-gray-500">Total Fee</p><p className="text-lg font-bold">₹{studentSummary.totalFee?.toLocaleString()}</p></div>
                <div className="bg-green-50 rounded-lg p-3"><p className="text-xs text-gray-500">Paid</p><p className="text-lg font-bold text-green-600">₹{studentSummary.totalPaid?.toLocaleString()}</p></div>
                <div className="bg-red-50 rounded-lg p-3"><p className="text-xs text-gray-500">Due</p><p className="text-lg font-bold text-red-600">₹{studentSummary.due?.toLocaleString()}</p></div>
              </div>

              {/* Record Payment Form */}
              <h4 className="font-medium mb-3">Record Payment</h4>
              <form onSubmit={recordPayment} className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <input type="number" placeholder="Amount (₹)" required value={payForm.amount} onChange={e => setPayForm({...payForm, amount: e.target.value})} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                <select value={payForm.mode} onChange={e => setPayForm({...payForm, mode: e.target.value})} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option value="CASH">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="CHEQUE">Cheque</option>
                  <option value="DD">DD</option>
                </select>
                <input placeholder="Remarks (optional)" value={payForm.remarks} onChange={e => setPayForm({...payForm, remarks: e.target.value})} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                <button type="submit" disabled={paying} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50">
                  {paying ? 'Processing...' : 'Record Payment'}
                </button>
              </form>

              {/* Payment History */}
              {studentSummary.payments?.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-medium mb-2">Payment History</h4>
                  <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                    <thead className="bg-gray-50"><tr><th className="text-left px-3 py-2 text-gray-600">Date</th><th className="text-right px-3 py-2 text-gray-600">Amount</th><th className="text-left px-3 py-2 text-gray-600">Mode</th><th className="text-left px-3 py-2 text-gray-600">Receipt</th></tr></thead>
                    <tbody>{studentSummary.payments.map(p => (<tr key={p.paymentId} className="border-t border-gray-100"><td className="px-3 py-2">{p.paidOn?.split('T')[0]}</td><td className="px-3 py-2 text-right font-medium">₹{p.amount?.toLocaleString()}</td><td className="px-3 py-2">{p.mode}</td><td className="px-3 py-2 text-gray-500">{p.receiptNo}</td></tr>))}</tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
