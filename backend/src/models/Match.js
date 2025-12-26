const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  matchId: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  matchNumber: {
    type: Number,
    required: true
  },
  tournamentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tournament',
    required: true
  },
  team1: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  team2: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  venue: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  startTime: String,
  matchType: {
    type: String,
    enum: ['group', 'quarterfinal', 'semifinal', 'final', 'super-six', 'super-four'],
    default: 'group'
  },
  group: String,
  toss: {
    wonBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team'
    },
    decision: {
      type: String,
      enum: ['bat', 'field', null]
    }
  },
  status: {
    type: String,
    enum: ['scheduled', 'toss', 'inning1', 'inning2', 'completed', 'abandoned', 'live'],
    default: 'scheduled'
  },
  currentInning: {
    type: Number,
    default: 1
  },
  currentOver: {
    type: Number,
    default: 0
  },
  currentBall: {
    type: Number,
    default: 0
  },
  battingTeam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  },
  bowlingTeam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  },
  innings: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Innings'
  }],
  result: {
    wonBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team'
    },
    margin: String,
    method: {
      type: String,
      enum: ['runs', 'wickets', 'superover', null]
    },
    playerOfTheMatch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Player'
    }
  },
  umpires: [String],
  referee: String,
  liveCommentary: [{
    over: Number,
    ball: Number,
    commentary: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Match', matchSchema);