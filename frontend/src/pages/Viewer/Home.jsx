import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useMatch } from '../../context/MatchContext';
import axios from 'axios';
import {
  FaBaseballBall, // Changed from FaCricketBall
  FaTrophy,
  FaUsers,
  FaChartLine,
  FaPlay,
  FaCalendarAlt,
  FaFire
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';

const Home = () => {
  const { liveMatches, upcomingMatches } = useMatch();
  const [tournaments, setTournaments] = useState([]);
  const [topPlayers, setTopPlayers] = useState([]);
  const [stats, setStats] = useState({
    totalTeams: 0,
    totalPlayers: 0,
    totalMatches: 0,
    liveMatches: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      const [
        tournamentsRes,
        playersRes,
        teamsRes,
        matchesRes
      ] = await Promise.all([
        axios.get('/api/tournaments?limit=3'),
        axios.get('/api/players?sortBy=statistics.runs&sortOrder=desc&limit=5'),
        axios.get('/api/teams'),
        axios.get('/api/matches')
      ]);

      setTournaments(tournamentsRes.data.tournaments || []);
      setTopPlayers(playersRes.data.players || []);
      
      const matches = matchesRes.data.matches || [];
      const liveMatchCount = matches.filter(m => 
        m.status === 'live' || m.status === 'inning1' || m.status === 'inning2'
      ).length;

      setStats({
        totalTeams: teamsRes.data.total || 0,
        totalPlayers: playersRes.data.total || 0,
        totalMatches: matches.length || 0,
        liveMatches: liveMatchCount
      });
    } catch (error) {
      console.error('Failed to fetch home data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Live Matches',
      value: stats.liveMatches,
      icon: <FaFire className="text-3xl" />,
      color: 'from-red-500 to-orange-500',
      delay: 0.1
    },
    {
      title: 'Total Teams',
      value: stats.totalTeams,
      icon: <FaUsers className="text-3xl" />,
      color: 'from-blue-500 to-cyan-500',
      delay: 0.2
    },
    {
      title: 'Total Players',
      value: stats.totalPlayers,
      icon: <FaBaseballBall className="text-3xl" />, // Changed
      color: 'from-green-500 to-emerald-500',
      delay: 0.3
    },
    {
      title: 'Total Matches',
      value: stats.totalMatches,
      icon: <FaChartLine className="text-3xl" />,
      color: 'from-purple-500 to-pink-500',
      delay: 0.4
    }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-900 to-indigo-800 text-white">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative container mx-auto px-4 py-24">
          <div className="max-w-3xl">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-5xl md:text-6xl font-bold mb-6"
            >
              Cricket Tournament
              <span className="block text-yellow-400">Management System</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl mb-8 text-gray-200"
            >
              Experience live scoring, real-time statistics, and comprehensive tournament management
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap gap-4"
            >
              <Link
                to="/live-match"
                className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold px-8 py-3 rounded-lg flex items-center"
              >
                <FaPlay className="mr-2" />
                Watch Live Matches
              </Link>
              <Link
                to="/matches"
                className="bg-transparent border-2 border-white hover:bg-white hover:text-gray-900 font-bold px-8 py-3 rounded-lg"
              >
                View All Matches
              </Link>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="container mx-auto px-4 py-12 -mt-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: stat.delay }}
              className="bg-white rounded-xl shadow-xl p-6"
            >
              <div className={`w-16 h-16 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center text-white mb-4`}>
                {stat.icon}
              </div>
              <h3 className="text-3xl font-bold text-gray-800 mb-2">
                <CountUp end={stat.value} duration={2} />
              </h3>
              <p className="text-gray-600">{stat.title}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Live Matches Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">
            <FaFire className="inline mr-3 text-red-500" />
            Live Matches
          </h2>
          <Link
            to="/matches?status=live"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            View All →
          </Link>
        </div>

        {liveMatches.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {liveMatches.slice(0, 2).map((match) => (
              <div 
                key={match._id}
                className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-red-100"
              >
                <div className="bg-red-50 p-4 border-b">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse mr-2"></div>
                      <span className="font-bold text-red-600">LIVE NOW</span>
                    </div>
                    <span className="text-gray-600 text-sm">
                      {match.venue} • {new Date(match.date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex justify-between items-center">
                    <div className="text-center">
                      <img 
                        src={match.team1?.logo?.url || '/team-placeholder.png'} 
                        alt={match.team1?.name}
                        className="w-20 h-20 mx-auto mb-2"
                      />
                      <h3 className="font-bold text-lg">{match.team1?.name}</h3>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-4xl font-bold text-gray-800">VS</div>
                      <div className="text-sm text-gray-600 mt-2">T20 Match</div>
                    </div>
                    
                    <div className="text-center">
                      <img 
                        src={match.team2?.logo?.url || '/team-placeholder.png'} 
                        alt={match.team2?.name}
                        className="w-20 h-20 mx-auto mb-2"
                      />
                      <h3 className="font-bold text-lg">{match.team2?.name}</h3>
                    </div>
                  </div>
                  
                  <div className="mt-8 text-center">
                    <div className="text-3xl font-bold text-gray-800 mb-2">
                      {match.currentInning?.totalRuns || 0}/{match.currentInning?.wickets || 0}
                    </div>
                    <p className="text-gray-600">
                      Overs: {match.currentOver || 0}.{match.currentBall || 0}
                    </p>
                  </div>
                  
                  <div className="mt-6">
                    <Link
                      to={`/live-match/${match._id}`}
                      className="block w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg text-center"
                    >
                      Watch Live
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl shadow-lg">
            <FaCalendarAlt className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-700 mb-2">No Live Matches</h3>
            <p className="text-gray-600">Check back later for live action</p>
          </div>
        )}
      </div>

      {/* Upcoming Matches & Tournaments */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upcoming Matches */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                <FaCalendarAlt className="inline mr-3 text-blue-500" />
                Upcoming Matches
              </h2>
              <Link
                to="/matches"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                View All →
              </Link>
            </div>
            
            <div className="space-y-4">
              {upcomingMatches.slice(0, 3).map((match) => (
                <Link
                  key={match._id}
                  to={`/matches/${match._id}`}
                  className="block border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-center">
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
                    <div className="text-right">
                      <div className="font-medium">
                        {new Date(match.date).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-600">{match.venue}</div>
                    </div>
                  </div>
                </Link>
              ))}
              
              {upcomingMatches.length === 0 && (
                <p className="text-center text-gray-500 py-8">No upcoming matches</p>
              )}
            </div>
          </div>

          {/* Active Tournaments */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                <FaTrophy className="inline mr-3 text-yellow-500" />
                Active Tournaments
              </h2>
              <Link
                to="/tournaments"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                View All →
              </Link>
            </div>
            
            <div className="space-y-4">
              {tournaments.map((tournament) => (
                <div 
                  key={tournament._id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg">{tournament.name}</h3>
                      <p className="text-gray-600">{tournament.season}</p>
                      <div className="flex items-center mt-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          tournament.status === 'ongoing' ? 'bg-green-100 text-green-800' :
                          tournament.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {tournament.status}
                        </span>
                        <span className="ml-3 text-sm text-gray-600">
                          {tournament.teams?.length || 0} Teams
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">
                        {new Date(tournament.startDate).toLocaleDateString()} - 
                        {new Date(tournament.endDate).toLocaleDateString()}
                      </div>
                      <Link
                        to={`/tournaments/${tournament._id}`}
                        className="inline-block mt-2 text-blue-600 hover:text-blue-800 font-medium"
                      >
                        View Details →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
              
              {tournaments.length === 0 && (
                <p className="text-center text-gray-500 py-8">No active tournaments</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Top Players Section */}
      <div className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Top Performers
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {topPlayers.map((player, index) => (
              <div 
                key={player._id}
                className="bg-gray-800 rounded-xl p-6 text-center hover:bg-gray-700 transition-colors"
              >
                <div className="relative inline-block mb-4">
                  <img 
                    src={player.photo?.url || '/player-placeholder.png'} 
                    alt={player.name}
                    className="w-24 h-24 rounded-full border-4 border-yellow-500"
                  />
                  <div className="absolute -top-2 -right-2 w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center font-bold">
                    #{index + 1}
                  </div>
                </div>
                
                <h3 className="font-bold text-xl mb-1">{player.name}</h3>
                <p className="text-gray-400 text-sm mb-4">{player.team?.name || 'Free Agent'}</p>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Runs</span>
                    <span className="font-bold">{player.statistics?.runs || 0}</span>
                  </div>
                  {player.role !== 'batsman' && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Wickets</span>
                      <span className="font-bold">{player.statistics?.wickets || 0}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-400">Matches</span>
                    <span className="font-bold">{player.statistics?.matches || 0}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-4xl font-bold text-gray-800 mb-6">
          Ready to Experience Cricket Like Never Before?
        </h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Join thousands of cricket enthusiasts following live matches, tracking statistics, and staying updated with tournament progress.
        </p>
        <div className="space-x-4">
          <Link
            to="/matches"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-lg"
          >
            Explore Matches
          </Link>
          <Link
            to="/leaderboard"
            className="inline-block border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-bold px-8 py-3 rounded-lg"
          >
            View Leaderboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;