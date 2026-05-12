const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String }],
  selectedAnswer: { type: String },
  correctAnswer: { type: String, required: true },
  explanation: { type: String },
  isCorrect: { type: Boolean, required: true },
  subject: { type: String, required: true },
  topic: { type: String, required: true },
}, { _id: false });

const attemptSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  results: {
    type: [answerSchema],
    required: true,
    validate: value => Array.isArray(value) && value.length > 0,
  },
  score: { type: Number, required: true, min: 0 },
  totalQuestions: { type: Number, required: true, min: 1 },
  percentage: { type: Number, required: true, min: 0, max: 100 },
}, { timestamps: true });

module.exports = mongoose.model('Attempt', attemptSchema);
