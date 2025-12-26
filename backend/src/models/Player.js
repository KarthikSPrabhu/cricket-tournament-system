const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  playerId: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  photo: {
    public_id: String,
    url: String
  },
  age: {
    type: Number,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true
  },
  role: {
    type: String,
    enum: ['batsman', 'bowler', 'allrounder', 'wicketkeeper'],
    required: true
  },
  battingStyle: {
    type: String,
    enum: ['right-handed', 'left-handed', null],
    default: null
  },
  bowlingStyle: {
    type: String,
    enum: ['right-arm fast', 'right-arm medium', 'right-arm spin', 
           'left-arm fast', 'left-arm medium', 'left-arm spin', null],
    default: null
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  tournamentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tournament'
  },
  isCaptain: {
    type: Boolean,
    default: false
  },
  isWicketKeeper: {
    type: Boolean,
    default: false
  },
  statistics: {
    matches: { type: Number, default: 0 },
    runs: { type: Number, default: 0 },
    ballsFaced: { type: Number, default: 0 },
    centuries: { type: Number, default: 0 },
    halfCenturies: { type: Number, default: 0 },
    wickets: { type: Number, default: 0 },
    oversBowled: { type: Number, default: 0 },
    maidens: { type: Number, default: 0 },
    catches: { type: Number, default: 0 },
    stumpings: { type: Number, default: 0 }
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

module.exports = mongoose.model('Player', playerSchema);