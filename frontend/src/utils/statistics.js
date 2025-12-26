const Player = require('../models/Player');
const Team = require('../models/Team');

async function updatePlayerStats(batsmanId, bowlerId, runs, isWicket, wicketType) {
  try {
    // Update batsman stats
    if (batsmanId) {
      await Player.findByIdAndUpdate(batsmanId, {
        $inc: {
          'statistics.runs': runs,
          'statistics.ballsFaced': 1,
          'statistics.centuries': runs >= 100 ? 1 : 0,
          'statistics.halfCenturies': runs >= 50 && runs < 100 ? 1 : 0,
          'statistics.fours': runs === 4 ? 1 : 0,
          'statistics.sixes': runs === 6 ? 1 : 0
        }
      });
    }
    
    // Update bowler stats
    if (bowlerId && isWicket && wicketType !== 'run out') {
      await Player.findByIdAndUpdate(bowlerId, {
        $inc: {
          'statistics.wickets': 1,
          'statistics.oversBowled': 0.1, // Approximate
          'statistics.maidens': runs === 0 ? 0.1 : 0
        }
      });
    }
  } catch (error) {
    console.error('Error updating player stats:', error);
  }
}

function calculateNRR(teamId, tournamentId) {
  // Net Run Rate = (Total Runs Scored / Total Overs Faced) - (Total Runs Conceded / Total Overs Bowled)
  // This would be calculated based on all matches in the tournament
  return 0; // Placeholder
}

function calculateStrikeRate(runs, balls) {
  if (balls === 0) return 0;
  return (runs / balls) * 100;
}

function calculateEconomy(runs, overs) {
  if (overs === 0) return 0;
  return runs / overs;
}

function calculateAverage(runs, wickets) {
  if (wickets === 0) return runs;
  return runs / wickets;
}

module.exports = {
  updatePlayerStats,
  calculateNRR,
  calculateStrikeRate,
  calculateEconomy,
  calculateAverage
};