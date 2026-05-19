import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { GraduationCap, Users, Trophy, BookOpen, Phone, Mail, MapPin, Clock, ChevronRight, Star, Calendar, FileText } from 'lucide-react';

const MAROON = '#7b1113';
const GOLD = '#d4a017';

export default function Home() {
  const [events, setEvents] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [birthdays, setBirthdays] = useState([]);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const isAdmin = (() => { try { const t = localStorage.getItem('token'); if (!t) return false; const p = t.split('.')[1]; const d = JSON.parse(atob(p.replace(/-/g,'+').replace(/_/g,'/'))); return ['SYS_ADMIN','PRINCIPAL','CLERK'].includes(d.role); } catch(e) { return false; } })();

  useEffect(() => {
    fetch('/api/events/upcoming').then(r => r.json()).then(setEvents).catch(() => {});
    fetch('/api/blogs/approved').then(r => r.json()).then(setBlogs).catch(() => {});
    fetch('/api/students/birthdays/today').then(r => r.json()).then(setBirthdays).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Top bar */}
      <div className="bg-[#7b1113] text-white text-xs py-2">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <span>Chatrah — School Management System</span>
          <span className="hidden md:block">Empowering Education</span>
        </div>
      </div>

      {/* Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-50 border-b-4 border-[#7b1113]">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-20 h-20 bg-[#7b1113] rounded-full flex items-center justify-center"><span className="text-white text-2xl font-bold">C</span></div>
            <div>
              <span className="font-bold text-lg text-[#7b1113] leading-tight block">Chatrah</span>
              <span className="text-[10px] text-gray-500 uppercase tracking-wider">High School - Empowering Education</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-700">
            <a href="#home" className="hover:text-[#7b1113] transition">Home</a>
            <a href="#about" className="hover:text-[#7b1113] transition">About</a>
            <a href="#academics" className="hover:text-[#7b1113] transition">Academics</a>
            <a href="#achievements" className="hover:text-[#7b1113] transition">Achievements</a>
            <a href="#gallery" className="hover:text-[#7b1113] transition">Gallery</a>
            <a href="#events" className="hover:text-[#7b1113] transition">Events</a>
            <a href="#blogs" className="hover:text-[#7b1113] transition">Blogs</a>
            <a href="#contact" className="hover:text-[#7b1113] transition">Contact</a>
          </div>
          <Link to="/login" className="px-5 py-2 bg-[#7b1113] text-white text-sm font-medium rounded-md hover:bg-[#5c0d0f] transition shadow-sm">
            Login
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section id="home" className="bg-gradient-to-r from-[#7b1113] to-[#a01515] py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
        <div className="max-w-7xl mx-auto px-6 text-center relative">
          <div className="inline-block px-4 py-1 bg-[#d4a017] text-[#7b1113] text-xs font-bold rounded-full mb-6 uppercase tracking-wider">Admissions Open 2026-27</div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Nurturing Young Minds<br />Building Tomorrow's Leaders</h1>
          <p className="text-red-100 text-lg max-w-2xl mx-auto mb-8">Chatrah School, Kesamudram — Inspired by Swami Vivekananda's vision of education, discipline, and character building.</p>
          <div className="flex justify-center gap-4">
            <a href="#about" className="px-6 py-3 bg-[#d4a017] text-[#7b1113] font-bold rounded-md hover:bg-[#e6b422] transition shadow">Explore More</a>
            <a href="#contact" className="px-6 py-3 border-2 border-white text-white font-medium rounded-md hover:bg-white/10 transition">Enquire Now</a>
          </div>
        </div>
        <div className="max-w-4xl mx-auto mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 px-6">
          {[{ n: '500+', l: 'Students' }, { n: '50+', l: 'Faculty' }, { n: '15+', l: 'Years' }, { n: '98%', l: 'Results' }].map(s => (
            <div key={s.l} className="bg-white/10 backdrop-blur rounded-lg p-4 text-center border border-white/20">
              <p className="text-2xl font-bold text-[#d4a017]">{s.n}</p>
              <p className="text-xs text-red-100 mt-1">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#7b1113]">About Our School</h2>
            <div className="w-16 h-1 bg-[#d4a017] mx-auto mt-3 rounded-full" />
          </div>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-gray-600 leading-relaxed mb-4">Inspired by the teachings of Swami Vivekananda, our school was established to provide quality education that builds character, confidence, and competence in every student.</p>
              <p className="text-gray-600 leading-relaxed mb-6">With experienced faculty, modern infrastructure, and a focus on both academics and extracurricular activities, we prepare students for success in all walks of life.</p>
              <div className="grid grid-cols-2 gap-3">
                {['Smart Classrooms', 'Science Labs', 'Sports Ground', 'Library', 'Computer Lab', 'Activity Hall'].map(f => (
                  <div key={f} className="flex items-center gap-2 text-sm text-gray-700"><Star className="w-4 h-4 text-[#d4a017]" />{f}</div>
                ))}
              </div>
            </div>
            <div className="relative rounded-2xl h-72 overflow-hidden border border-[#7b1113]/10 group">
              {(() => { const img = localStorage.getItem('aboutImage'); return img ? <img src={img} alt="About School" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gradient-to-br from-[#fdf2f2] to-[#fce4e4] flex items-center justify-center"><GraduationCap className="w-20 h-20 text-[#7b1113] opacity-20" /></div>; })()}
              {isAdmin && <label className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition cursor-pointer">
                <span className="bg-white px-4 py-2 rounded-xl text-sm font-medium text-[#7b1113] shadow">📷 Upload Image</span>
                <input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files[0]; if (f) { const r = new FileReader(); r.onloadend = () => { localStorage.setItem('aboutImage', r.result); window.location.reload(); }; r.readAsDataURL(f); }}} />
              </label>}
            </div>
          </div>
        </div>
      </section>

      {/* Academics */}
      <section id="academics" className="py-16 bg-[#fdf8f0]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#7b1113]">Academics</h2>
            <div className="w-16 h-1 bg-[#d4a017] mx-auto mt-3 rounded-full" />
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: BookOpen, title: 'Primary (I-V)', desc: 'Foundation years with activity-based learning, value education, and personality development.', details: ['Activity-based learning methodology', 'Focus on reading, writing & arithmetic', 'Art, craft & music integrated curriculum', 'Value education & moral stories', 'Regular parent-teacher meetings', 'Sports & physical education daily'] },
              { icon: GraduationCap, title: 'Middle (VI-VIII)', desc: 'Building analytical thinking with science, mathematics, and language skills.', details: ['Advanced science with lab practicals', 'Mathematics & logical reasoning', 'Three-language formula (Telugu, Hindi, English)', 'Computer education & digital literacy', 'Social science with project work', 'Olympiad & quiz preparation'] },
              { icon: Trophy, title: 'Secondary (IX-X)', desc: 'Board exam preparation with focused coaching, practice tests, and career guidance.', details: ['TS SSC Board exam preparation', 'Subject-wise expert faculty', 'Weekly tests & model exams', 'IIT/NEET foundation batch available', 'Career counseling & guidance', 'Previous year paper practice', 'Doubt clearing sessions', 'Performance tracking & parent updates'] },
            ].map(item => (
              <div key={item.title} className="bg-white rounded-2xl border border-gray-200 hover:shadow-xl hover:border-[#7b1113]/20 transition-all duration-300 overflow-hidden group">
                <div className="p-6">
                  <div className="w-12 h-12 bg-[#7b1113]/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#7b1113] transition"><item.icon className="w-6 h-6 text-[#7b1113] group-hover:text-white transition" /></div>
                  <h3 className="font-bold text-[#7b1113] text-lg mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">{item.desc}</p>
                  <div className="space-y-2 max-h-0 group-hover:max-h-96 overflow-hidden transition-all duration-500">
                    {item.details.map((d, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="w-1.5 h-1.5 bg-[#d4a017] rounded-full mt-1.5 flex-shrink-0"></span>
                        <span>{d}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="h-1 bg-gradient-to-r from-[#7b1113] to-[#d4a017] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section id="achievements" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#7b1113]">Achievements & Awards</h2>
            <div className="w-16 h-1 bg-[#d4a017] mx-auto mt-3 rounded-full" />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {['State Topper in Board Exams 2025', 'District Sports Champions - 3 Years', '100% Pass Rate - Board Exams 2024', 'Best School Award - Education Excellence', 'National Science Olympiad Winners', 'Swami Vivekananda Youth Award'].map((a, i) => (
              <div key={i} className="bg-[#fffde7] border border-[#d4a017]/30 rounded-lg p-4 flex items-start gap-3">
                <Trophy className="w-5 h-5 text-[#d4a017] mt-0.5 shrink-0" />
                <p className="text-sm font-medium text-gray-800">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section id="gallery" className="py-16 bg-[#fdf8f0]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#7b1113]">School Gallery</h2>
            <div className="w-16 h-1 bg-[#d4a017] mx-auto mt-3 rounded-full" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {(() => {
              const saved = JSON.parse(localStorage.getItem('galleryImages') || '[]');
              const labels = ['Annual Day', 'Sports Day', 'Science Fair', 'Republic Day', 'Classroom', 'Library', 'Lab', 'Assembly'];
              return labels.map((label, i) => {
                const img = saved[i];
                return (
                  <div key={i} className="aspect-square rounded-xl overflow-hidden relative group border border-[#7b1113]/10 hover:shadow-lg transition">
                    {img ? (
                      <img src={img} alt={label} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#fdf2f2] to-[#fce4e4] flex flex-col items-center justify-center gap-2">
                        <GraduationCap className="w-8 h-8 text-[#7b1113] opacity-20" />
                        <span className="text-xs text-[#7b1113]/40 font-medium">{label}</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-end p-3">
                      <span className="text-white text-xs font-medium">{label}</span>
                    </div>
                    {isAdmin && <label className="absolute top-2 right-2 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition shadow">
                      <span className="text-xs">📷</span>
                      <input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files[0]; if (f) { const r = new FileReader(); r.onloadend = () => { const imgs = JSON.parse(localStorage.getItem('galleryImages') || '[]'); imgs[i] = r.result; localStorage.setItem('galleryImages', JSON.stringify(imgs)); window.location.reload(); }; r.readAsDataURL(f); }}} />
                    </label>}
                  </div>
                );
              });
            })()}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#7b1113]">Contact Us</h2>
            <div className="w-16 h-1 bg-[#d4a017] mx-auto mt-3 rounded-full" />
          </div>
          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <div className="space-y-5">
              <div className="flex items-start gap-3"><MapPin className="w-5 h-5 text-[#7b1113] mt-0.5" /><div><h3 className="font-semibold text-gray-900 text-sm">Address</h3><p className="text-sm text-gray-600">School Management System District, Telangana - 506145</p></div></div>
              <div className="flex items-start gap-3"><Phone className="w-5 h-5 text-[#7b1113] mt-0.5" /><div><h3 className="font-semibold text-gray-900 text-sm">Phone</h3><p className="text-sm text-gray-600">Contact school admin</p></div></div>
              <div className="flex items-start gap-3"><Mail className="w-5 h-5 text-[#7b1113] mt-0.5" /><div><h3 className="font-semibold text-gray-900 text-sm">Email</h3><p className="text-sm text-gray-600">admin@chatrah.com</p></div></div>
              <div className="flex items-start gap-3"><Clock className="w-5 h-5 text-[#7b1113] mt-0.5" /><div><h3 className="font-semibold text-gray-900 text-sm">Office Hours</h3><p className="text-sm text-gray-600">Mon - Sat: 8:00 AM - 4:00 PM</p></div></div>
            </div>
            <form className="space-y-4 bg-[#fdf8f0] p-6 rounded-xl" onSubmit={e => { e.preventDefault(); alert('Thank you! We will get back to you soon.'); }}>
              <input placeholder="Parent/Guardian Name" required className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-sm bg-white" />
              <input placeholder="Phone Number" required className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-sm bg-white" />
              <input placeholder="Email (optional)" type="email" className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-sm bg-white" />
              <select className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-sm bg-white text-gray-600">
                <option>Enquiry Type</option><option>Admission</option><option>Fee Structure</option><option>Transport</option><option>General</option>
              </select>
              <textarea placeholder="Your Message" rows={3} className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-sm bg-white" />
              <button type="submit" className="w-full py-2.5 bg-[#7b1113] text-white font-medium rounded-md hover:bg-[#5c0d0f] text-sm transition">Send Enquiry</button>
            </form>
          </div>
        </div>
      </section>

      {/* Today's Birthdays */}
      {birthdays.length > 0 && (
        <section className="py-12 bg-gradient-to-r from-pink-50 to-yellow-50">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">🎂 Today's Birthdays</h2>
            <p className="text-center text-gray-500 mb-8">Wishing our students a very Happy Birthday!</p>
            <div className="flex flex-wrap justify-center gap-4">
              {birthdays.map(s => (
                <div key={s.id} className="bg-white rounded-xl border border-pink-200 px-6 py-4 text-center shadow-sm">
                  <p className="font-semibold text-gray-900">{s.name}</p>
                  <p className="text-xs text-gray-500">Class {s.className} - {s.section}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Events Section */}
      {events.length > 0 && (
        <section id="events" className="py-20 bg-gradient-to-b from-[#7b1113]/5 to-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-12">
              <span className="inline-block px-4 py-1 bg-[#7b1113]/10 text-[#7b1113] text-xs font-semibold rounded-full mb-3">WHAT'S HAPPENING</span>
              <h2 className="text-3xl font-bold text-[#7b1113]">Upcoming Events</h2>
              <p className="text-gray-500 mt-2">Stay updated with school activities and celebrations</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.slice(0, 6).map((ev, i) => (
                <div key={ev.id} className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100">
                  <div className="h-2 bg-gradient-to-r from-[#7b1113] to-[#d4a017]"></div>
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-14 h-14 bg-[#7b1113] rounded-xl flex flex-col items-center justify-center text-white">
                        <span className="text-[10px] font-medium leading-none">{ev.eventDate ? new Date(ev.eventDate).toLocaleString('en',{month:'short'}).toUpperCase() : ''}</span>
                        <span className="text-xl font-bold leading-none">{ev.eventDate ? new Date(ev.eventDate).getDate() : ''}</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 group-hover:text-[#7b1113] transition">{ev.title}</h3>
                        <p className="text-xs text-gray-400">{ev.eventDate ? new Date(ev.eventDate).toLocaleString('en',{weekday:'long'}) : ''}</p>
                      </div>
                    </div>
                    {ev.description && <p className="text-sm text-gray-500 leading-relaxed">{ev.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Blogs Section */}
      {blogs.length > 0 && (
        <section id="blogs" className="py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-12">
              <span className="inline-block px-4 py-1 bg-[#d4a017]/10 text-[#d4a017] text-xs font-semibold rounded-full mb-3">FROM OUR COMMUNITY</span>
              <h2 className="text-3xl font-bold text-[#7b1113]">Student & Teacher Blogs</h2>
              <p className="text-gray-500 mt-2">Thoughts, stories and achievements from our school family</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogs.slice(0, 6).map(blog => (
                <div key={blog.id} onClick={() => setSelectedBlog(blog)} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 cursor-pointer">
                  {/* Decorative header with gradient */}
                  <div className="h-32 bg-gradient-to-br from-[#7b1113] via-[#7b1113] to-[#d4a017] relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute top-4 right-4 w-20 h-20 border-2 border-white rounded-full"></div>
                      <div className="absolute bottom-2 left-6 w-12 h-12 border-2 border-white rounded-full"></div>
                    </div>
                    <div className="absolute bottom-4 left-6">
                      <span className="text-white/60 text-xs">{blog.createdAt?.split('T')[0]}</span>
                    </div>
                  </div>
                  <div className="p-6 -mt-6 relative">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                      <h3 className="font-bold text-gray-900 text-lg group-hover:text-[#7b1113] transition line-clamp-2">{blog.title}</h3>
                      <p className="text-sm text-gray-500 mt-2 line-clamp-3 leading-relaxed">{blog.content}</p>
                    </div>
                    <div className="flex items-center gap-3 mt-4 px-1">
                      <div className="w-8 h-8 bg-[#7b1113] rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {(blog.authorName || 'A')[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{blog.authorName || 'Anonymous'}</p>
                        <p className="text-[10px] text-gray-400">{blog.authorClass || 'School Community'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Blog Detail Modal */}
      {selectedBlog && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setSelectedBlog(null)}>
          <div className="w-full max-w-2xl bg-white rounded-2xl overflow-hidden max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="h-3 bg-gradient-to-r from-[#7b1113] to-[#d4a017]"></div>
            <div className="p-8 overflow-y-auto flex-1">
              <h2 className="text-2xl font-bold text-[#7b1113] mb-3">{selectedBlog.title}</h2>
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                <div className="w-9 h-9 bg-[#7b1113] rounded-full flex items-center justify-center text-white text-sm font-bold">{(selectedBlog.authorName || 'A')[0]}</div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{selectedBlog.authorName || 'Anonymous'}</p>
                  <p className="text-xs text-gray-400">{selectedBlog.authorClass || 'School Community'} • {selectedBlog.createdAt?.split('T')[0]}</p>
                </div>
              </div>
              <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedBlog.content}</div>
            </div>
            <div className="px-8 py-4 border-t border-gray-100 bg-gray-50">
              <button onClick={() => setSelectedBlog(null)} className="px-5 py-2 bg-[#7b1113] text-white rounded-xl text-sm font-medium hover:bg-[#5c0d0f]">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-[#7b1113] text-white py-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-20 h-20 bg-[#7b1113] rounded-full flex items-center justify-center"><span className="text-white text-2xl font-bold">C</span></div>
                <span className="font-bold">Chatrah School</span>
              </div>
              <p className="text-sm text-red-200">Empowering Education — School Management System. Inspired by Swami Vivekananda's vision of education and character building.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm text-[#d4a017]">Quick Links</h4>
              <div className="space-y-2 text-sm text-red-200">
                <a href="#about" className="block hover:text-white">About Us</a>
                <a href="#academics" className="block hover:text-white">Academics</a>
                <a href="#achievements" className="block hover:text-white">Achievements</a>
                <a href="#contact" className="block hover:text-white">Contact</a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm text-[#d4a017]">Portal Access</h4>
              <div className="space-y-2 text-sm text-red-200">
                <Link to="/login" className="block hover:text-white flex items-center gap-1">Student Portal <ChevronRight className="w-3 h-3" /></Link>
                <Link to="/login" className="block hover:text-white flex items-center gap-1">Teacher Portal <ChevronRight className="w-3 h-3" /></Link>
                <Link to="/login" className="block hover:text-white flex items-center gap-1">Admin Portal <ChevronRight className="w-3 h-3" /></Link>
              </div>
            </div>
          </div>
          <div className="border-t border-white/20 pt-6 text-center text-xs text-red-200">
            © 2026 Chatrah School, Kesamudram. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
