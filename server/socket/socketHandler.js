// server/socket/socketHandler.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const socketHandler = (io) => {
  // Middleware to authenticate socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error'));
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      const user = await User.findById(decoded.id);

      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = user._id.toString();
      socket.userName = user.name;
      
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userName} (${socket.userId})`);

    // Join user-specific room
    socket.join(socket.userId);

    // Emit connection success
    socket.emit('connected', {
      message: 'Connected to real-time server',
      userId: socket.userId
    });

    // Handle emission created event
    socket.on('emissionCreated', (data) => {
      // Broadcast to user's room
      io.to(socket.userId).emit('newEmission', data);
    });

    // Handle emission updated event
    socket.on('emissionUpdated', (data) => {
      io.to(socket.userId).emit('emissionUpdate', data);
    });

    // Handle emission deleted event
    socket.on('emissionDeleted', (data) => {
      io.to(socket.userId).emit('emissionDelete', data);
    });

    // Handle request for real-time stats
    socket.on('requestStats', async () => {
      try {
        const user = await User.findById(socket.userId);
        socket.emit('statsUpdate', {
          totalEmissions: user.totalEmissions
        });
      } catch (error) {
        socket.emit('error', { message: 'Error fetching stats' });
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userName}`);
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });
};

module.exports = socketHandler;
