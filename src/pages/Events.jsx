import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Plus, Calendar, Loader2, MapPin, Clock, PartyPopper } from 'lucide-react';

export default function Events() {
  const { user } = useAuth();
  const canEdit = ['SYS_ADMIN', 'PRINCIPAL', 'CLERK'].includes(user?.role);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', eventDate: '', location: '' });

  useEffect(() => { api.get('/events/upcoming').then(r => setEvents(r.data)).catch(() => {}).finally(() => setLoading(false)); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try { await api.post('/events', form); setShowForm(false); setForm({ title: '', description: '', eventDate: '', location: '' }); const r = await api.get('/events/upcoming'); setEvents(r.data); } catch (e) { alert('Error'); }
  };

  const getMonth = (date) => new Date(date).toLocaleString('en', { month: 'short' }).toUpperCase();
  const getDay = (date) => new Date(date).getDate();
  const getDayName = (date) => new Date(date).toLocaleString('en', { weekday: 'long' });

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[#7b1113]" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#7b1113]">School Events</h1>
          <p className="text-sm text-gray-500">Upcoming activities and celebrations</p>
        </div>
        {canEdit && <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-5 py-2.5 bg-[#7b1113] text-white rounded-xl hover:bg-[#5c0d0f] text-sm font-medium shadow-md"><Plus className="w-4 h-4" />Add Event</button>}
      </div>

      {/* Add Event Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl p-6">
            <h2 className="text-xl font-bold text-[#7b1113] mb-4">🎉 Create Event</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input placeholder="Event Title" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#7b1113] outline-none" />
              <textarea placeholder="Description (what, why, who should attend...)" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#7b1113] outline-none resize-none" />
              <div className="grid grid-cols-2 gap-3">
                <input type="date" required value={form.eventDate} onChange={e => setForm({ ...form, eventDate: e.target.value })} className="px-4 py-3 border border-gray-200 rounded-xl text-sm" />
                <input placeholder="Location (optional)" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className="px-4 py-3 border border-gray-200 rounded-xl text-sm" />
              </div>
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-[#7b1113] text-white rounded-xl text-sm font-medium hover:bg-[#5c0d0f]">Create Event</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Events List */}
      {events.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl">
          <PartyPopper className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400">No upcoming events scheduled</p>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map(ev => (
            <div key={ev.id} className="bg-white border border-[#7b1113]/10 rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-all group">
              <div className="flex">
                {/* Date Badge */}
                <div className="w-24 bg-gradient-to-b from-[#7b1113] to-[#5c0d0f] flex flex-col items-center justify-center text-white p-4">
                  <span className="text-xs font-medium opacity-80">{ev.eventDate ? getMonth(ev.eventDate) : ''}</span>
                  <span className="text-3xl font-bold">{ev.eventDate ? getDay(ev.eventDate) : ''}</span>
                  <span className="text-[10px] opacity-70">{ev.eventDate ? getDayName(ev.eventDate) : ''}</span>
                </div>
                {/* Content */}
                <div className="flex-1 p-5">
                  <h3 className="font-bold text-gray-900 text-lg group-hover:text-[#7b1113] transition">{ev.title}</h3>
                  {ev.description && <p className="text-sm text-gray-500 mt-1">{ev.description}</p>}
                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{ev.eventDate}</span>
                    {ev.location && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{ev.location}</span>}
                  </div>
                </div>
                {/* Decorative */}
                <div className="w-1 bg-gradient-to-b from-[#d4a017] to-[#7b1113] opacity-50"></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
