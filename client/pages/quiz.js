import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { useSession } from '../context/SessionContext';
import axios from 'axios';
import { apiUrl } from '../utils/api';
import Navbar from '../components/Navbar';
import LoginPrompt from '../components/LoginPrompt';

export default function Quiz() {
  const { user, token, loading: authLoading } = useAuth();
  const { currentSetIndex, addAttempt } = useSession();
  const router = useRouter();

  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!user) return;
    if (user.role === 'admin') { router.push('/admin'); return; }
    if (!router.isReady || !token) return;
    fetchQuiz();
  }, [user, authLoading, router.isReady, token]);

  useEffect(() => {
    const blockCopyActions = (event) => {
      event.preventDefault();
    };

    const blockShortcuts = (event) => {
      const key = event.key.toLowerCase();
      const isCopyShortcut = (event.ctrlKey || event.metaKey) && ['a', 'c', 'x', 's', 'p'].includes(key);

      if (isCopyShortcut) {
        event.preventDefault();
      }
    };

    document.addEventListener('copy', blockCopyActions);
    document.addEventListener('cut', blockCopyActions);
    document.addEventListener('contextmenu', blockCopyActions);
    document.addEventListener('dragstart', blockCopyActions);
    document.addEventListener('keydown', blockShortcuts);

    return () => {
      document.removeEventListener('copy', blockCopyActions);
      document.removeEventListener('cut', blockCopyActions);
      document.removeEventListener('contextmenu', blockCopyActions);
      document.removeEventListener('dragstart', blockCopyActions);
      document.removeEventListener('keydown', blockShortcuts);
    };
  }, []);

  const fetchQuiz = async () => {
    setLoading(true);
    setError('');
    try {
      const selectedTopics = router.query.topics
        ? router.query.topics.split(',')
        : [];

      const subjects = router.query.subjects
        ? router.query.subjects.split(',')
        : ['OOPS', 'DBMS', 'OS', 'CN', 'Java'];

      const selections = subjects.map((subject) => {
        const topics = getTopicsForSubject(subject);

        // if a selected topic belongs to this subject use it, else pick normally
        const subjectSelectedTopics = selectedTopics.filter(t => topics.includes(t));
        const topic = subjectSelectedTopics.length > 0
          ? subjectSelectedTopics[currentSetIndex % subjectSelectedTopics.length]
          : topics[currentSetIndex % topics.length];

        return { subject, topic };
      });

      const res = await axios.post(
        apiUrl('/api/quiz/generate-mixed'),
        { selections, difficulty: 'Medium' },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setQuestions(res.data.questions);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getTopicsForSubject = (subject) => {
    const map = {
      OOPS: ['Classes and Objects', 'Inheritance', 'Polymorphism', 'Encapsulation', 'Abstraction'],
      DBMS: ['Joins', 'Normalization', 'Transactions', 'Indexing', 'SQL Basics'],
      OS: ['Process Management', 'Deadlocks', 'Scheduling', 'Memory Management', 'File Systems'],
      CN: ['OSI Model', 'TCP/IP', 'Routing', 'Network Security', 'IP Addressing'],
      Java: ['Collections', 'Exception Handling', 'Multithreading', 'Java 8 Features', 'String Handling'],
    };
    return map[subject];
  };

  const handleSelect = (option) => {
    if (selected !== null) return; // already answered
    setSelected(option);
  };

  const handleNext = () => {
    const q = questions[current];
    const isCorrect = selected === q.answer;

    const newAnswers = [...answers, {
      question: q.question,
      options: q.options,
      selectedAnswer: selected,
      correctAnswer: q.answer,
      explanation: q.explanation,
      isCorrect,
      subject: q.subject,
      topic: q.topic,
    }];

    if (current + 1 < questions.length) {
      setAnswers(newAnswers);
      setCurrent(current + 1);
      setSelected(null);
    } else {
      // quiz done
      const score = newAnswers.filter(a => a.isCorrect).length;
      const attempt = {
        results: newAnswers,
        score,
        totalQuestions: questions.length,
        percentage: Math.round((score / questions.length) * 100),
      };
      addAttempt(attempt);
      router.push({
        pathname: '/results',
        query: { score, total: questions.length },
      });
    }
  };

  if (!authLoading && !user) {
    return (
      <LoginPrompt
        title="Login to take a quiz"
        message="Please log in before starting a quiz so your attempt and progress are saved correctly."
      />
    );
  }

  if (authLoading || loading) return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center">
      <div className="text-white text-xl mb-2">Generating your quiz...</div>
      <p className="text-gray-500 text-sm">Fetching questions from AI</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center">
      <p className="text-red-400 mb-4">{error}</p>
      <button onClick={fetchQuiz} className="bg-blue-600 text-white px-6 py-2 rounded-xl">
        Try Again
      </button>
    </div>
  );

  const q = questions[current];
  const progress = ((current) / questions.length) * 100;
  const isWrongAnswer = selected !== null && selected !== q.answer;

  return (
    <div
      className="min-h-screen bg-gray-950 text-white flex flex-col select-none"
      onCopy={(event) => event.preventDefault()}
      onCut={(event) => event.preventDefault()}
      onContextMenu={(event) => event.preventDefault()}
      onDragStart={(event) => event.preventDefault()}
    >

      <Navbar />
      <div className="bg-gray-900 px-6 py-3 flex justify-end border-b border-gray-800">
        <span className="text-gray-400 text-sm">Question {current + 1} of {questions.length}</span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-800 h-1">
        <div
          className="bg-blue-500 h-1 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-2xl">

          {/* Subject & Topic Badge */}
          <div className="flex gap-2 mb-4">
            <span className="bg-blue-900 text-blue-300 text-xs px-3 py-1 rounded-full">{q.subject}</span>
            <span className="bg-gray-800 text-gray-400 text-xs px-3 py-1 rounded-full">{q.topic}</span>
          </div>

          {/* Question */}
          <h2 className="text-xl font-semibold mb-6 leading-relaxed">{q.question}</h2>

          {/* Options */}
          <div className="space-y-3 mb-8">
            {q.options.map((option, i) => {
              let style = 'bg-gray-900 border border-gray-700 hover:border-blue-500';
              if (selected !== null) {
                if (option === q.answer) style = 'bg-green-900 border border-green-500';
                else if (option === selected) style = 'bg-red-900 border border-red-500';
                else style = 'bg-gray-900 border border-gray-700 opacity-50';
              }
              return (
                <button
                  key={i}
                  onClick={() => handleSelect(option)}
                  className={`w-full text-left px-5 py-4 rounded-xl transition-all ${style}`}
                >
                  <span className="text-gray-400 mr-3">{String.fromCharCode(65 + i)}.</span>
                  {option}
                </button>
              );
            })}
          </div>

          {/* Explanation */}
          {selected && (
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 mb-6">
              {isWrongAnswer && (
                <div className="space-y-1 mb-3">
                  <p className="text-xs text-red-300">Your answer: {selected}</p>
                  <p className="text-xs text-green-300">Correct answer: {q.answer}</p>
                </div>
              )}
              <p className="text-sm text-gray-300">
                <span className="text-blue-400 font-semibold">
                  {isWrongAnswer ? 'Why this is correct: ' : 'Explanation: '}
                </span>
                {q.explanation}
              </p>
            </div>
          )}

          {/* Next Button */}
          {selected && (
            <button
              onClick={handleNext}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition"
            >
              {current + 1 === questions.length ? 'See Results →' : 'Next Question →'}
            </button>
          )}

        </div>
      </div>
    </div>
  );
}
