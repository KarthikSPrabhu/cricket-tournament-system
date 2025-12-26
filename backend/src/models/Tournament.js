const mongoose = require('mongoose');

const tournamentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  tournamentId: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  season: String,
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  format: {
    type: String,
    enum: ['T20', 'ODI', 'Test', 'Custom'],
    default: 'T20'
  },
  totalOvers: {
    type: Number,
    default: 20
  },
  maxPlayersPerTeam: {
    type: Number,
    default: 15
  },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  groups: [{
    name: String,
    teams: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team'
    }]
  }],
  teams: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  }],
  matches: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match'
  }],
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  },
  runnerUp: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  },
  manOfTheSeries: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player'
  },
  images: [{
    public_id: String,
    url: String,
    caption: String
  }],
  videos: [{
    public_id: String,
    url: String,
    title: String
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Tournament', tournamentSchema);
