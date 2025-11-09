const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// ---------- REGISTER ----------
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  if(!name || !email || !password) 
    return res.status(400).json({ message: 'All fields required' });

  try {
    const existingUser = await User.findOne({ email });
    if(existingUser) 
      return res.status(400).json({ message: 'User already exists' });

    const user = await User.create({ name, email, password });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Return token and user info (frontend uses this)
    res.status(201).json({ token, user: { name: user.name, email: user.email } });
  } catch(err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ---------- LOGIN ----------
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if(!email || !password) 
    return res.status(400).json({ message: 'Email and password required' });

  try {
    const user = await User.findOne({ email });
    if(!user) return res.status(401).json({ message: 'Invalid email or password' });

    const isMatch = await user.matchPassword(password);
    if(!isMatch) return res.status(401).json({ message: 'Invalid email or password' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token, user: { name: user.name, email: user.email } });
  } catch(err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
