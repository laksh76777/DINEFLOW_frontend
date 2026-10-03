import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    // In dev, Vite proxies or connects to backend origin
    const socketUrl = window.location.origin;
    socket = io(socketUrl, {
      autoConnect: true,
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('⚡ Socket.IO connected with id:', socket?.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('🔌 Socket.IO disconnected:', reason);
    });
  }
  return socket;
}

export const socketService = {
  getSocket,

  joinSession(sessionId: string) {
    const s = getSocket();
    s.emit('join_session', sessionId);
  },

  leaveSession(sessionId: string) {
    const s = getSocket();
    s.emit('leave_session', sessionId);
  },

  joinKitchen(station?: string) {
    const s = getSocket();
    s.emit('join_kitchen', station);
  },

  joinWaiter() {
    const s = getSocket();
    s.emit('join_waiter');
  },

  joinDashboard() {
    const s = getSocket();
    s.emit('join_dashboard');
  },
};
