const express = require('express');
const axios = require('axios');
const router = express.Router();

// Shuffle utility
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// GET quizzes from OpenTDB
router.get('/', async (req, res) => {
  try {
    const response = await axios.get('https://opentdb.com/api.php?amount=5&type=multiple');
    const questions = response.data.results.map((q, index) => ({
      id: index + 1,
      question: q.question,
      options: shuffle([...q.incorrect_answers, q.correct_answer]),
      answer: q.correct_answer
    }));
    res.json(questions);
  } catch (err) {
    console.error('❌ Failed to fetch questions:', err.message);
    res.status(500).json({ message: 'Failed to fetch questions' });
  }
});

module.exports = router;
