import React from 'react';
import { useLiveMatch } from '../../hooks/useLiveMatch';
import { formatOvers, getTeamScoreDisplay } from '../../utils/helpers';
import { Spinner } from '../Common/Loader';

const LiveScore = ({ matchId }) => {
  const { match, loading, error } = useLiveMatch(matchId);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="bg-yellow-900/20 border border-yellow-500 rounded-lg p-4">
        <p className="text-yellow-400">Match not found</p>
      </div>
    );
  }

  const { team1, team2, innings1, innings2, currentInnings, toss, venue, status } = match;
  const isLive = status === 'live';
  const currentBatting = currentInnings === 1 ? team1 : team2;
  const currentBowling = currentInnings === 1 ? team2 : team1;

  return (
    <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-700">
      {/* Match Header */}
      <div className="bg-gradient-to-r from-gray-900 to-blue-900 p-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-white">{team1?.name} vs {team2?.name}</h2>
            <p className="text-gray-400 text-sm">{venue} • {isLive ? 'LIVE' : match.status}</p>
          </div>
          {isLive && (
            <div className="flex items-center">
              <div className="h-3 w-3 bg-red-500 rounded-full animate-ping mr-2"></div>
              <span className="text-red-400 font-bold">LIVE</span>
            </div>
          )}
        </div>
      </div>

      {/* Toss Info */}
      {toss && (
        <div className="px-4 pt-3">
          <p className="text-sm text-gray-400">
            {toss.winner?.name} won the toss and chose to {toss.decision}
          </p>
        </div>
      )}

      {/* Score Cards */}
      <div className="p-4 space-y-4">
        {/* Team 1 */}
        <div className="bg-gray-900/50 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center">
              <span className="font-bold text-white">{team1?.name}</span>
              {currentInnings === 1 && (
                <span className="ml-2 text-xs bg-yellow-500 text-black px-2 py-1 rounded">Batting</span>
              )}
            </div>
            {innings1 ? (
              <div className="text-right">
                <div className="text-2xl font-bold text-white">
                  {innings1.runs}/{innings1.wickets}
                </div>
                <div className="text-sm text-gray-400">
                  {formatOvers(innings1.overs)} overs
                </div>
              </div>
            ) : (
              <span className="text-gray-400">Yet to bat</span>
            )}
          </div>
        </div>

        {/* Team 2 */}
        <div className="bg-gray-900/50 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center">
              <span className="font-bold text-white">{team2?.name}</span>
              {currentInnings === 2 && (
                <span className="ml-2 text-xs bg-yellow-500 text-black px-2 py-1 rounded">Batting</span>
              )}
            </div>
            {innings2 ? (
              <div className="text-right">
                <div className="text-2xl font-bold text-white">
                  {innings2.runs}/{innings2.wickets}
                </div>
                <div className="text-sm text-gray-400">
                  {formatOvers(innings2.overs)} overs
                </div>
              </div>
            ) : (
              <span className="text-gray-400">Yet to bat</span>
            )}
          </div>
        </div>
      </div>

      {/* Current Situation */}
      {isLive && currentInnings && (
        <div className="border-t border-gray-700 p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-400">Current Run Rate</p>
              <p className="text-lg font-bold text-white">
                {currentInnings === 1 
                  ? ((innings1?.runs || 0) / (innings1?.overs || 1)).toFixed(2)
                  : ((innings2?.runs || 0) / (innings2?.overs || 1)).toFixed(2)
                }
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Required Run Rate</p>
              <p className="text-lg font-bold text-white">
                {currentInnings === 2 && innings1?.runs 
                  ? ((innings1.runs - (innings2?.runs || 0)) / (20 - (innings2?.overs || 0))).toFixed(2)
                  : '-'
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Match Status */}
      <div className="border-t border-gray-700 p-4 bg-gray-900/30">
        <p className="text-center text-gray-300">
          {status === 'scheduled' && 'Match scheduled'}
          {status === 'live' && 'Match in progress'}
          {status === 'completed' && 'Match completed'}
        </p>
      </div>
    </div>
  );
};

export default LiveScore;