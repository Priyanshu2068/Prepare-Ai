const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const User = require('../models/User');
const Subject = require('../models/Subject');
const Question = require('../models/Question');
const Attempt = require('../models/Attempt');

const defaultSubjects = [
  { code: 'DBMS', name: 'Database Management Systems', topics: ['Joins', 'Normalization', 'Transactions', 'Indexing', 'SQL Basics'], locked: true },
  { code: 'OS', name: 'Operating Systems', topics: ['Process Management', 'Deadlocks', 'Scheduling', 'Memory Management', 'File Systems'], locked: true },
  { code: 'CN', name: 'Computer Networks', topics: ['OSI Model', 'TCP/IP', 'Routing', 'Network Security', 'IP Addressing'], locked: true },
  { code: 'Java', name: 'Java Programming', topics: ['Collections', 'Exception Handling', 'Multithreading', 'Java 8 Features', 'String Handling'], locked: true },
  { code: 'OOPS', name: 'Object Oriented Programming', topics: ['Classes and Objects', 'Inheritance', 'Polymorphism', 'Encapsulation', 'Abstraction'], locked: true },
  { code: 'JavaScript', name: 'JavaScript', topics: ['Basics', 'Async JS', 'DOM', 'Closures'], locked: true },
  { code: 'DSA', name: 'Data Structures and Algorithms', topics: ['Arrays', 'Trees', 'Graphs', 'Dynamic Programming'], locked: true },
  { code: 'Aptitude', name: 'Aptitude', topics: ['Quantitative', 'Logical Reasoning', 'Verbal Ability'], locked: true },
];

const adminPermissions = {
  manageUsers: true,
  manageSubjects: true,
  manageQuestions: true,
  manageQuizzes: true,
  viewAnalytics: true,
};

router.use(auth, admin);

router.get('/summary', async (req, res) => {
  try {
    const [users, subjects, questions, attempts] = await Promise.all([
      User.countDocuments(),
      Subject.countDocuments(),
      Question.countDocuments(),
      Attempt.countDocuments(),
    ]);

    const latestAttempts = await Attempt.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name email')
      .lean();

    res.json({
      stats: {
        users,
        subjects: subjects + defaultSubjects.length,
        questions,
        attempts,
      },
      latestAttempts,
      permissions: adminPermissions,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to load admin summary', error: err.message });
  }
});

router.get('/users', async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: 'Failed to load users', error: err.message });
  }
});

router.patch('/users/:id', async (req, res) => {
  try {
    const { role, permissions } = req.body;
    const update = {};

    if (role && ['student', 'admin'].includes(role)) update.role = role;
    if (permissions && typeof permissions === 'object') update.permissions = permissions;

    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true })
      .select('-password');

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update user', error: err.message });
  }
});

router.get('/subjects', async (req, res) => {
  try {
    const customSubjects = await Subject.find().sort({ code: 1 }).lean();
    res.json({ subjects: [...defaultSubjects, ...customSubjects] });
  } catch (err) {
    res.status(500).json({ message: 'Failed to load subjects', error: err.message });
  }
});

router.post('/subjects', async (req, res) => {
  try {
    const { code, name, description = '', topics = [], isActive = true } = req.body;
    const normalizedCode = typeof code === 'string' ? code.trim() : '';

    if (!normalizedCode || !name) {
      return res.status(400).json({ message: 'Subject code and name are required' });
    }

    if (defaultSubjects.some(subject => subject.code.toLowerCase() === normalizedCode.toLowerCase())) {
      return res.status(400).json({ message: 'A built-in subject already uses this code' });
    }

    const subject = await Subject.create({
      code: normalizedCode,
      name: name.trim(),
      description,
      topics,
      isActive,
    });

    res.status(201).json({ subject });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create subject', error: err.message });
  }
});

router.patch('/subjects/:id', async (req, res) => {
  try {
    const subject = await Subject.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!subject) return res.status(404).json({ message: 'Subject not found' });
    res.json({ subject });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update subject', error: err.message });
  }
});

router.get('/questions', async (req, res) => {
  try {
    const { subject, topic } = req.query;
    const filter = {};
    if (subject) filter.subject = subject;
    if (topic) filter.topic = topic;

    const questions = await Question.find(filter)
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();

    res.json({ questions });
  } catch (err) {
    res.status(500).json({ message: 'Failed to load questions', error: err.message });
  }
});

router.post('/questions', async (req, res) => {
  try {
    const { subject, topic, question, options, answer, explanation, difficulty, source, isActive = true } = req.body;

    if (!subject || !topic || !question || !Array.isArray(options) || !answer) {
      return res.status(400).json({ message: 'Subject, topic, question, options and answer are required' });
    }

    if (!options.includes(answer)) {
      return res.status(400).json({ message: 'Correct answer must match one of the options' });
    }

    const created = await Question.create({
      subject,
      topic,
      question,
      options,
      answer,
      explanation,
      difficulty,
      source,
      isActive,
      createdBy: req.user.id,
    });

    res.status(201).json({ question: created });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create question', error: err.message });
  }
});

router.patch('/questions/:id', async (req, res) => {
  try {
    const question = await Question.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!question) return res.status(404).json({ message: 'Question not found' });
    res.json({ question });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update question', error: err.message });
  }
});

router.delete('/questions/:id', async (req, res) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);
    if (!question) return res.status(404).json({ message: 'Question not found' });
    res.json({ message: 'Question deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete question', error: err.message });
  }
});

module.exports = router;
