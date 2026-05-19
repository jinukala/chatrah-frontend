import { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Loader2, CheckCircle, XCircle, Image, FileText, Heart, MessageCircle, Calendar, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['General', 'Academic', 'Sports', 'Arts & Culture', 'Science', 'Achievement', 'Story'];

export default function Blogs() {
  const [blogs, setBlogs] = useState([]);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', category: 'General', imageUrl: '' });
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const { user } = useAuth();
  const canApprove = ['SYS_ADMIN', 'PRINCIPAL', 'CLERK'].includes(user?.role);

  useEffect(() => { fetchBlogs(); }, []);
  const fetchBlogs = async () => {
    try {
      const r = await api.get('/blogs/approved'); setBlogs(r.data);
      if (canApprove) { const p = await api.get('/blogs/pending'); setPending(p.data); }
    } catch (e) {} finally { setLoading(false); }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => { setImagePreview(reader.result); setForm({ ...form, imageUrl: reader.result }); };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/blogs', { title: form.title, content: form.content });
      setShowForm(false); setForm({ title: '', content: '', category: 'General', imageUrl: '' }); setImagePreview(null);
      fetchBlogs();
    } catch (e) { alert('Error submitting blog'); }
  };

  const approve = async (id) => { await api.post(`/blogs/${id}/approve`); fetchBlogs(); };
  const reject = async (id) => { await api.post(`/blogs/${id}/reject`); fetchBlogs(); };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[#7b1113]" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#7b1113]">School Blog</h1>
          <p className="text-sm text-gray-500">Share your thoughts, stories & achievements</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-5 py-2.5 bg-[#7b1113] text-white rounded-xl hover:bg-[#5c0d0f] text-sm font-medium shadow-md hover:shadow-lg transition-all">
          <Plus className="w-4 h-4" />Write a Blog
        </button>
      </div>

      {/* Write Blog Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-[#7b1113] mb-4">✍️ Write Your Blog</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input placeholder="Give your blog a catchy title..." required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#7b1113] outline-none" />
              <div className="flex gap-3">
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="px-3 py-2 border border-gray-200 rounded-xl text-sm">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <label className="flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-[#7b1113] transition text-sm text-gray-500">
                  <Image className="w-4 h-4" />Add Image
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              </div>
              {imagePreview && (
                <div className="relative">
                  <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-xl" />
                  <button type="button" onClick={() => { setImagePreview(null); setForm({...form, imageUrl: ''}); }} className="absolute top-2 right-2 bg-white rounded-full p-1 shadow"><XCircle className="w-4 h-4 text-red-500" /></button>
                </div>
              )}
              <textarea placeholder="Write your blog content here... Share your experience, story, or achievement!" rows={6} required value={form.content} onChange={e => setForm({ ...form, content: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#7b1113] outline-none resize-none" />
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => { setShowForm(false); setImagePreview(null); }} className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-[#7b1113] text-white rounded-xl text-sm font-medium hover:bg-[#5c0d0f]">Submit for Review</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pending Approval */}
      {canApprove && pending.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-[#7b1113] mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>Pending Approval ({pending.length})
          </h2>
          <div className="space-y-3">
            {pending.map(b => (
              <div key={b.id} className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-5 flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{b.title}</p>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{b.content}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><User className="w-3 h-3" />{b.authorName || 'Anonymous'}</span>
                    {b.authorClass && <span>{b.authorClass}</span>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => approve(b.id)} className="p-2.5 bg-green-100 text-green-600 hover:bg-green-200 rounded-xl transition"><CheckCircle className="w-5 h-5" /></button>
                  <button onClick={() => reject(b.id)} className="p-2.5 bg-red-100 text-red-600 hover:bg-red-200 rounded-xl transition"><XCircle className="w-5 h-5" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Published Blogs */}
      <h2 className="text-lg font-semibold text-gray-900 mb-4">📚 Published Stories</h2>
      {blogs.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400">No blogs published yet. Be the first to write!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {blogs.map(b => (
            <div key={b.id} onClick={() => setSelectedBlog(b)} className="bg-white border border-[#7b1113]/10 rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-all cursor-pointer group">
              {/* Decorative gradient header */}
              <div className="h-2 bg-gradient-to-r from-[#7b1113] to-[#d4a017]"></div>
              <div className="p-6">
                <h3 className="font-bold text-gray-900 text-lg group-hover:text-[#7b1113] transition">{b.title}</h3>
                <p className="text-gray-500 mt-2 text-sm line-clamp-3">{b.content}</p>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-[#7b1113]/10 rounded-full flex items-center justify-center">
                      <User className="w-3.5 h-3.5 text-[#7b1113]" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-900">{b.authorName || 'Anonymous'}</p>
                      <p className="text-[10px] text-gray-400">{b.authorClass || ''}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 flex items-center gap-1"><Calendar className="w-3 h-3" />{b.createdAt?.split('T')[0]}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Blog Detail Modal */}
      {selectedBlog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedBlog(null)}>
          <div className="w-full max-w-2xl bg-white rounded-2xl overflow-hidden max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="h-3 bg-gradient-to-r from-[#7b1113] to-[#d4a017]"></div>
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedBlog.title}</h2>
              <div className="flex items-center gap-4 mb-6 text-sm text-gray-500">
                <span className="flex items-center gap-1"><User className="w-4 h-4" />{selectedBlog.authorName || 'Anonymous'}</span>
                {selectedBlog.authorClass && <span className="bg-[#7b1113]/10 text-[#7b1113] px-2 py-0.5 rounded-full text-xs">{selectedBlog.authorClass}</span>}
                <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{selectedBlog.createdAt?.split('T')[0]}</span>
              </div>
              <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">{selectedBlog.content}</div>
              <button onClick={() => setSelectedBlog(null)} className="mt-6 px-5 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
