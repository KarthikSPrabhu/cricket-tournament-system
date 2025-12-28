import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { formatDate, getMatchResult } from '../../utils/helpers';
import { Spinner } from '../../components/Common/Loader';

const Matches = () => {
  const [matches, setMatches] = useState([]);
  const [filteredMatches, setFilteredMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    tournament: 'all',
    team: 'all',
    dateFrom: '',
    dateTo: ''
  });
  const [tournaments, setTournaments] = useState([]);
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterMatches();
  }, [matches, filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [matchesRes, tournamentsRes, teamsRes] = await Promise.all([
        api.get('/matches'),
        api.get('/tournaments'),
        api.get('/teams')
      ]);
      setMatches(matchesRes.data);
      setTournaments(tournamentsRes.data);
      setTeams(teamsRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterMatches = () => {
    let filtered = [...matches];

    if (filters.status !== 'all') {
      filtered = filtered.filter(match => match.status === filters.status);
    }

    if (filters.tournament !== 'all') {
      filtered = filtered.filter(match => match.tournament?._id === filters.tournament);
    }

    if (filters.team !== 'all') {
      filtered = filtered.filter(match => 
        match.team1?._id === filters.team || match.team2?._id === filters.team
      );
    }

    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      filtered = filtered.filter(match => new Date(match.date) >= fromDate);
    }

    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(match => new Date(match.date) <= toDate);
    }

    setFilteredMatches(filtered);
  };

  const getStatusBadge = (status) => {
    const badges = {
      scheduled: 'bg-blue-900 text-blue-300 border-blue-700',
      live: 'bg-red-900 text-red-300 border-red-700',
      completed: 'bg-green-900 text-green-300 border-green-700',
      cancelled: 'bg-gray-800 text-gray-400 border-gray-600'
    };
    return badges[status] || 'bg-gray-800 text-gray-400 border-gray-600';
  };

  const getMatchCardClass = (status) => {
    if (status === 'live') {
      return 'border-l-4 border-red-500 bg-gradient-to-r from-gray-800 to-gray-900';
    }
    if (status === 'completed') {
      return 'border-l-4 border-green-500 bg-gray-800';
    }
    return 'border-l-4 border-blue-500 bg-gray-800';
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
          <h1 className="text-3xl font-bold text-white mb-2">Cricket Matches</h1>
          <p className="text-gray-400">Browse all matches, live scores, and results</p>
        </div>

        {/* Filters */}
        <div className="bg-gray-800/50 rounded-xl p-6 mb-8 backdrop-blur-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
              >
                <option value="all">All Matches</option>
                <option value="scheduled">Scheduled</option>
                <option value="live">Live</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Tournament</label>
              <select
                value={filters.tournament}
                onChange={(e) => setFilters(prev => ({ ...prev, tournament: e.target.value }))}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
              >
                <option value="all">All Tournaments</option>
                {tournaments.map(t => (
                  <option key={t._id} value={t._id}>{t.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Team</label>
              <select
                value={filters.team}
                onChange={(e) => setFilters(prev => ({ ...prev, team: e.target.value }))}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
              >
                <option value="all">All Teams</option>
                {teams.map(t => (
                  <option key={t._id} value={t._id}>{t.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">From Date</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">To Date</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
              />
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button
              onClick={() => setFilters({
                status: 'all',
                tournament: 'all',
                team: 'all',
                dateFrom: '',
                dateTo: ''
              })}
              className="px-4 py-2 text-gray-400 hover:text-white transition"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Matches Grid */}
        <div className="space-y-6">
          {filteredMatches.length > 0 ? (
            filteredMatches.map(match => (
              <div
                key={match._id}
                className={`rounded-xl shadow-lg p-6 ${getMatchCardClass(match.status)}`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(match.status)}`}>
                        {match.status.toUpperCase()}
                      </span>
                      {match.tournament && (
                        <span className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-xs">
                          {match.tournament.name}
                        </span>
                      )}
                    </div>
                    <h2 className="text-xl font-bold text-white">
                      {match.team1?.name} vs {match.team2?.name}
                    </h2>
                    <p className="text-gray-400">
                      {formatDate(match.date)} • {match.venue} • {match.overs} overs
                    </p>
                  </div>
                  <div className="mt-4 md:mt-0">
                    <Link
                      to={`/live/${match._id}`}
                      className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition inline-block"
                    >
                      {match.status === 'live' ? 'Watch Live' : 'View Details'}
                    </Link>
                  </div>
                </div>

                {/* Score Display */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div className="bg-gray-900/50 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-bold text-white">{match.team1?.name}</h3>
                        <p className="text-sm text-gray-400">1st Innings</p>
                      </div>
                      {match.innings1 ? (
                        <div className="text-right">
                          <div className="text-2xl font-bold text-white">
                            {match.innings1.runs}/{match.innings1.wickets}
                          </div>
                          <div className="text-sm text-gray-400">
                            {match.innings1.overs} overs
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400">Yet to bat</span>
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-900/50 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-bold text-white">{match.team2?.name}</h3>
                        <p className="text-sm text-gray-400">2nd Innings</p>
                      </div>
                      {match.innings2 ? (
                        <div className="text-right">
                          <div className="text-2xl font-bold text-white">
                            {match.innings2.runs}/{match.innings2.wickets}
                          </div>
                          <div className="text-sm text-gray-400">
                            {match.innings2.overs} overs
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400">Yet to bat</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Match Result */}
                {match.status === 'completed' && (
                  <div className="mt-4 p-4 bg-green-900/20 border border-green-700 rounded-lg">
                    <p className="text-green-300 font-bold text-center">
                      {getMatchResult(match)}
                    </p>
                  </div>
                )}

                {match.status === 'live' && (
                  <div className="mt-4 flex items-center">
                    <div className="h-2 w-2 bg-red-500 rounded-full animate-ping mr-2"></div>
                    <p className="text-red-400 font-bold">Live in progress</p>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-gray-800/50 rounded-xl">
              <div className="text-5xl mb-4">🏏</div>
              <h3 className="text-xl font-bold text-white mb-2">No matches found</h3>
              <p className="text-gray-400">Try adjusting your filters to find matches</p>
            </div>
          )}
        </div>

        {/* Stats Summary */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-800/50 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-white mb-2">
              {matches.filter(m => m.status === 'scheduled').length}
            </div>
            <p className="text-gray-400">Scheduled Matches</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-white mb-2">
              {matches.filter(m => m.status === 'live').length}
            </div>
            <p className="text-gray-400">Live Matches</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-white mb-2">
              {matches.filter(m => m.status === 'completed').length}
            </div>
            <p className="text-gray-400">Completed Matches</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Matches;