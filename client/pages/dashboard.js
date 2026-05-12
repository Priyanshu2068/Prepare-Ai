import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { useSession } from '../context/SessionContext';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import Navbar from '../components/Navbar';
import LoginPrompt from '../components/LoginPrompt';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const { attempts, getStats, loading: progressLoading } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    else if (user.role === 'admin') router.push('/admin');
  }, [user, loading, router]);

  if (!loading && !user) {
    return (
      <LoginPrompt
        title="Login to view progress"
        message="Your accuracy, streak, weak topics and quiz history are saved to your account."
      />
    );
  }

  if (loading || progressLoading || !user) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  const stats = getStats();

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* No attempts yet */}
        {!stats ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="text-6xl mb-6">🎯</div>
            <h2 className="text-2xl font-bold mb-2">Ready to practice?</h2>
            <p className="text-gray-400 mb-8">Take your first quiz and your dashboard will come alive with insights.</p>
            <button
              onClick={() => router.push('/select')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition"
            >
              Start First Quiz
            </button>
          </div>
        ) : (
          <>
            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-gray-900 rounded-2xl p-6 text-center">
                <p className="text-gray-400 text-sm mb-1">Quizzes Taken</p>
                <p className="text-4xl font-bold text-blue-400">{stats.totalQuizzes}</p>
              </div>
              <div className="bg-gray-900 rounded-2xl p-6 text-center">
                <p className="text-gray-400 text-sm mb-1">Average Score</p>
                <p className="text-4xl font-bold text-green-400">{stats.averageScore}%</p>
              </div>
              <div className="bg-gray-900 rounded-2xl p-6 text-center">
                <p className="text-gray-400 text-sm mb-1">Topics Covered</p>
                <p className="text-4xl font-bold text-purple-400">
                  {stats.strongTopics.length + stats.weakTopics.length}
                </p>
              </div>
            </div>

            {/* Score Trend Chart */}
            {stats.scoreTrend.length > 1 && (
              <div className="bg-gray-900 rounded-2xl p-6 mb-8">
                <h2 className="text-lg font-semibold mb-4">Score Trend</h2>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={stats.scoreTrend.map((s, i) => ({ quiz: `Q${i + 1}`, score: s }))}>
                    <XAxis dataKey="quiz" stroke="#6b7280" />
                    <YAxis domain={[0, 100]} stroke="#6b7280" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Subject Performance */}
            <div className="bg-gray-900 rounded-2xl p-6 mb-8">
              <h2 className="text-lg font-semibold mb-4">Subject Performance</h2>
              <div className="space-y-3">
                {Object.entries(stats.subjectStats).map(([subject, data]) => {
                  const pct = Math.round((data.correct / data.total) * 100);
                  return (
                    <div key={subject}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-300">{subject}</span>
                        <span className="text-gray-400">{pct}%</span>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${pct >= 70 ? 'bg-green-500' : pct >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Strong & Weak Topics */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-gray-900 rounded-2xl p-6">
                <h2 className="text-lg font-semibold mb-3 text-green-400">💪 Strong Topics</h2>
                {stats.strongTopics.length === 0 ? (
                  <p className="text-gray-500 text-sm">Keep practicing to build strengths!</p>
                ) : (
                  <ul className="space-y-2">
                    {stats.strongTopics.map(t => (
                      <li key={t.topic} className="flex justify-between text-sm">
                        <span className="text-gray-300">{t.topic}</span>
                        <span className="text-green-400">{Math.round(t.accuracy)}%</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="bg-gray-900 rounded-2xl p-6">
                <h2 className="text-lg font-semibold mb-3 text-red-400">⚠️ Weak Topics</h2>
                {stats.weakTopics.length === 0 ? (
                  <p className="text-gray-500 text-sm">No weak topics yet!</p>
                ) : (
                  <ul className="space-y-2">
                    {stats.weakTopics.map(t => (
                      <li key={t.topic} className="flex justify-between text-sm">
                        <span className="text-gray-300">{t.topic}</span>
                        <span className="text-red-400">{Math.round(t.accuracy)}%</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Start Next Quiz */}
            <div className="text-center">
              <button
                onClick={() => router.push('/select')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-3 rounded-xl font-semibold transition"
              >
                Start Next Quiz →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
