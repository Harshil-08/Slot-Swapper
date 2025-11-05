import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const { token } = useAuth();

  useEffect(() => {
    if (!token) return;

    const newSocket = io('http://localhost:3000', {
      auth: { token },
    });

    newSocket.on('connect', () => {
      console.log('✅ Socket connected');
    });

    newSocket.on('swap-request-received', (data) => {
      console.log('Swap request received:', data);
      setNotifications((prev) => [
        {
          id: Date.now(),
          type: 'swap-request',
          message: data.message,
          data: data.swapRequest,
          timestamp: new Date(),
        },
        ...prev,
      ]);
    });

    newSocket.on('swap-request-accepted', (data) => {
      console.log('Swap request accepted:', data);
      setNotifications((prev) => [
        {
          id: Date.now(),
          type: 'swap-accepted',
          message: data.message,
          data: data.swapRequest,
          timestamp: new Date(),
        },
        ...prev,
      ]);
    });

    newSocket.on('swap-request-rejected', (data) => {
      console.log('Swap request rejected:', data);
      setNotifications((prev) => [
        {
          id: Date.now(),
          type: 'swap-rejected',
          message: data.message,
          data: data.swapRequest,
          timestamp: new Date(),
        },
        ...prev,
      ]);
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [token]);

  const clearNotifications = () => {
    setNotifications([]);
  };

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const value = {
    socket,
    notifications,
    clearNotifications,
    removeNotification,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};
