import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user && user._id) {
      const newSocket = io('http://localhost:5000', {
        transports: ['websocket', 'polling']
      });

      newSocket.on('connect', () => {
        console.log('Socket connected');
        newSocket.emit('userOnline', user._id);
        if (user.role === 'admin') {
          newSocket.emit('adminJoin', user._id);
        }
      });

      newSocket.on('notification', (notification) => {
        toast.info(notification.message, {
          title: notification.title,
          autoClose: 5000
        });
      });

      newSocket.on('newNotification', (notification) => {
        toast.info(notification.message, {
          title: notification.title
        });
      });

      newSocket.on('applicationApproved', (data) => {
        toast.success(`🎉 Your pass ${data.passNumber} has been approved!`, {
          title: 'Pass Approved',
          autoClose: 8000
        });
      });

      newSocket.on('applicationUpdated', (data) => {
        toast.info(data.message, {
          title: 'Application Update'
        });
      });

      newSocket.on('adminNotification', (data) => {
        if (data.type === 'new_application') {
          toast.info(`${data.message}`, {
            title: 'New Application',
            autoClose: 5000
          });
        }
      });

      newSocket.on('verificationAlert', (data) => {
        console.log('Verification alert:', data);
      });

      newSocket.on('userStatus', (data) => {
        console.log('User status:', data);
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [user]);

  const sendNotification = (userId, notification) => {
    if (socket) {
      socket.emit('sendNotification', { userId, notification });
    }
  };

  const joinRoom = (room) => {
    if (socket) {
      socket.emit('joinRoom', room);
    }
  };

  const leaveRoom = (room) => {
    if (socket) {
      socket.emit('leaveRoom', room);
    }
  };

  const value = {
    socket,
    sendNotification,
    joinRoom,
    leaveRoom
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
