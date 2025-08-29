import React, { createContext, useContext, useEffect, useState, useRef, type ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import api from '../utils/API';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  joinRoom: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
  sendMessage: (roomId: string, content: string, toUserId?: string) => void;
  playNotificationSound: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // إنشاء ملف صوتي للإشعارات
  useEffect(() => {
    // إنشاء صوت إشعار هادئ ونعيم باستخدام Web Audio API
    const createNotificationSound = () => {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // تردد أكثر نعومة وهدوءاً
      oscillator.frequency.setValueAtTime(520, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(440, audioContext.currentTime + 0.3);
      oscillator.type = 'sine';
      
      // صوت أكثر هدوءاً
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.8);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.8);
    };
    
    audioRef.current = { play: createNotificationSound } as any;
  }, []);

  const playNotificationSound = () => {
    try {
      if (audioRef.current) {
        audioRef.current.play();
      }
    } catch (error) {
      console.log('Could not play notification sound:', error);
    }
  };

  useEffect(() => {
    let currentSocket: Socket | null = null;
    
    if (user && isAuthenticated) {
      const connectSocket = async () => {
        try {
          console.log('🔌 Attempting to connect socket for user:', user.id);
          
          // الحصول على التوكن من الباك إند
          const { data } = await api.get('/auth/socket-token');
          const token = data.token;
          
          console.log('🎫 Got socket token:', token ? 'Yes' : 'No');
          
          if (token) {
            currentSocket = io('http://localhost:8080', {
              auth: {
                token: token
              },
              transports: ['websocket', 'polling'],
              reconnection: true,
              reconnectionAttempts: 5,
              reconnectionDelay: 1000
            });

            currentSocket.on('connect', () => {
              console.log('✅ Socket connected successfully');
              setIsConnected(true);
            });

            currentSocket.on('disconnect', (reason) => {
              console.log('❌ Socket disconnected:', reason);
              setIsConnected(false);
            });

            currentSocket.on('connect_error', (error) => {
              console.error('🚫 Socket connection error:', error);
              setIsConnected(false);
            });

            // استماع للرسائل الجديدة مع الإشعار الصوتي
            currentSocket.on('receive_message', (data) => {
              console.log('📨 New message received:', data);
              // تشغيل الصوت عند وصول رسالة جديدة
              playNotificationSound();
              
              // إشعار المتصفح إذا كان مسموحاً
              if (Notification.permission === 'granted') {
                new Notification('رسالة جديدة', {
                  body: data.message?.content || 'لديك رسالة جديدة',
                  icon: '/vite.svg'
                });
              }
            });

            // طلب إذن الإشعارات
            if (Notification.permission === 'default') {
              Notification.requestPermission();
            }

            setSocket(currentSocket);
          }
        } catch (error) {
          console.error('❌ Failed to get socket token:', error);
          setIsConnected(false);
        }
      };
      
      connectSocket();
    } else {
      if (socket) {
        console.log('🔌 Disconnecting socket - user not authenticated');
        socket.close();
        setSocket(null);
        setIsConnected(false);
      }
    }

    // Cleanup function
    return () => {
      if (currentSocket) {
        console.log('🧹 Cleaning up socket connection');
        currentSocket.close();
        currentSocket = null;
      }
    };
  }, [user, isAuthenticated]);

  const joinRoom = (roomId: string) => {
    if (socket && isConnected) {
      console.log('🏠 Joining room:', roomId);
      socket.emit('join_room', roomId);
    } else {
      console.log('❌ Cannot join room - socket not connected');
    }
  };

  const leaveRoom = (roomId: string) => {
    if (socket && isConnected) {
      console.log('🚪 Leaving room:', roomId);
      socket.emit('leave_room', roomId);
    }
  };

  const sendMessage = (roomId: string, content: string, toUserId?: string) => {
    if (socket && isConnected) {
      console.log('📤 Sending message via socket:', { roomId, content, toUserId });
      socket.emit('send_message', {
        roomId,
        content,
        toUserId
      });
    } else {
      console.log('❌ Cannot send message - socket not connected');
    }
  };

  const value = {
    socket,
    isConnected,
    joinRoom,
    leaveRoom,
    sendMessage,
    playNotificationSound
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};