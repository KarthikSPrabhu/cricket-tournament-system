const Team = require('../models/Team');
const Player = require('../models/Player');
const Tournament = require('../models/Tournament');
const cloudinary = require('../config/cloudinary');

// @desc    Create a new team
// @route   POST /api/teams
// @access  Private (Admin)
exports.createTeam = async (req, res) => {
  try {
    const { name, teamId, coach, homeGround, foundedYear, tournamentId } = req.body;
    
    // Check if team already exists
    const existingTeam = await Team.findOne({ 
      $or: [{ name }, { teamId }] 
    });
    
    if (existingTeam) {
      return res.status(400).json({ 
        message: 'Team with this name or ID already exists' 
      });
    }
    
    // Handle logo upload
    let logo = {};
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'cricket-teams',
        width: 300,
        height: 300,
        crop: 'fill'
      });
      
      logo = {
        public_id: result.public_id,
        url: result.secure_url
      };
    }
    
    // Create team
    const team = new Team({
      name,
      teamId: teamId.toUpperCase(),
      logo,
      coach,
      homeGround,
      foundedYear,
      tournamentId,
      createdBy: req.user.id
    });
    
    await team.save();
    
    // If tournament specified, add team to tournament
    if (tournamentId) {
      await Tournament.findByIdAndUpdate(
        tournamentId,
        { $push: { teams: team._id } }
      );
    }
    
    res.status(201).json({
      success: true,
      team
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all teams
// @route   GET /api/teams
// @access  Public
exports.getTeams = async (req, res) => {
  try {
    const { tournamentId, page = 1, limit = 10 } = req.query;
    
    const query = {};
    if (tournamentId) {
      query.tournamentId = tournamentId;
    }
    
    const teams = await Team.find(query)
      .populate('captain', 'name photo playerId')
      .populate('tournamentId', 'name season')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Team.countDocuments(query);
    
    res.status(200).json({
      success: true,
      teams,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single team
// @route   GET /api/teams/:id
// @access  Public
exports.getTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('captain', 'name photo playerId age role')
      .populate('players', 'name photo playerId age role statistics')
      .populate('tournamentId', 'name season')
      .populate('createdBy', 'username');
    
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    res.status(200).json({
      success: true,
      team
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update team
// @route   PUT /api/teams/:id
// @access  Private (Admin)
exports.updateTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    // Handle logo update
    if (req.file) {
      // Delete old logo from Cloudinary
      if (team.logo.public_id) {
        await cloudinary.uploader.destroy(team.logo.public_id);
      }
      
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'cricket-teams',
        width: 300,
        height: 300,
        crop: 'fill'
      });
      
      team.logo = {
        public_id: result.public_id,
        url: result.secure_url
      };
    }
    
    // Update fields
    const updatableFields = ['name', 'coach', 'homeGround', 'foundedYear', 'captain'];
    updatableFields.forEach(field => {
      if (req.body[field] !== undefined) {
        team[field] = req.body[field];
      }
    });
    
    await team.save();
    
    res.status(200).json({
      success: true,
      team
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete team
// @route   DELETE /api/teams/:id
// @access  Private (Admin)
exports.deleteTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    // Check if team has players
    if (team.players.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete team with players. Remove players first.' 
      });
    }
    
    // Delete logo from Cloudinary
    if (team.logo.public_id) {
      await cloudinary.uploader.destroy(team.logo.public_id);
    }
    
    // Remove team from tournament
    if (team.tournamentId) {
      await Tournament.findByIdAndUpdate(
        team.tournamentId,
        { $pull: { teams: team._id } }
      );
    }
    
    await team.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Team deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add player to team
// @route   POST /api/teams/:id/players
// @access  Private (Admin)
exports.addPlayerToTeam = async (req, res) => {
  try {
    const { playerId } = req.body;
    
    const team = await Team.findById(req.params.id);
    const player = await Player.findById(playerId);
    
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }
    
    // Check if player already in team
    if (team.players.includes(playerId)) {
      return res.status(400).json({ message: 'Player already in team' });
    }
    
    // Check if player already in another team in same tournament
    if (team.tournamentId && player.tournamentId) {
      if (team.tournamentId.toString() !== player.tournamentId.toString()) {
        return res.status(400).json({ 
          message: 'Player is already in another tournament' 
        });
      }
    }
    
    // Add player to team
    team.players.push(playerId);
    await team.save();
    
    // Update player's team
    player.team = team._id;
    player.tournamentId = team.tournamentId;
    await player.save();
    
    res.status(200).json({
      success: true,
      message: 'Player added to team successfully',
      team
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove player from team
// @route   DELETE /api/teams/:id/players/:playerId
// @access  Private (Admin)
exports.removePlayerFromTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    // Check if player is in team
    if (!team.players.includes(req.params.playerId)) {
      return res.status(400).json({ message: 'Player not in team' });
    }
    
    // Remove player from team
    team.players = team.players.filter(
      player => player.toString() !== req.params.playerId
    );
    
    await team.save();
    
    // Update player
    await Player.findByIdAndUpdate(req.params.playerId, {
      $unset: { team: 1, tournamentId: 1 }
    });
    
    res.status(200).json({
      success: true,
      message: 'Player removed from team successfully',
      team
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get team statistics
// @route   GET /api/teams/:id/stats
// @access  Public
exports.getTeamStats = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    // Get all players in team with stats
    const players = await Player.find({ team: team._id })
      .select('name role statistics');
    
    // Calculate team totals
    const teamStats = players.reduce((acc, player) => {
      acc.totalRuns += player.statistics.runs || 0;
      acc.totalWickets += player.statistics.wickets || 0;
      acc.totalMatches += player.statistics.matches || 0;
      acc.totalCatches += player.statistics.catches || 0;
      
      // Count by role
      if (player.role === 'batsman') acc.batsmenCount++;
      if (player.role === 'bowler') acc.bowlersCount++;
      if (player.role === 'allrounder') acc.allroundersCount++;
      if (player.role === 'wicketkeeper') acc.wicketkeepersCount++;
      
      return acc;
    }, {
      totalRuns: 0,
      totalWickets: 0,
      totalMatches: 0,
      totalCatches: 0,
      batsmenCount: 0,
      bowlersCount: 0,
      allroundersCount: 0,
      wicketkeepersCount: 0
    });
    
    // Add win/loss ratio
    teamStats.winPercentage = team.matchesPlayed > 0 
      ? (team.matchesWon / team.matchesPlayed) * 100 
      : 0;
    
    res.status(200).json({
      success: true,
      teamStats,
      players
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};