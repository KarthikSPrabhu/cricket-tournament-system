const Player = require('../models/Player');
const Team = require('../models/Team');
const cloudinary = require('../config/cloudinary');
const { calculateStrikeRate, calculateEconomy, calculateAverage } = require('../utils/statistics');

// @desc    Create a new player
// @route   POST /api/players
// @access  Private (Admin)
exports.createPlayer = async (req, res) => {
  try {
    const {
      playerId,
      name,
      age,
      phone,
      email,
      role,
      battingStyle,
      bowlingStyle,
      isCaptain,
      isWicketKeeper,
      teamId
    } = req.body;
    
    // Check if player already exists
    const existingPlayer = await Player.findOne({
      $or: [{ playerId }, { email }, { phone }]
    });
    
    if (existingPlayer) {
      return res.status(400).json({ 
        message: 'Player with this ID, email or phone already exists' 
      });
    }
    
    // Handle photo upload
    let photo = {};
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'cricket-players',
        width: 400,
        height: 400,
        crop: 'fill'
      });
      
      photo = {
        public_id: result.public_id,
        url: result.secure_url
      };
    }
    
    // Get team for tournament ID
    let tournamentId = null;
    if (teamId) {
      const team = await Team.findById(teamId);
      if (team) {
        tournamentId = team.tournamentId;
      }
    }
    
    // Create player
    const player = new Player({
      playerId: playerId.toUpperCase(),
      name,
      photo,
      age,
      phone,
      email,
      role,
      battingStyle,
      bowlingStyle,
      team: teamId,
      tournamentId,
      isCaptain: role === 'captain' || isCaptain || false,
      isWicketKeeper: role === 'wicketkeeper' || isWicketKeeper || false,
      createdBy: req.user.id
    });
    
    await player.save();
    
    // If team specified, add player to team
    if (teamId) {
      await Team.findByIdAndUpdate(
        teamId,
        { $push: { players: player._id } }
      );
    }
    
    res.status(201).json({
      success: true,
      player
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all players
// @route   GET /api/players
// @access  Public
exports.getPlayers = async (req, res) => {
  try {
    const { 
      teamId, 
      tournamentId, 
      role, 
      page = 1, 
      limit = 20,
      sortBy = 'name',
      sortOrder = 'asc'
    } = req.query;
    
    const query = {};
    
    if (teamId) query.team = teamId;
    if (tournamentId) query.tournamentId = tournamentId;
    if (role) query.role = role;
    
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    const players = await Player.find(query)
      .populate('team', 'name logo')
      .populate('tournamentId', 'name season')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Player.countDocuments(query);
    
    // Calculate additional stats for each player
    const playersWithStats = players.map(player => {
      const playerObj = player.toObject();
      
      // Calculate derived statistics
      if (playerObj.role === 'batsman' || playerObj.role === 'allrounder') {
        playerObj.statistics.strikeRate = calculateStrikeRate(
          playerObj.statistics.runs,
          playerObj.statistics.ballsFaced
        );
        playerObj.statistics.battingAverage = calculateAverage(
          playerObj.statistics.runs,
          playerObj.statistics.matches
        );
      }
      
      if (playerObj.role === 'bowler' || playerObj.role === 'allrounder') {
        playerObj.statistics.economy = calculateEconomy(
          playerObj.statistics.runs,
          playerObj.statistics.oversBowled
        );
        playerObj.statistics.bowlingAverage = calculateAverage(
          playerObj.statistics.runs,
          playerObj.statistics.wickets
        );
      }
      
      return playerObj;
    });
    
    res.status(200).json({
      success: true,
      players: playersWithStats,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single player
// @route   GET /api/players/:id
// @access  Public
exports.getPlayer = async (req, res) => {
  try {
    const player = await Player.findById(req.params.id)
      .populate('team', 'name logo teamId')
      .populate('tournamentId', 'name season')
      .populate('createdBy', 'username');
    
    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }
    
    // Calculate derived statistics
    const playerObj = player.toObject();
    
    if (playerObj.role === 'batsman' || playerObj.role === 'allrounder') {
      playerObj.statistics.strikeRate = calculateStrikeRate(
        playerObj.statistics.runs,
        playerObj.statistics.ballsFaced
      );
      playerObj.statistics.battingAverage = calculateAverage(
        playerObj.statistics.runs,
        playerObj.statistics.matches
      );
    }
    
    if (playerObj.role === 'bowler' || playerObj.role === 'allrounder') {
      playerObj.statistics.economy = calculateEconomy(
        playerObj.statistics.runs,
        playerObj.statistics.oversBowled
      );
      playerObj.statistics.bowlingAverage = calculateAverage(
        playerObj.statistics.runs,
        playerObj.statistics.wickets
      );
    }
    
    res.status(200).json({
      success: true,
      player: playerObj
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update player
// @route   PUT /api/players/:id
// @access  Private (Admin)
exports.updatePlayer = async (req, res) => {
  try {
    const player = await Player.findById(req.params.id);
    
    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }
    
    // Handle photo update
    if (req.file) {
      // Delete old photo from Cloudinary
      if (player.photo.public_id) {
        await cloudinary.uploader.destroy(player.photo.public_id);
      }
      
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'cricket-players',
        width: 400,
        height: 400,
        crop: 'fill'
      });
      
      player.photo = {
        public_id: result.public_id,
        url: result.secure_url
      };
    }
    
    // Update fields
    const updatableFields = [
      'name', 'age', 'phone', 'email', 'role', 
      'battingStyle', 'bowlingStyle', 'isCaptain', 'isWicketKeeper'
    ];
    
    updatableFields.forEach(field => {
      if (req.body[field] !== undefined) {
        player[field] = req.body[field];
      }
    });
    
    await player.save();
    
    res.status(200).json({
      success: true,
      player
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete player
// @route   DELETE /api/players/:id
// @access  Private (Admin)
exports.deletePlayer = async (req, res) => {
  try {
    const player = await Player.findById(req.params.id);
    
    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }
    
    // Remove player from team if assigned
    if (player.team) {
      await Team.findByIdAndUpdate(
        player.team,
        { $pull: { players: player._id } }
      );
    }
    
    // Delete photo from Cloudinary
    if (player.photo.public_id) {
      await cloudinary.uploader.destroy(player.photo.public_id);
    }
    
    await player.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Player deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get player statistics
// @route   GET /api/players/:id/statistics
// @access  Public
exports.getPlayerStatistics = async (req, res) => {
  try {
    const player = await Player.findById(req.params.id);
    
    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }
    
    // Get match history for the player
    const Match = require('../models/Match');
    const Ball = require('../models/Ball');
    
    // Get all balls where player was involved
    const battingBalls = await Ball.find({ batsman: player._id })
      .populate('matchId', 'matchNumber date venue')
      .sort({ timestamp: -1 })
      .limit(50);
    
    const bowlingBalls = await Ball.find({ bowler: player._id })
      .populate('matchId', 'matchNumber date venue')
      .sort({ timestamp: -1 })
      .limit(50);
    
    // Calculate performance trends
    const battingPerformance = battingBalls.map(ball => ({
      match: ball.matchId.matchNumber,
      date: ball.matchId.date,
      runs: ball.runs,
      isOut: ball.isWicket,
      timestamp: ball.timestamp
    }));
    
    const bowlingPerformance = bowlingBalls.map(ball => ({
      match: ball.matchId.matchNumber,
      date: ball.matchId.date,
      runs: ball.runs,
      wickets: ball.isWicket ? 1 : 0,
      timestamp: ball.timestamp
    }));
    
    res.status(200).json({
      success: true,
      statistics: player.statistics,
      battingPerformance,
      bowlingPerformance,
      recentMatches: {
        batting: battingBalls.slice(0, 10),
        bowling: bowlingBalls.slice(0, 10)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Search players
// @route   GET /api/players/search
// @access  Public
exports.searchPlayers = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.length < 2) {
      return res.status(400).json({ 
        message: 'Search query must be at least 2 characters long' 
      });
    }
    
    const players = await Player.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { playerId: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ]
    })
    .populate('team', 'name logo')
    .limit(20);
    
    res.status(200).json({
      success: true,
      players
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};