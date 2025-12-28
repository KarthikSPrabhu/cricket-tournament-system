import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useMatch } from '../../context/MatchContext';
import { 
  FaCricketBall, 
  FaUsers, 
  FaChartLine,
  FaArrowRight,
  FaComment,
  FaHistory,
  FaRedo,
  FaShareAlt
} from 'react-icons/fa';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toast } from 'react-hot-toast';

const LiveMatch = () => {
  const { matchId } = useParams();
  const { socket, joinMatchRoom, leaveMatchRoom } = useMatch();
  
  const [match, setMatch] = useState(null);
  const [inning, setInning] = useState(null);
  const [balls, setBalls] = useState([]);
  const [commentary, setCommentary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [graphData, setGraphData] = useState([]);
  const [selectedTab, setSelectedTab] = useState('scorecard');
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadMatchData();
    joinMatchRoom(matchId);

    // Setup socket listeners
    if (socket) {
      socket.on('ball-update', handleBallUpdate);
      socket.on('match-update', handleMatchUpdate);
    }

    // Auto refresh interval
    const interval = setInterval(() => {
      if (autoRefresh) {
        loadMatchData();
      }
    }, 10000); // Refresh every 10 seconds

    return () => {
      clearInterval(interval);
      leaveMatchRoom(matchId);
      if (socket) {
        socket.off('ball-update');
        socket.off('match-update');
      }
    };
  }, [matchId, socket, autoRefresh]);

  const loadMatchData = async () => {
    try {
      const response = await axios.get(`/api/matches/${matchId}/live`);
      setMatch(response.data.match);
      setInning(response.data.currentInning);
      setBalls(response.data.recentBalls || []);
      setCommentary(response.data.match?.liveCommentary || []);
      
      // Generate graph data
      generateGraphData(response.data.recentBalls || []);
    } catch (error) {
      toast.error('Failed to load match data');
    } finally {
      setLoading(false);
    }
  };

  const handleBallUpdate = (data) => {
    // Update match data in real-time
    setInning(prev => ({
      ...prev,
      totalRuns: data.runs,
      wickets: data.wickets
    }));
    
    // Add to commentary
    setCommentary(prev => [...prev, {
      over: data.over,
      ball: data.ball,
      commentary: data.commentary,
      timestamp: new Date()
    }]);
    
    // Add to balls
    setBalls(prev => [data, ...prev.slice(0, 19)]);
  };

  const handleMatchUpdate = (data) => {
    toast.info(`Match update: ${data.type}`);
    loadMatchData(); // Reload full data
  };

  const generateGraphData = (ballsData) => {
    if (!ballsData.length) return;
    
    const data = [];
    let cumulativeRuns = 0;
    
    ballsData.forEach((ball, index) => {
      cumulativeRuns += ball.runs + (ball.extraRuns || 0);
      data.push({
        ball: index + 1,
        runs: cumulativeRuns,
        over: ball.overNumber + (ball.ballNumber / 10)
      });
    });
    
    setGraphData(data);
  };

  const getRunRate = () => {
    if (!inning || !match) return 0;
    const overs = match.currentOver + (match.currentBall / 10);
    return overs > 0 ? (inning.totalRuns / overs).toFixed(2) : 0;
  };

  const getRequiredRate = () => {
    if (!match || !inning || match.currentInning !== 2) return null;
    
    const target = match.innings?.[0]?.totalRuns || 0;
    const oversLeft = match.totalOvers - (match.currentOver + (match.currentBall / 10));
    const runsNeeded = target - inning.totalRuns + 1;
    
    return oversLeft > 0 ? (runsNeeded / oversLeft).toFixed(2) : null;
  };

  const shareMatch = () => {
    if (navigator.share) {
      navigator.share({
        title: `${match?.team1?.name} vs ${match?.team2?.name}`,
        text: `Live Cricket Match - ${match?.team1?.name} ${inning?.totalRuns || 0}/${inning?.wickets || 0} vs ${match?.team2?.name}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Match link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Match Not Found</h2>
        <p className="text-gray-600">The requested match could not be found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Match Header */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-800 text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center space-x-4 mb-2">
                <button
                  onClick={() => window.history.back()}
                  className="p-2 hover:bg-blue-800 rounded-lg"
                >
                  ← Back
                </button>
                <span className="px-3 py-1 bg-yellow-500 text-yellow-900 rounded-full text-sm font-bold">
                  {match.status === 'live' ? 'LIVE' : match.status.toUpperCase()}
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                {match.team1?.name} vs {match.team2?.name}
              </h1>
              <div className="text-gray-300">
                <span>{match.venue}</span>
                <span className="mx-2">•</span>
                <span>{new Date(match.date).toLocaleDateString()}</span>
                <span className="mx-2">•</span>
                <span>T20 Match</span>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`p-2 rounded-lg ${autoRefresh ? 'bg-green-600' : 'bg-gray-700'}`}
                title={autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
              >
                <FaRedo className={autoRefresh ? 'animate-spin' : ''} />
              </button>
              <button
                onClick={shareMatch}
                className="p-2 bg-blue-700 hover:bg-blue-600 rounded-lg"
                title="Share Match"
              >
                <FaShareAlt />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Score Banner */}
      <div className="bg-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Team 1 */}
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <img 
                  src={match.team1?.logo?.url || '/team-placeholder.png'} 
                  alt={match.team1?.name}
                  className="w-16 h-16 rounded-full"
                />
                <h2 className="text-2xl font-bold ml-4">{match.team1?.name}</h2>
              </div>
              {match.battingTeam?._id === match.team1?._id && (
                <div className="text-center">
                  <div className="text-4xl font-bold text-gray-800">
                    {inning?.totalRuns || 0}<span className="text-red-500">/{inning?.wickets || 0}</span>
                  </div>
                  <div className="text-gray-600">
                    Overs: {match.currentOver || 0}.{match.currentBall || 0}
                  </div>
                </div>
              )}
            </div>

            {/* Match Status */}
            <div className="text-center">
              <div className="mb-4">
                <div className="text-sm text-gray-600 mb-1">Current Run Rate</div>
                <div className="text-3xl font-bold text-green-600">{getRunRate()}</div>
              </div>
              
              {getRequiredRate() && (
                <div>
                  <div className="text-sm text-gray-600 mb-1">Required Run Rate</div>
                  <div className="text-2xl font-bold text-red-600">{getRequiredRate()}</div>
                </div>
              )}
              
              {match.toss && (
                <div className="mt-4 text-sm">
                  <span className="text-gray-600">Toss: </span>
                  <span className="font-medium">
                    {match.toss.wonBy?.name} chose to {match.toss.decision}
                  </span>
                </div>
              )}
            </div>

            {/* Team 2 */}
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <img 
                  src={match.team2?.logo?.url || '/team-placeholder.png'} 
                  alt={match.team2?.name}
                  className="w-16 h-16 rounded-full"
                />
                <h2 className="text-2xl font-bold ml-4">{match.team2?.name}</h2>
              </div>
              {match.battingTeam?._id === match.team2?._id && (
                <div className="text-center">
                  <div className="text-4xl font-bold text-gray-800">
                    {inning?.totalRuns || 0}<span className="text-red-500">/{inning?.wickets || 0}</span>
                  </div>
                  <div className="text-gray-600">
                    Overs: {match.currentOver || 0}.{match.currentBall || 0}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex space-x-2 border-b border-gray-200">
          {['scorecard', 'commentary', 'graph', 'partnership'].map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`px-6 py-3 font-medium rounded-t-lg ${
                selectedTab === tab
                  ? 'bg-white border-t border-l border-r border-gray-200 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab === 'scorecard' && <FaUsers className="inline mr-2" />}
              {tab === 'commentary' && <FaComment className="inline mr-2" />}
              {tab === 'graph' && <FaChartLine className="inline mr-2" />}
              {tab === 'partnership' && <FaCricketBall className="inline mr-2" />}
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="container mx-auto px-4 py-6">
        {selectedTab === 'scorecard' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold mb-6">Scorecard</h3>
            
            {inning ? (
              <>
                {/* Batting */}
                <div className="mb-8">
                  <h4 className="font-bold text-lg mb-4">Batting - {inning.battingTeam?.name}</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="py-3 px-4 text-left">Batsman</th>
                          <th className="py-3 px-4 text-center">R</th>
                          <th className="py-3 px-4 text-center">B</th>
                          <th className="py-3 px-4 text-center">4s</th>
                          <th className="py-3 px-4 text-center">6s</th>
                          <th className="py-3 px-4 text-center">SR</th>
                          <th className="py-3 px-4 text-left">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {inning.batsmen?.map((batsman, index) => (
                          <tr key={index} className="border-b border-gray-100">
                            <td className="py-3 px-4">
                              <div className="flex items-center">
                                <img 
                                  src={batsman.player?.photo?.url || '/player-placeholder.png'} 
                                  alt={batsman.player?.name}
                                  className="w-8 h-8 rounded-full mr-3"
                                />
                                <div>
                                  <div className="font-medium">{batsman.player?.name}</div>
                                  {batsman.isBatting && (
                                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                      Batting
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-center font-bold">{batsman.runs || 0}</td>
                            <td className="py-3 px-4 text-center">{batsman.balls || 0}</td>
                            <td className="py-3 px-4 text-center">{batsman.fours || 0}</td>
                            <td className="py-3 px-4 text-center">{batsman.sixes || 0}</td>
                            <td className="py-3 px-4 text-center">
                              {batsman.strikeRate ? batsman.strikeRate.toFixed(2) : '0.00'}
                            </td>
                            <td className="py-3 px-4">
                              {batsman.isOut ? (
                                <span className="text-red-600">Out</span>
                              ) : batsman.isBatting ? (
                                <span className="text-green-600">Not Out</span>
                              ) : 'Yet to Bat'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Bowling */}
                <div>
                  <h4 className="font-bold text-lg mb-4">Bowling - {inning.bowlingTeam?.name}</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="py-3 px-4 text-left">Bowler</th>
                          <th className="py-3 px-4 text-center">O</th>
                          <th className="py-3 px-4 text-center">M</th>
                          <th className="py-3 px-4 text-center">R</th>
                          <th className="py-3 px-4 text-center">W</th>
                          <th className="py-3 px-4 text-center">Econ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {inning.bowlers?.map((bowler, index) => (
                          <tr key={index} className="border-b border-gray-100">
                            <td className="py-3 px-4">
                              <div className="flex items-center">
                                <img 
                                  src={bowler.player?.photo?.url || '/player-placeholder.png'} 
                                  alt={bowler.player?.name}
                                  className="w-8 h-8 rounded-full mr-3"
                                />
                                <div className="font-medium">{bowler.player?.name}</div>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-center">{bowler.overs?.toFixed(1) || '0.0'}</td>
                            <td className="py-3 px-4 text-center">{bowler.maidens || 0}</td>
                            <td className="py-3 px-4 text-center">{bowler.runs || 0}</td>
                            <td className="py-3 px-4 text-center font-bold">{bowler.wickets || 0}</td>
                            <td className="py-3 px-4 text-center">
                              {bowler.economy ? bowler.economy.toFixed(2) : '0.00'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-center text-gray-500 py-8">Match has not started yet</p>
            )}
          </div>
        )}

        {selectedTab === 'commentary' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold mb-6">Live Commentary</h3>
            
            <div className="space-y-4 max-h-[500px] overflow-y-auto">
              {commentary.map((comment, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-bold">{comment.over}.{comment.ball}</span>
                      <span className="mx-2">•</span>
                      <span>{comment.commentary}</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(comment.timestamp).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                </div>
              ))}
              
              {commentary.length === 0 && (
                <p className="text-center text-gray-500 py-8">No commentary available yet</p>
              )}
            </div>
            
            {/* Recent Balls */}
            <div className="mt-8">
              <h4 className="font-bold text-lg mb-4">Recent Balls</h4>
              <div className="flex flex-wrap gap-2">
                {balls.slice(0, 12).map((ball, index) => (
                  <div 
                    key={index}
                    className={`px-3 py-2 rounded-lg ${
                      ball.runs === 4 || ball.runs === 6
                        ? 'bg-green-100 text-green-800'
                        : ball.isWicket
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-sm font-bold">
                        {ball.overNumber}.{ball.ballNumber}
                      </div>
                      <div className="text-lg">
                        {ball.isWicket ? 'W' : ball.runs}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'graph' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold mb-6">Run Rate Graph</h3>
            
            {graphData.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={graphData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="ball" 
                      label={{ value: 'Ball Number', position: 'insideBottom', offset: -5 }}
                    />
                    <YAxis 
                      label={{ value: 'Runs', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip 
                      formatter={(value) => [`${value} runs`, 'Cumulative Runs']}
                      labelFormatter={(label) => `Ball ${label}`}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="runs" 
                      stroke="#3B82F6" 
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 6 }}
                      name="Cumulative Runs"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">No data available for graph</p>
            )}
            
            {/* Statistics Summary */}
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">Total Runs</div>
                <div className="text-2xl font-bold">{inning?.totalRuns || 0}</div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">Wickets</div>
                <div className="text-2xl font-bold">{inning?.wickets || 0}</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">Run Rate</div>
                <div className="text-2xl font-bold">{getRunRate()}</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">Overs</div>
                <div className="text-2xl font-bold">
                  {match.currentOver || 0}.{match.currentBall || 0}
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'partnership' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold mb-6">Current Partnership</h3>
            
            {inning?.partnership?.current ? (
              <div className="text-center py-8">
                <div className="text-5xl font-bold text-gray-800 mb-4">
                  {inning.partnership.current.runs || 0}
                  <span className="text-lg text-gray-600 ml-2">runs</span>
                </div>
                <div className="text-gray-600 mb-6">
                  in {inning.partnership.current.balls || 0} balls
                </div>
                
                <div className="flex justify-center space-x-8 mb-8">
                  <div className="text-center">
                    <img 
                      src={inning.partnership.current.player1?.photo?.url || '/player-placeholder.png'} 
                      alt={inning.partnership.current.player1?.name}
                      className="w-20 h-20 rounded-full mx-auto mb-2"
                    />
                    <div className="font-bold">{inning.partnership.current.player1?.name}</div>
                  </div>
                  <div className="flex items-center">
                    <FaArrowRight className="text-gray-400 text-2xl" />
                  </div>
                  <div className="text-center">
                    <img 
                      src={inning.partnership.current.player2?.photo?.url || '/player-placeholder.png'} 
                      alt={inning.partnership.current.player2?.name}
                      className="w-20 h-20 rounded-full mx-auto mb-2"
                    />
                    <div className="font-bold">{inning.partnership.current.player2?.name}</div>
                  </div>
                </div>
                
                {/* Partnership Run Rate */}
                <div className="bg-gray-50 p-4 rounded-lg inline-block">
                  <div className="text-sm text-gray-600">Partnership Run Rate</div>
                  <div className="text-2xl font-bold">
                    {inning.partnership.current.balls > 0 
                      ? ((inning.partnership.current.runs / inning.partnership.current.balls) * 6).toFixed(2)
                      : '0.00'}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">No partnership data available</p>
            )}
            
            {/* Highest Partnership */}
            {inning?.partnership?.highest && inning.partnership.highest.runs > 0 && (
              <div className="mt-8 border-t border-gray-200 pt-6">
                <h4 className="font-bold text-lg mb-4">Highest Partnership</h4>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-2xl font-bold">{inning.partnership.highest.runs} runs</div>
                      <div className="text-gray-600">
                        {inning.partnership.highest.player1?.name} & {inning.partnership.highest.player2?.name}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">for wicket {inning.partnership.highest.wickets}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-wrap justify-center gap-4">
          <a
            href={`/matches/${matchId}`}
            className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 flex items-center"
          >
            <FaHistory className="mr-2" />
            Full Scorecard
          </a>
          {match.status === 'live' && (
            <a
              href={`/admin/live-scoring/${matchId}`}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
            >
              <FaCricketBall className="mr-2" />
              Admin Scoring Panel
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveMatch;