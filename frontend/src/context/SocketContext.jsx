import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const token = localStorage.getItem('accessToken');
      
      // Get WebSocket URL based on environment
      const getSocketUrl = () => {
        if (import.meta.env.VITE_API_URL) {
          return import.meta.env.VITE_API_URL;
        }
        // Production - use relative WebSocket
        if (import.meta.env.PROD || window.location.hostname !== 'localhost') {
          return window.location.origin;
        }
        return 'http://localhost:3001';
      };
      
      const newSocket = io(getSocketUrl(), {
        auth: { token },
        transports: ['websocket', 'polling']
      });

      newSocket.on('connect', () => {
        console.log('🔌 Socket connected');
      });

      newSocket.on('disconnect', () => {
        console.log('🔌 Socket disconnected');
      });

      newSocket.on('error', (error) => {
        console.error('Socket error:', error);
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [user]);

  const joinSession = (sessionId) => {
    if (socket) {
      socket.emit('join_session', sessionId);
    }
  };

  const leaveSession = (sessionId) => {
    if (socket) {
      socket.emit('leave_session', sessionId);
    }
  };

  const sendMessage = (sessionId, content, messageType = 'text') => {
    if (socket) {
      socket.emit('send_message', { sessionId, content, messageType });
    }
  };

  const startTyping = (sessionId) => {
    if (socket) {
      socket.emit('typing_start', { sessionId });
    }
  };

  const stopTyping = (sessionId) => {
    if (socket) {
      socket.emit('typing_stop', { sessionId });
    }
  };

  const markRead = (sessionId) => {
    if (socket) {
      socket.emit('mark_read', { sessionId });
    }
  };

  const value = {
    socket,
    joinSession,
    leaveSession,
    sendMessage,
    startTyping,
    stopTyping,
    markRead
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
