const Match = require('../models/Match');
const Innings = require('../models/Innings');
const Ball = require('../models/Ball');

class LiveUpdateManager {
  constructor(io) {
    this.io = io;
    this.activeMatches = new Map();
  }

  // Initialize live match
  async initializeMatch(matchId) {
    try {
      const match = await Match.findById(matchId)
        .populate('team1', 'name logo')
        .populate('team2', 'name logo')
        .populate('battingTeam', 'name logo')
        .populate('bowlingTeam', 'name logo');

      if (!match) {
        throw new Error('Match not found');
      }

      const currentInning = await Innings.findOne({
        matchId,
        inningNumber: match.currentInning
      })
        .populate('batsmen.player', 'name photo')
        .populate('bowlers.player', 'name photo');

      this.activeMatches.set(matchId, {
        match,
        currentInning,
        connections: new Set()
      });

      return { match, currentInning };
    } catch (error) {
      console.error('Error initializing match:', error);
      throw error;
    }
  }

  // Add connection to match room
  addConnection(matchId, socketId) {
    if (this.activeMatches.has(matchId)) {
      const matchData = this.activeMatches.get(matchId);
      matchData.connections.add(socketId);
    }
  }

  // Remove connection from match room
  removeConnection(matchId, socketId) {
    if (this.activeMatches.has(matchId)) {
      const matchData = this.activeMatches.get(matchId);
      matchData.connections.delete(socketId);
      
      // Clean up if no connections
      if (matchData.connections.size === 0) {
        this.activeMatches.delete(matchId);
      }
    }
  }

  // Broadcast ball update
  async broadcastBallUpdate(matchId, ballData) {
    try {
      // Update match data
      const matchData = this.activeMatches.get(matchId);
      if (matchData) {
        matchData.currentInning.totalRuns += ballData.runs + (ballData.extraRuns || 0);
        if (ballData.isWicket) {
          matchData.currentInning.wickets += 1;
        }

        // Update batsman
        const batsmanIndex = matchData.currentInning.batsmen.findIndex(
          b => b.player._id.toString() === ballData.batsmanId
        );
        if (batsmanIndex !== -1) {
          matchData.currentInning.batsmen[batsmanIndex].runs += ballData.runs;
          matchData.currentInning.batsmen[batsmanIndex].balls += 1;
        }

        // Update bowler
        const bowlerIndex = matchData.currentInning.bowlers.findIndex(
          b => b.player._id.toString() === ballData.bowlerId
        );
        if (bowlerIndex !== -1) {
          matchData.currentInning.bowlers[bowlerIndex].runs += ballData.runs + (ballData.extraRuns || 0);
          if (ballData.isWicket && ballData.wicketType !== 'run out') {
            matchData.currentInning.bowlers[bowlerIndex].wickets += 1;
          }
        }
      }

      // Broadcast to all clients in match room
      this.io.to(`match-${matchId}`).emit('ball-update', {
        matchId,
        over: ballData.overNumber,
        ball: ballData.ballNumber,
        runs: matchData?.currentInning.totalRuns || 0,
        wickets: matchData?.currentInning.wickets || 0,
        batsmanId: ballData.batsmanId,
        bowlerId: ballData.bowlerId,
        commentary: ballData.commentary,
        shotArea: ballData.shotArea,
        isWicket: ballData.isWicket,
        timestamp: new Date()
      });

      // Also broadcast to home page for live matches list
      this.io.emit('match-score-update', {
        matchId,
        score: matchData?.currentInning.totalRuns || 0,
        wickets: matchData?.currentInning.wickets || 0,
        overs: `${ballData.overNumber || 0}.${ballData.ballNumber || 0}`
      });
    } catch (error) {
      console.error('Error broadcasting ball update:', error);
    }
  }

  // Broadcast match status change
  async broadcastMatchStatus(matchId, status) {
    try {
      const match = await Match.findById(matchId)
        .populate('team1', 'name logo')
        .populate('team2', 'name logo');

      this.io.to(`match-${matchId}`).emit('match-status', {
        matchId,
        status,
        matchInfo: {
          team1: match.team1.name,
          team2: match.team2.name,
          venue: match.venue
        },
        timestamp: new Date()
      });

      // Update all clients about match list
      this.io.emit('match-list-update', {
        matchId,
        status
      });
    } catch (error) {
      console.error('Error broadcasting match status:', error);
    }
  }

  // Broadcast toss update
  async broadcastTossUpdate(matchId, tossData) {
    this.io.to(`match-${matchId}`).emit('toss-update', tossData);
  }

  // Broadcast inning end
  async broadcastInningEnd(matchId, inningData) {
    this.io.to(`match-${matchId}`).emit('inning-end', inningData);
  }

  // Get active matches count
  getActiveMatchesCount() {
    return this.activeMatches.size;
  }

  // Get match connections count
  getMatchConnections(matchId) {
    const matchData = this.activeMatches.get(matchId);
    return matchData ? matchData.connections.size : 0;
  }
}

module.exports = LiveUpdateManager;