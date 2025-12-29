import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer
} from 'recharts';
import api from '../../services/api';
import { Spinner } from '../../components/Common/Loader';
import { calculateStrikeRate, calculateEconomy, calculateAverage } from '../../utils/helpers';

const Statistics = () => {
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState([]);
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTournament, setSelectedTournament] = useState('all');
  const [tournaments, setTournaments] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [matchesRes, playersRes, teamsRes, tournamentsRes] = await Promise.all([
        api.get('/matches'),
        api.get('/players'),
        api.get('/teams'),
        api.get('/tournaments')
      ]);

      // Transform data with mock statistics
      const matchesWithStats = matchesRes.data.map(match => ({
        ...match,
        totalRuns: (match.innings1?.runs || 0) + (match.innings2?.runs || 0),
        totalWickets: (match.innings1?.wickets || 0) + (match.innings2?.wickets || 0),
        totalSixes: Math.floor(Math.random() * 20),
        totalFours: Math.floor(Math.random() * 40),
        totalExtras: Math.floor(Math.random() * 30)
      }));

      const playersWithStats = playersRes.data.map(player => ({
        ...player,
        runs: player.role !== 'bowler' ? Math.floor(Math.random() * 2000) + 100 : Math.floor(Math.random() * 200),
        wickets: player.role !== 'batsman' ? Math.floor(Math.random() * 100) + 10 : Math.floor(Math.random() * 10),
        matches: Math.floor(Math.random() * 50) + 10,
        average: calculateAverage(Math.floor(Math.random() * 2000) + 100, Math.floor(Math.random() * 30) + 5),
        strikeRate: calculateStrikeRate(Math.floor(Math.random() * 2000) + 100, Math.floor(Math.random() * 1500) + 100),
        economy: calculateEconomy(Math.floor(Math.random() * 800) + 100, Math.floor(Math.random() * 100) + 20)
      }));

      const teamsWithStats = teamsRes.data.map(team => ({
        ...team,
        matchesPlayed: Math.floor(Math.random() * 30) + 5,
        matchesWon: Math.floor(Math.random() * 20) + 1,
        matchesLost: Math.floor(Math.random() * 15) + 1,
        totalRuns: Math.floor(Math.random() * 5000) + 1000,
        totalWickets: Math.floor(Math.random() * 200) + 50,
        netRunRate: (Math.random() * 2 - 1).toFixed(2),
        winPercentage: ((Math.floor(Math.random() * 20) + 1) / (Math.floor(Math.random() * 30) + 5) * 100).toFixed(1)
      }));

      setMatches(matchesWithStats);
      setPlayers(playersWithStats);
      setTeams(teamsWithStats);
      setTournaments(tournamentsRes.data);
    } catch (error) {
      console.error('Failed to fetch statistics data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Chart Data Preparation
  const getMatchResultsData = () => {
    const completedMatches = matches.filter(m => m.status === 'completed');
    const results = {
      'Team 1 Wins': completedMatches.filter(m => m.innings1?.runs > m.innings2?.runs).length,
      'Team 2 Wins': completedMatches.filter(m => m.innings2?.runs > m.innings1?.runs).length,
      'Tied': completedMatches.filter(m => m.innings1?.runs === m.innings2?.runs).length,
    };
    return Object.entries(results).map(([name, value]) => ({ name, value }));
  };

  const getRunsDistributionData = () => {
    const ranges = [
      { range: '0-100', count: 0 },
      { range: '101-200', count: 0 },
      { range: '201-300', count: 0 },
      { range: '301-400', count: 0 },
      { range: '401+', count: 0 }
    ];
    
    matches.forEach(match => {
      const totalRuns = match.totalRuns || 0;
      if (totalRuns <= 100) ranges[0].count++;
      else if (totalRuns <= 200) ranges[1].count++;
      else if (totalRuns <= 300) ranges[2].count++;
      else if (totalRuns <= 400) ranges[3].count++;
      else ranges[4].count++;
    });
    
    return ranges;
  };

  const getPlayerRolesData = () => {
    const roles = {
      'Batsman': players.filter(p => p.role === 'batsman').length,
      'Bowler': players.filter(p => p.role === 'bowler').length,
      'All Rounder': players.filter(p => p.role === 'all_rounder').length,
      'Wicket Keeper': players.filter(p => p.role === 'wicket_keeper').length
    };
    return Object.entries(roles).map(([name, value]) => ({ name, value }));
  };

  const getTeamPerformanceData = () => {
    return teams.map(team => ({
      name: team.shortName,
      matches: team.matchesPlayed,
      wins: team.matchesWon,
      winRate: parseFloat(team.winPercentage)
    })).slice(0, 8);
  };

  const getTopBatsmenData = () => {
    return players
      .filter(p => p.role === 'batsman' || p.role === 'all_rounder' || p.role === 'wicket_keeper')
      .sort((a, b) => (b.runs || 0) - (a.runs || 0))
      .slice(0, 5)
      .map(player => ({
        name: `${player.firstName} ${player.lastName}`.slice(0, 10),
        runs: player.runs || 0,
        average: parseFloat(player.average) || 0
      }));
  };

  const getTopBowlersData = () => {
    return players
      .filter(p => p.role === 'bowler' || p.role === 'all_rounder')
      .sort((a, b) => (b.wickets || 0) - (a.wickets || 0))
      .slice(0, 5)
      .map(player => ({
        name: `${player.firstName} ${player.lastName}`.slice(0, 10),
        wickets: player.wickets || 0,
        economy: parseFloat(player.economy) || 0
      }));
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  const PieChartTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-700 p-3 rounded-lg shadow-lg">
          <p className="text-white font-medium">{payload[0].name}</p>
          <p className="text-gray-300">{payload[0].value} matches</p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Statistics & Analytics</h1>
          <p className="text-gray-400">Comprehensive cricket statistics and visualizations</p>
        </div>

        {/* Tabs and Filters */}
        <div className="bg-gray-800/50 rounded-xl p-6 mb-8 backdrop-blur-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {['overview', 'players', 'teams', 'matches', 'advanced'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2 rounded-lg font-medium transition whitespace-nowrap ${
                    activeTab === tab
                      ? 'bg-yellow-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={selectedTournament}
                onChange={(e) => setSelectedTournament(e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
              >
                <option value="all">All Tournaments</option>
                {tournaments.map(t => (
                  <option key={t._id} value={t._id}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Stats Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800/50 rounded-xl p-6">
            <div className="text-3xl font-bold text-white mb-2">{matches.length}</div>
            <div className="text-gray-400">Total Matches</div>
            <div className="text-sm text-gray-500 mt-2">
              {matches.filter(m => m.status === 'completed').length} completed
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-6">
            <div className="text-3xl font-bold text-white mb-2">{players.length}</div>
            <div className="text-gray-400">Total Players</div>
            <div className="text-sm text-gray-500 mt-2">
              {players.filter(p => p.role === 'batsman').length} batsmen
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-6">
            <div className="text-3xl font-bold text-white mb-2">{teams.length}</div>
            <div className="text-gray-400">Total Teams</div>
            <div className="text-sm text-gray-500 mt-2">
              Avg {Math.round(teams.reduce((acc, t) => acc + (t.matchesPlayed || 0), 0) / teams.length)} matches/team
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-6">
            <div className="text-3xl font-bold text-white mb-2">
              {matches.reduce((acc, m) => acc + (m.totalRuns || 0), 0).toLocaleString()}
            </div>
            <div className="text-gray-400">Total Runs</div>
            <div className="text-sm text-gray-500 mt-2">
              Avg {Math.round(matches.reduce((acc, m) => acc + (m.totalRuns || 0), 0) / matches.length)} runs/match
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Match Results Pie Chart */}
          <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm">
            <h3 className="text-xl font-bold text-white mb-4">Match Results Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={getMatchResultsData()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {getMatchResultsData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieChartTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Runs Distribution Bar Chart */}
          <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm">
            <h3 className="text-xl font-bold text-white mb-4">Total Runs Distribution per Match</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getRunsDistributionData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="range" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151' }}
                    labelStyle={{ color: '#D1D5DB' }}
                  />
                  <Legend />
                  <Bar dataKey="count" name="Number of Matches" fill="#F59E0B" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Player Roles Pie Chart */}
          <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm">
            <h3 className="text-xl font-bold text-white mb-4">Player Roles Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={getPlayerRolesData()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {getPlayerRolesData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieChartTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Team Performance Line Chart */}
          <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm">
            <h3 className="text-xl font-bold text-white mb-4">Team Win Rates</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={getTeamPerformanceData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151' }}
                    labelStyle={{ color: '#D1D5DB' }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="winRate" name="Win Rate %" stroke="#10B981" strokeWidth={2} />
                  <Line type="monotone" dataKey="wins" name="Wins" stroke="#3B82F6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Batsmen Bar Chart */}
          <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm">
            <h3 className="text-xl font-bold text-white mb-4">Top Batsmen (Runs)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getTopBatsmenData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151' }}
                    labelStyle={{ color: '#D1D5DB' }}
                  />
                  <Legend />
                  <Bar dataKey="runs" name="Runs" fill="#F59E0B" />
                  <Bar dataKey="average" name="Average" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Bowlers Bar Chart */}
          <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm">
            <h3 className="text-xl font-bold text-white mb-4">Top Bowlers (Wickets)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getTopBowlersData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151' }}
                    labelStyle={{ color: '#D1D5DB' }}
                  />
                  <Legend />
                  <Bar dataKey="wickets" name="Wickets" fill="#3B82F6" />
                  <Bar dataKey="economy" name="Economy" fill="#EF4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Additional Statistics */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-800/50 rounded-xl p-6">
            <h4 className="text-lg font-bold text-white mb-4">Match Statistics</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Highest Team Total</span>
                <span className="text-white">428/5</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Lowest Team Total</span>
                <span className="text-white">49</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Highest Run Chase</span>
                <span className="text-white">387</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Average Total</span>
                <span className="text-white">268</span>
              </div>
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-6">
            <h4 className="text-lg font-bold text-white mb-4">Player Records</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Highest Individual Score</span>
                <span className="text-white">264*</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Best Bowling Figures</span>
                <span className="text-white">8/19</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Most Sixes in Match</span>
                <span className="text-white">17</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Fastest Century</span>
                <span className="text-white">31 balls</span>
              </div>
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-6">
            <h4 className="text-lg font-bold text-white mb-4">Tournament Stats</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Most Tournament Wins</span>
                <span className="text-white">Mumbai Indians (5)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Most Final Appearances</span>
                <span className="text-white">Chennai Super Kings (10)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Highest Partnership</span>
                <span className="text-white">229 runs</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Most Matches as Captain</span>
                <span className="text-white">MS Dhoni (210)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;