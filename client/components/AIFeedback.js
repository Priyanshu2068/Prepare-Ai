import { useState, useEffect } from 'react';
import axios from 'axios';
import { apiUrl } from '../utils/api';

export default function AIFeedback({ results, localFeedback, token }) {
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(true);
  const [isAI, setIsAI] = useState(false);

  useEffect(() => {
    generateFeedback();
  }, [results]);

  const generateFeedback = async () => {
    setLoading(true);

    try {
      const res = await axios.post(
        apiUrl('/api/quiz/feedback'),
        { results },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFeedback(res.data.feedback);
      setIsAI(true);
    } catch (err) {
      setFeedback(localFeedback);
      setIsAI(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 rounded-2xl p-6 mb-8">
      <div className="flex items-center justify-between gap-4 mb-3">
        <div>
          <h2 className="text-lg font-semibold">AI Result Feedback</h2>
          <p className="text-xs text-gray-500">Personalized review based on your attempted answers</p>
        </div>
        <span className={`text-xs px-3 py-1 rounded-full border flex-shrink-0 ${
          isAI
            ? 'bg-blue-950 border-blue-500 text-blue-300'
            : 'bg-gray-800 border-gray-600 text-gray-400'
        }`}>
          
        </span>
      </div>
      {loading ? (
        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <span className="animate-pulse">Generating fair feedback with a tiny sense of humor...</span>
        </div>
      ) : (
        <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">{feedback}</p>
      )}
    </div>
  );
}
