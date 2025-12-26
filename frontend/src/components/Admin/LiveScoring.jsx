import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import GroundView from './GroundView';
import { FaCricketBall, FaUser, FaSync } from 'react-icons/fa';

const LiveScoring = () => {
  const { matchId } = useParams();
  const [socket, setSocket] = useState(null);
  const [match, setMatch] = useState(null);
  const [inning, setInning] = useState(null);
  const [selectedBowler, setSelectedBowler] = useState('');
  const [selectedBatsman, setSelectedBatsman] = useState('');
  const [selectedNonStriker, setSelectedNonStriker] = useState('');
  const [runs, setRuns] = useState(0);
  const [extraType, setExtraType] = useState('');
  const [isWicket, setIsWicket] = useState(false);
  const [wicketType, setWicketType] = useState('');
  const [shotArea, setShotArea] = useState(null);
  const [bowlers, setBowlers] = useState([]);
  const [batsmen, setBatsmen] = useState([]);

  useEffect(() => {
    // Connect to socket
    const newSocket = io(import.meta.env.VITE_API_URL);
    setSocket(newSocket);

    // Join match room
    newSocket.emit('join-match', matchId);

    // Listen for updates
    newSocket.on('ball-update', handleBallUpdate);
    newSocket.on('toss-update', handleTossUpdate);
    newSocket.on('inning-end', handleInningEnd);

    // Load match data
    loadMatchData();

    return () => {
      newSocket.disconnect();
    };
  }, [matchId]);

  const loadMatchData = async () => {
    try {
      const response = await axios.get(`/api/matches/${matchId}/live`);
      setMatch(response.data.match);
      setInning(response.data.currentInning);
      
      // Set available bowlers and batsmen
      if (response.data.currentInning) {
        setBowlers(response.data.currentInning.bowlers);
        setBatsmen(response.data.currentInning.batsmen.filter(b => !b.isOut));
      }
    } catch (error) {
      toast.error('Failed to load match data');
    }
  };

  const handleBallUpdate = (data) => {
    // Update local state with new ball data
    setMatch(prev => ({
      ...prev,
      currentOver: data.over,
      currentBall: data.ball,
      liveCommentary: [...prev.liveCommentary, {
        over: data.over,
        ball: data.ball,
        commentary: data.commentary,
        timestamp: new Date()
      }]
    }));
    
    setInning(prev => ({
      ...prev,
      totalRuns: data.runs,
      wickets: data.wickets
    }));
  };

  const handleSubmitBall = async () => {
    try {
      const ballData = {
        bowlerId: selectedBowler,
        batsmanId: selectedBatsman,
        nonStrikerId: selectedNonStriker,
        runs,
        extraType: extraType || null,
        isWicket,
        wicketType: isWicket ? wicketType : null,
        shotArea
      };

      await axios.post(`/api/matches/${matchId}/ball`, ballData);
      
      // Reset form
      setRuns(0);
      setExtraType('');
      setIsWicket(false);
      setWicketType('');
      setShotArea(null);
      
      toast.success('Ball recorded successfully');
    } catch (error) {
      toast.error('Failed to record ball');
    }
  };

  const handleShotSelect = (zone, coordinates) => {
    setShotArea({
      zone,
      x: coordinates.x,
      y: coordinates.y
    });
  };

  const scoringButtons = [0, 1, 2, 3, 4, 6];

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Match Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                {match?.team1?.name} vs {match?.team2?.name}
              </h1>
              <p className="text-gray-600">
                {match?.venue} | {new Date(match?.date).toLocaleDateString()}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">
                {inning?.totalRuns || 0}/{inning?.wickets || 0}
              </div>
              <div className="text-gray-600">
                Overs: {match?.currentOver || 0}.{match?.currentBall || 0}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Scoring Controls */}
          <div className="lg:col-span-2 space-y-6">
            {/* Scoring Panel */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">Scoring Panel</h2>
              
              {/* Player Selection */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bowler
                  </label>
                  <select
                    value={selectedBowler}
                    onChange={(e) => setSelectedBowler(e.target.value)}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Select Bowler</option>
                    {bowlers.map((bowler) => (
                      <option key={bowler.player._id} value={bowler.player._id}>
                        {bowler.player.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Batsman
                  </label>
                  <select
                    value={selectedBatsman}
                    onChange={(e) => setSelectedBatsman(e.target.value)}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Select Batsman</option>
                    {batsmen.map((batsman) => (
                      <option key={batsman.player._id} value={batsman.player._id}>
                        {batsman.player.name} ({batsman.runs || 0})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Non-Striker
                  </label>
                  <select
                    value={selectedNonStriker}
                    onChange={(e) => setSelectedNonStriker(e.target.value)}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Select Non-Striker</option>
                    {batsmen
                      .filter(b => b.player._id !== selectedBatsman)
                      .map((batsman) => (
                        <option key={batsman.player._id} value={batsman.player._id}>
                          {batsman.player.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Runs Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Runs
                </label>
                <div className="flex flex-wrap gap-2">
                  {scoringButtons.map((run) => (
                    <button
                      key={run}
                      onClick={() => {
                        setRuns(run);
                        setExtraType('');
                        setIsWicket(false);
                      }}
                      className={`px-4 py-2 rounded-lg font-bold ${
                        runs === run
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 hover:bg-gray-300'
                      }`}
                    >
                      {run}
                    </button>
                  ))}
                </div>
              </div>

              {/* Extras and Wickets */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Extras
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['wide', 'no ball', 'bye', 'leg bye'].map((extra) => (
                      <button
                        key={extra}
                        onClick={() => {
                          setExtraType(extra);
                          setRuns(0);
                          setIsWicket(false);
                        }}
                        className={`px-3 py-1 rounded ${
                          extraType === extra
                            ? 'bg-yellow-600 text-white'
                            : 'bg-yellow-100 hover:bg-yellow-200'
                        }`}
                      >
                        {extra}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Wicket
                  </label>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => setIsWicket(!isWicket)}
                      className={`px-3 py-1 rounded ${
                        isWicket
                          ? 'bg-red-600 text-white'
                          : 'bg-red-100 hover:bg-red-200'
                      }`}
                    >
                      Wicket
                    </button>
                    
                    {isWicket && (
                      <select
                        value={wicketType}
                        onChange={(e) => setWicketType(e.target.value)}
                        className="p-2 border rounded"
                      >
                        <option value="">Type</option>
                        {['bowled', 'caught', 'lbw', 'run out', 'stumped'].map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              </div>

              {/* Ground View for Shot Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shot Placement
                </label>
                <GroundView onShotSelect={handleShotSelect} selectedArea={shotArea} />
                {shotArea && (
                  <p className="mt-2 text-sm text-gray-600">
                    Selected area: {shotArea.zone} ({shotArea.x}, {shotArea.y})
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmitBall}
                disabled={!selectedBowler || !selectedBatsman}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <FaCricketBall className="inline mr-2" />
                Record Ball
              </button>
            </div>

            {/* Commentary */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">Live Commentary</h2>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {match?.liveCommentary?.map((comment, index) => (
                  <div key={index} className="border-b pb-2">
                    <div className="flex justify-between">
                      <span className="font-bold">{comment.over}.{comment.ball}</span>
                      <span className="text-sm text-gray-500">
                        {new Date(comment.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p>{comment.commentary}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Match Summary */}
          <div className="space-y-6">
            {/* Scorecard */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">Current Scorecard</h2>
              
              <div className="mb-4">
                <h3 className="font-bold text-lg mb-2">Batting</h3>
                <div className="space-y-2">
                  {inning?.batsmen?.map((batsman, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div>
                        <span className="font-medium">{batsman.player.name}</span>
                        {batsman.isBatting && (
                          <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            Batting
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{batsman.runs || 0}</div>
                        <div className="text-sm text-gray-500">{batsman.balls || 0} balls</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-bold text-lg mb-2">Bowling</h3>
                <div className="space-y-2">
                  {inning?.bowlers?.map((bowler, index) => (
                    <div key={index} className="flex justify-between">
                      <span>{bowler.player.name}</span>
                      <span>{bowler.overs || 0}-{bowler.maidens || 0}-{bowler.runs || 0}-{bowler.wickets || 0}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Match Actions */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">Match Actions</h2>
              <div className="space-y-3">
                <button
                  onClick={() => {/* End over logic */}}
                  className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                >
                  End Over
                </button>
                <button
                  onClick={() => {/* End innings logic */}}
                  className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700"
                >
                  End Innings
                </button>
                <button
                  onClick={() => {/* Change bowler logic */}}
                  className="w-full bg-yellow-600 text-white py-2 rounded hover:bg-yellow-700"
                >
                  Change Bowler
                </button>
                <button
                  onClick={loadMatchData}
                  className="w-full bg-gray-600 text-white py-2 rounded hover:bg-gray-700"
                >
                  <FaSync className="inline mr-2" />
                  Refresh
                </button>
              </div>
            </div>

            {/* Partnership */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">Current Partnership</h2>
              {inning?.partnership?.current && (
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="font-bold">
                      {inning.partnership.current.runs || 0} runs
                    </span>
                    <span>{inning.partnership.current.balls || 0} balls</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {inning.partnership.current.player1?.name} & 
                    {inning.partnership.current.player2?.name}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveScoring;