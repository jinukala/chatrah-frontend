import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Lock, Loader2, CheckCircle, Eye, EyeOff, Camera, GraduationCap, Phone, Mail, Calendar, MapPin, BookOpen } from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [photo, setPhoto] = useState(localStorage.getItem('userPhoto') || null);
  const [showPwForm, setShowPwForm] = useState(false);
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (user?.studentId) {
          const res = await api.get(`/students/${user.studentId}`);
          setProfile({ type: 'student', ...res.data });
        } else if (user?.teacherId) {
          const res = await api.get(`/teachers/${user.teacherId}`);
          setProfile({ type: 'teacher', ...res.data });
        } else {
          setProfile({ type: 'admin' });
        }
      } catch (e) { setProfile({ type: 'admin' }); }
      setLoading(false);
    };
    fetchProfile();
  }, [user]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => { setPhoto(reader.result); localStorage.setItem('userPhoto', reader.result); };
      reader.readAsDataURL(file);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault(); setError(''); setMsg('');
    if (pwForm.newPassword !== pwForm.confirmPassword) { setError('Passwords do not match'); return; }
    if (pwForm.newPassword.length < 6) { setError('Min 6 characters'); return; }
    setPwLoading(true);
    try {
      await api.post('/auth/password/change', { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      setMsg('Password changed successfully!');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => { setShowPwForm(false); setMsg(''); }, 2000);
    } catch (e) { setError(e.response?.data?.message || 'Failed'); }
    finally { setPwLoading(false); }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-[#7b1113]" /></div>;

  const name = profile?.name || user?.displayName || user?.username;

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-[#7b1113] mb-6">My Profile</h1>

      {/* Profile Header Card */}
      <div className="bg-gradient-to-r from-[#7b1113] to-[#5c0d0f] rounded-2xl p-6 mb-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="flex items-center gap-5">
          <div className="relative">
            {photo ? (
              <img src={photo} alt="Profile" className="w-20 h-20 rounded-full object-cover border-4 border-white/30" />
            ) : (
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-3xl font-bold border-4 border-white/30">
                {name[0]}
              </div>
            )}
            <label className="absolute bottom-0 right-0 w-7 h-7 bg-[#d4a017] rounded-full flex items-center justify-center cursor-pointer hover:bg-[#b8891a] transition shadow-lg">
              <Camera className="w-3.5 h-3.5 text-white" />
              <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
            </label>
          </div>
          <div>
            <h2 className="text-xl font-bold">{name}</h2>
            <p className="text-white/70 text-sm">{profile?.type === 'student' ? 'Student' : profile?.type === 'teacher' ? 'Teacher' : 'Administrator'}</p>
            {profile?.studentUniqueId && <span className="inline-block mt-1 bg-[#d4a017] text-white text-xs font-bold px-3 py-0.5 rounded-full">{profile.studentUniqueId}</span>}
            {profile?.teacherUniqueId && <span className="inline-block mt-1 bg-[#d4a017] text-white text-xs font-bold px-3 py-0.5 rounded-full">{profile.teacherUniqueId}</span>}
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {profile?.type === 'student' && (<>
          <InfoCard icon={BookOpen} label="Class" value={profile.className ? `Class ${profile.className} - ${profile.section}` : '—'} />
          <InfoCard icon={GraduationCap} label="Roll No" value={profile.rollNo || '—'} />
          <InfoCard icon={Calendar} label="Date of Birth" value={profile.dateOfBirth || '—'} />
          <InfoCard icon={Calendar} label="Admission Date" value={profile.admissionDate || '—'} />
          <InfoCard icon={Phone} label="Mobile" value={profile.parentMobile || '—'} />
          <InfoCard icon={Mail} label="Email" value={profile.email || '—'} />
          <InfoCard label="Father's Name" value={profile.fatherName || '—'} />
          <InfoCard label="Mother's Name" value={profile.motherName || '—'} />
          <InfoCard label="Gender" value={profile.gender || '—'} />
          <InfoCard label="Hosteller" value={profile.isHosteller ? '✓ Yes' : 'No'} highlight={profile.isHosteller} />
          <InfoCard label="Transport" value={profile.isTransportUser ? '✓ Yes' : 'No'} highlight={profile.isTransportUser} />
          <InfoCard label="IIT/NEET Batch" value={profile.iitNeetOpted ? '✓ Yes' : 'No'} highlight={profile.iitNeetOpted} />
        </>)}

        {profile?.type === 'teacher' && (<>
          <InfoCard icon={BookOpen} label="Subjects" value={profile.subjects || profile.subject || '—'} />
          <InfoCard icon={GraduationCap} label="Qualification" value={profile.qualification || '—'} />
          <InfoCard icon={Phone} label="Mobile" value={profile.mobile || '—'} />
          <InfoCard icon={Mail} label="Email" value={profile.email || '—'} />
          <InfoCard label="Class Teacher Of" value={profile.classTeacherOfName || '—'} />
          <InfoCard icon={Calendar} label="Join Date" value={profile.joinDate || '—'} />
        </>)}

        {profile?.type === 'admin' && (
          <InfoCard label="Username" value={user?.username || '—'} />
        )}
      </div>

      {/* Password Change */}
      <div className="bg-white border border-[#7b1113]/10 rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2"><Lock className="w-5 h-5 text-[#7b1113]" /><h3 className="font-semibold text-gray-900">Security</h3></div>
          {!showPwForm && <button onClick={() => setShowPwForm(true)} className="px-4 py-2 bg-[#7b1113] text-white rounded-xl text-sm font-medium hover:bg-[#5c0d0f]">Change Password</button>}
        </div>
        {showPwForm && (
          <form onSubmit={handlePasswordChange} className="space-y-3">
            {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">{error}</div>}
            {msg && <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl flex items-center gap-2"><CheckCircle className="w-4 h-4" />{msg}</div>}
            <div className="relative">
              <input type={showCurrent ? 'text' : 'password'} placeholder="Current Password" required value={pwForm.currentPassword} onChange={e => setPwForm({...pwForm, currentPassword: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm pr-10 focus:ring-2 focus:ring-[#7b1113] outline-none" />
              <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">{showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
            </div>
            <div className="relative">
              <input type={showNew ? 'text' : 'password'} placeholder="New Password" required value={pwForm.newPassword} onChange={e => setPwForm({...pwForm, newPassword: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm pr-10 focus:ring-2 focus:ring-[#7b1113] outline-none" />
              <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">{showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
            </div>
            <input type={showNew ? 'text' : 'password'} placeholder="Confirm New Password" required value={pwForm.confirmPassword} onChange={e => setPwForm({...pwForm, confirmPassword: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#7b1113] outline-none" />
            <div className="flex gap-3">
              <button type="submit" disabled={pwLoading} className="px-5 py-2.5 bg-[#7b1113] text-white rounded-xl text-sm font-medium disabled:opacity-50 flex items-center gap-2">{pwLoading && <Loader2 className="w-4 h-4 animate-spin" />}Update Password</button>
              <button type="button" onClick={() => { setShowPwForm(false); setError(''); setMsg(''); }} className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium">Cancel</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function InfoCard({ icon: Icon, label, value, highlight }) {
  return (
    <div className="bg-white border border-[#7b1113]/10 rounded-xl p-4 shadow-sm flex items-start gap-3">
      {Icon && <div className="w-8 h-8 bg-[#7b1113]/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"><Icon className="w-4 h-4 text-[#7b1113]" /></div>}
      {!Icon && <div className="w-8 h-8 bg-gray-100 rounded-lg flex-shrink-0 mt-0.5"></div>}
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className={`font-medium text-sm ${highlight ? 'text-[#7b1113]' : 'text-gray-900'}`}>{value}</p>
      </div>
    </div>
  );
}
