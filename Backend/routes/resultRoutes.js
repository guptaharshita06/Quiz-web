const express = require('express');
const router = express.Router();
const Result = require('../models/Result');

console.log('✅ Result routes loaded!');

// POST: Save new result
router.post('/', async (req, res) => {
  try {
    const { userId, quizId, score, totalQuestions, subject } = req.body;
    if (!userId || !quizId || score === undefined || !subject) {
      return res.status(400).json({ message: "userId, quizId, score, and subject are required" });
    }

    const newResult = await Result.create({ userId, quizId, subject, score, totalQuestions });
    res.status(201).json({ message: "✅ Result saved successfully", result: newResult });
  } catch (err) {
    console.error("❌ Error saving result:", err);
    res.status(500).json({ message: "Error saving result", error: err.message });
  }
});

// GET results by user (last 5 only)
router.get('/user/:userId', async (req, res) => {
  try {
    const results = await Result.find({ userId: req.params.userId })
      .sort({ date: -1 })
      .limit(5);
    res.json(results);
  } catch (err) {
    console.error("❌ Error fetching user results:", err);
    res.status(500).json({ message: "Error fetching user results" });
  }
});

// DELETE result by ID
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Result.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Result not found" });
    res.json({ message: "🗑️ Result deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting result:", err);
    res.status(500).json({ message: "Error deleting result", error: err.message });
  }
});

module.exports = router;
