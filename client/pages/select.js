import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import LoginPrompt from '../components/LoginPrompt';

const SUBJECTS = [
  { id: 'OOPS', label: 'Object Oriented Programming', icon: '🧱', available: true },
  { id: 'DBMS', label: 'Database Management Systems', icon: '🗄️', available: true },
  { id: 'OS', label: 'Operating Systems', icon: '⚙️', available: true },
  { id: 'CN', label: 'Computer Networks', icon: '🌐', available: true },
  { id: 'Java', label: 'Java Programming', icon: '☕', available: true },
  { id: 'DSA', label: 'Data Structures & Algorithms', icon: '📊', available: false },
  { id: 'System Design', label: 'System Design', icon: '🏗️', available: false },
];

export default function Select() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [selected, setSelected] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (loading) return;
    if (user?.role === 'admin') router.push('/admin');
  }, [user, loading, router]);

  if (!loading && !user) {
    return (
      <LoginPrompt
        title="Login to start practicing"
        message="Create or enter your account before starting a quiz so your progress can be saved."
      />
    );
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  const toggleSubject = (id) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
    setError('');
  };

  const handleStart = () => {
    if (selected.length === 0) {
      setError('Please select at least one subject to continue.');
      return;
    }
    router.push({
      pathname: '/quiz',
      query: { subjects: selected.join(',') },
    });
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />

      <div className="max-w-2xl mx-auto px-6 py-10">

        {/* Heading */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-2">Choose Your Subjects</h2>
          <p className="text-gray-400">Select the subjects you want to be quizzed on. Your quiz will only include questions from selected subjects.</p>
        </div>

        {/* Subject Grid */}
        <div className="grid grid-cols-1 gap-3 mb-4">
          {SUBJECTS.map(({ id, label, icon, available }) => {
            const isSelected = selected.includes(id);

            if (!available) {
              return (
                <div
                  key={id}
                  className="flex items-center justify-between bg-gray-900 border border-gray-800 rounded-2xl px-5 py-4 opacity-50 cursor-not-allowed"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{icon}</span>
                    <div>
                      <p className="font-medium text-gray-400">{label}</p>
                      <p className="text-xs text-gray-600">{id}</p>
                    </div>
                  </div>
                  <span className="text-xs bg-gray-800 text-gray-500 px-3 py-1 rounded-full border border-gray-700">
                    Coming Soon
                  </span>
                </div>
              );
            }

            return (
              <button
                key={id}
                onClick={() => toggleSubject(id)}
                className={`flex items-center justify-between rounded-2xl px-5 py-4 border transition-all text-left ${
                  isSelected
                    ? 'bg-blue-950 border-blue-500'
                    : 'bg-gray-900 border-gray-800 hover:border-gray-600'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl">{icon}</span>
                  <div>
                    <p className="font-medium">{label}</p>
                    <p className="text-xs text-gray-500">{id}</p>
                  </div>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-600'
                }`}>
                  {isSelected && <span className="text-white text-xs">✓</span>}
                </div>
              </button>
            );
          })}

          {/* Add Subject Card — disabled */}
          <div className="flex items-center justify-between bg-gray-900 border border-dashed border-gray-700 rounded-2xl px-5 py-4 opacity-50 cursor-not-allowed">
            <div className="flex items-center gap-4">
              <span className="text-2xl">➕</span>
              <div>
                <p className="font-medium text-gray-400">Add Your Own Subject</p>
                <p className="text-xs text-gray-600">Request a custom subject to be added</p>
              </div>
            </div>
            <span className="text-xs bg-gray-800 text-gray-500 px-3 py-1 rounded-full border border-gray-700">
              Coming Soon
            </span>
          </div>

        </div>

        {/* Selected count */}
        <p className="text-center text-gray-500 text-sm mb-2">
          {selected.length === 0
            ? 'No subjects selected'
            : `${selected.length} subject${selected.length > 1 ? 's' : ''} selected`}
        </p>

        {/* Error */}
        {error && (
          <p className="text-center text-red-400 text-sm mb-4">{error}</p>
        )}

        {/* Start Button */}
        <button
          onClick={handleStart}
          className={`w-full py-4 rounded-2xl font-semibold text-lg transition-all mt-4 ${
            selected.length > 0
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-gray-800 text-gray-500 cursor-not-allowed'
          }`}
        >
          {selected.length > 0 ? `Start Quiz with ${selected.length} Subject${selected.length > 1 ? 's' : ''} →` : 'Select a subject to continue'}
        </button>

      </div>
    </div>
  );
}
