const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  permissions: {
    manageUsers: { type: Boolean, default: false },
    manageSubjects: { type: Boolean, default: false },
    manageQuestions: { type: Boolean, default: false },
    manageQuizzes: { type: Boolean, default: false },
    viewAnalytics: { type: Boolean, default: false },
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
