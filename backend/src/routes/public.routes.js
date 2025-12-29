const express = require('express');
const router = express.Router();
const statsController = require('../controllers/stats.controller');
const matchController = require('../controllers/match.controller');
const teamController = require('../controllers/team.controller');
const playerController = require('../controllers/player.controller');
const tournamentController = require('../controllers/tournament.controller');

// ========================
// STATISTICS ROUTES
// ========================

// @route   GET /api/public/stats/batsmen
// @desc    Get top batsmen statistics
// @access  Public
router.get('/stats/batsmen', statsController.getTopBatsmen);

// @route   GET /api/public/stats/bowlers
// @desc    Get top bowlers statistics
// @access  Public
router.get('/stats/bowlers', statsController.getTopBowlers);

// @route   GET /api/public/stats/teams
// @desc    Get team statistics
// @access  Public
router.get('/stats/teams', statsController.getTeamStats);

// @route   GET /api/public/stats/matches
// @desc    Get match statistics
// @access  Public
router.get('/stats/matches', statsController.getMatchStats);

// @route   GET /api/public/stats/players/:id
// @desc    Get player career statistics
// @access  Public
router.get('/stats/players/:id', statsController.getPlayerStats);

// @route   GET /api/public/stats/tournaments/:id
// @desc    Get tournament statistics
// @access  Public
router.get('/stats/tournaments/:id', statsController.getTournamentStats);

// @route   GET /api/public/stats/overall
// @desc    Get overall system statistics
// @access  Public
router.get('/stats/overall', statsController.getOverallStats);

// ========================
// MATCH ROUTES
// ========================

// @route   GET /api/public/live-matches
// @desc    Get live matches
// @access  Public
router.get('/live-matches', async (req, res) => {
  try {
    const Match = require('../models/Match');
    const liveMatches = await Match.find({
      status: { $in: ['live', 'inning1', 'inning2'] }
    })
    .populate('team1', 'name logo')
    .populate('team2', 'name logo')
    .populate('tournamentId', 'name')
    .sort({ date: -1 })
    .limit(10);
    
    res.status(200).json({
      success: true,
      matches: liveMatches
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch live matches',
      error: error.message 
    });
  }
});

// @route   GET /api/public/upcoming-matches
// @desc    Get upcoming matches
// @access  Public
router.get('/upcoming-matches', async (req, res) => {
  try {
    const Match = require('../models/Match');
    const upcomingMatches = await Match.find({
      status: { $in: ['scheduled', 'toss'] },
      date: { $gte: new Date() }
    })
    .populate('team1', 'name logo')
    .populate('team2', 'name logo')
    .populate('tournamentId', 'name')
    .sort({ date: 1 })
    .limit(10);
    
    res.status(200).json({
      success: true,
      matches: upcomingMatches
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch upcoming matches',
      error: error.message 
    });
  }
});

// @route   GET /api/public/completed-matches
// @desc    Get completed matches
// @access  Public
router.get('/completed-matches', async (req, res) => {
  try {
    const Match = require('../models/Match');
    const completedMatches = await Match.find({
      status: 'completed'
    })
    .populate('team1', 'name logo')
    .populate('team2', 'name logo')
    .populate('tournamentId', 'name')
    .populate('result.wonBy', 'name')
    .sort({ date: -1 })
    .limit(20);
    
    res.status(200).json({
      success: true,
      matches: completedMatches
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch completed matches',
      error: error.message 
    });
  }
});

// ========================
// TOURNAMENT ROUTES
// ========================

// @route   GET /api/public/active-tournaments
// @desc    Get active tournaments
// @access  Public
router.get('/active-tournaments', async (req, res) => {
  try {
    const Tournament = require('../models/Tournament');
    const activeTournaments = await Tournament.find({
      status: { $in: ['ongoing', 'upcoming'] }
    })
    .populate('teams', 'name logo')
    .sort({ startDate: 1 })
    .limit(10);
    
    res.status(200).json({
      success: true,
      tournaments: activeTournaments
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch active tournaments',
      error: error.message 
    });
  }
});

// ========================
// LEADERBOARD ROUTES
// ========================

// @route   GET /api/public/leaderboard/batsmen
// @desc    Get leaderboard - top batsmen
// @access  Public
router.get('/leaderboard/batsmen', async (req, res) => {
  try {
    const Player = require('../models/Player');
    const topBatsmen = await Player.find({
      $or: [
        { role: 'batsman' },
        { role: 'allrounder' }
      ],
      'statistics.matches': { $gt: 0 }
    })
    .sort({ 'statistics.runs': -1 })
    .limit(20)
    .select('name photo team role statistics.runs statistics.ballsFaced statistics.centuries statistics.halfCenturies')
    .populate('team', 'name');
    
    // Calculate strike rate
    const batsmenWithStats = topBatsmen.map(player => {
      const playerObj = player.toObject();
      playerObj.strikeRate = playerObj.statistics.ballsFaced > 0 
        ? (playerObj.statistics.runs / playerObj.statistics.ballsFaced * 100).toFixed(2)
        : 0;
      return playerObj;
    });
    
    res.status(200).json({
      success: true,
      batsmen: batsmenWithStats
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch batsmen leaderboard',
      error: error.message 
    });
  }
});

