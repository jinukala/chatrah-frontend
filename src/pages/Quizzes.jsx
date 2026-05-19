import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Loader2, Plus, CheckCircle, Clock, Trophy } from 'lucide-react';

export default function Quizzes() {
  const { user } = useAuth();
  if (user?.role === 'STUDENT') return <StudentQuizzes />;
  return <TeacherQuizzes />;
}

function TeacherQuizzes() {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [quizzes, setQuizzes] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', subject: '', durationMinutes: 30, iitNeetOnly: false });
  const [questions, setQuestions] = useState([{ question: '', optionA: '', optionB: '', optionC: '', optionD: '', correctAnswer: 'A' }]);
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.get('/classes').then(r => { setClasses(r.data); if (r.data.length) setSelectedClass(String(r.data[0].id)); }).catch(() => {}).finally(() => setLoading(false)); }, []);

  useEffect(() => {
    if (!selectedClass) return;
    const cls = classes.find(c => String(c.id) === selectedClass);
    setSubjectOptions(cls?.subjects ? cls.subjects.split(',').map(s => s.trim()) : []);
    api.get(`/quizzes/class/${selectedClass}`).then(r => setQuizzes(r.data)).catch(() => setQuizzes([]));
  }, [selectedClass]);

  const addQuestion = () => setQuestions([...questions, { question: '', optionA: '', optionB: '', optionC: '', optionD: '', correctAnswer: 'A', imageData: '' }]);
  const updateQ = (i, field, val) => { const q = [...questions]; q[i][field] = val; setQuestions(q); };
  const removeQ = (i) => setQuestions(questions.filter((_, idx) => idx !== i));

  const createQuiz = async () => {
    if (!form.title || !form.subject || questions.length === 0) { alert('Fill all fields'); return; }
    try {
      await api.post('/quizzes', { classId: Number(selectedClass), ...form, questions });
      setShowCreate(false); setForm({ title: '', subject: '', durationMinutes: 30 });
      setQuestions([{ question: '', optionA: '', optionB: '', optionC: '', optionD: '', correctAnswer: 'A' }]);
      const r = await api.get(`/quizzes/class/${selectedClass}`); setQuizzes(r.data);
    } catch (e) { alert('Error'); }
  };

  const publishQuiz = async (id) => { await api.put(`/quizzes/${id}/publish`); const r = await api.get(`/quizzes/class/${selectedClass}`); setQuizzes(r.data); };
  const viewResults = async (id) => { const r = await api.get(`/quizzes/${id}/results`); setResults(r.data); };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[#7b1113]" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#7b1113]">Quizzes</h1>
        <div className="flex gap-3">
          <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-xl text-sm">
            {classes.map(c => <option key={c.id} value={c.id}>Class {c.className}-{c.section}</option>)}
          </select>
          <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 bg-[#7b1113] text-white rounded-xl text-sm font-medium hover:bg-[#5c0d0f]"><Plus className="w-4 h-4" />Create Quiz</button>
        </div>
      </div>

      {/* Quiz List */}
      <div className="space-y-3 mb-6">
        {quizzes.length === 0 ? <p className="text-center py-8 text-gray-400">No quizzes created</p> : quizzes.map(q => (
          <div key={q.id} className="bg-white border border-[#7b1113]/10 rounded-xl shadow-sm p-4 flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">{q.title}</h3>
              <p className="text-xs text-gray-500">{q.subject} • {q.questionCount} questions • {q.durationMinutes} min {q.iitNeetOnly && <span className="ml-1 bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded text-[10px] font-medium">IIT/NEET</span>}</p>
            </div>
            <div className="flex gap-2">
              {!q.published && <button onClick={() => publishQuiz(q.id)} className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-xs font-medium">Publish</button>}
              {q.published && <span className="px-3 py-1.5 bg-green-50 text-green-600 rounded-lg text-xs">Live</span>}
              <button onClick={() => viewResults(q.id)} className="px-3 py-1.5 bg-[#7b1113]/10 text-[#7b1113] rounded-lg text-xs font-medium">Results</button>
            </div>
          </div>
        ))}
      </div>

      {/* Results Modal */}
      {results && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setResults(null)}>
          <div className="w-full max-w-lg bg-white rounded-2xl p-6 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-[#7b1113] mb-4">Quiz Results</h2>
            {results.length === 0 ? <p className="text-gray-400">No submissions yet</p> : (
              <table className="w-full text-sm"><thead className="bg-[#7b1113]/5"><tr><th className="text-left px-3 py-2">Student</th><th className="text-center px-3 py-2">Score</th><th className="text-center px-3 py-2">Correct</th></tr></thead>
                <tbody>{results.map((r, i) => (<tr key={i} className="border-t border-gray-100"><td className="px-3 py-2 font-medium">{r.studentName}</td><td className="px-3 py-2 text-center font-bold text-[#7b1113]">{r.score}%</td><td className="px-3 py-2 text-center">{r.correct}/{r.total}</td></tr>))}</tbody>
              </table>
            )}
            <button onClick={() => setResults(null)} className="mt-4 px-4 py-2 bg-gray-100 rounded-xl text-sm">Close</button>
          </div>
        </div>
      )}

      {/* Create Quiz Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-[#7b1113] mb-4">🧠 Create Quiz</h2>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <input placeholder="Quiz Title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="px-3 py-2 border border-gray-200 rounded-xl text-sm" />
              <select value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} className="px-3 py-2 border border-gray-200 rounded-xl text-sm">
                <option value="">Subject</option>{subjectOptions.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <input type="number" placeholder="Duration (min)" value={form.durationMinutes} onChange={e => setForm({...form, durationMinutes: Number(e.target.value)})} className="px-3 py-2 border border-gray-200 rounded-xl text-sm" />
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-700 mb-3">
              <input type="checkbox" checked={form.iitNeetOnly} onChange={e => setForm({...form, iitNeetOnly: e.target.checked})} className="w-4 h-4 rounded border-gray-300 text-[#7b1113]" />
              🎯 IIT/NEET Batch Only (Special Quiz)
            </label>
            <h3 className="font-semibold text-sm mb-2">Questions ({questions.length})</h3>
            <div className="space-y-4 mb-4">
              {questions.map((q, i) => (
                <div key={i} className="border border-gray-200 rounded-xl p-4">
                  <div className="flex justify-between mb-2"><span className="text-xs font-medium text-gray-500">Q{i + 1}</span>{questions.length > 1 && <button onClick={() => removeQ(i)} className="text-xs text-red-500">Remove</button>}</div>
                  <input placeholder="Question" value={q.question} onChange={e => updateQ(i, 'question', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm mb-2" />
                  <div className="flex items-center gap-2 mb-2">
                    <label className="text-xs text-gray-500 border border-dashed border-gray-300 rounded-lg px-3 py-1.5 cursor-pointer hover:border-[#7b1113]">
                      📷 Add Snippet
                      <input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files[0]; if (f) { const r = new FileReader(); r.onloadend = () => updateQ(i, 'imageData', r.result); r.readAsDataURL(f); } }} />
                    </label>
                    {q.imageData && <><img src={q.imageData} className="h-12 rounded" /><button onClick={() => updateQ(i, 'imageData', '')} className="text-xs text-red-500">✕</button></>}
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <input placeholder="Option A" value={q.optionA} onChange={e => updateQ(i, 'optionA', e.target.value)} className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs" />
                    <input placeholder="Option B" value={q.optionB} onChange={e => updateQ(i, 'optionB', e.target.value)} className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs" />
                    <input placeholder="Option C" value={q.optionC} onChange={e => updateQ(i, 'optionC', e.target.value)} className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs" />
                    <input placeholder="Option D" value={q.optionD} onChange={e => updateQ(i, 'optionD', e.target.value)} className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs" />
                  </div>
                  <select value={q.correctAnswer} onChange={e => updateQ(i, 'correctAnswer', e.target.value)} className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs">
                    <option value="A">Correct: A</option><option value="B">Correct: B</option><option value="C">Correct: C</option><option value="D">Correct: D</option>
                  </select>
                </div>
              ))}
            </div>
            <button onClick={addQuestion} className="w-full py-2 border border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-[#7b1113] mb-4">+ Add Question</button>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowCreate(false)} className="px-5 py-2.5 bg-gray-100 rounded-xl text-sm">Cancel</button>
              <button onClick={createQuiz} className="px-5 py-2.5 bg-[#7b1113] text-white rounded-xl text-sm font-medium">Create & Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StudentQuizzes() {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        if (!user?.studentId) { setLoading(false); return; }
        const profile = await api.get(`/students/${user.studentId}`);
        if (profile.data.classId) {
          const r = await api.get(`/quizzes/class/${profile.data.classId}`);
          // Filter: show regular quizzes to all, IIT/NEET quizzes only to opted students
          const isIitNeet = Boolean(profile.data.iitNeetOpted);
          setQuizzes(r.data.filter(q => q.published && (!q.iitNeetOnly || isIitNeet)));
        }
      } catch (e) {}
      setLoading(false);
    };
    fetchQuizzes();
  }, [user]);

  const startQuiz = async (id) => {
    try { const r = await api.get(`/quizzes/${id}/take`); setActiveQuiz(r.data); setAnswers({}); setResult(null); }
    catch (e) { alert(e.response?.data?.message || 'Cannot take quiz'); }
  };

  const submitQuiz = async () => {
    try {
      const r = await api.post(`/quizzes/${activeQuiz.id}/submit`, { answers });
      setResult(r.data); setActiveQuiz(null);
    } catch (e) { alert('Error submitting'); }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[#7b1113]" /></div>;

  // Taking quiz
  if (activeQuiz) {
    return (
      <div>
        <div className="bg-gradient-to-r from-[#7b1113] to-[#5c0d0f] rounded-2xl p-5 mb-6 text-white flex items-center justify-between">
          <div><h1 className="text-lg font-bold">{activeQuiz.title}</h1><p className="text-white/70 text-sm">{activeQuiz.subject} • {activeQuiz.questions.length} questions</p></div>
          <div className="flex items-center gap-2 text-sm"><Clock className="w-4 h-4" />{activeQuiz.durationMinutes} min</div>
        </div>
        <div className="space-y-4 mb-6">
          {activeQuiz.questions.map((q, i) => (
            <div key={q.id} className="bg-white border border-[#7b1113]/10 rounded-xl shadow-sm p-5">
              <p className="font-medium text-gray-900 mb-3"><span className="text-[#7b1113] mr-2">Q{i + 1}.</span>{q.question}</p>
              {q.imageData && <img src={q.imageData} alt="Question snippet" className="mb-3 max-h-48 rounded-xl border border-gray-200" />}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {['A', 'B', 'C', 'D'].map(opt => (
                  <button key={opt} onClick={() => setAnswers({...answers, [q.id]: opt})}
                    className={`text-left px-4 py-2.5 rounded-xl text-sm border transition ${answers[q.id] === opt ? 'border-[#7b1113] bg-[#7b1113]/10 text-[#7b1113] font-medium' : 'border-gray-200 hover:border-gray-300'}`}>
                    <span className="font-medium mr-2">{opt}.</span>{q[`option${opt}`]}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <button onClick={submitQuiz} className="w-full py-3 bg-[#7b1113] text-white rounded-xl font-medium text-sm hover:bg-[#5c0d0f]">Submit Quiz</button>
      </div>
    );
  }

  // Result
  if (result) {
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <div className="w-20 h-20 bg-[#7b1113]/10 rounded-full flex items-center justify-center mx-auto mb-4"><Trophy className="w-10 h-10 text-[#d4a017]" /></div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Quiz Complete!</h2>
        <p className="text-4xl font-bold text-[#7b1113] mb-2">{result.score}%</p>
        <p className="text-gray-500">{result.correct} correct out of {result.total} questions</p>
        <button onClick={() => setResult(null)} className="mt-6 px-6 py-2.5 bg-[#7b1113] text-white rounded-xl text-sm font-medium">Back to Quizzes</button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#7b1113] mb-6">Available Quizzes</h1>
      {quizzes.length === 0 ? <p className="text-center py-12 text-gray-400">No quizzes available</p> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quizzes.map(q => (
            <div key={q.id} className="bg-white border border-[#7b1113]/10 rounded-xl shadow-sm p-5">
              <h3 className="font-semibold text-gray-900">{q.title}</h3>
              <p className="text-xs text-gray-500 mt-1">{q.subject} • {q.questionCount} questions • {q.durationMinutes} min {q.iitNeetOnly && <span className="ml-1 bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded text-[10px] font-medium">🎯 IIT/NEET</span>}</p>
              <button onClick={() => startQuiz(q.id)} className="mt-3 w-full py-2 bg-[#7b1113] text-white rounded-lg text-sm font-medium hover:bg-[#5c0d0f]">Take Quiz</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
