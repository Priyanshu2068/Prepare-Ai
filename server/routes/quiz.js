const express = require('express');
const router = express.Router();
const {
  generateQuizHandler,
  generateMixedQuizHandler,
  generateFeedbackHandler,
} = require('../controllers/quizController');
const auth = require('../middleware/auth');

router.post('/generate', auth, generateQuizHandler);
router.post('/generate-mixed', auth, generateMixedQuizHandler);
router.post('/feedback', auth, generateFeedbackHandler);

module.exports = router;
