const app = require('./app');
const http = require('http');
const server = http.createServer(app);

const { Server } = require('socket.io');
const io = new Server(server, {
  cors: {
    origin: '*', // Adjust as needed for security
    methods: ['GET', 'POST']
  }
});

// Store connected users: { userId: socketId }
const connectedUsers = {};

io.on('connection', (socket) => {
  // When a user connects, they should emit their userId
  socket.on('register', (userId) => {
    connectedUsers[userId] = socket.id;
  });

  // Admin sends a message
  socket.on('admin-message', ({ to, group, message }) => {
    if (to) {
      // Individual message
      if (connectedUsers[to]) {
        io.to(connectedUsers[to]).emit('receive-message', { from: 'admin', message });
      }
    } else if (group) {
      // Group message: send to all users in the group (simulate with a list)
      // In production, fetch user IDs for the group from your DB
      // For demo, broadcast to all except admin
      socket.broadcast.emit('receive-message', { from: 'admin', message, group });
    }
    // Optionally, save the message to the DB here
  });

  socket.on('disconnect', () => {
    // Remove user from connectedUsers
    for (const [userId, sockId] of Object.entries(connectedUsers)) {
      if (sockId === socket.id) {
        delete connectedUsers[userId];
        break;
      }
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { io, connectedUsers };
