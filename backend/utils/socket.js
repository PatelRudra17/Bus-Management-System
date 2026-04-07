// Socket utility to avoid circular dependencies
let io = null;
let onlineUsers = new Map();
let adminSockets = [];

const initSocket = (socketIO) => {
  io = socketIO;
  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized. Call initSocket first.');
  }
  return io;
};

const emitToUser = (userId, event, data) => {
  if (!io) return;
  const socketId = onlineUsers.get(userId);
  if (socketId) {
    io.to(socketId).emit(event, data);
  }
};

const emitToAll = (event, data) => {
  if (!io) return;
  io.emit(event, data);
};

const emitToAdmins = (event, data) => {
  if (!io) return;
  adminSockets.forEach(id => {
    io.to(id).emit(event, data);
  });
};

const addOnlineUser = (userId, socketId) => {
  onlineUsers.set(userId, socketId);
};

const removeOnlineUser = (userId) => {
  onlineUsers.delete(userId);
};

const addAdminSocket = (socketId) => {
  if (!adminSockets.includes(socketId)) {
    adminSockets.push(socketId);
  }
};

const removeAdminSocket = (socketId) => {
  adminSockets = adminSockets.filter(id => id !== socketId);
};

const getOnlineUsers = () => onlineUsers;
const getAdminSockets = () => adminSockets;

module.exports = {
  initSocket,
  getIO,
  emitToUser,
  emitToAll,
  emitToAdmins,
  addOnlineUser,
  removeOnlineUser,
  addAdminSocket,
  removeAdminSocket,
  getOnlineUsers,
  getAdminSockets
};
