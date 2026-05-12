const flattenSubject = (data) => {
  const flat = [];
  Object.entries(data).forEach(([topic, questions]) => {
    questions.forEach(q => flat.push({ ...q, topic }));
  });
  return flat;
};

const Question = require('../models/Question');
const Subject = require('../models/Subject');

const staticQuestions = {
  DBMS: flattenSubject(require('../data/dbms')),
  OOPS: flattenSubject(require('../data/oops')),
  OS:   flattenSubject(require('../data/os')),
  CN:   flattenSubject(require('../data/cn')),
  Java: flattenSubject(require('../data/java')),
};

const { generateQuiz, generateMixedQuiz } = require('../utils/gemini');

const getSubjectPool = async (subject) => {
  const manualQuestions = await Question.find({ subject, isActive: true }).lean();
  const normalizedManualQuestions = manualQuestions.map(q => ({
    question: q.question,
    options: q.options,
    answer: q.answer,
    explanation: q.explanation,
    topic: q.topic,
    subject: q.subject,
  }));

  return [
    ...(staticQuestions[subject] || []),
    ...normalizedManualQuestions,
  ];
};

const getValidSubjectCodes = async () => {
  const customSubjects = await Subject.find({ isActive: true }).select('code').lean();
  return new Set([
    ...Object.keys(staticQuestions),
    ...customSubjects.map(subject => subject.code),
  ]);
};

const getFallbackQuestions = async (subject, topic) => {
  const subjectPool = await getSubjectPool(subject);
  if (!subjectPool.length) return null;

  let pool = subjectPool.filter(q => q.topic === topic);
  if (pool.length === 0) pool = subjectPool;

  return [...pool].sort(() => Math.random() - 0.5).slice(0, 10);
};

const buildQuestionDistribution = (items, totalQuestions = 10) => {
  const baseCount = Math.floor(totalQuestions / items.length);
  const extraCount = totalQuestions % items.length;

  return items.map((item, index) => ({
    ...item,
    count: baseCount + (index < extraCount ? 1 : 0),
  }));
};

const getMixedFallbackQuestions = async (selections) => {
  const questionSets = await Promise.all(selections.map(async ({ subject, topic, count }) => {
    const subjectPool = await getSubjectPool(subject);
    let pool = subjectPool.filter(q => q.topic === topic);
    if (pool.length === 0) pool = subjectPool;

    return [...pool]
      .sort(() => Math.random() - 0.5)
      .slice(0, count)
      .map(q => ({ ...q, subject, topic: q.topic || topic }));
  }));

  return questionSets.flat();
};

exports.generateQuizHandler = async (req, res) => {
  try {
    const { subject, topic, difficulty } = req.body;

    if (!subject || !topic || !difficulty) {
      return res.status(400).json({ message: 'Subject, topic and difficulty are required' });
    }

    const subjectPool = await getSubjectPool(subject);
    if (!subjectPool.length) {
      return res.status(400).json({ message: 'Invalid subject' });
    }

    try {
      const questions = await generateQuiz(subject, topic, difficulty);

      return res.json({
        subject,
        topic,
        difficulty,
        usedFallback: false,
        questions,
      });
    } catch (aiErr) {
      console.error('Gemini quiz generation failed:', aiErr.message);
    }

    const fallbackQuestions = await getFallbackQuestions(subject, topic);

    res.json({
      subject,
      topic,
      difficulty,
      usedFallback: true,
      questions: fallbackQuestions,
    });

  } catch (err) {
    res.status(500).json({ message: 'Quiz generation failed', error: err.message });
  }
};

exports.generateMixedQuizHandler = async (req, res) => {
  try {
    const { selections, difficulty = 'Medium' } = req.body;

    if (!Array.isArray(selections) || selections.length === 0) {
      return res.status(400).json({ message: 'At least one subject/topic selection is required' });
    }

    const cleanedSelections = selections.map(item => ({
      subject: item.subject,
      topic: item.topic,
    }));

    const validSubjectCodes = await getValidSubjectCodes();
    const hasInvalidSelection = cleanedSelections.some(({ subject, topic }) => (
      !subject ||
      !topic ||
      !validSubjectCodes.has(subject)
    ));

    if (hasInvalidSelection) {
      return res.status(400).json({ message: 'Invalid subject or topic selection' });
    }

    const plannedSelections = buildQuestionDistribution(cleanedSelections);

    try {
      const questions = await generateMixedQuiz(plannedSelections, difficulty);

      return res.json({
        difficulty,
        usedFallback: false,
        questions,
      });
    } catch (aiErr) {
      console.error('Gemini mixed quiz generation failed:', aiErr.message);
    }

    const fallbackQuestions = await getMixedFallbackQuestions(plannedSelections);

    res.json({
      difficulty,
      usedFallback: true,
      questions: fallbackQuestions,
    });
  } catch (err) {
    res.status(500).json({ message: 'Mixed quiz generation failed', error: err.message });
  }
};

exports.generateFeedbackHandler = async (req, res) => {
  const { results } = req.body;

  if (!Array.isArray(results) || results.length === 0) {
    return res.status(400).json({ message: 'Results are required' });
  }

  const score = results.filter(r => r.isCorrect).length;
  const percentage = Math.round((score / results.length) * 100);
  const wrongTopics = [...new Set(results.filter(r => !r.isCorrect).map(r => r.topic))];
  const rightTopics = [...new Set(results.filter(r => r.isCorrect).map(r => r.topic))];
  const missedTopicDetails = results
    .filter(r => !r.isCorrect)
    .map(r => `${r.subject}: ${r.topic}`);
  const topicsToRead = [...new Set(missedTopicDetails)];
  const answerReview = results.map((r, index) => (
    `${index + 1}. Subject: ${r.subject}; Topic: ${r.topic}; Question: ${r.question}; Student answer: ${r.selectedAnswer || 'not answered'}; Correct answer: ${r.correctAnswer}; Result: ${r.isCorrect ? 'correct' : 'wrong'}`
  )).join('\n');

  const prompt = `
    A student just completed a technical interview preparation quiz.
    Score: ${score}/${results.length} (${percentage}%)
    Strong topics: ${rightTopics.join(', ') || 'none'}
    Weak topics: ${wrongTopics.join(', ') || 'none'}
    Topics to read for missed answers: ${topicsToRead.join(', ') || 'none'}
    Answer attempts:
    ${answerReview}
    
    Write fair, unbiased feedback based only on the student's actual answers.
    Tone: witty, funny, playful, and encouraging, like a friendly mentor with good comic timing.
    Make the humor result-aware: if the score is low, be gentle and motivating; if the score is high, be celebratory but not overconfident.
    Do not roast, insult, shame, or exaggerate. Keep it classroom-safe and supportive.
    If the student attempted any wrong answer, clearly name the exact topics they should read to reach their full potential.
    Format the response as exactly 2 short paragraphs:
    Paragraph 1: Give the score summary, mention what went well, and include one funny/witty observation about the attempt.
    Paragraph 2: Start exactly with "Read next:" then list the study topics from "Topics to read for missed answers", grouped by subject if possible, and end with one concrete study tip.
    If there are no wrong answers, start paragraph 2 with "Read next: No urgent weak topics" and suggest one advanced practice step.
    No markdown headings, no bullet points, no emojis.
  `;

  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    });
    const result = await model.generateContent(prompt);
    const feedback = result.response.text();
    res.json({ feedback });
  } catch (err) {
    res.status(500).json({ message: 'Feedback generation failed' });
  }
};
