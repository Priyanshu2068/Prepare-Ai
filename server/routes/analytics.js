const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Attempt = require('../models/Attempt');

router.get('/ping', (req, res) => {
  res.json({ status: 'ok' });
});

router.get('/attempts', auth, async (req, res) => {
  try {
    const attempts = await Attempt.find({ user: req.user.id })
      .sort({ createdAt: 1 })
      .lean();

    res.json({ attempts });
  } catch (err) {
    res.status(500).json({ message: 'Failed to load progress', error: err.message });
  }
});

router.post('/attempts', auth, async (req, res) => {
  try {
    const { results, score, totalQuestions, percentage } = req.body;

    if (!Array.isArray(results) || results.length === 0) {
      return res.status(400).json({ message: 'Attempt results are required' });
    }

    const attempt = await Attempt.create({
      user: req.user.id,
      results,
      score,
      totalQuestions,
      percentage,
    });

    res.status(201).json({ attempt });
  } catch (err) {
    res.status(500).json({ message: 'Failed to save progress', error: err.message });
  }
});

module.exports = router;
