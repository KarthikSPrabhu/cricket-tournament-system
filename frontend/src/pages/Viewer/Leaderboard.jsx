import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Spinner } from '../../components/Common/Loader';
import { calculateStrikeRate, calculateAverage, calculateEconomy, formatOvers } from '../../utils/helpers';

const Leaderboard = () => {
  const [batsmen, setBatsmen] = useState([]);
  const [bowlers, setBowlers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('batsmen');
  const [tournaments, setTournaments] = useState([]);
  const [selectedTournament, setSelectedTournament] = useState('all');

  useEffect(() => {
    fetchData();
  }, [selectedTournament]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // For now, using mock data since backend endpoints might not be ready
      // In production, replace with actual API calls
      const [batsmenRes, bowlersRes, teamsRes, tournamentsRes] = await Promise.all([
        api.get('/players?role=batsman&limit=20'),
        api.get('/players?role=bowler&limit=20'),
        api.get('/teams'),
        api.get('/tournaments')
      ]);

      // Transform data for leaderboard display
      const transformedBatsmen = batsmenRes.data.map(player => ({
        ...player,
        matches: Math.floor(Math.random() * 20) + 1,
        runs: Math.floor(Math.random() * 1500) + 100,
        average: calculateAverage(Math.floor(Math.random() * 1500) + 100, Math.floor(Math.random() * 20) + 1),
        strikeRate: calculateStrikeRate(Math.floor(Math.random() * 1500) + 100, Math.floor(Math.random() * 1200) + 100),
        highest: Math.floor(Math.random() * 150) + 50,
        centuries: Math.floor(Math.random() * 10),
        fifties: Math.floor(Math.random() * 20),
        fours: Math.floor(Math.random() * 200),
        sixes: Math.floor(Math.random() * 50)
      })).sort((a, b) => b.runs - b.runs);

      const transformedBowlers = bowlersRes.data.map(player => ({
        ...player,
        matches: Math.floor(Math.random() * 20) + 1,
        wickets: Math.floor(Math.random() * 50) + 5,
        economy: calculateEconomy(Math.floor(Math.random() * 800) + 100, Math.floor(Math.random() * 100) + 20),
        average: calculateAverage(Math.floor(Math.random() * 800) + 100, Math.floor(Math.random() * 50) + 5),
        bestBowling: `${Math.floor(Math.random() * 6)}/${Math.floor(Math.random() * 40)}`,
        maidens: Math.floor(Math.random() * 20),
        runs: Math.floor(Math.random() * 800) + 100,
        overs: Math.floor(Math.random() * 100) + 20
      })).sort((a, b) => b.wickets - a.wickets);

      const transformedTeams = teamsRes.data.map(team => ({
        ...team,
        matches: Math.floor(Math.random() * 30) + 5,
        wins: Math.floor(Math.random() * 20) + 1,
        losses: Math.floor(Math.random() * 15) + 1,
        draws: Math.floor(Math.random() * 5),
        points: Math.floor(Math.random() * 50) + 10,
        netRunRate: (Math.random() * 2 - 1).toFixed(2)
      })).sort((a, b) => b.points - a.points);

      setBatsmen(transformedBatsmen);
      setBowlers(transformedBowlers);
      setTeams(transformedTeams);
      setTournaments(tournamentsRes.data);
      
    } catch (error) {
      console.error('Failed to fetch leaderboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderBatsmenTable = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-700">
        <thead>
          <tr className="bg-gray-900">
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Rank</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Player</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Team</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Matches</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Runs</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Avg</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">SR</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">100s</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">50s</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">HS</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {batsmen.slice(0, 20).map((player, index) => (
            <tr key={player._id} className="hover:bg-gray-800">
              <td className="px-4 py-3">
                <div className={`w-8 h-8 flex items-center justify-center rounded-full ${
                  index < 3 ? 'bg-yellow-900/30 text-yellow-400' : 'bg-gray-700 text-gray-300'
                }`}>
                  {index + 1}
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center mr-3">
                    {player.profileImage ? (
                      <img src={player.profileImage} alt={player.firstName} className="h-10 w-10 rounded-full" />
                    ) : (
                      <span className="text-lg">{player.firstName[0]}{player.lastName[0]}</span>
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-white">
                      {player.firstName} {player.lastName}
                    </div>
                    <div className="text-sm text-gray-400">{player.battingStyle}</div>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center">
                  <div className="h-6 w-6 rounded-full bg-gray-700 mr-2 flex items-center justify-center">
                    {player.team?.logo ? (
                      <img src={player.team.logo} alt={player.team.name} className="h-6 w-6 rounded-full" />
                    ) : (
                      <span className="text-xs">{player.team?.shortName?.[0]}</span>
                    )}
                  </div>
                  <span className="text-gray-300">{player.team?.shortName}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-gray-300">{player.matches}</td>
              <td className="px-4 py-3">
                <div className="font-bold text-white">{player.runs}</div>
                <div className="text-xs text-gray-400">{player.fours} fours, {player.sixes} sixes</div>
              </td>
              <td className="px-4 py-3">
                <div className="font-bold text-white">{player.average}</div>
              </td>
              <td className="px-4 py-3">
                <div className={`font-bold ${parseFloat(player.strikeRate) > 130 ? 'text-green-400' : 'text-yellow-400'}`}>
                  {player.strikeRate}
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="font-bold text-white">{player.centuries}</div>
              </td>
              <td className="px-4 py-3">
                <div className="font-bold text-white">{player.fifties}</div>
              </td>
              <td className="px-4 py-3">
                <div className="font-bold text-white">{player.highest}*</div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderBowlersTable = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-700">
        <thead>
          <tr className="bg-gray-900">
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Rank</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Player</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Team</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Matches</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Wickets</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Avg</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Econ</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Best</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Mdns</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Runs</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {bowlers.slice(0, 20).map((player, index) => (
            <tr key={player._id} className="hover:bg-gray-800">
              <td className="px-4 py-3">
                <div className={`w-8 h-8 flex items-center justify-center rounded-full ${
                  index < 3 ? 'bg-yellow-900/30 text-yellow-400' : 'bg-gray-700 text-gray-300'
                }`}>
                  {index + 1}
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center mr-3">
                    {player.profileImage ? (
                      <img src={player.profileImage} alt={player.firstName} className="h-10 w-10 rounded-full" />
                    ) : (
                      <span className="text-lg">{player.firstName[0]}{player.lastName[0]}</span>
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-white">
                      {player.firstName} {player.lastName}
                    </div>
                    <div className="text-sm text-gray-400">{player.bowlingStyle}</div>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center">
                  <div className="h-6 w-6 rounded-full bg-gray-700 mr-2 flex items-center justify-center">
                    {player.team?.logo ? (
                      <img src={player.team.logo} alt={player.team.name} className="h-6 w-6 rounded-full" />
                    ) : (
                      <span className="text-xs">{player.team?.shortName?.[0]}</span>
                    )}
                  </div>
                  <span className="text-gray-300">{player.team?.shortName}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-gray-300">{player.matches}</td>
              <td className="px-4 py-3">
                <div className="font-bold text-white">{player.wickets}</div>
              </td>
              <td className="px-4 py-3">
                <div className="font-bold text-white">{player.average}</div>
              </td>
              <td className="px-4 py-3">
                <div className={`font-bold ${parseFloat(player.economy) < 7 ? 'text-green-400' : 'text-yellow-400'}`}>
                  {player.economy}
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="font-bold text-white">{player.bestBowling}</div>
              </td>
              <td className="px-4 py-3">
                <div className="font-bold text-white">{player.maidens}</div>
              </td>
              <td className="px-4 py-3">
                <div className="font-bold text-white">{player.runs}</div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderTeamsTable = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-700">
        <thead>
          <tr className="bg-gray-900">
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Rank</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Team</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Matches</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Won</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Lost</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Draw</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Points</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">NRR</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {teams.slice(0, 10).map((team, index) => (
            <tr key={team._id} className="hover:bg-gray-800">
              <td className="px-4 py-3">
                <div className={`w-8 h-8 flex items-center justify-center rounded-full ${
                  index < 4 ? 'bg-yellow-900/30 text-yellow-400' : 'bg-gray-700 text-gray-300'
                }`}>
                  {index + 1}
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center mr-3 overflow-hidden">
                    {team.logo ? (
                      <img src={team.logo} alt={team.name} className="h-10 w-10 object-cover" />
                    ) : (
                      <span className="text-lg">{team.shortName?.[0]}{team.shortName?.[1]}</span>
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-white">{team.name}</div>
                    <div className="text-sm text-gray-400">{team.coachName}</div>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-gray-300">{team.matches}</td>
              <td className="px-4 py-3">
                <div className="font-bold text-green-400">{team.wins}</div>
              </td>
              <td className="px-4 py-3">
                <div className="font-bold text-red-400">{team.losses}</div>
              </td>
              <td className="px-4 py-3 text-gray-300">{team.draws}</td>
              <td className="px-4 py-3">
                <div className="font-bold text-white text-lg">{team.points}</div>
              </td>
              <td className="px-4 py-3">
                <div className={`font-bold ${parseFloat(team.netRunRate) > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {team.netRunRate}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

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
          <h1 className="text-3xl font-bold text-white mb-2">Leaderboard</h1>
          <p className="text-gray-400">Top performers and team rankings</p>
        </div>

        {/* Filters */}
        <div className="bg-gray-800/50 rounded-xl p-6 mb-8 backdrop-blur-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
            <div className="flex space-x-4">
              {['batsmen', 'bowlers', 'teams'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2 rounded-lg font-medium transition ${
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

        {/* Top Performers Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Top Batsman */}
          <div className="bg-gradient-to-br from-yellow-900/30 to-yellow-800/20 rounded-xl p-6 border border-yellow-700/50">
            <div className="flex items-center mb-4">
              <div className="h-12 w-12 rounded-full bg-yellow-600 flex items-center justify-center mr-4">
                <span className="text-2xl">👑</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Top Batsman</h3>
                <p className="text-yellow-400">Orange Cap Holder</p>
              </div>
            </div>
            {batsmen.length > 0 && (
              <div className="space-y-2">
                <div className="font-bold text-white text-xl">
                  {batsmen[0].firstName} {batsmen[0].lastName}
                </div>
                <div className="text-gray-300">{batsmen[0].team?.name}</div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <div className="text-2xl font-bold text-yellow-400">{batsmen[0].runs}</div>
                    <div className="text-sm text-gray-400">Runs</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-yellow-400">{batsmen[0].average}</div>
                    <div className="text-sm text-gray-400">Average</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Top Bowler */}
          <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 rounded-xl p-6 border border-blue-700/50">
            <div className="flex items-center mb-4">
              <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center mr-4">
                <span className="text-2xl">🎯</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Top Bowler</h3>
                <p className="text-blue-400">Purple Cap Holder</p>
              </div>
            </div>
            {bowlers.length > 0 && (
              <div className="space-y-2">
                <div className="font-bold text-white text-xl">
                  {bowlers[0].firstName} {bowlers[0].lastName}
                </div>
                <div className="text-gray-300">{bowlers[0].team?.name}</div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <div className="text-2xl font-bold text-blue-400">{bowlers[0].wickets}</div>
                    <div className="text-sm text-gray-400">Wickets</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-400">{bowlers[0].economy}</div>
                    <div className="text-sm text-gray-400">Economy</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Top Team */}
          <div className="bg-gradient-to-br from-green-900/30 to-green-800/20 rounded-xl p-6 border border-green-700/50">
            <div className="flex items-center mb-4">
              <div className="h-12 w-12 rounded-full bg-green-600 flex items-center justify-center mr-4">
                <span className="text-2xl">🏆</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Top Team</h3>
                <p className="text-green-400">Table Toppers</p>
              </div>
            </div>
            {teams.length > 0 && (
              <div className="space-y-2">
                <div className="font-bold text-white text-xl">{teams[0].name}</div>
                <div className="text-gray-300">{teams[0].coachName}</div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <div className="text-2xl font-bold text-green-400">{teams[0].points}</div>
                    <div className="text-sm text-gray-400">Points</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-400">{teams[0].netRunRate}</div>
                    <div className="text-sm text-gray-400">NRR</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Table */}
        <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white mb-2">
              {activeTab === 'batsmen' && 'Top Batsmen'}
              {activeTab === 'bowlers' && 'Top Bowlers'}
              {activeTab === 'teams' && 'Team Standings'}
            </h2>
            <p className="text-gray-400">
              {activeTab === 'batsmen' && 'Ranked by total runs scored'}
              {activeTab === 'bowlers' && 'Ranked by total wickets taken'}
              {activeTab === 'teams' && 'Ranked by tournament points'}
            </p>
          </div>

          {activeTab === 'batsmen' && renderBatsmenTable()}
          {activeTab === 'bowlers' && renderBowlersTable()}
          {activeTab === 'teams' && renderTeamsTable()}
        </div>

        {/* Statistics Summary */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-white">{batsmen.length}</div>
            <div className="text-gray-400">Batsmen</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-white">{bowlers.length}</div>
            <div className="text-gray-400">Bowlers</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-white">{teams.length}</div>
            <div className="text-gray-400">Teams</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-white">{tournaments.length}</div>
            <div className="text-gray-400">Tournaments</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;