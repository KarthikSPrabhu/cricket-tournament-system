import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Spinner } from '../../components/Common/Loader';
import { calculateStrikeRate, calculateEconomy } from '../../utils/helpers';

const Players = () => {
  const [players, setPlayers] = useState([]);
  const [filteredPlayers, setFilteredPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    role: 'all',
    team: 'all',
    country: 'all'
  });
  const [teams, setTeams] = useState([]);
  const [countries] = useState(['India', 'Australia', 'England', 'Pakistan', 'South Africa', 'New Zealand', 'Sri Lanka', 'Bangladesh']);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterAndSearchPlayers();
  }, [players, searchTerm, filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [playersRes, teamsRes] = await Promise.all([
        api.get('/players'),
        api.get('/teams')
      ]);
      
      // Add mock statistics for demonstration
      const playersWithStats = playersRes.data.map(player => ({
        ...player,
        matches: Math.floor(Math.random() * 50) + 10,
        runs: player.role !== 'bowler' ? Math.floor(Math.random() * 2000) + 100 : Math.floor(Math.random() * 200),
        wickets: player.role !== 'batsman' ? Math.floor(Math.random() * 100) + 10 : Math.floor(Math.random() * 10),
        average: (Math.random() * 50 + 20).toFixed(2),
        strikeRate: calculateStrikeRate(Math.floor(Math.random() * 2000) + 100, Math.floor(Math.random() * 1500) + 100),
        economy: calculateEconomy(Math.floor(Math.random() * 800) + 100, Math.floor(Math.random() * 100) + 20),
        bestBowling: player.role !== 'batsman' ? `${Math.floor(Math.random() * 6)}/${Math.floor(Math.random() * 40)}` : null,
        highestScore: player.role !== 'bowler' ? Math.floor(Math.random() * 150) + 50 : null,
        centuries: player.role !== 'bowler' ? Math.floor(Math.random() * 10) : 0,
        fifties: player.role !== 'bowler' ? Math.floor(Math.random() * 20) : 0
      }));

      setPlayers(playersWithStats);
      setTeams(teamsRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSearchPlayers = () => {
    let filtered = [...players];

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(player =>
        `${player.firstName} ${player.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        player.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        player.battingStyle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        player.bowlingStyle?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply filters
    if (filters.role !== 'all') {
      filtered = filtered.filter(player => player.role === filters.role);
    }

    if (filters.team !== 'all') {
      filtered = filtered.filter(player => player.team?._id === filters.team);
    }

    if (filters.country !== 'all') {
      filtered = filtered.filter(player => player.country === filters.country);
    }

    setFilteredPlayers(filtered);
  };

  const getRoleColor = (role) => {
    const colors = {
      batsman: 'bg-green-900/30 text-green-400 border-green-700',
      bowler: 'bg-blue-900/30 text-blue-400 border-blue-700',
      all_rounder: 'bg-yellow-900/30 text-yellow-400 border-yellow-700',
      wicket_keeper: 'bg-purple-900/30 text-purple-400 border-purple-700'
    };
    return colors[role] || 'bg-gray-800 text-gray-400 border-gray-600';
  };

  const getRoleLabel = (role) => {
    const labels = {
      batsman: 'Batsman',
      bowler: 'Bowler',
      all_rounder: 'All Rounder',
      wicket_keeper: 'Wicket Keeper'
    };
    return labels[role] || role;
  };

  const getPlayerStats = (player) => {
    if (player.role === 'batsman' || player.role === 'wicket_keeper' || player.role === 'all_rounder') {
      return {
        primary: player.runs,
        primaryLabel: 'Runs',
        secondary: player.average,
        secondaryLabel: 'Avg',
        tertiary: player.strikeRate,
        tertiaryLabel: 'SR'
      };
    } else if (player.role === 'bowler') {
      return {
        primary: player.wickets,
        primaryLabel: 'Wickets',
        secondary: player.average,
        secondaryLabel: 'Avg',
        tertiary: player.economy,
        tertiaryLabel: 'Econ'
      };
    }
    return { primary: 0, primaryLabel: '', secondary: 0, secondaryLabel: '', tertiary: 0, tertiaryLabel: '' };
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
          <h1 className="text-3xl font-bold text-white mb-2">Players Directory</h1>
          <p className="text-gray-400">Browse all cricket players and their statistics</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-gray-800/50 rounded-xl p-6 mb-8 backdrop-blur-sm">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search players by name, role, or style..."
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 pl-12 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Role Filter */}
            <div>
              <select
                value={filters.role}
                onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-3 text-white"
              >
                <option value="all">All Roles</option>
                <option value="batsman">Batsman</option>
                <option value="bowler">Bowler</option>
                <option value="all_rounder">All Rounder</option>
                <option value="wicket_keeper">Wicket Keeper</option>
              </select>
            </div>

            {/* Team Filter */}
            <div>
              <select
                value={filters.team}
                onChange={(e) => setFilters(prev => ({ ...prev, team: e.target.value }))}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-3 text-white"
              >
                <option value="all">All Teams</option>
                {teams.map(team => (
                  <option key={team._id} value={team._id}>{team.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Additional Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div>
              <select
                value={filters.country}
                onChange={(e) => setFilters(prev => ({ ...prev, country: e.target.value }))}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-3 text-white"
              >
                <option value="all">All Countries</option>
                {countries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2 flex items-center justify-end space-x-4">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilters({ role: 'all', team: 'all', country: 'all' });
                }}
                className="px-4 py-2 text-gray-400 hover:text-white transition"
              >
                Clear Filters
              </button>
              <div className="text-gray-400">
                Showing {filteredPlayers.length} of {players.length} players
              </div>
            </div>
          </div>
        </div>

        {/* Players Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPlayers.map(player => {
            const stats = getPlayerStats(player);
            return (
              <div
                key={player._id}
                className="bg-gray-800/50 rounded-xl p-6 hover:bg-gray-800/70 transition border border-gray-700 backdrop-blur-sm"
              >
                {/* Player Header */}
                <div className="flex items-start space-x-4 mb-4">
                  <div className="relative">
                    <div className="h-20 w-20 rounded-full border-2 border-yellow-500 overflow-hidden bg-gray-700">
                      {player.profileImage ? (
                        <img
                          src={player.profileImage}
                          alt={`${player.firstName} ${player.lastName}`}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-2xl text-gray-400">
                          {player.firstName[0]}{player.lastName[0]}
                        </div>
                      )}
                    </div>
                    <div className={`absolute -bottom-1 -right-1 px-2 py-1 rounded-full text-xs font-medium border ${getRoleColor(player.role)}`}>
                      {getRoleLabel(player.role)}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white">
                      {player.firstName} {player.lastName}
                    </h3>
                    <div className="flex items-center space-x-2 mt-1">
                      {player.team?.logo ? (
                        <img
                          src={player.team.logo}
                          alt={player.team.name}
                          className="h-6 w-6 rounded-full"
                        />
                      ) : (
                        <div className="h-6 w-6 rounded-full bg-gray-700 flex items-center justify-center text-xs">
                          {player.team?.shortName?.[0]}
                        </div>
                      )}
                      <span className="text-gray-300">{player.team?.name}</span>
                    </div>
                    <div className="text-gray-400 text-sm mt-1">
                      {player.country} • Age: {player.age || 'N/A'}
                    </div>
                  </div>
                </div>

                {/* Player Styles */}
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {player.battingStyle && (
                      <span className="px-3 py-1 bg-green-900/30 text-green-400 rounded-full text-sm">
                        {player.battingStyle}
                      </span>
                    )}
                    {player.bowlingStyle && (
                      <span className="px-3 py-1 bg-blue-900/30 text-blue-400 rounded-full text-sm">
                        {player.bowlingStyle}
                      </span>
                    )}
                  </div>
                </div>

                {/* Statistics */}
                <div className="bg-gray-900/50 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-white">{stats.primary}</div>
                      <div className="text-xs text-gray-400">{stats.primaryLabel}</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">{stats.secondary}</div>
                      <div className="text-xs text-gray-400">{stats.secondaryLabel}</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">{stats.tertiary}</div>
                      <div className="text-xs text-gray-400">{stats.tertiaryLabel}</div>
                    </div>
                  </div>
                </div>

                {/* Additional Stats */}
                <div className="text-sm text-gray-400 space-y-1">
                  <div className="flex justify-between">
                    <span>Matches</span>
                    <span className="text-white">{player.matches}</span>
                  </div>
                  {player.highestScore && (
                    <div className="flex justify-between">
                      <span>Highest Score</span>
                      <span className="text-white">{player.highestScore}</span>
                    </div>
                  )}
                  {player.bestBowling && (
                    <div className="flex justify-between">
                      <span>Best Bowling</span>
                      <span className="text-white">{player.bestBowling}</span>
                    </div>
                  )}
                  {player.centuries > 0 && (
                    <div className="flex justify-between">
                      <span>Centuries</span>
                      <span className="text-white">{player.centuries}</span>
                    </div>
                  )}
                  {player.fifties > 0 && (
                    <div className="flex justify-between">
                      <span>Half Centuries</span>
                      <span className="text-white">{player.fifties}</span>
                    </div>
                  )}
                </div>

                {/* View Details Button */}
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <Link
                    to={`/players/${player._id}`}
                    className="block w-full text-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition"
                  >
                    View Profile
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* No Results */}
        {filteredPlayers.length === 0 && (
          <div className="text-center py-12 bg-gray-800/50 rounded-xl">
            <div className="text-5xl mb-4">👤</div>
            <h3 className="text-xl font-bold text-white mb-2">No players found</h3>
            <p className="text-gray-400">Try adjusting your search or filters</p>
          </div>
        )}

        {/* Stats Summary */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-white">
              {players.filter(p => p.role === 'batsman').length}
            </div>
            <div className="text-gray-400">Batsmen</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-white">
              {players.filter(p => p.role === 'bowler').length}
            </div>
            <div className="text-gray-400">Bowlers</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-white">
              {players.filter(p => p.role === 'all_rounder').length}
            </div>
            <div className="text-gray-400">All Rounders</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-white">
              {players.filter(p => p.role === 'wicket_keeper').length}
            </div>
            <div className="text-gray-400">Wicket Keepers</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Players;