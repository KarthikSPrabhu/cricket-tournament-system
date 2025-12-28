const Team = require('../models/Team');
const Player = require('../models/Player');

class ScoreCalculator {
  // Calculate Net Run Rate (NRR)
  static calculateNRR(teamId, tournamentId) {
    // Formula: NRR = (Total Runs Scored / Total Overs Faced) - (Total Runs Conceded / Total Overs Bowled)
    return 0; // Will be implemented based on match data
  }

  // Calculate points after match completion
  static async updatePointsTable(matchId) {
    try {
      const Match = require('../models/Match');
      const match = await Match.findById(matchId)
        .populate('team1 team2 result.wonBy');

      if (!match || match.status !== 'completed') {
        return;
      }

      const { team1, team2, result } = match;

      // Update team statistics
      if (result.wonBy) {
        // Winning team gets 2 points
        await Team.findByIdAndUpdate(result.wonBy._id, {
          $inc: {
            matchesPlayed: 1,
            matchesWon: 1,
            points: 2
          }
        });

        // Losing team gets 0 points
        const losingTeamId = team1._id.toString() === result.wonBy._id.toString() 
          ? team2._id 
          : team1._id;
        
        await Team.findByIdAndUpdate(losingTeamId, {
          $inc: {
            matchesPlayed: 1,
            matchesLost: 1
          }
        });

        // Update NRR for both teams
        await this.updateTeamNRR(team1._id, match.tournamentId);
        await this.updateTeamNRR(team2._id, match.tournamentId);
      }
    } catch (error) {
      console.error('Error updating points table:', error);
    }
  }

  // Update team NRR
  static async updateTeamNRR(teamId, tournamentId) {
    try {
      const Match = require('../models/Match');
      const Innings = require('../models/Innings');
      
      // Get all matches for this team in tournament
      const matches = await Match.find({
        tournamentId,
        $or: [{ team1: teamId }, { team2: teamId }],
        status: 'completed'
      });

      let totalRunsScored = 0;
      let totalOversFaced = 0;
      let totalRunsConceded = 0;
      let totalOversBowled = 0;

      for (const match of matches) {
        const innings = await Innings.find({ matchId: match._id });
        
        for (const inning of innings) {
          if (inning.battingTeam.toString() === teamId.toString()) {
            totalRunsScored += inning.totalRuns;
            totalOversFaced += inning.overs + (inning.balls / 6);
          }
          if (inning.bowlingTeam.toString() === teamId.toString()) {
            totalRunsConceded += inning.totalRuns;
            totalOversBowled += inning.overs + (inning.balls / 6);
          }
        }
      }

      // Calculate NRR
      const nrr = (totalRunsScored / (totalOversFaced || 1)) - 
                  (totalRunsConceded / (totalOversBowled || 1));

      // Update team
      await Team.findByIdAndUpdate(teamId, {
        netRunRate: parseFloat(nrr.toFixed(3))
      });
    } catch (error) {
      console.error('Error updating team NRR:', error);
    }
  }

  // Calculate player statistics
  static async updatePlayerStatistics(playerId, stats) {
    try {
      const player = await Player.findById(playerId);
      if (!player) return;

      const updateFields = {};
      
      if (stats.runs !== undefined) {
        updateFields['statistics.runs'] = player.statistics.runs + stats.runs;
        updateFields['statistics.ballsFaced'] = player.statistics.ballsFaced + (stats.balls || 0);
        
        // Update centuries/half-centuries
        if (stats.runs >= 100) {
          updateFields['statistics.centuries'] = player.statistics.centuries + 1;
        } else if (stats.runs >= 50) {
          updateFields['statistics.halfCenturies'] = player.statistics.halfCenturies + 1;
        }

        // Update boundaries
        if (stats.fours) {
          updateFields['statistics.fours'] = player.statistics.fours + stats.fours;
        }
        if (stats.sixes) {
          updateFields['statistics.sixes'] = player.statistics.sixes + stats.sixes;
        }
      }

      if (stats.wickets !== undefined) {
        updateFields['statistics.wickets'] = player.statistics.wickets + stats.wickets;
        updateFields['statistics.oversBowled'] = player.statistics.oversBowled + (stats.overs || 0);
        
        if (stats.maidens) {
          updateFields['statistics.maidens'] = player.statistics.maidens + stats.maidens;
        }
      }

      if (stats.matches !== undefined) {
        updateFields['statistics.matches'] = player.statistics.matches + stats.matches;
      }

      if (stats.catches !== undefined) {
        updateFields['statistics.catches'] = player.statistics.catches + stats.catches;
      }

      if (stats.stumpings !== undefined) {
        updateFields['statistics.stumpings'] = player.statistics.stumpings + stats.stumpings;
      }

      await Player.findByIdAndUpdate(playerId, { $set: updateFields });
    } catch (error) {
      console.error('Error updating player statistics:', error);
    }
  }

  // Calculate match summary
  static calculateMatchSummary(innings, balls) {
    const summary = {
      totalRuns: innings.totalRuns,
      totalWickets: innings.wickets,
      totalOvers: innings.overs + (innings.balls / 10),
      extras: innings.extras,
      runRate: 0,
      partnership: innings.partnership?.current || null,
      powerplay: innings.powerplay || {},
      milestones: []
    };

    // Calculate run rate
    if (summary.totalOvers > 0) {
      summary.runRate = (summary.totalRuns / summary.totalOvers).toFixed(2);
    }

    // Identify milestones
    const battingMilestones = [50, 100, 150, 200];
    const bowlingMilestones = [3, 5, 7]; // 3, 5, 7 wicket hauls

    // Check for batting milestones
    innings.batsmen.forEach(batsman => {
      battingMilestones.forEach(milestone => {
        if (batsman.runs >= milestone && 
            !summary.milestones.some(m => m.type === 'batting' && m.value === milestone && m.player === batsman.player._id)) {
          summary.milestones.push({
            type: 'batting',
            value: milestone,
            player: batsman.player,
            runs: batsman.runs
          });
        }
      });
    });

    // Check for bowling milestones
    innings.bowlers.forEach(bowler => {
      bowlingMilestones.forEach(milestone => {
        if (bowler.wickets >= milestone) {
          summary.milestones.push({
            type: 'bowling',
            value: milestone,
            player: bowler.player,
            wickets: bowler.wickets
          });
        }
      });
    });

    // Calculate dot ball percentage
    const totalBalls = balls.length;
    const dotBalls = balls.filter(ball => ball.runs === 0 && !ball.extraType).length;
    summary.dotBallPercentage = totalBalls > 0 ? ((dotBallPercentage / totalBalls) * 100).toFixed(1) : 0;

    // Calculate boundary percentage
    const boundaryBalls = balls.filter(ball => ball.runs === 4 || ball.runs === 6).length;
    summary.boundaryPercentage = totalBalls > 0 ? ((boundaryBalls / totalBalls) * 100).toFixed(1) : 0;

    return summary;
  }

  // Calculate required run rate
  static calculateRequiredRunRate(target, currentRuns, oversLeft) {
    if (oversLeft <= 0) return null;
    
    const runsNeeded = target - currentRuns + 1;
    return (runsNeeded / oversLeft).toFixed(2);
  }

  // Calculate projected score
  static calculateProjectedScore(currentRuns, currentOvers, totalOvers) {
    if (currentOvers <= 0) return 0;
    
    const runRate = currentRuns / currentOvers;
    return Math.round(runRate * totalOvers);
  }
}

module.exports = ScoreCalculator;