const Tournament = require('../models/Tournament');
const Team = require('../models/Team');
const Match = require('../models/Match');
const cloudinary = require('../config/cloudinary');
const { calculateNRR } = require('../utils/statistics');

// @desc    Create a new tournament
// @route   POST /api/tournaments
// @access  Private (Admin)
exports.createTournament = async (req, res) => {
  try {
    const {
      name,
      tournamentId,
      season,
      startDate,
      endDate,
      format,
      totalOvers,
      maxPlayersPerTeam,
      groups
    } = req.body;
    
    // Check if tournament already exists
    const existingTournament = await Tournament.findOne({
      $or: [{ name }, { tournamentId }]
    });
    
    if (existingTournament) {
      return res.status(400).json({ 
        message: 'Tournament with this name or ID already exists' 
      });
    }
    
    // Parse groups if provided
    let parsedGroups = [];
    if (groups) {
      try {
        parsedGroups = typeof groups === 'string' ? JSON.parse(groups) : groups;
      } catch (error) {
        return res.status(400).json({ message: 'Invalid groups format' });
      }
    }
    
    // Create tournament
    const tournament = new Tournament({
      name,
      tournamentId: tournamentId.toUpperCase(),
      season,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      format,
      totalOvers: totalOvers || 20,
      maxPlayersPerTeam: maxPlayersPerTeam || 15,
      groups: parsedGroups,
      createdBy: req.user.id
    });
    
    await tournament.save();
    
    res.status(201).json({
      success: true,
      tournament
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all tournaments
// @route   GET /api/tournaments
// @access  Public
exports.getTournaments = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const query = {};
    if (status) query.status = status;
    
    const tournaments = await Tournament.find(query)
      .populate('teams', 'name logo')
      .populate('winner', 'name logo')
      .populate('runnerUp', 'name logo')
      .sort({ startDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Tournament.countDocuments(query);
    
    res.status(200).json({
      success: true,
      tournaments,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single tournament
// @route   GET /api/tournaments/:id
// @access  Public
exports.getTournament = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id)
      .populate('teams', 'name logo captain players')
      .populate('matches', 'matchNumber team1 team2 venue date status')
      .populate('winner', 'name logo')
      .populate('runnerUp', 'name logo')
      .populate('manOfTheSeries', 'name photo')
      .populate('createdBy', 'username');
    
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }
    
    res.status(200).json({
      success: true,
      tournament
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update tournament
// @route   PUT /api/tournaments/:id
// @access  Private (Admin)
exports.updateTournament = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }
    
    // Update fields
    const updatableFields = [
      'name', 'season', 'startDate', 'endDate', 'format',
      'totalOvers', 'maxPlayersPerTeam', 'status', 'groups'
    ];
    
    updatableFields.forEach(field => {
      if (req.body[field] !== undefined) {
        if (field === 'startDate' || field === 'endDate') {
          tournament[field] = new Date(req.body[field]);
        } else if (field === 'groups') {
          tournament[field] = typeof req.body[field] === 'string' 
            ? JSON.parse(req.body[field]) 
            : req.body[field];
        } else {
          tournament[field] = req.body[field];
        }
      }
    });
    
    await tournament.save();
    
    res.status(200).json({
      success: true,
      tournament
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete tournament
// @route   DELETE /api/tournaments/:id
// @access  Private (Admin)
exports.deleteTournament = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }
    
    // Check if tournament has teams or matches
    if (tournament.teams.length > 0 || tournament.matches.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete tournament with teams or matches. Remove them first.' 
      });
    }
    
    await tournament.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Tournament deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add team to tournament
// @route   POST /api/tournaments/:id/teams
// @access  Private (Admin)
exports.addTeamToTournament = async (req, res) => {
  try {
    const { teamId } = req.body;
    
    const tournament = await Tournament.findById(req.params.id);
    const team = await Team.findById(teamId);
    
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }
    
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    // Check if team already in tournament
    if (tournament.teams.includes(teamId)) {
      return res.status(400).json({ message: 'Team already in tournament' });
    }
    
    // Check max teams if specified
    const maxTeams = tournament.groups.reduce((total, group) => 
      total + (group.teams ? group.teams.length : 0), 0
    );
    
    if (maxTeams > 0 && tournament.teams.length >= maxTeams) {
      return res.status(400).json({ 
        message: 'Tournament has reached maximum teams limit' 
      });
    }
    
    // Add team to tournament
    tournament.teams.push(teamId);
    await tournament.save();
    
    // Update team's tournament ID
    team.tournamentId = tournament._id;
    await team.save();
    
    res.status(200).json({
      success: true,
      message: 'Team added to tournament successfully',
      tournament
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove team from tournament
// @route   DELETE /api/tournaments/:id/teams/:teamId
// @access  Private (Admin)
exports.removeTeamFromTournament = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }
    
    // Check if team is in tournament
    if (!tournament.teams.includes(req.params.teamId)) {
      return res.status(400).json({ message: 'Team not in tournament' });
    }
    
    // Remove team from tournament
    tournament.teams = tournament.teams.filter(
      team => team.toString() !== req.params.teamId
    );
    
    await tournament.save();
    
    // Update team
    await Team.findByIdAndUpdate(req.params.teamId, {
      $unset: { tournamentId: 1 }
    });
    
    res.status(200).json({
      success: true,
      message: 'Team removed from tournament successfully',
      tournament
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get tournament standings/points table
// @route   GET /api/tournaments/:id/standings
// @access  Public
exports.getTournamentStandings = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id)
      .populate('teams', 'name logo matchesPlayed matchesWon matchesLost points netRunRate');
    
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }
    
    // Sort teams by points and NRR
    const standings = tournament.teams.sort((a, b) => {
      if (b.points !== a.points) {
        return b.points - a.points;
      }
      return b.netRunRate - a.netRunRate;
    });
    
    res.status(200).json({
      success: true,
      standings,
      tournament: {
        name: tournament.name,
        season: tournament.season,
        format: tournament.format
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upload tournament media
// @route   POST /api/tournaments/:id/media
// @access  Private (Admin)
exports.uploadTournamentMedia = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }
    
    const uploadedMedia = [];
    
    for (const file of req.files) {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: `cricket-tournaments/${tournament.tournamentId}`,
        resource_type: file.mimetype.startsWith('video') ? 'video' : 'image'
      });
      
      const mediaItem = {
        public_id: result.public_id,
        url: result.secure_url,
        resource_type: result.resource_type
      };
      
      if (file.mimetype.startsWith('image')) {
        mediaItem.caption = file.originalname;
        tournament.images.push(mediaItem);
      } else if (file.mimetype.startsWith('video')) {
        mediaItem.title = file.originalname;
        tournament.videos.push(mediaItem);
      }
      
      uploadedMedia.push(mediaItem);
    }
    
    await tournament.save();
    
    res.status(200).json({
      success: true,
      message: 'Media uploaded successfully',
      media: uploadedMedia
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get tournament statistics
// @route   GET /api/tournaments/:id/statistics
// @access  Public
exports.getTournamentStatistics = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id)
      .populate('teams')
      .populate('matches');
    
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }
    
    const Player = require('../models/Player');
    
    // Get top batsmen
    const topBatsmen = await Player.find({ tournamentId: tournament._id })
      .sort({ 'statistics.runs': -1 })
      .limit(10)
      .select('name photo role statistics.runs statistics.ballsFaced statistics.centuries statistics.halfCenturies');
    
    // Get top bowlers
    const topBowlers = await Player.find({ tournamentId: tournament._id })
      .sort({ 'statistics.wickets': -1 })
      .limit(10)
      .select('name photo role statistics.wickets statistics.oversBowled statistics.maidens statistics.runs');
    
    // Get match statistics
    const completedMatches = await Match.countDocuments({
      tournamentId: tournament._id,
      status: 'completed'
    });
    
    const upcomingMatches = await Match.countDocuments({
      tournamentId: tournament._id,
      status: 'scheduled'
    });
    
    const liveMatches = await Match.countDocuments({
      tournamentId: tournament._id,
      status: 'live'
    });
    
    // Calculate tournament statistics
    const stats = {
      totalTeams: tournament.teams.length,
      totalMatches: tournament.matches.length,
      completedMatches,
      upcomingMatches,
      liveMatches,
      topBatsmen,
      topBowlers,
      highestTotal: await getHighestTotal(tournament._id),
      bestBowling: await getBestBowling(tournament._id),
      mostSixes: await getMostSixes(tournament._id),
      mostFours: await getMostFours(tournament._id)
    };
    
    res.status(200).json({
      success: true,
      statistics: stats
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper functions for statistics
async function getHighestTotal(tournamentId) {
  const Innings = require('../models/Innings');
  const innings = await Innings.aggregate([
    {
      $lookup: {
        from: 'matches',
        localField: 'matchId',
        foreignField: '_id',
        as: 'match'
      }
    },
    { $unwind: '$match' },
    { $match: { 'match.tournamentId': tournamentId } },
    { $sort: { totalRuns: -1 } },
    { $limit: 1 }
  ]);
  
  return innings[0] || null;
}

async function getBestBowling(tournamentId) {
  // Implementation for best bowling figures
  return null;
}

async function getMostSixes(tournamentId) {
  // Implementation for most sixes
  return null;
}

async function getMostFours(tournamentId) {
  // Implementation for most fours
  return null;
}