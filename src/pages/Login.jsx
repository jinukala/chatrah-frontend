import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Loader2, WifiOff, CheckCircle, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [serverDown, setServerDown] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1=enter username, 2=enter OTP, 3=new password
  const [forgotUsername, setForgotUsername] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [forgotMsg, setForgotMsg] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setServerDown(false);
    setLoading(true);
    try {
      const data = await login(username, password);
      setDisplayName(data.displayName || data.username || username);
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 1800);
    } catch (err) {
      if (!err.response) {
        setServerDown(true);
      } else {
        setError(err.response?.data?.message || 'Invalid credentials');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setForgotError(''); setForgotMsg(''); setForgotLoading(true);
    try {
      if (forgotStep === 1) {
        await import('../services/api').then(m => m.default.post('/auth/otp/send-reset', { username: forgotUsername }));
        setForgotMsg('OTP sent to your registered email.');
        setForgotStep(2);
      } else if (forgotStep === 2) {
        await import('../services/api').then(m => m.default.post('/auth/otp/verify-reset', { username: forgotUsername, otp }));
        setForgotMsg('OTP verified. Set your new password.');
        setForgotStep(3);
      } else if (forgotStep === 3) {
        await import('../services/api').then(m => m.default.post('/auth/password/reset', { username: forgotUsername, otp, newPassword }));
        setForgotMsg('Password reset successful! You can now login.');
        setTimeout(() => { setForgotMode(false); setForgotStep(1); setForgotMsg(''); }, 2000);
      }
    } catch (err) {
      setForgotError(err.response?.data?.message || 'Something went wrong');
    } finally { setForgotLoading(false); }
  };

  // Success screen
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center animate-[fadeIn_0.3s_ease-out]">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5 animate-[scaleIn_0.4s_ease-out]">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">Welcome back!</h2>
          <p className="text-gray-500 text-sm mb-6">{displayName}</p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Loading your dashboard...</span>
          </div>
          {/* Progress bar */}
          <div className="mt-6 h-1 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-[#7b1113] rounded-full animate-[progress_1.5s_ease-in-out]" />
          </div>
        </div>
      </div>
    );
  }

  // Server down screen
  if (serverDown) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <WifiOff className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Server Unavailable</h2>
          <p className="text-gray-500 text-sm mb-6">We're unable to connect to the server. Please check your internet connection or try again later.</p>
          <button onClick={() => setServerDown(false)} className="px-6 py-2.5 bg-[#7b1113] text-white font-medium rounded-lg hover:bg-[#5c0d0f] transition text-sm">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 bg-[#7b1113] rounded-full flex items-center justify-center"><span className="text-white text-2xl font-bold">C</span></div>
          <h1 className="text-xl font-bold text-[#7b1113]">Chatrah School</h1>
          <p className="text-gray-500 text-sm mt-1">Sign in to your account</p>
        </div>
        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7b1113] focus:border-transparent outline-none transition" placeholder="Enter username" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7b1113] focus:border-transparent outline-none transition pr-10" placeholder="Enter password" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="flex justify-end">
            <button type="button" onClick={() => setForgotMode(true)} className="text-sm text-[#7b1113] hover:underline">Forgot Password?</button>
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-2.5 bg-[#7b1113] hover:bg-[#5c0d0f] text-white font-medium rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />} Sign In
          </button>
        </form>
      </div>

      {/* Forgot Password Modal */}
      {forgotMode && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Reset Password</h2>
            <p className="text-sm text-gray-500 mb-4">
              {forgotStep === 1 && 'Enter your username to receive an OTP.'}
              {forgotStep === 2 && 'Enter the OTP sent to your email.'}
              {forgotStep === 3 && 'Set your new password.'}
            </p>
            {forgotError && <div className="mb-3 p-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{forgotError}</div>}
            {forgotMsg && <div className="mb-3 p-2 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg">{forgotMsg}</div>}
            <form onSubmit={handleForgotSubmit} className="space-y-3">
              {forgotStep === 1 && (
                <input type="text" placeholder="Username" required value={forgotUsername} onChange={e => setForgotUsername(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#7b1113] outline-none" />
              )}
              {forgotStep === 2 && (
                <input type="text" placeholder="Enter OTP" required value={otp} onChange={e => setOtp(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#7b1113] outline-none" />
              )}
              {forgotStep === 3 && (
                <input type="password" placeholder="New Password" required value={newPassword} onChange={e => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#7b1113] outline-none" />
              )}
              <div className="flex gap-2">
                <button type="submit" disabled={forgotLoading}
                  className="flex-1 py-2.5 bg-[#7b1113] text-white font-medium rounded-lg text-sm hover:bg-[#5c0d0f] disabled:opacity-50 flex items-center justify-center gap-2">
                  {forgotLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {forgotStep === 1 ? 'Send OTP' : forgotStep === 2 ? 'Verify OTP' : 'Reset Password'}
                </button>
                <button type="button" onClick={() => { setForgotMode(false); setForgotStep(1); setForgotError(''); setForgotMsg(''); }}
                  className="px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg text-sm hover:bg-gray-200">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
