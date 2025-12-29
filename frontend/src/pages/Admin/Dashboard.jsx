import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  FaUsers,
  FaTrophy,
  FaCalendarAlt,
  FaChartLine,
  FaUserPlus,
  FaUserFriends, // Use FaUserFriends instead of FaTeam
  FaBaseballBall // Use this instead of FaCricketBall
} from 'react-icons/fa';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalTeams: 0,
    totalPlayers: 0,
    totalTournaments: 0,
    totalMatches: 0,
    liveMatches: 0,
    upcomingMatches: 0
  });
  const [recentMatches, setRecentMatches] = useState([]);
  const [topPlayers, setTopPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [
        teamsRes,
        playersRes,
        tournamentsRes,
        matchesRes,
        recentMatchesRes,
        topPlayersRes
      ] = await Promise.all([
        axios.get('/api/teams'),
        axios.get('/api/players'),
        axios.get('/api/tournaments'),
        axios.get('/api/matches'),
        axios.get('/api/matches?limit=5'),
        axios.get('/api/players?sortBy=statistics.runs&sortOrder=desc&limit=5')
      ]);

      const matches = matchesRes.data.matches || [];
      const liveMatches = matches.filter(m => 
        m.status === 'live' || m.status === 'inning1' || m.status === 'inning2'
      ).length;
      
      const upcomingMatches = matches.filter(m => 
        m.status === 'scheduled' || m.status === 'toss'
      ).length;

      setStats({
        totalTeams: teamsRes.data.total || 0,
        totalPlayers: playersRes.data.total || 0,
        totalTournaments: tournamentsRes.data.total || 0,
        totalMatches: matches.length || 0,
        liveMatches,
        upcomingMatches
      });

      setRecentMatches(recentMatchesRes.data.matches || []);
      setTopPlayers(topPlayersRes.data.players || []);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Teams',
      value: stats.totalTeams,
      icon: <FaUserFriends className="text-3xl" />, // Changed from FaTeam
      color: 'bg-blue-500',
      link: '/admin/teams'
    },
    {
      title: 'Total Players',
      value: stats.totalPlayers,
      icon: <FaUsers className="text-3xl" />,
      color: 'bg-green-500',
      link: '/admin/players'
    },
    {
      title: 'Tournaments',
      value: stats.totalTournaments,
      icon: <FaTrophy className="text-3xl" />,
      color: 'bg-yellow-500',
      link: '/admin/tournament'
    },
    {
      title: 'Total Matches',
      value: stats.totalMatches,
      icon: <FaCalendarAlt className="text-3xl" />,
      color: 'bg-purple-500',
      link: '#'
    },
    {
      title: 'Live Matches',
      value: stats.liveMatches,
      icon: <FaBaseballBall className="text-3xl" />,
      color: 'bg-red-500',
      link: '#'
    },
    {
      title: 'Upcoming Matches',
      value: stats.upcomingMatches,
      icon: <FaChartLine className="text-3xl" />,
      color: 'bg-indigo-500',
      link: '#'
    }
  ];

  // Sample data for charts
  const matchData = [
    { name: 'Completed', value: stats.totalMatches - stats.liveMatches - stats.upcomingMatches },
    { name: 'Live', value: stats.liveMatches },
    { name: 'Upcoming', value: stats.upcomingMatches }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="text-gray-600">Welcome to Cricket Tournament Management System</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <Link
            key={index}
            to={stat.link}
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-800 mt-2">{stat.value}</p>
              </div>
              <div className={`${stat.color} text-white p-3 rounded-lg`}>
                {stat.icon}
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Matches */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Recent Matches</h2>
            <Link 
              to="/admin/tournament"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View All
            </Link>
          </div>
          
          <div className="space-y-4">
            {recentMatches.map((match) => (
              <div 
                key={match._id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <img 
                          src={match.team1?.logo?.url || '/team-placeholder.png'} 
                          alt={match.team1?.name}
                          className="w-8 h-8 rounded-full"
                        />
                        <span className="ml-2 font-medium">{match.team1?.name}</span>
                      </div>
                      <span className="text-gray-500">vs</span>
                      <div className="flex items-center">
                        <img 
                          src={match.team2?.logo?.url || '/team-placeholder.png'} 
                          alt={match.team2?.name}
                          className="w-8 h-8 rounded-full"
                        />
                        <span className="ml-2 font-medium">{match.team2?.name}</span>
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      <span>{match.venue}</span>
                      <span className="mx-2">•</span>
                      <span>{new Date(match.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      match.status === 'completed' ? 'bg-green-100 text-green-800' :
                      match.status === 'live' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {match.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            
            {recentMatches.length === 0 && (
              <p className="text-center text-gray-500 py-8">No matches found</p>
            )}
          </div>
        </div>

        {/* Top Players */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Top Players</h2>
            <Link 
              to="/admin/players"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View All
            </Link>
          </div>
          
          <div className="space-y-4">
            {topPlayers.map((player, index) => (
              <div 
                key={player._id}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-lg font-bold text-white">
                    {index + 1}
                  </div>
                  <div className="ml-4">
                    <div className="flex items-center">
                      <img 
                        src={player.photo?.url || '/player-placeholder.png'} 
                        alt={player.name}
                        className="w-8 h-8 rounded-full mr-2"
                      />
                      <h3 className="font-medium">{player.name}</h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      {player.team?.name || 'No Team'} • {player.role}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">{player.statistics?.runs || 0}</p>
                  <p className="text-sm text-gray-600">Runs</p>
                </div>
              </div>
            ))}
            
            {topPlayers.length === 0 && (
              <p className="text-center text-gray-500 py-8">No players found</p>
            )}
          </div>
        </div>

        {/* Charts */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Match Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-medium text-gray-700 mb-4">Match Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={matchData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {matchData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-700 mb-4">Quick Actions</h3>
              <div className="space-y-4">
                <Link
                  to="/admin/tournament/create"
                  className="flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                      <FaTrophy className="text-white" />
                    </div>
                    <div className="ml-4">
                      <h4 className="font-medium">Create Tournament</h4>
                      <p className="text-sm text-gray-600">Start a new tournament</p>
                    </div>
                  </div>
                  <span className="text-blue-600">→</span>
                </Link>
                
                <Link
                  to="/admin/teams/create"
                  className="flex items-center justify-between p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                      <FaUserFriends className="text-white" /> {/* Updated */}
                    </div>
                    <div className="ml-4">
                      <h4 className="font-medium">Create Team</h4>
                      <p className="text-sm text-gray-600">Add a new team</p>
                    </div>
                  </div>
                  <span className="text-green-600">→</span>
                </Link>
                
                <Link
                  to="/admin/players/create"
                  className="flex items-center justify-between p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                      <FaUserPlus className="text-white" />
                    </div>
                    <div className="ml-4">
                      <h4 className="font-medium">Add Player</h4>
                      <p className="text-sm text-gray-600">Register new player</p>
                    </div>
                  </div>
                  <span className="text-purple-600">→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;