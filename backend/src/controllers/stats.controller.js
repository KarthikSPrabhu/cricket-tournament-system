const Player = require('../models/Player');
const Match = require('../models/Match');
const Team = require('../models/Team');
const Tournament = require('../models/Tournament');

// @desc    Get top batsmen statistics
// @route   GET /api/stats/batsmen
// @access  Public
exports.getTopBatsmen = async (req, res) => {
  try {
    const { tournament, limit = 10, minMatches = 1 } = req.query;

    let matchFilter = {};
    if (tournament) {
      matchFilter.tournament = tournament;
    }

    // In a real implementation, you would aggregate from match data
    // For now, returning sample data structure
    const batsmen = await Player.find({ 
      role: { $in: ['batsman', 'all_rounder', 'wicket_keeper'] }
    })
    .populate('team', 'name shortName logo')
    .limit(parseInt(limit))
    .lean();

    // Add mock statistics for demonstration
    const batsmenWithStats = batsmen.map(player => ({
      player: {
        _id: player._id,
        firstName: player.firstName,
        lastName: player.lastName,
        team: player.team
      },
      matches: Math.floor(Math.random() * 20) + 1,
      innings: Math.floor(Math.random() * 20) + 1,
      runs: Math.floor(Math.random() * 1500) + 100,
      balls: Math.floor(Math.random() * 1200) + 100,
      average: (Math.random() * 50 + 20).toFixed(2),
      strikeRate: (Math.random() * 50 + 100).toFixed(2),
      highest: Math.floor(Math.random() * 150) + 50,
      notOuts: Math.floor(Math.random() * 5),
      centuries: Math.floor(Math.random() * 10),
      fifties: Math.floor(Math.random() * 20),
      fours: Math.floor(Math.random() * 200),
      sixes: Math.floor(Math.random() * 50)
    })).sort((a, b) => b.runs - a.runs);

    res.json(batsmenWithStats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get top bowlers statistics
// @route   GET /api/stats/bowlers
// @access  Public
exports.getTopBowlers = async (req, res) => {
  try {
    const { tournament, limit = 10, minMatches = 1 } = req.query;

    const bowlers = await Player.find({ 
      role: { $in: ['bowler', 'all_rounder'] }
    })
    .populate('team', 'name shortName logo')
    .limit(parseInt(limit))
    .lean();

    // Add mock statistics for demonstration
    const bowlersWithStats = bowlers.map(player => ({
      player: {
        _id: player._id,
        firstName: player.firstName,
        lastName: player.lastName,
        team: player.team
      },
      matches: Math.floor(Math.random() * 20) + 1,
      innings: Math.floor(Math.random() * 20) + 1,
      overs: (Math.random() * 100 + 20).toFixed(1),
      maidens: Math.floor(Math.random() * 20),
      runs: Math.floor(Math.random() * 800) + 100,
      wickets: Math.floor(Math.random() * 50) + 5,
      average: (Math.random() * 30 + 10).toFixed(2),
      economy: (Math.random() * 4 + 6).toFixed(2),
      strikeRate: (Math.random() * 20 + 20).toFixed(2),
      bestBowling: `${Math.floor(Math.random() * 6)}/${Math.floor(Math.random() * 40)}`,
      fourWickets: Math.floor(Math.random() * 5),
      fiveWickets: Math.floor(Math.random() * 3)
    })).sort((a, b) => b.wickets - a.wickets);

    res.json(bowlersWithStats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get team statistics
// @route   GET /api/stats/teams
// @access  Public
exports.getTeamStats = async (req, res) => {
  try {
    const { tournament } = req.query;

    const teams = await Team.find()
      .populate('players')
      .lean();

    const teamsWithStats = teams.map(team => {
      const matchesPlayed = Math.floor(Math.random() * 30) + 5;
      const matchesWon = Math.floor(Math.random() * 20) + 1;
      const matchesLost = matchesPlayed - matchesWon;
      const winPercentage = ((matchesWon / matchesPlayed) * 100).toFixed(1);

      return {
        team: {
          _id: team._id,
          name: team.name,
          shortName: team.shortName,
          logo: team.logo
        },
        matches: {
          played: matchesPlayed,
          won: matchesWon,
          lost: matchesLost,
          draw: Math.floor(Math.random() * 5),
          winPercentage: parseFloat(winPercentage)
        },
        points: Math.floor(Math.random() * 50) + 10,
        netRunRate: (Math.random() * 2 - 1).toFixed(2),
        highestTotal: Math.floor(Math.random() * 300) + 200,
        lowestTotal: Math.floor(Math.random() * 100) + 50,
        battingAverage: (Math.random() * 30 + 20).toFixed(2),
        bowlingAverage: (Math.random() * 35 + 15).toFixed(2)
      };
    }).sort((a, b) => b.points - a.points);

    res.json(teamsWithStats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get match statistics
// @route   GET /api/stats/matches
// @access  Public
exports.getMatchStats = async (req, res) => {
  try {
    const { tournament, team, venue, startDate, endDate } = req.query;

    let filter = {};
    if (tournament) filter.tournament = tournament;
    if (team) {
      filter.$or = [
        { team1: team },
        { team2: team }
      ];
    }
    if (venue) filter.venue = { $regex: venue, $options: 'i' };
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const matches = await Match.find(filter)
      .populate('team1 team2 tournament')
      .sort({ date: -1 })
      .lean();

    const stats = {
      totalMatches: matches.length,
      completedMatches: matches.filter(m => m.status === 'completed').length,
      liveMatches: matches.filter(m => m.status === 'live').length,
      scheduledMatches: matches.filter(m => m.status === 'scheduled').length,
      highestTotal: 0,
      lowestTotal: 9999,
      averageTotal: 0,
      totalRuns: 0,
      totalWickets: 0,
      totalSixes: 0,
      totalFours: 0,
      mostSuccessfulTeam: null,
      mostRunsInMatch: 0,
      mostWicketsInMatch: 0
    };

    // Calculate statistics from matches
    matches.forEach(match => {
      const innings1Runs = match.innings1?.runs || 0;
      const innings2Runs = match.innings2?.runs || 0;
      const totalRuns = innings1Runs + innings2Runs;

      stats.totalRuns += totalRuns;
      stats.totalWickets += (match.innings1?.wickets || 0) + (match.innings2?.wickets || 0);

      if (totalRuns > stats.highestTotal) {
        stats.highestTotal = totalRuns;
      }
      if (totalRuns < stats.lowestTotal && totalRuns > 0) {
        stats.lowestTotal = totalRuns;
      }
    });

    if (matches.length > 0) {
      stats.averageTotal = Math.round(stats.totalRuns / matches.length);
    }

    // Get recent matches
    const recentMatches = matches.slice(0, 10);

    res.json({
      summary: stats,
      recentMatches
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get player career statistics
// @route   GET /api/stats/players/:id
// @access  Public
exports.getPlayerStats = async (req, res) => {
  try {
    const playerId = req.params.id;

    const player = await Player.findById(playerId)
      .populate('team', 'name shortName logo')
      .lean();

    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }

    // Mock career statistics based on player role
    const isBatsman = ['batsman', 'all_rounder', 'wicket_keeper'].includes(player.role);
    const isBowler = ['bowler', 'all_rounder'].includes(player.role);

    const careerStats = {
      player,
      career: {
        matches: Math.floor(Math.random() * 50) + 10,
        innings: Math.floor(Math.random() * 50) + 10,
        debut: new Date(Date.now() - Math.random() * 5 * 365 * 24 * 60 * 60 * 1000)
      },
      batting: isBatsman ? {
        runs: Math.floor(Math.random() * 2000) + 100,
        average: (Math.random() * 50 + 20).toFixed(2),
        strikeRate: (Math.random() * 50 + 100).toFixed(2),
        highest: Math.floor(Math.random() * 150) + 50,
        centuries: Math.floor(Math.random() * 10),
        fifties: Math.floor(Math.random() * 20),
        fours: Math.floor(Math.random() * 200),
        sixes: Math.floor(Math.random() * 50),
        notOuts: Math.floor(Math.random() * 10)
      } : null,
      bowling: isBowler ? {
        wickets: Math.floor(Math.random() * 100) + 10,
        average: (Math.random() * 30 + 10).toFixed(2),
        economy: (Math.random() * 4 + 6).toFixed(2),
        strikeRate: (Math.random() * 20 + 20).toFixed(2),
        bestBowling: `${Math.floor(Math.random() * 6)}/${Math.floor(Math.random() * 40)}`,
        fourWickets: Math.floor(Math.random() * 5),
        fiveWickets: Math.floor(Math.random() * 3),
        maidens: Math.floor(Math.random() * 20),
        runs: Math.floor(Math.random() * 800) + 100
      } : null,
      fielding: {
        catches: Math.floor(Math.random() * 50),
        stumpings: player.role === 'wicket_keeper' ? Math.floor(Math.random() * 20) : 0,
        runOuts: Math.floor(Math.random() * 10)
      }
    };

    // Get recent performances (mock)
    const recentPerformances = Array.from({ length: 5 }, (_, i) => ({
      matchId: `match_${i}`,
      date: new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000),
      opponent: `Team ${String.fromCharCode(65 + i)}`,
      venue: `Venue ${i + 1}`,
      batting: isBatsman ? {
        runs: Math.floor(Math.random() * 100),
        balls: Math.floor(Math.random() * 60) + 20,
        fours: Math.floor(Math.random() * 8),
        sixes: Math.floor(Math.random() * 3)
      } : null,
      bowling: isBowler ? {
        overs: (Math.random() * 4 + 1).toFixed(1),
        maidens: Math.floor(Math.random() * 2),
        runs: Math.floor(Math.random() * 40),
        wickets: Math.floor(Math.random() * 4)
      } : null
    }));

    res.json({
      ...careerStats,
      recentPerformances
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get tournament statistics
// @route   GET /api/stats/tournaments/:id
// @access  Public
exports.getTournamentStats = async (req, res) => {
  try {
    const tournamentId = req.params.id;

    const tournament = await Tournament.findById(tournamentId)
      .populate('teams')
      .lean();

    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    // Get matches for this tournament
    const matches = await Match.find({ tournament: tournamentId })
      .populate('team1 team2')
      .lean();

    // Calculate tournament statistics
    const stats = {
      tournament,
      summary: {
        totalMatches: matches.length,
        completedMatches: matches.filter(m => m.status === 'completed').length,
        liveMatches: matches.filter(m => m.status === 'live').length,
        totalRuns: matches.reduce((sum, m) => 
          sum + (m.innings1?.runs || 0) + (m.innings2?.runs || 0), 0),
        totalWickets: matches.reduce((sum, m) => 
          sum + (m.innings1?.wickets || 0) + (m.innings2?.wickets || 0), 0),
        totalSixes: matches.length * 10, // Mock data
        totalFours: matches.length * 20, // Mock data
        averageScore: 0
      },
      topPerformers: {
        batsmen: [],
        bowlers: []
      },
      teamStandings: []
    };

    if (matches.length > 0) {
      stats.summary.averageScore = Math.round(stats.summary.totalRuns / matches.length);
    }

    // Mock top performers
    if (tournament.teams && tournament.teams.length > 0) {
      // Mock top batsmen
      stats.topPerformers.batsmen = tournament.teams.slice(0, 3).map(team => ({
        playerId: `player_${team._id}`,
        playerName: `Top Player from ${team.shortName}`,
        team: team.shortName,
        runs: Math.floor(Math.random() * 300) + 150,
        average: (Math.random() * 40 + 30).toFixed(2),
        strikeRate: (Math.random() * 40 + 120).toFixed(2)
      })).sort((a, b) => b.runs - a.runs);

      // Mock top bowlers
      stats.topPerformers.bowlers = tournament.teams.slice(0, 3).map(team => ({
        playerId: `player_${team._id}_bowler`,
        playerName: `Top Bowler from ${team.shortName}`,
        team: team.shortName,
        wickets: Math.floor(Math.random() * 15) + 5,
        average: (Math.random() * 10 + 20).toFixed(2),
        economy: (Math.random() * 2 + 7).toFixed(2)
      })).sort((a, b) => b.wickets - a.wickets);
    }

    // Mock team standings
    stats.teamStandings = tournament.teams.map((team, index) => ({
      team: {
        _id: team._id,
        name: team.name,
        shortName: team.shortName,
        logo: team.logo
      },
      matches: Math.floor(Math.random() * 8) + 2,
      won: Math.floor(Math.random() * 6) + 1,
      lost: Math.floor(Math.random() * 4),
      points: Math.floor(Math.random() * 20) + 4,
      netRunRate: (Math.random() * 2 - 1).toFixed(2)
    })).sort((a, b) => b.points - a.points);

    res.json(stats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get overall system statistics
// @route   GET /api/stats/overall
// @access  Public
exports.getOverallStats = async (req, res) => {
  try {
    const [
      totalTeams,
      totalPlayers,
      totalTournaments,
      totalMatches,
      totalRuns,
      totalWickets
    ] = await Promise.all([
      Team.countDocuments(),
      Player.countDocuments(),
      Tournament.countDocuments(),
      Match.countDocuments(),
      // In a real app, you would aggregate from match data
      Promise.resolve(10000), // Mock total runs
      Promise.resolve(500)    // Mock total wickets
    ]);

    const stats = {
      totals: {
        teams: totalTeams,
        players: totalPlayers,
        tournaments: totalTournaments,
        matches: totalMatches,
        runs: totalRuns,
        wickets: totalWickets
      },
      averages: {
        playersPerTeam: Math.round(totalPlayers / totalTeams),
        matchesPerTournament: Math.round(totalMatches / totalTournaments),
        runsPerMatch: Math.round(totalRuns / totalMatches),
        wicketsPerMatch: (totalWickets / totalMatches).toFixed(2)
      },
      records: {
        highestIndividualScore: '264*',
        bestBowlingFigures: '8/19',
        highestTeamTotal: '428/5',
        lowestTeamTotal: '49',
        fastestCentury: '31 balls',
        mostSixesInMatch: '17'
      }
    };

    res.json(stats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};