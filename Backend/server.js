require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const userRoutes = require('./routes/userRoutes');
const quizRoutes = require('./routes/quizRoutes');
const resultRoutes = require('./routes/resultRoutes');

const app = express();

// ---------- Middleware ----------
app.use(cors());
app.use(express.json()); // Parse JSON

// ---------- API Routes (must be before static and catch-all) ----------
app.use('/api/users', userRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/results', resultRoutes);

// ---------- Test route ----------
app.get('/ping', (req, res) => res.json({ message: 'pong' }));

// ---------- Serve frontend ----------
app.use(express.static(path.join(__dirname, 'public')));

// ---------- Catch-all frontend route ----------
app.get(/^\/(?!api\/).*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ---------- Connect MongoDB ----------
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// ---------- Start server ----------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
