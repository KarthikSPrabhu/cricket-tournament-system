import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'react-hot-toast';

const useSocket = () => {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [activeMatches, setActiveMatches] = useState([]);

  useEffect(() => {
    // Initialize socket connection
    const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    // Connection events
    socket.on('connect', () => {
      console.log('✅ Socket connected:', socket.id);
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      toast.error('Connection to live server failed');
    });

    // Live matches updates
    socket.on('active-matches-list', (data) => {
      setActiveMatches(data.matches);
    });

    // Match-specific events
    socket.on('ball-update', (data) => {
      // This will be handled by individual match components
      console.log('Ball update received:', data);
    });

    socket.on('match-status', (data) => {
      console.log('Match status update:', data);
    });

    socket.on('toss-update', (data) => {
      console.log('Toss update:', data);
    });

    socket.on('inning-end', (data) => {
      console.log('Inning end:', data);
    });

    socket.on('match-complete', (data) => {
      console.log('Match complete:', data);
      toast.success('Match completed!');
    });

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const joinMatchRoom = (matchId) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('join-match', matchId);
      console.log(`Joined match room: ${matchId}`);
    }
  };

  const leaveMatchRoom = (matchId) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('leave-match', matchId);
      console.log(`Left match room: ${matchId}`);
    }
  };

  const subscribeLiveMatches = () => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('subscribe-live-matches');
    }
  };

  const unsubscribeLiveMatches = () => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('unsubscribe-live-matches');
    }
  };

  const emitBallRecorded = (matchId, ballData) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('admin-ball-recorded', { matchId, ballData });
    }
  };

  const emitTossUpdate = (matchId, tossData) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('admin-toss-update', { matchId, tossData });
    }
  };

  const emitInningsEnd = (matchId, inningData) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('admin-innings-end', { matchId, inningData });
    }
  };

  const emitMatchComplete = (matchId, result) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('admin-match-complete', { matchId, result });
    }
  };

  return {
    socket: socketRef.current,
    isConnected,
    activeMatches,
    joinMatchRoom,
    leaveMatchRoom,
    subscribeLiveMatches,
    unsubscribeLiveMatches,
    emitBallRecorded,
    emitTossUpdate,
    emitInningsEnd,
    emitMatchComplete,
  };
};

export default useSocket;