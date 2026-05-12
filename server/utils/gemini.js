const { GoogleGenerativeAI } = require('@google/generative-ai');

const validateQuestions = (questions, options = {}) => {
  if (!Array.isArray(questions) || questions.length !== 10) {
    throw new Error('Gemini did not return exactly 10 questions');
  }

  questions.forEach((q, index) => {
    if (
      !q ||
      typeof q.question !== 'string' ||
      !Array.isArray(q.options) ||
      q.options.length !== 4 ||
      typeof q.answer !== 'string' ||
      typeof q.explanation !== 'string' ||
      !q.options.includes(q.answer) ||
      (options.requireMetadata && typeof q.subject !== 'string') ||
      (options.requireMetadata && typeof q.topic !== 'string')
    ) {
      throw new Error(`Invalid Gemini question format at index ${index}`);
    }
  });
};

const generateQuiz = async (subject, topic, difficulty) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
  });

  const prompt = `
    Generate exactly 10 multiple choice questions about "${topic}" in "${subject}" for a "${difficulty}" difficulty level.
    
    Return ONLY a valid JSON array with no extra text, in this exact format:
    [
      {
        "question": "Question text here?",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "answer": "Correct option text here",
        "explanation": "Two to four sentence explanation here"
      }
    ]
    
    Rules:
    - Exactly 10 questions
    - Exactly 4 options each
    - answer must exactly match one of the options
    - explanation must be 2 to 4 clear teaching sentences, around 45 to 80 words
    - explanation must say why the correct answer is correct
    - explanation must also briefly explain why the common wrong options are not correct, so students learn from wrong attempts
    - Keep explanations beginner-friendly, interview-focused, and specific to the question
    - No markdown, no backticks, just raw JSON array
  `;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  // strip any accidental markdown fences
  const clean = text.replace(/```json|```/g, '').trim();
  const questions = JSON.parse(clean);
  validateQuestions(questions);

  return questions;
};

const generateMixedQuiz = async (selections, difficulty) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
  });

  const plan = selections
    .map(item => `- ${item.count} question(s): ${item.subject} / ${item.topic}`)
    .join('\n');

  const prompt = `
    Generate exactly 10 multiple choice questions for a "${difficulty}" difficulty quiz.

    Distribute the questions exactly like this:
    ${plan}
    
    Return ONLY a valid JSON array with no extra text, in this exact format:
    [
      {
        "subject": "Subject name here",
        "topic": "Topic name here",
        "question": "Question text here?",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "answer": "Correct option text here",
        "explanation": "Two to four sentence explanation here"
      }
    ]
    
    Rules:
    - Exactly 10 questions total
    - Use only the subjects and topics from the distribution above
    - Exactly 4 options each
    - answer must exactly match one of the options
    - explanation must be 2 to 4 clear teaching sentences, around 45 to 80 words
    - explanation must say why the correct answer is correct
    - explanation must also briefly explain why the common wrong options are not correct, so students learn from wrong attempts
    - Keep explanations beginner-friendly, interview-focused, and specific to the question
    - No markdown, no backticks, just raw JSON array
  `;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  const clean = text.replace(/```json|```/g, '').trim();
  const questions = JSON.parse(clean);
  validateQuestions(questions, { requireMetadata: true });

  return questions;
};

module.exports = { generateQuiz, generateMixedQuiz };
