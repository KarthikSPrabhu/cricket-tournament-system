const mongoose = require('mongoose');

const ballSchema = new mongoose.Schema({
  matchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match',
    required: true
  },
  inningNumber: {
    type: Number,
    required: true
  },
  overNumber: {
    type: Number,
    required: true
  },
  ballNumber: {
    type: Number,
    required: true
  },
  bowler: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player',
    required: true
  },
  batsman: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player',
    required: true
  },
  nonStriker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player'
  },
  runs: {
    type: Number,
    default: 0
  },
  extraRuns: {
    type: Number,
    default: 0
  },
  extraType: {
    type: String,
    enum: ['wide', 'no ball', 'bye', 'leg bye', 'penalty', null]
  },
  isWicket: {
    type: Boolean,
    default: false
  },
  wicketType: {
    type: String,
    enum: ['bowled', 'caught', 'lbw', 'run out', 'stumped', 'hit wicket', null]
  },
  dismissalPlayer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player'
  },
  fielder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player'
  },
  shotType: {
    type: String,
    enum: ['drive', 'cut', 'pull', 'sweep', 'hook', 'defensive', 'lofted', null]
  },
  shotArea: {
    x: Number,
    y: Number,
    zone: {
      type: String,
      enum: ['cover', 'midwicket', 'square', 'fine', 'straight', 'third man', 'point', null]
    }
  },
  commentary: String,
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Ball', ballSchema);