const mongoose = require('mongoose');

const inningsSchema = new mongoose.Schema({
  matchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match',
    required: true
  },
  inningNumber: {
    type: Number,
    required: true
  },
  battingTeam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  bowlingTeam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  totalRuns: {
    type: Number,
    default: 0
  },
  wickets: {
    type: Number,
    default: 0
  },
  overs: {
    type: Number,
    default: 0
  },
  balls: {
    type: Number,
    default: 0
  },
  extras: {
    wides: { type: Number, default: 0 },
    noBalls: { type: Number, default: 0 },
    byes: { type: Number, default: 0 },
    legByes: { type: Number, default: 0 },
    penalties: { type: Number, default: 0 }
  },
  batsmen: [{
    player: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Player'
    },
    runs: { type: Number, default: 0 },
    balls: { type: Number, default: 0 },
    fours: { type: Number, default: 0 },
    sixes: { type: Number, default: 0 },
    strikeRate: { type: Number, default: 0 },
    isBatting: { type: Boolean, default: false },
    isOut: { type: Boolean, default: false },
    dismissal: {
      type: {
        type: String,
        enum: ['bowled', 'caught', 'lbw', 'run out', 'stumped', 'hit wicket', 'retired hurt', 'not out']
      },
      bowler: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player'
      },
      fielder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player'
      }
    }
  }],
  bowlers: [{
    player: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Player'
    },
    overs: { type: Number, default: 0 },
    maidens: { type: Number, default: 0 },
    runs: { type: Number, default: 0 },
    wickets: { type: Number, default: 0 },
    wides: { type: Number, default: 0 },
    noBalls: { type: Number, default: 0 },
    economy: { type: Number, default: 0 }
  }],
  partnership: {
    current: {
      runs: { type: Number, default: 0 },
      balls: { type: Number, default: 0 },
      player1: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player'
      },
      player2: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player'
      }
    },
    highest: {
      runs: { type: Number, default: 0 },
      wickets: { type: Number, default: 0 },
      player1: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player'
      },
      player2: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player'
      }
    }
  },
  powerplay: {
    overs1: {
      runs: { type: Number, default: 0 },
      wickets: { type: Number, default: 0 }
    },
    overs2: {
      runs: { type: Number, default: 0 },
      wickets: { type: Number, default: 0 }
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Innings', inningsSchema);
