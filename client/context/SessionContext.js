import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { apiUrl } from '../utils/api';

const SessionContext = createContext();

export const SessionProvider = ({ children }) => {
  const [attempts, setAttempts] = useState([]);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user, token } = useAuth();

  useEffect(() => {
    if (!user || !token) {
      setAttempts([]);
      setCurrentSetIndex(0);
      setLoading(false);
      return;
    }

    let isActive = true;

    const loadAttempts = async () => {
      setLoading(true);
      try {
        const res = await axios.get(apiUrl('/api/analytics/attempts'), {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!isActive) return;

        const userAttempts = res.data.attempts || [];
        setAttempts(userAttempts);
        setCurrentSetIndex(userAttempts.length);
      } catch {
        if (!isActive) return;
        setAttempts([]);
        setCurrentSetIndex(0);
      } finally {
        if (isActive) setLoading(false);
      }
    };

    loadAttempts();

    return () => {
      isActive = false;
    };
  }, [user?.id, token]);

  const addAttempt = (attempt) => {
    setAttempts(prev => [...prev, attempt]);
    setCurrentSetIndex(prev => prev + 1);

    if (token) {
      axios.post(apiUrl('/api/analytics/attempts'), attempt, {
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
  };

  const getStats = () => {
    if (attempts.length === 0) return null;

    const subjectStats = {};
    const topicStats = {};

    attempts.forEach(attempt => {
      attempt.results.forEach(r => {
        // subject level
        if (!subjectStats[r.subject]) {
          subjectStats[r.subject] = { correct: 0, total: 0 };
        }
        subjectStats[r.subject].total++;
        if (r.isCorrect) subjectStats[r.subject].correct++;

        // topic level
        if (!topicStats[r.topic]) {
          topicStats[r.topic] = { correct: 0, total: 0, subject: r.subject };
        }
        topicStats[r.topic].total++;
        if (r.isCorrect) topicStats[r.topic].correct++;
      });
    });

    const strongTopics = [];
    const weakTopics = [];

    Object.entries(topicStats).forEach(([topic, stat]) => {
      const accuracy = (stat.correct / stat.total) * 100;
      if (accuracy >= 70) strongTopics.push({ topic, accuracy, subject: stat.subject });
      else weakTopics.push({ topic, accuracy, subject: stat.subject });
    });

    const totalCorrect = attempts.reduce((sum, a) => sum + a.score, 0);
    const totalQuestions = attempts.reduce((sum, a) => sum + a.totalQuestions, 0);

    return {
      totalQuizzes: attempts.length,
      averageScore: Math.round((totalCorrect / totalQuestions) * 100),
      strongTopics,
      weakTopics,
      subjectStats,
      scoreTrend: attempts.map(a => Math.round(a.percentage)),
    };
  };

  return (
    <SessionContext.Provider value={{
      attempts,
      currentSetIndex,
      loading,
      addAttempt,
      getStats,
    }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => useContext(SessionContext);
