const socketIO = require('socket.io');
const LiveUpdateManager = require('../utils/liveUpdate');
const Match = require('../models/Match');

let io;
let liveUpdateManager;

const configureSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      credentials: true,
      methods: ["GET", "POST"]
    },
    transports: ['websocket', 'polling']
  });

  liveUpdateManager = new LiveUpdateManager(io);

  io.on('connection', (socket) => {
    console.log('🔌 New client connected:', socket.id);

    // Join match room
    socket.on('join-match', async (matchId) => {
      try {
        socket.join(`match-${matchId}`);
        liveUpdateManager.addConnection(matchId, socket.id);
        
        console.log(`👥 Socket ${socket.id} joined match-${matchId}`);
        
        // Send current match data to new connection
        const match = await Match.findById(matchId)
          .populate('team1', 'name logo')
          .populate('team2', 'name logo');
        
        if (match) {
          socket.emit('match-joined', {
            matchId,
            matchInfo: {
              team1: match.team1.name,
              team2: match.team2.name,
              status: match.status,
              venue: match.venue
            }
          });
        }
      } catch (error) {
        console.error('Error joining match room:', error);
        socket.emit('error', { message: 'Failed to join match room' });
      }
    });

    // Leave match room
    socket.on('leave-match', (matchId) => {
      socket.leave(`match-${matchId}`);
      liveUpdateManager.removeConnection(matchId, socket.id);
      console.log(`🚪 Socket ${socket.id} left match-${matchId}`);
    });

    // Subscribe to live matches list
    socket.on('subscribe-live-matches', () => {
      socket.join('live-matches');
      console.log(`📡 Socket ${socket.id} subscribed to live matches`);
    });

    // Unsubscribe from live matches
    socket.on('unsubscribe-live-matches', () => {
      socket.leave('live-matches');
      console.log(`📡 Socket ${socket.id} unsubscribed from live matches`);
    });

    // Admin scoring events
    socket.on('admin-scoring-start', (data) => {
      const { matchId, adminId } = data;
      console.log(`🎯 Admin ${adminId} started scoring for match ${matchId}`);
      
      // Broadcast to all viewers
      io.to(`match-${matchId}`).emit('scoring-started', {
        matchId,
        startedBy: adminId,
        timestamp: new Date()
      });
    });

    socket.on('admin-ball-recorded', (data) => {
      const { matchId, ballData } = data;
      
      // Broadcast to all connected clients
      io.to(`match-${matchId}`).emit('ball-update', ballData);
      
      // Also update live matches list
      io.to('live-matches').emit('live-match-update', {
        matchId,
        score: ballData.runs,
        wickets: ballData.wickets,
        overs: `${ballData.overNumber || 0}.${ballData.ballNumber || 0}`
      });
    });

    socket.on('admin-toss-update', (data) => {
      const { matchId, tossData } = data;
      io.to(`match-${matchId}`).emit('toss-update', tossData);
    });

    socket.on('admin-innings-end', (data) => {
      const { matchId, inningData } = data;
      io.to(`match-${matchId}`).emit('inning-end', inningData);
    });

    socket.on('admin-match-complete', (data) => {
      const { matchId, result } = data;
      
      io.to(`match-${matchId}`).emit('match-complete', result);
      io.to('live-matches').emit('match-ended', { matchId });
    });

    // Heartbeat for connection monitoring
    socket.on('heartbeat', () => {
      socket.emit('heartbeat-response', { timestamp: new Date() });
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log('❌ Client disconnected:', socket.id);
      
      // Remove from all match rooms
      // This would require tracking which rooms socket is in
    });

    // Error handling
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  // Periodic broadcast of active matches
  setInterval(async () => {
    try {
      const liveMatches = await Match.find({
        status: { $in: ['live', 'inning1', 'inning2'] }
      })
      .populate('team1', 'name logo')
      .populate('team2', 'name logo')
      .limit(10);

      if (liveMatches.length > 0) {
        io.to('live-matches').emit('active-matches-list', {
          matches: liveMatches.map(match => ({
            id: match._id,
            team1: match.team1.name,
            team2: match.team2.name,
            team1Logo: match.team1.logo?.url,
            team2Logo: match.team2.logo?.url,
            status: match.status,
            currentScore: match.currentInning?.totalRuns || 0,
            currentWickets: match.currentInning?.wickets || 0,
            currentOver: match.currentOver || 0,
            currentBall: match.currentBall || 0,
            venue: match.venue
          })),
          timestamp: new Date(),
          totalActive: liveMatches.length
        });
      }
    } catch (error) {
      console.error('Error broadcasting active matches:', error);
    }
  }, 30000); // Every 30 seconds

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

const getLiveUpdateManager = () => {
  if (!liveUpdateManager) {
    throw new Error('LiveUpdateManager not initialized');
  }
  return liveUpdateManager;
};

module.exports = {
  configureSocket,
  getIO,
  getLiveUpdateManager
};