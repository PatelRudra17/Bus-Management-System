const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
const applicationRoutes = require('./routes/applications');
const routeRoutes = require('./routes/routes');
const paymentRoutes = require('./routes/payments');
const verificationRoutes = require('./routes/verification');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

app.use(morgan('dev'));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/buspassdb')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Connection Error:', err));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/verification', verificationRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Bus Pass Management API is running' });
});

let onlineUsers = new Map();
let adminSockets = [];

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('userOnline', (userId) => {
    onlineUsers.set(userId, socket.id);
    io.emit('userStatus', { userId, status: 'online' });
  });

  socket.on('sendNotification', (data) => {
    const { userId, notification } = data;
    const socketId = onlineUsers.get(userId);
    if (socketId) {
      io.to(socketId).emit('newNotification', notification);
    }
  });

  socket.on('adminJoin', (adminId) => {
    socket.isAdmin = true;
    adminSockets.push(socket.id);
    console.log(`Admin ${adminId} joined monitoring`);
  });

  socket.on('applicationUpdate', (data) => {
    io.emit('applicationUpdated', data);
    adminSockets.forEach(id => {
      io.to(id).emit('adminNotification', {
        type: 'application',
        ...data
      });
    });
  });

  socket.on('passVerified', (data) => {
    io.emit('verificationAlert', data);
  });

  socket.on('joinRoom', (room) => {
    socket.join(room);
    console.log(`Socket ${socket.id} joined room: ${room}`);
  });

  socket.on('leaveRoom', (room) => {
    socket.leave(room);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    for (let [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        io.emit('userStatus', { userId, status: 'offline' });
        break;
      }
    }
    adminSockets = adminSockets.filter(id => id !== socket.id);
  });
});

const emitToUser = (userId, event, data) => {
  const socketId = onlineUsers.get(userId);
  if (socketId) {
    io.to(socketId).emit(event, data);
  }
};

const emitToAll = (event, data) => {
  io.emit(event, data);
};

const emitToAdmins = (event, data) => {
  adminSockets.forEach(id => {
    io.to(id).emit(event, data);
  });
};

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, io, emitToUser, emitToAll, emitToAdmins };
