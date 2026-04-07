const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const morgan = require('morgan');
const path = require('path');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { errorHandler } = require('./middleware/errorHandler');
const socketUtil = require('./utils/socket');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
const applicationRoutes = require('./routes/applications');
const routeRoutes = require('./routes/routes');
const paymentRoutes = require('./routes/payments');
const verificationRoutes = require('./routes/verification');
const smartCardRoutes = require('./routes/smartCardRoutes');
const travelLogRoutes = require('./routes/travelLogRoutes');
const incidentRoutes = require('./routes/incidentRoutes');
const kycRoutes = require('./routes/kycRoutes');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

app.use(morgan('dev'));

// CORS with whitelist validation
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3001'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) {
      callback(null, true);
    } else if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // For development, allow all origins
      // In production, you might want to be more strict
      console.log('CORS: Allowing origin:', origin);
      callback(null, true);
    }
  },
  credentials: true
}));

// Rate limiting - 500 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
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
app.use('/api/cards', smartCardRoutes);
app.use('/api/travel', travelLogRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/kyc', kycRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Bus Pass Management API is running' });
});

// Initialize socket utility
socketUtil.initSocket(io);

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('userOnline', (userId) => {
    socketUtil.addOnlineUser(userId, socket.id);
    io.emit('userStatus', { userId, status: 'online' });
  });

  socket.on('sendNotification', (data) => {
    const { userId, notification } = data;
    socketUtil.emitToUser(userId, 'newNotification', notification);
  });

  socket.on('adminJoin', (adminId) => {
    socket.isAdmin = true;
    socketUtil.addAdminSocket(socket.id);
    console.log(`Admin ${adminId} joined monitoring`);
  });

  socket.on('applicationUpdate', (data) => {
    socketUtil.emitToAll('applicationUpdated', data);
    socketUtil.emitToAdmins('adminNotification', {
      type: 'application',
      ...data
    });
  });

  socket.on('passVerified', (data) => {
    socketUtil.emitToAll('verificationAlert', data);
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
    const onlineUsers = socketUtil.getOnlineUsers();
    for (let [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        socketUtil.removeOnlineUser(userId);
        io.emit('userStatus', { userId, status: 'offline' });
        break;
      }
    }
    socketUtil.removeAdminSocket(socket.id);
  });
});

// Use centralized error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, io };
