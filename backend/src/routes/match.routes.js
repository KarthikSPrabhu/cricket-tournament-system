const express = require('express');
const router = express.Router();
const matchController = require('../controllers/match.controller');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// Public routes
router.get('/', async (req, res) => {
  try {
    const Match = require('../models/Match');
    const { 
      tournamentId, 
      status, 
      teamId,
      page = 1, 
      limit = 20 
    } = req.query;
    
    const query = {};
    if (tournamentId) query.tournamentId = tournamentId;
    if (status) query.status = status;
    if (teamId) {
      query.$or = [
        { team1: teamId },
        { team2: teamId }
      ];
    }
    
    const matches = await Match.find(query)
      .populate('team1', 'name logo')
      .populate('team2', 'name logo')
      .populate('tournamentId', 'name')
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Match.countDocuments(query);
    
    res.status(200).json({
      success: true,
      matches,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/live/:matchId', matchController.getLiveMatch);
router.get('/:id', async (req, res) => {
  try {
    const Match = require('../models/Match');
    const match = await Match.findById(req.params.id)
      .populate('team1', 'name logo players')
      .populate('team2', 'name logo players')
      .populate('tournamentId', 'name season')
      .populate('toss.wonBy', 'name logo')
      .populate('battingTeam', 'name logo')
      .populate('bowlingTeam', 'name logo')
      .populate('result.wonBy', 'name logo')
      .populate('result.playerOfTheMatch', 'name photo')
      .populate({
        path: 'innings',
        populate: [
          { path: 'battingTeam', select: 'name logo' },
          { path: 'bowlingTeam', select: 'name logo' },
          { path: 'batsmen.player', select: 'name photo role' },
          { path: 'bowlers.player', select: 'name photo role' }
        ]
      });
    
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }
    
    // Get ball-by-ball commentary
    const Ball = require('../models/Ball');
    const balls = await Ball.find({ matchId: match._id })
      .populate('batsman', 'name')
      .populate('bowler', 'name')
      .populate('fielder', 'name')
      .sort({ overNumber: 1, ballNumber: 1 });
    
    res.status(200).json({
      success: true,
      match: {
        ...match.toObject(),
        balls
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Protected routes (Admin only)
router.post('/', auth, admin, async (req, res) => {
  try {
    const Match = require('../models/Match');
    const Tournament = require('../models/Tournament');
    
    const {
      tournamentId,
      team1,
      team2,
      venue,
      date,
      startTime,
      matchType,
      group,
      matchNumber
    } = req.body;
    
    // Check if tournament exists
    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }
    
    // Generate match ID
    const matchId = `MATCH${Date.now().toString().slice(-6)}`;
    
    const match = new Match({
      matchId,
      matchNumber: matchNumber || (await Match.countDocuments({ tournamentId })) + 1,
      tournamentId,
      team1,
      team2,
      venue,
      date: new Date(date),
      startTime,
      matchType: matchType || 'group',
      group,
      createdBy: req.user.id
    });
    
    await match.save();
    
    // Add match to tournament
    tournament.matches.push(match._id);
    await tournament.save();
    
    res.status(201).json({
      success: true,
      match
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', auth, admin, async (req, res) => {
  try {
    const Match = require('../models/Match');
    const match = await Match.findById(req.params.id);
    
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }
    
    // Update fields
    const updatableFields = [
      'venue', 'date', 'startTime', 'matchType', 'group', 'status',
      'umpires', 'referee'
    ];
    
    updatableFields.forEach(field => {
      if (req.body[field] !== undefined) {
        if (field === 'date') {
          match[field] = new Date(req.body[field]);
        } else {
          match[field] = req.body[field];
        }
      }
    });
    
    await match.save();
    
    res.status(200).json({
      success: true,
      match
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', auth, admin, async (req, res) => {
  try {
    const Match = require('../models/Match');
    const Tournament = require('../models/Tournament');
    
    const match = await Match.findById(req.params.id);
    
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }
    
    // Remove match from tournament
    if (match.tournamentId) {
      await Tournament.findByIdAndUpdate(
        match.tournamentId,
        { $pull: { matches: match._id } }
      );
    }
    
    await match.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Match deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Match scoring routes
router.post('/:id/toss', auth, admin, matchController.updateToss);
router.post('/:id/start-scoring', auth, admin, matchController.startScoring);
router.post('/:id/ball', auth, admin, matchController.recordBall);
router.post('/:id/end-innings', auth, admin, matchController.endInnings);

module.exports = router;