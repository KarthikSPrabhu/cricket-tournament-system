import React, { useState } from 'react';
import { useLiveMatch } from '../../hooks/useLiveMatch';
import { Spinner } from '../Common/Loader';
import { calculateStrikeRate, formatOvers, calculateEconomy } from '../../utils/helpers';

const Scorecard = ({ matchId }) => {
  const { match, loading, error } = useLiveMatch(matchId);
  const [activeTab, setActiveTab] = useState('innings1');

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

  const { team1, team2, innings1, innings2, extras1, extras2 } = match;

  const getBattingRows = (innings, extras) => {
    if (!innings?.batsmen) return [];
    
    return innings.batsmen.map((batsman, index) => ({
      id: index,
      name: `${batsman.player?.firstName} ${batsman.player?.lastName}`,
      runs: batsman.runs || 0,
      balls: batsman.balls || 0,
      fours: batsman.fours || 0,
      sixes: batsman.sixes || 0,
      strikeRate: calculateStrikeRate(batsman.runs, batsman.balls),
      dismissal: batsman.dismissal || 'not out',
      bowler: batsman.dismissal === 'bowled' ? batsman.bowler?.name : '-',
      fielder: batsman.fielder || '-'
    }));
  };

  const getBowlingRows = (innings) => {
    if (!innings?.bowlers) return [];
    
    return innings.bowlers.map((bowler, index) => ({
      id: index,
      name: `${bowler.player?.firstName} ${bowler.player?.lastName}`,
      overs: formatOvers(bowler.balls || 0),
      maidens: bowler.maidens || 0,
      runs: bowler.runs || 0,
      wickets: bowler.wickets || 0,
      economy: calculateEconomy(bowler.runs, (bowler.balls || 0) / 6),
      extras: bowler.extras || 0
    }));
  };

  const batting1 = getBattingRows(innings1, extras1);
  const bowling1 = getBowlingRows(innings1);
  const batting2 = getBattingRows(innings2, extras2);
  const bowling2 = getBowlingRows(innings2);

  const tabs = [
    { id: 'innings1', name: `${team1?.name} Batting` },
    { id: 'bowling1', name: `${team2?.name} Bowling` },
    { id: 'innings2', name: `${team2?.name} Batting` },
    { id: 'bowling2', name: `${team1?.name} Bowling` },
  ];

  const renderTable = (battingData, bowlingData) => {
    const isBatting = activeTab.includes('innings');
    
    if (isBatting) {
      return (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead>
              <tr className="bg-gray-900">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Batsman</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">R</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">B</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">4s</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">6s</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">SR</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Dismissal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {battingData.map((row) => (
                <tr key={row.id} className="hover:bg-gray-800">
                  <td className="px-4 py-3">
                    <div>
                      <div className="font-medium text-white">{row.name}</div>
                      <div className="text-xs text-gray-400">{row.dismissal} {row.bowler !== '-' && `b ${row.bowler}`}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-white font-bold">{row.runs}</td>
                  <td className="px-4 py-3 text-gray-300">{row.balls}</td>
                  <td className="px-4 py-3 text-gray-300">{row.fours}</td>
                  <td className="px-4 py-3 text-gray-300">{row.sixes}</td>
                  <td className="px-4 py-3 text-gray-300">{row.strikeRate}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 text-xs rounded bg-gray-700 text-gray-300">
                      {row.dismissal}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    } else {
      return (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead>
              <tr className="bg-gray-900">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Bowler</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">O</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">M</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">R</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">W</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Econ</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Ext</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {bowlingData.map((row) => (
                <tr key={row.id} className="hover:bg-gray-800">
                  <td className="px-4 py-3 font-medium text-white">{row.name}</td>
                  <td className="px-4 py-3 text-gray-300">{row.overs}</td>
                  <td className="px-4 py-3 text-gray-300">{row.maidens}</td>
                  <td className="px-4 py-3 text-white font-bold">{row.runs}</td>
                  <td className="px-4 py-3 text-white font-bold">{row.wickets}</td>
                  <td className="px-4 py-3 text-gray-300">{row.economy}</td>
                  <td className="px-4 py-3 text-gray-300">{row.extras}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700">
      {/* Header */}
      <div className="border-b border-gray-700">
        <div className="flex space-x-4 px-6 pt-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 px-1 border-b-2 font-medium transition ${
                activeTab === tab.id
                  ? 'border-yellow-500 text-yellow-500'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      {/* Table Content */}
      <div className="p-6">
        {activeTab === 'innings1' && renderTable(batting1, bowling1)}
        {activeTab === 'bowling1' && renderTable(batting1, bowling1)}
        {activeTab === 'innings2' && renderTable(batting2, bowling2)}
        {activeTab === 'bowling2' && renderTable(batting2, bowling2)}
      </div>
    </div>
  );
};

export default Scorecard;