// @route   GET /api/public/leaderboard/bowlers
// @desc    Get leaderboard - top bowlers
// @access  Public
router.get('/leaderboard/bowlers', async (req, res) => {
  try {
    const Player = require('../models/Player');
    const topBowlers = await Player.find({
      $or: [
        { role: 'bowler' },
        { role: 'allrounder' }
      ],
      'statistics.wickets': { $gt: 0 }
    })
    .sort({ 'statistics.wickets': -1 })
    .limit(20)
    .select('name photo team role statistics.wickets statistics.oversBowled statistics.maidens statistics.runs')
    .populate('team', 'name');
    
    // Calculate economy and average
    const bowlersWithStats = topBowlers.map(player => {
      const playerObj = player.toObject();
      playerObj.economy = playerObj.statistics.oversBowled > 0 
        ? (playerObj.statistics.runs / playerObj.statistics.oversBowled).toFixed(2)
        : 0;
      playerObj.average = playerObj.statistics.wickets > 0 
        ? (playerObj.statistics.runs / playerObj.statistics.wickets).toFixed(2)
        : playerObj.statistics.runs;
      return playerObj;
    });
    
    res.status(200).json({
      success: true,
      bowlers: bowlersWithStats
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch bowlers leaderboard',
      error: error.message 
    });
  }
});

// ========================
// POINTS TABLE & STATS
// ========================

// @route   GET /api/public/points-table/:tournamentId
// @desc    Get points table for tournament
// @access  Public
router.get('/points-table/:tournamentId', async (req, res) => {
  try {
    const Team = require('../models/Team');
    const teams = await Team.find({ tournamentId: req.params.tournamentId })
      .select('name logo matchesPlayed matchesWon matchesLost points netRunRate')
      .sort({ points: -1, netRunRate: -1 });
    
    res.status(200).json({
      success: true,
      teams
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch points table',
      error: error.message 
    });
  }
});

// @route   GET /api/public/match-stats/:matchId
// @desc    Get match statistics
// @access  Public
router.get('/match-stats/:matchId', async (req, res) => {
  try {
    const Match = require('../models/Match');
    const Ball = require('../models/Ball');
    
    const match = await Match.findById(req.params.matchId)
      .populate('team1', 'name logo')
      .populate('team2', 'name logo');
    
    if (!match) {
      return res.status(404).json({ 
        success: false,
        message: 'Match not found' 
      });
    }
    
    // Get ball data for statistics
    const balls = await Ball.find({ matchId: match._id });
    
    // Calculate run rate per over
    const runRateData = [];
    const overWiseRuns = {};
    
    balls.forEach(ball => {
      const overKey = ball.overNumber;
      if (!overWiseRuns[overKey]) {
        overWiseRuns[overKey] = { runs: 0, balls: 0 };
      }
      overWiseRuns[overKey].runs += ball.runs + (ball.extraRuns || 0);
      overWiseRuns[overKey].balls += 1;
    });
    
    Object.keys(overWiseRuns).sort().forEach(over => {
      const overData = overWiseRuns[over];
      runRateData.push({
        over: parseInt(over),
        runRate: (overData.runs / (overData.balls / 6)).toFixed(2)
      });
    });
    
    // Calculate partnership data
    const partnershipData = [];
    // This would require more complex calculation based on innings data
    
    // Calculate wicket fall intervals
    const wicketData = [];
    let cumulativeRuns = 0;
    let wicketCount = 0;
    
    balls.forEach((ball, index) => {
      cumulativeRuns += ball.runs + (ball.extraRuns || 0);
      if (ball.isWicket) {
        wicketCount++;
        wicketData.push({
          wicket: wicketCount,
          runs: cumulativeRuns,
          over: ball.overNumber + (ball.ballNumber / 10)
        });
      }
    });
    
    res.status(200).json({
      success: true,
      matchInfo: {
        teams: `${match.team1.name} vs ${match.team2.name}`,
        venue: match.venue,
        date: match.date,
        tournament: match.tournamentId
      },
      statistics: {
        runRateData,
        partnershipData,
        wicketData,
        totalBalls: balls.length,
        totalRuns: balls.reduce((sum, ball) => sum + ball.runs + (ball.extraRuns || 0), 0),
        totalWickets: balls.filter(ball => ball.isWicket).length,
        totalFours: balls.filter(ball => ball.runs === 4).length,
        totalSixes: balls.filter(ball => ball.runs === 6).length,
        totalExtras: balls.reduce((sum, ball) => sum + (ball.extraRuns || 0), 0)
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch match statistics',
      error: error.message 
    });
  }
});

// ========================
// CONTROLLER-BASED ROUTES
// ========================

// Public listings - Using controllers for better organization
router.get('/teams', teamController.getTeams);
router.get('/teams/:id', teamController.getTeamById);
router.get('/players', playerController.getPlayers);
router.get('/players/:id', playerController.getPlayerById);
router.get('/tournaments', tournamentController.getTournaments);
router.get('/tournaments/:id', tournamentController.getTournamentById);
router.get('/matches', matchController.getMatches);
router.get('/matches/:id', matchController.getMatchById);

module.exports = router;