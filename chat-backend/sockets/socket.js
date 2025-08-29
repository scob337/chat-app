const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const Message = require('../models/Message');

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true
    }
  });

  // مصادقة Socket.IO
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      // استخدام نفس المفتاح المستخدم في auth.js
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'mySuperAccessSecretKey123!');
      socket.userId = decoded.sub;
      next();
    } catch (err) {
      console.error('Socket authentication error:', err.message);
      next(new Error('Authentication error: ' + err.message));
    }
  });

  io.on('connection', (socket) => {
    console.log('✅ User connected:', socket.userId);
    
    // انضمام تلقائي لغرفة المستخدم الشخصية
    socket.join(socket.userId);
    console.log(`🏠 User ${socket.userId} joined personal room`);

    // انضمام لغرفة
    socket.on('join_room', (roomId) => {
      socket.join(roomId);
      console.log(`🏠 User ${socket.userId} joined room ${roomId}`);
    });

    // مغادرة غرفة
    socket.on('leave_room', (roomId) => {
      socket.leave(roomId);
      console.log(`🚪 User ${socket.userId} left room ${roomId}`);
    });

    // إرسال رسالة
    socket.on('send_message', async (data) => {
      try {
        console.log('📤 Sending message via socket:', data);
        
        const messageData = {
          content: data.content,
          sender: socket.userId
        };
        
        // تحديد نوع المحادثة
        if (data.toUserId) {
          // محادثة مباشرة
          messageData.receiver = data.toUserId;
        } else if (data.groupId) {
          // محادثة جماعية
          messageData.group = data.groupId;
        } else {
          // افتراض أن roomId هو receiverId للمحادثات المباشرة
          messageData.receiver = data.roomId;
        }
        
        const message = new Message(messageData);
        
        await message.save();
        await message.populate('sender', 'name phone');
        if (message.receiver) {
          await message.populate('receiver', 'name phone');
        }
        if (message.group) {
          await message.populate('group', 'name description');
        }
        
        // إرسال الرسالة لجميع المستخدمين في الغرفة
        io.to(data.roomId).emit('receive_message', {
          message: message,
          roomId: data.roomId
        });
        
        console.log('✅ Message sent successfully');
      } catch (error) {
        console.error('❌ Error sending message:', error);
        socket.emit('message_error', { error: error.message });
      }
    });

    // قطع الاتصال
    socket.on('disconnect', () => {
      console.log('❌ User disconnected:', socket.userId);
    });
  });
};

module.exports = { initSocket };
