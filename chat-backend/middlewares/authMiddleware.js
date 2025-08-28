const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_CONFIG = {
  accessSecret: "mySuperAccessSecretKey123!",
  refreshSecret: "mySuperRefreshSecretKey456!",
  accessExpires: "15m",
  refreshExpires: "7d",
  bcryptSalt: 10
};
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2) {
      return res.status(401).json({ message: 'Token error' });
    }

    const token = parts[1];

    // استخدم السر الثابت هنا
    const decoded = jwt.verify(token, JWT_CONFIG.accessSecret);

    const user = await User.findById(decoded.sub).select('-passwordHash');
    if (!user) {
      return res.status(401).json({ message: 'Invalid token user' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized', error: err.message });
  }
};

module.exports = authMiddleware;
