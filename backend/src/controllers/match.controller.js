const Match = require('../models/Match');
const Innings = require('../models/Innings');
const Ball = require('../models/Ball');
const Team = require('../models/Team');
const Player = require('../models/Player');
const { generateCommentary } = require('../utils/commentaryGenerator');
const { calculateNRR, updatePlayerStats } = require('../utils/statistics');

// Start match scoring
exports.startScoring = async (req, res) => {
  try {
    const { matchId } = req.params;
    const { battingTeamId, bowlingTeamId } = req.body;

    const match = await Match.findById(matchId);
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    // Create first innings
    const innings = new Innings({
      matchId,
      inningNumber: 1,
      battingTeam: battingTeamId,
      bowlingTeam: bowlingTeamId,
      batsmen: [],
      bowlers: []
    });

    await innings.save();

    match.status = 'inning1';
    match.battingTeam = battingTeamId;
    match.bowlingTeam = bowlingTeamId;
    match.innings.push(innings._id);
    await match.save();

    // Emit live update
    req.app.get('io').to(`match-${matchId}`).emit('match-update', {
      type: 'inning_started',
      data: { inning: 1, battingTeam: battingTeamId, bowlingTeam: bowlingTeamId }
    });

    res.status(200).json({ message: 'Scoring started', innings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Record a ball
exports.recordBall = async (req, res) => {
  try {
    const { matchId } = req.params;
    const {
      bowlerId,
      batsmanId,
      nonStrikerId,
      runs,
      extraType,
      isWicket,
      wicketType,
      dismissalPlayerId,
      fielderId,
      shotArea
    } = req.body;

    const match = await Match.findById(matchId);
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    const currentInning = await Innings.findOne({ 
      matchId, 
      inningNumber: match.currentInning 
    });

    // Calculate ball and over numbers
    let overNumber = match.currentOver;
    let ballNumber = match.currentBall + 1;

    if (ballNumber > 6) {
      ballNumber = 1;
      overNumber += 1;
    }

    // Handle extras
    let extraRuns = 0;
    if (extraType === 'wide' || extraType === 'no ball') {
      extraRuns = runs + 1; // Extra run for wide/no ball
    }

    // Create ball record
    const ball = new Ball({
      matchId,
      inningNumber: match.currentInning,
      overNumber,
      ballNumber,
      bowler: bowlerId,
      batsman: batsmanId,
      nonStriker: nonStrikerId,
      runs: extraType ? 0 : runs,
      extraRuns,
      extraType,
      isWicket,
      wicketType,
      dismissalPlayer: dismissalPlayerId,
      fielder: fielderId,
      shotArea,
      commentary: generateCommentary(runs, isWicket, wicketType, shotArea)
    });

    await ball.save();

    // Update innings
    currentInning.totalRuns += runs + extraRuns;
    currentInning.balls = ballNumber;
    currentInning.overs = overNumber + (ballNumber / 10);

    if (isWicket) {
      currentInning.wickets += 1;
    }

    // Update batsman stats
    const batsmanIndex = currentInning.batsmen.findIndex(
      b => b.player.toString() === batsmanId
    );

    if (batsmanIndex !== -1) {
      currentInning.batsmen[batsmanIndex].runs += runs;
      currentInning.batsmen[batsmanIndex].balls += 1;
      currentInning.batsmen[batsmanIndex].strikeRate = 
        (currentInning.batsmen[batsmanIndex].runs / currentInning.batsmen[batsmanIndex].balls) * 100;
      
      if (runs === 4) currentInning.batsmen[batsmanIndex].fours += 1;
      if (runs === 6) currentInning.batsmen[batsmanIndex].sixes += 1;
      
      if (isWicket) {
        currentInning.batsmen[batsmanIndex].isOut = true;
        currentInning.batsmen[batsmanIndex].isBatting = false;
        currentInning.batsmen[batsmanIndex].dismissal = {
          type: wicketType,
          bowler: bowlerId,
          fielder: fielderId
        };
      }
    }

    // Update bowler stats
    const bowlerIndex = currentInning.bowlers.findIndex(
      b => b.player.toString() === bowlerId
    );

    if (bowlerIndex !== -1) {
      currentInning.bowlers[bowlerIndex].runs += runs + extraRuns;
      currentInning.bowlers[bowlerIndex].overs = overNumber + (ballNumber / 6);
      
      if (extraType === 'wide') currentInning.bowlers[bowlerIndex].wides += 1;
      if (extraType === 'no ball') currentInning.bowlers[bowlerIndex].noBalls += 1;
      
      if (isWicket && wicketType !== 'run out') {
        currentInning.bowlers[bowlerIndex].wickets += 1;
      }
      
      currentInning.bowlers[bowlerIndex].economy = 
        currentInning.bowlers[bowlerIndex].runs / currentInning.bowlers[bowlerIndex].overs;
    }

    await currentInning.save();

    // Update match
    match.currentOver = overNumber;
    match.currentBall = ballNumber;
    match.liveCommentary.push({
      over: overNumber,
      ball: ballNumber,
      commentary: ball.commentary,
      timestamp: new Date()
    });

    await match.save();

    // Update player statistics
    await updatePlayerStats(batsmanId, bowlerId, runs, isWicket, wicketType);

    // Emit live update
    const liveData = {
      matchId,
      over: overNumber,
      ball: ballNumber,
      runs: currentInning.totalRuns,
      wickets: currentInning.wickets,
      currentBatsman: batsmanId,
      currentBowler: bowlerId,
      commentary: ball.commentary,
      shotArea
    };

    req.app.get('io').to(`match-${matchId}`).emit('ball-update', liveData);

    res.status(200).json({ message: 'Ball recorded', data: liveData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update toss
exports.updateToss = async (req, res) => {
  try {
    const { matchId } = req.params;
    const { tossWonBy, decision } = req.body;

    const match = await Match.findById(matchId);
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    match.toss = {
      wonBy: tossWonBy,
      decision: decision
    };
    match.status = 'toss';

    await match.save();

    req.app.get('io').to(`match-${matchId}`).emit('toss-update', {
      tossWonBy,
      decision
    });

    res.status(200).json({ message: 'Toss updated', toss: match.toss });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get live match data
exports.getLiveMatch = async (req, res) => {
  try {
    const { matchId } = req.params;

    const match = await Match.findById(matchId)
      .populate('team1', 'name logo')
      .populate('team2', 'name logo')
      .populate('battingTeam', 'name logo')
      .populate('bowlingTeam', 'name logo')
      .populate('toss.wonBy', 'name');

    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    const currentInning = await Innings.findOne({
      matchId,
      inningNumber: match.currentInning
    })
      .populate('batsmen.player', 'name photo')
      .populate('bowlers.player', 'name photo')
      .populate('partnership.current.player1', 'name')
      .populate('partnership.current.player2', 'name');

    const balls = await Ball.find({ matchId })
      .sort({ overNumber: 1, ballNumber: 1 })
      .limit(20)
      .populate('batsman', 'name')
      .populate('bowler', 'name');

    res.status(200).json({
      match,
      currentInning,
      recentBalls: balls
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// End innings
exports.endInnings = async (req, res) => {
  try {
    const { matchId } = req.params;

    const match = await Match.findById(matchId);
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    if (match.currentInning === 1) {
      match.status = 'inning2';
      match.currentInning = 2;
      match.currentOver = 0;
      match.currentBall = 0;
      
      // Swap batting and bowling teams
      [match.battingTeam, match.bowlingTeam] = [match.bowlingTeam, match.battingTeam];
    } else {
      match.status = 'completed';
      await calculateMatchResult(matchId);
    }

    await match.save();

    req.app.get('io').to(`match-${matchId}`).emit('inning-end', {
      inning: match.currentInning === 2 ? 1 : 2,
      target: match.status === 'inning2' ? calculateTarget(matchId) : null
    });

    res.status(200).json({ message: 'Innings ended', matchStatus: match.status });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper function to calculate target
async function calculateTarget(matchId) {
  const firstInning = await Innings.findOne({ matchId, inningNumber: 1 });
  return firstInning.totalRuns + 1;
}

// Helper function to calculate match result
async function calculateMatchResult(matchId) {
  const match = await Match.findById(matchId);
  const inning1 = await Innings.findOne({ matchId, inningNumber: 1 });
  const inning2 = await Innings.findOne({ matchId, inningNumber: 2 });

  if (inning1.totalRuns > inning2.totalRuns) {
    match.result = {
      wonBy: match.team1._id.equals(inning1.battingTeam) ? match.team1 : match.team2,
      margin: `${inning1.totalRuns - inning2.totalRuns} runs`,
      method: 'runs'
    };
  } else {
    match.result = {
      wonBy: match.team1._id.equals(inning2.battingTeam) ? match.team1 : match.team2,
      margin: `${10 - inning2.wickets} wickets`,
      method: 'wickets'
    };
  }

  await match.save();
  
  // Update team statistics
  await updateTeamStats(match);
}