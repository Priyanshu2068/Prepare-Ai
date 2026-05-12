import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';
import LoginPrompt from '../components/LoginPrompt';
import { useAuth } from '../context/AuthContext';
import { apiUrl } from '../utils/api';

const tabs = ['Overview', 'Users', 'Subjects', 'Questions', 'Quiz Controls'];

const emptyQuestion = {
  subject: 'DBMS',
  topic: '',
  question: '',
  options: ['', '', '', ''],
  answer: '',
  explanation: '',
  difficulty: 'Medium',
  source: 'manual',
  isActive: true,
};

export default function AdminPanel() {
  const router = useRouter();
  const { user, token, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('Overview');
  const [busy, setBusy] = useState(true);
  const [message, setMessage] = useState('');
  const [summary, setSummary] = useState(null);
  const [users, setUsers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [subjectForm, setSubjectForm] = useState({ code: '', name: '', description: '', topics: '' });
  const [questionForm, setQuestionForm] = useState(emptyQuestion);

  const headers = useMemo(() => ({
    Authorization: `Bearer ${token}`,
  }), [token]);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      return;
    }
    if (user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
    loadAdminData();
  }, [user, loading, token]);

  useEffect(() => {
    const requestedTab = router.query.tab;
    if (typeof requestedTab === 'string' && tabs.includes(requestedTab)) {
      setActiveTab(requestedTab);
    }
  }, [router.query.tab]);

  const request = async (path) => {
    const res = await axios.get(apiUrl(path), { headers });
    return res.data;
  };

  const loadAdminData = async () => {
    if (!token) return;
    setBusy(true);
    setMessage('');

    try {
      const [summaryData, userData, subjectData, questionData] = await Promise.all([
        request('/api/admin/summary'),
        request('/api/admin/users'),
        request('/api/admin/subjects'),
        request('/api/admin/questions'),
      ]);

      setSummary(summaryData);
      setUsers(userData.users || []);
      setSubjects(subjectData.subjects || []);
      setQuestions(questionData.questions || []);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to load admin data');
    } finally {
      setBusy(false);
    }
  };

  const createSubject = async (event) => {
    event.preventDefault();
    setMessage('');

    try {
      await axios.post(apiUrl('/api/admin/subjects'), {
        ...subjectForm,
        topics: subjectForm.topics.split(',').map(topic => topic.trim()).filter(Boolean),
      }, { headers });

      setSubjectForm({ code: '', name: '', description: '', topics: '' });
      setMessage('Subject created successfully');
      loadAdminData();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to create subject');
    }
  };

  const createQuestion = async (event) => {
    event.preventDefault();
    setMessage('');

    try {
      await axios.post(apiUrl('/api/admin/questions'), {
        ...questionForm,
        options: questionForm.options.map(option => option.trim()).filter(Boolean),
      }, { headers });

      setQuestionForm(emptyQuestion);
      setMessage('Question added to the bank');
      loadAdminData();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to create question');
    }
  };

  const updateUserRole = async (id, role) => {
    try {
      await axios.patch(apiUrl(`/api/admin/users/${id}`), {
        role,
        permissions: role === 'admin' ? {
          manageUsers: true,
          manageSubjects: true,
          manageQuestions: true,
          manageQuizzes: true,
          viewAnalytics: true,
        } : {
          manageUsers: false,
          manageSubjects: false,
          manageQuestions: false,
          manageQuizzes: false,
          viewAnalytics: false,
        },
      }, { headers });
      loadAdminData();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to update user');
    }
  };

  const toggleQuestion = async (id, isActive) => {
    try {
      await axios.patch(apiUrl(`/api/admin/questions/${id}`), { isActive: !isActive }, { headers });
      loadAdminData();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to update question');
    }
  };

  if (loading || busy) {
    if (!loading && !user) {
      return (
        <LoginPrompt
          title="Login to access admin"
          message="Admin tools are protected. Please log in with an admin account to continue."
        />
      );
    }

    return (
      <div className="min-h-screen bg-gray-950 text-white">
        <Navbar />
        <div className="flex min-h-[70vh] items-center justify-center text-gray-500">Loading admin panel...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-300">Admin</p>
            <h1 className="mt-3 text-3xl font-black sm:text-4xl">Prepare.ai Control Center</h1>
            <p className="mt-3 max-w-2xl text-gray-400">
              Manage users, subjects, question bank content, quiz behavior, permissions, and platform health.
            </p>
          </div>
          <button
            onClick={loadAdminData}
            className="w-fit rounded-full border border-gray-700 px-5 py-2 text-sm text-gray-200 hover:border-blue-500 hover:text-white"
          >
            Refresh
          </button>
        </div>

        {message && (
          <div className="mb-6 rounded-xl border border-blue-800 bg-blue-950/50 px-4 py-3 text-sm text-blue-200">
            {message}
          </div>
        )}

        <div className="mb-6 flex gap-2 overflow-x-auto rounded-2xl border border-gray-800 bg-gray-900/70 p-2">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                router.push({ pathname: '/admin', query: { tab } }, undefined, { shallow: true });
              }}
              className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm font-semibold transition ${
                activeTab === tab ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'Overview' && <Overview summary={summary} />}
        {activeTab === 'Users' && <Users users={users} onRoleChange={updateUserRole} />}
        {activeTab === 'Subjects' && (
          <Subjects
            subjects={subjects}
            form={subjectForm}
            setForm={setSubjectForm}
            onSubmit={createSubject}
          />
        )}
        {activeTab === 'Questions' && (
          <Questions
            subjects={subjects}
            questions={questions}
            form={questionForm}
            setForm={setQuestionForm}
            onSubmit={createQuestion}
            onToggle={toggleQuestion}
          />
        )}
        {activeTab === 'Quiz Controls' && <QuizControls />}
      </main>
    </div>
  );
}

