const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const User = require('../models/User');

// Get friends
router.get('/', auth, async (req, res) => {
  const user = await User.findById(req.user._id).populate('friends', 'name phone');
  return res.json({ friends: user.friends });
});

// Add friend by phone
router.post('/add', auth, async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ message: 'phone required' });
    const toAdd = await User.findOne({ phone });
    if (!toAdd) return res.status(404).json({ message: 'phone not registered' });
    const me = await User.findById(req.user._id);
    if (me.friends.includes(toAdd._id)) return res.status(400).json({ message: 'Already friends' });
    me.friends.push(toAdd._id);
    await me.save();
    return res.json({ message: 'Friend added', friend: { id: toAdd._id, name: toAdd.name, phone: toAdd.phone } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
