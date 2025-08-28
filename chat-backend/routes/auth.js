const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const JWT_CONFIG = {
  accessSecret: "mySuperAccessSecretKey123!",
  refreshSecret: "mySuperRefreshSecretKey456!",
  accessExpires: "15m",
  refreshExpires: "7d",
  bcryptSalt: 10
};

const createAccessToken = (user) => {
  return jwt.sign({ sub: user._id }, JWT_CONFIG.accessSecret, { expiresIn: JWT_CONFIG.accessExpires });
};

const createRefreshToken = (user) => {
  return jwt.sign({ sub: user._id }, JWT_CONFIG.refreshSecret, { expiresIn: JWT_CONFIG.refreshExpires });
};

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, phone, password } = req.body;
    if (!name || !phone || !password) return res.status(400).json({ message: 'Missing fields' });
    const existing = await User.findOne({ phone });
    if (existing) return res.status(400).json({ message: 'Phone already registered' });
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);
    const hash = await bcrypt.hash(password, saltRounds);
    const user = await User.create({ name, phone, passwordHash: hash });
    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);
    user.refreshToken = refreshToken;
    await user.save();
    return res.json({ message: 'User registered', user: { id: user._id, name: user.name, phone: user.phone }, tokens: { accessToken, refreshToken } });
    
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password) return res.status(400).json({ message: 'Missing fields' });
    const user = await User.findOne({ phone });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(400).json({ message: 'Invalid credentials' });
    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);
    user.refreshToken = refreshToken;
    await user.save();
    return res.json({ message: 'Logged in', tokens: { accessToken, refreshToken }, user: { id: user._id, name: user.name, phone: user.phone } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Logout
router.post('/logout', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ message: 'refreshToken required' });
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.sub);
    if (!user) return res.status(400).json({ message: 'Invalid token' });
    user.refreshToken = null;
    await user.save();
    return res.json({ message: 'Logged out' });
  } catch (err) {
    return res.status(400).json({ message: 'Invalid token', error: err.message });
  }
});

// Refresh
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ message: 'refreshToken required' });
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.sub);
    if (!user || user.refreshToken !== refreshToken) return res.status(401).json({ message: 'Invalid refresh token' });
    const accessToken = createAccessToken(user);
    return res.json({ accessToken });
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token', error: err.message });
  }
});

module.exports = router;
