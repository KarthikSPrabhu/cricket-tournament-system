import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSocket } from '../../hooks/useSocket';
import { useTeams } from '../../hooks/useTeams';
import { usePlayers } from '../../hooks/usePlayers';
import api from '../../services/api';
import { Spinner } from '../../components/Common/Loader';

const LiveScoring = () => {
  const [matches, setMatches] = useState([]);
  const [activeMatches, setActiveMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [scoreForm, setScoreForm] = useState({
    runs: 0,
    isWide: false,
    isNoBall: false,
    isWicket: false,
    dismissalType: '',
    batsmanId: '',
    bowlerId: '',
    fielderId: ''
  });
  
  const { socket, joinMatchRoom, leaveMatchRoom } = useSocket();
  const { teams, fetchTeams } = useTeams();
  const { players, fetchPlayers } = usePlayers();

  useEffect(() => {
    fetchMatches();
    fetchTeams();
    fetchPlayers();
    
    if (socket) {
      socket.emit('subscribe-live-matches');
      socket.on('active-matches-list', setActiveMatches);
      
      return () => {
        socket.off('active-matches-list');
      };
    }
  }, [socket]);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const response = await api.get('/matches');
      setMatches(response.data);
    } catch (error) {
      console.error('Failed to fetch matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartScoring = async (matchId) => {
    try {
      await api.put(`/matches/${matchId}`, { status: 'live' });
      fetchMatches();
      if (socket) {
        joinMatchRoom(matchId);
      }
    } catch (error) {
      console.error('Failed to start scoring:', error);
    }
  };

  const handleSubmitBall = async (e) => {
    e.preventDefault();
    if (!selectedMatch) return;

    try {
      const ballData = {
        ...scoreForm,
        matchId: selectedMatch._id
      };
      
      await api.post(`/matches/${selectedMatch._id}/ball`, ballData);
      
      // Reset form
      setScoreForm({
        runs: 0,
        isWide: false,
        isNoBall: false,
        isWicket: false,
        dismissalType: '',
        batsmanId: '',
        bowlerId: '',
        fielderId: ''
      });
    } catch (error) {
      console.error('Failed to submit ball:', error);
    }
  };

  const getMatchBatsmen = (match) => {
    if (!match || !match.team1 || !match.team2) return [];
    return players.filter(p => 
      p.team === match.team1._id || p.team === match.team2._id
    ).filter(p => p.role === 'batsman' || p.role === 'all_rounder' || p.role === 'wicket_keeper');
  };

  const getMatchBowlers = (match) => {
    if (!match || !match.team1 || !match.team2) return [];
    return players.filter(p => 
      p.team === match.team1._id || p.team === match.team2._id
    ).filter(p => p.role === 'bowler' || p.role === 'all_rounder');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-6 shadow-lg">
        <h1 className="text-2xl font-bold text-white mb-2">Live Scoring</h1>
        <p className="text-gray-400">Start and manage live cricket matches</p>
      </div>

      {/* Active Matches */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scheduled Matches */}
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-bold text-white mb-4">Scheduled Matches</h2>
          <div className="space-y-4">
            {matches
              .filter(m => m.status === 'scheduled')
              .map(match => (
                <div key={match._id} className="bg-gray-900/50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-white">{match.team1?.name} vs {match.team2?.name}</h3>
                      <p className="text-sm text-gray-400">
                        {new Date(match.date).toLocaleDateString()} • {match.venue}
                      </p>
                    </div>
                    <button
                      onClick={() => handleStartScoring(match._id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                    >
                      Start Scoring
                    </button>
                  </div>
                </div>
              ))}
            
            {matches.filter(m => m.status === 'scheduled').length === 0 && (
              <p className="text-gray-400 text-center py-4">No scheduled matches</p>
            )}
          </div>
        </div>

        {/* Live Matches */}
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-bold text-white mb-4">Live Matches</h2>
          <div className="space-y-4">
            {matches
              .filter(m => m.status === 'live')
              .map(match => (
                <div key={match._id} className="bg-gray-900/50 rounded-lg p-4 border-l-4 border-green-500">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <div className="flex items-center">
                        <h3 className="font-bold text-white">{match.team1?.name} vs {match.team2?.name}</h3>
                        <span className="ml-2 px-2 py-1 bg-red-600 text-white text-xs rounded-full animate-pulse">
                          LIVE
                        </span>
                      </div>
                      <p className="text-sm text-gray-400">{match.venue}</p>
                    </div>
                    <Link
                      to={`/admin/live-scoring/${match._id}`}
                      className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition"
                    >
                      Score Now
                    </Link>
                  </div>
                  
                  {match.innings1 && (
                    <div className="mt-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-300">{match.team1?.name}</span>
                        <span className="font-bold text-white">
                          {match.innings1.runs}/{match.innings1.wickets} ({match.innings1.overs} overs)
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            
            {matches.filter(m => m.status === 'live').length === 0 && (
              <p className="text-gray-400 text-center py-4">No live matches</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Scoring Panel */}
      {selectedMatch && (
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg mt-6">
          <h2 className="text-xl font-bold text-white mb-4">Quick Scoring: {selectedMatch.team1?.name} vs {selectedMatch.team2?.name}</h2>
          
          <form onSubmit={handleSubmitBall} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Runs */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Runs</label>
                <div className="flex space-x-2">
                  {[0, 1, 2, 3, 4, 6].map(runs => (
                    <button
                      key={runs}
                      type="button"
                      onClick={() => setScoreForm(prev => ({ ...prev, runs }))}
                      className={`flex-1 py-2 rounded-lg transition ${
                        scoreForm.runs === runs
                          ? 'bg-yellow-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {runs}
                    </button>
                  ))}
                </div>
              </div>

              {/* Batsman */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Batsman</label>
                <select
                  value={scoreForm.batsmanId}
                  onChange={(e) => setScoreForm(prev => ({ ...prev, batsmanId: e.target.value }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  required
                >
                  <option value="">Select Batsman</option>
                  {getMatchBatsmen(selectedMatch).map(player => (
                    <option key={player._id} value={player._id}>
                      {player.firstName} {player.lastName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Bowler */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Bowler</label>
                <select
                  value={scoreForm.bowlerId}
                  onChange={(e) => setScoreForm(prev => ({ ...prev, bowlerId: e.target.value }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  required
                >
                  <option value="">Select Bowler</option>
                  {getMatchBowlers(selectedMatch).map(player => (
                    <option key={player._id} value={player._id}>
                      {player.firstName} {player.lastName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Special Balls */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Special</label>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setScoreForm(prev => ({ ...prev, isWide: !prev.isWide, isNoBall: false }))}
                    className={`flex-1 py-2 rounded-lg transition ${
                      scoreForm.isWide
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    Wide
                  </button>
                  <button
                    type="button"
                    onClick={() => setScoreForm(prev => ({ ...prev, isNoBall: !prev.isNoBall, isWide: false }))}
                    className={`flex-1 py-2 rounded-lg transition ${
                      scoreForm.isNoBall
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    No Ball
                  </button>
                </div>
              </div>
            </div>

            {/* Wicket Options */}
            {scoreForm.isWicket && (
              <div className="bg-gray-900/50 p-4 rounded-lg">
                <label className="block text-sm font-medium text-gray-300 mb-2">Dismissal Type</label>
                <select
                  value={scoreForm.dismissalType}
                  onChange={(e) => setScoreForm(prev => ({ ...prev, dismissalType: e.target.value }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                >
                  <option value="">Select dismissal</option>
                  <option value="bowled">Bowled</option>
                  <option value="caught">Caught</option>
                  <option value="lbw">LBW</option>
                  <option value="run_out">Run Out</option>
                  <option value="stumped">Stumped</option>
                </select>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setScoreForm(prev => ({ ...prev, isWicket: !prev.isWicket }))}
                className={`px-4 py-2 rounded-lg transition ${
                  scoreForm.isWicket
                    ? 'bg-red-700 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {scoreForm.isWicket ? 'Cancel Wicket' : 'Add Wicket'}
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                Submit Ball
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default LiveScoring;