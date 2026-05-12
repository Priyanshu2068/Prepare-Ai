import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { useSession } from '../context/SessionContext';
import AIFeedback from '../components/AIFeedback';
import feedtemp from '../utils/feedtemp';
import Navbar from '../components/Navbar';
import LoginPrompt from '../components/LoginPrompt';

export default function Results() {
  const { user, token, loading } = useAuth();
  const { attempts } = useSession();
  const router = useRouter();

  const [selectedTopics, setSelectedTopics] = useState([]);

  useEffect(() => {
    if (loading) return;
    if (!user) return;
    if (user.role === 'admin') { router.push('/admin'); return; }
    if (attempts.length === 0) { router.push('/dashboard'); return; }
  }, [user, loading, attempts.length, router]);

  if (!loading && !user) {
    return (
      <LoginPrompt
        title="Login to view results"
        message="Your quiz results belong to your account, so please log in to continue."
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

  const lastAttempt = attempts[attempts.length - 1];
  if (!lastAttempt) return null;

  const { results, score, totalQuestions, percentage } = lastAttempt;

  // get unique weak topics from this attempt
  const topicMap = {};
  results.forEach(r => {
    if (!topicMap[r.topic]) topicMap[r.topic] = { correct: 0, total: 0, subject: r.subject };
    topicMap[r.topic].total++;
    if (r.isCorrect) topicMap[r.topic].correct++;
  });

  const weakTopics = Object.entries(topicMap)
    .filter(([_, s]) => (s.correct / s.total) < 0.7)
    .map(([topic, s]) => ({ topic, subject: s.subject }));

  const strongTopics = Object.entries(topicMap)
    .filter(([_, s]) => (s.correct / s.total) >= 0.7)
    .map(([topic, s]) => ({ topic, subject: s.subject }));

  const toggleTopic = (topic) => {
    setSelectedTopics(prev =>
      prev.includes(topic) ? prev.filter(t => t !== topic) : [...prev, topic]
    );
  };

  const feedbackData = {
  score,
  totalQuestions,
  percentage,
  strongTopics: strongTopics.map(t => t.topic),
  weakTopics: weakTopics.map(t => t.topic),
  };
  const templateIndex = (attempts.length - 1) % feedtemp.length;
  const feedbackTemplate = feedtemp[templateIndex] || feedtemp[0];
  const localFeedback = feedbackTemplate(feedbackData);

  const handleNextQuiz = () => {
    if (selectedTopics.length > 0) {
      router.push({
        pathname: '/quiz',
        query: { topics: selectedTopics.join(',') },
      });
    } else {
      router.push('/quiz');
    }
  };

  const getScoreColor = () => {
    if (percentage >= 70) return 'text-green-400';
    if (percentage >= 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreMessage = () => {
    if (percentage >= 70) return 'Great job! 🎉';
    if (percentage >= 40) return 'Keep practicing! 💪';
    return 'Need more work! 📚';
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />

      <div className="max-w-2xl mx-auto px-6 py-10">

        {/* Score Card */}
        <div className="bg-gray-900 rounded-2xl p-8 text-center mb-8">
          <p className="text-gray-400 mb-2">Your Score</p>
          <p className={`text-7xl font-bold mb-2 ${getScoreColor()}`}>{percentage}%</p>
          <p className="text-2xl mb-1">{getScoreMessage()}</p>
          <p className="text-gray-500 text-sm">{score} out of {totalQuestions} correct</p>
        </div>

        {/* AI Feedback */}
        <AIFeedback results={results} localFeedback={localFeedback} token={token} />

        {/* Question Breakdown */}
        <div className="bg-gray-900 rounded-2xl p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Question Breakdown</h2>
          <div className="space-y-4">
            {results.map((r, i) => (
              <div
                key={i}
                className={`rounded-xl p-4 border ${r.isCorrect ? 'border-green-800 bg-green-950' : 'border-red-800 bg-red-950'}`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="text-sm font-medium">{i + 1}. {r.question}</p>
                  <span className={`text-lg flex-shrink-0 ${r.isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                    {r.isCorrect ? '✓' : '✗'}
                  </span>
                </div>
                <div className="flex gap-2 mb-2">
                  <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">{r.subject}</span>
                  <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">{r.topic}</span>
                </div>
                {!r.isCorrect && (
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-red-300">Your answer: {r.selectedAnswer}</p>
                    <p className="text-xs text-green-300">Correct: {r.correctAnswer}</p>
                  </div>
                )}
                <p className="text-xs text-gray-400 mt-2">{r.explanation}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Topic Filter for Next Quiz */}
        <div className="bg-gray-900 rounded-2xl p-6 mb-8">
          <h2 className="text-lg font-semibold mb-1">Next Quiz Focus</h2>
          <p className="text-gray-500 text-sm mb-4">
            Select topics to focus on, or skip to get a mixed quiz.
          </p>

          {weakTopics.length > 0 && (
            <div className="mb-4">
              <p className="text-red-400 text-sm font-medium mb-2">⚠️ Weak Topics</p>
              <div className="flex flex-wrap gap-2">
                {weakTopics.map(({ topic }) => (
                  <button
                    key={topic}
                    onClick={() => toggleTopic(topic)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition border ${
                      selectedTopics.includes(topic)
                        ? 'bg-red-600 border-red-500 text-white'
                        : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-red-500'
                    }`}
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>
          )}

          {strongTopics.length > 0 && (
            <div>
              <p className="text-green-400 text-sm font-medium mb-2">💪 Strong Topics</p>
              <div className="flex flex-wrap gap-2">
                {strongTopics.map(({ topic }) => (
                  <button
                    key={topic}
                    onClick={() => toggleTopic(topic)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition border ${
                      selectedTopics.includes(topic)
                        ? 'bg-green-600 border-green-500 text-white'
                        : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-green-500'
                    }`}
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-xl font-semibold transition"
          >
            View Dashboard
          </button>
          <button
            onClick={handleNextQuiz}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition"
          >
            {selectedTopics.length > 0 ? `Next Quiz (${selectedTopics.length} topics) →` : 'Next Quiz →'}
          </button>
        </div>

      </div>
    </div>
  );
}
