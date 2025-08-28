const { Server } = require('socket.io');
const Message = require('../models/Message');
const Group = require('../models/Group');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

let io;
const initSocket = (server) => {
  io = new Server(server, { cors: { origin: '*' } });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Auth token required'));
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      const user = await User.findById(decoded.sub);
      if (!user) return next(new Error('Invalid user'));
      socket.user = { id: String(user._id), name: user.name };
      next();
    } catch (err) {
      next(new Error('Authentication error: ' + err.message));
    }
  });

  io.on('connection', (socket) => {
    console.log('Socket connected', socket.user.id);

    socket.on('join_room', (roomId) => {
      socket.join(roomId);
      io.to(roomId).emit('user_joined', { userId: socket.user.id, roomId });
    });

    socket.on('leave_room', (roomId) => {
      socket.leave(roomId);
      io.to(roomId).emit('user_left', { userId: socket.user.id, roomId });
    });

    socket.on('send_message', async (payload) => {
      // payload: { roomId, content, toUserId (optional) }
      try {
        const msg = await Message.create({
          senderId: socket.user.id,
          groupId: payload.roomId || null,
          receiverId: payload.toUserId || null,
          content: payload.content || ''
        });
        io.to(payload.roomId).emit('receive_message', { message: msg });
      } catch (err) {
        console.error('send_message error', err);
      }
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected', socket.user.id);
    });
  });
};

module.exports = { initSocket };
