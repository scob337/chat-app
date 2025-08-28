const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  content: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Message', MessageSchema);