function Overview({ summary }) {
  const stats = summary?.stats || {};
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard label="Users" value={stats.users || 0} />
        <StatCard label="Subjects" value={stats.subjects || 0} />
        <StatCard label="Questions" value={stats.questions || 0} />
        <StatCard label="Quiz Attempts" value={stats.attempts || 0} />
      </div>
      <Panel title="Admin Permissions">
        <div className="grid gap-3 sm:grid-cols-2">
          {Object.keys(summary?.permissions || {}).map(permission => (
            <div key={permission} className="rounded-xl border border-gray-800 bg-gray-950/70 p-4">
              <p className="font-semibold text-gray-100">{permission}</p>
              <p className="mt-1 text-sm text-emerald-300">Enabled</p>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function Users({ users, onRoleChange }) {
  return (
    <Panel title="Users and Permissions">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-gray-500">
            <tr>
              <th className="py-3">Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Permissions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user._id} className="border-t border-gray-800">
                <td className="py-4 font-semibold text-gray-100">{user.name}</td>
                <td className="text-gray-400">{user.email}</td>
                <td>
                  <select
                    value={user.role || 'student'}
                    onChange={(event) => onRoleChange(user._id, event.target.value)}
                    className="rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-gray-200 outline-none"
                  >
                    <option value="student">student</option>
                    <option value="admin">admin</option>
                  </select>
                </td>
                <td className="text-gray-400">
                  {user.role === 'admin' ? 'Full access' : 'Practice access'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

function Subjects({ subjects, form, setForm, onSubmit }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
      <Panel title="Add Subject">
        <form onSubmit={onSubmit} className="space-y-4">
          <Input label="Subject Code" value={form.code} onChange={value => setForm({ ...form, code: value })} placeholder="AI" />
          <Input label="Subject Name" value={form.name} onChange={value => setForm({ ...form, name: value })} placeholder="Artificial Intelligence" />
          <Input label="Description" value={form.description} onChange={value => setForm({ ...form, description: value })} placeholder="Core AI interview MCQs" />
          <Input label="Topics" value={form.topics} onChange={value => setForm({ ...form, topics: value })} placeholder="Search, ML Basics, Agents" />
          <button className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold hover:bg-blue-500">Create Subject</button>
        </form>
      </Panel>

      <Panel title="Subject Library">
        <div className="grid gap-3 sm:grid-cols-2">
          {subjects.map(subject => (
            <div key={subject._id || subject.code} className="rounded-2xl border border-gray-800 bg-gray-950/70 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-bold">{subject.code}</p>
                  <p className="text-sm text-gray-400">{subject.name}</p>
                </div>
                <span className={`rounded-full px-2 py-1 text-xs ${subject.locked ? 'bg-gray-800 text-gray-400' : 'bg-blue-950 text-blue-300'}`}>
                  {subject.locked ? 'Built-in' : 'Custom'}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {(subject.topics || []).slice(0, 5).map(topic => (
                  <span key={topic} className="rounded-full bg-gray-800 px-2 py-1 text-xs text-gray-300">{topic}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function Questions({ subjects, questions, form, setForm, onSubmit, onToggle }) {
  const updateOption = (index, value) => {
    const options = [...form.options];
    options[index] = value;
    setForm({ ...form, options });
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <Panel title="Create Question">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Select label="Subject" value={form.subject} onChange={value => setForm({ ...form, subject: value })} options={subjects.map(s => s.code)} />
            <Input label="Topic" value={form.topic} onChange={value => setForm({ ...form, topic: value })} placeholder="Normalization" />
          </div>
          <TextArea label="Question" value={form.question} onChange={value => setForm({ ...form, question: value })} />
          <div className="grid gap-3 sm:grid-cols-2">
            {form.options.map((option, index) => (
              <Input key={index} label={`Option ${index + 1}`} value={option} onChange={value => updateOption(index, value)} />
            ))}
          </div>
          <Input label="Correct Answer" value={form.answer} onChange={value => setForm({ ...form, answer: value })} placeholder="Must match an option exactly" />
          <TextArea label="Explanation" value={form.explanation} onChange={value => setForm({ ...form, explanation: value })} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Select label="Difficulty" value={form.difficulty} onChange={value => setForm({ ...form, difficulty: value })} options={['Easy', 'Medium', 'Hard']} />
            <Select label="Source" value={form.source} onChange={value => setForm({ ...form, source: value })} options={['manual', 'previous-year', 'mock-test']} />
          </div>
          <button className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold hover:bg-blue-500">Add Question</button>
        </form>
      </Panel>

      <Panel title="Question Bank">
        <div className="space-y-3">
          {questions.length === 0 ? (
            <p className="text-sm text-gray-500">No custom questions yet.</p>
          ) : questions.map(question => (
            <div key={question._id} className="rounded-2xl border border-gray-800 bg-gray-950/70 p-4">
              <div className="mb-2 flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-blue-300">{question.subject} / {question.topic}</p>
                  <h3 className="mt-1 font-semibold text-gray-100">{question.question}</h3>
                </div>
                <button
                  onClick={() => onToggle(question._id, question.isActive)}
                  className={`rounded-full px-3 py-1 text-xs ${question.isActive ? 'bg-emerald-950 text-emerald-300' : 'bg-gray-800 text-gray-400'}`}
                >
                  {question.isActive ? 'Active' : 'Inactive'}
                </button>
              </div>
              <p className="text-sm text-gray-400">Answer: {question.answer}</p>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function QuizControls() {
  const controls = [
    'Create and curate manual MCQs',
    'Mark questions as previous-year or mock-test',
    'Enable or disable question availability',
    'Add new subjects and topic lists',
    'Control user roles and admin permissions',
    'View total users, questions, subjects and attempts',
  ];

  return (
    <Panel title="Quiz Management Abilities">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {controls.map(control => (
          <div key={control} className="rounded-2xl border border-gray-800 bg-gray-950/70 p-5">
            <div className="mb-4 h-10 w-10 rounded-xl bg-blue-600/20" />
            <p className="font-semibold text-gray-100">{control}</p>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900/70 p-6">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-3 text-4xl font-black text-white">{value}</p>
    </div>
  );
}

function Panel({ title, children }) {
  return (
    <section className="rounded-3xl border border-gray-800 bg-gray-900/70 p-6 shadow-2xl shadow-gray-950/30">
      <h2 className="mb-5 text-xl font-bold">{title}</h2>
      {children}
    </section>
  );
}

function Input({ label, value, onChange, placeholder = '' }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-gray-400">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-gray-800 bg-gray-950 px-4 py-3 text-sm text-gray-100 outline-none focus:border-blue-500"
      />
    </label>
  );
}

function TextArea({ label, value, onChange }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-gray-400">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={4}
        className="w-full resize-none rounded-xl border border-gray-800 bg-gray-950 px-4 py-3 text-sm text-gray-100 outline-none focus:border-blue-500"
      />
    </label>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-gray-400">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-gray-800 bg-gray-950 px-4 py-3 text-sm text-gray-100 outline-none focus:border-blue-500"
      >
        {options.map(option => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}
