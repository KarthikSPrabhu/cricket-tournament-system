const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  teamId: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  logo: {
    public_id: String,
    url: String
  },
  captain: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player'
  },
  coach: String,
  homeGround: String,
  foundedYear: Number,
  tournamentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tournament'
  },
  players: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player'
  }],
  matchesPlayed: {
    type: Number,
    default: 0
  },
  matchesWon: {
    type: Number,
    default: 0
  },
  matchesLost: {
    type: Number,
    default: 0
  },
  points: {
    type: Number,
    default: 0
  },
  netRunRate: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Team', teamSchema);