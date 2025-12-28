import React, { createContext, useState, useContext, useEffect } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const MatchContext = createContext({});

export const useMatch = () => useContext(MatchContext);

export const MatchProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [liveMatches, setLiveMatches] = useState([]);
  const [upcomingMatches, setUpcomingMatches] = useState([]);
  const [completedMatches, setCompletedMatches] = useState([]);

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io(import.meta.env.VITE_SOCKET_URL);
    setSocket(newSocket);

    // Listen for match updates
    newSocket.on('match-update', handleMatchUpdate);
    newSocket.on('ball-update', handleBallUpdate);
    newSocket.on('toss-update', handleTossUpdate);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Load matches on mount
  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    try {
      const response = await axios.get('/api/matches');
      const matches = response.data.matches;
      
      // Categorize matches
      const live = matches.filter(m => m.status === 'live' || m.status === 'inning1' || m.status === 'inning2');
      const upcoming = matches.filter(m => m.status === 'scheduled' || m.status === 'toss');
      const completed = matches.filter(m => m.status === 'completed');
      
      setLiveMatches(live);
      setUpcomingMatches(upcoming);
      setCompletedMatches(completed);
    } catch (error) {
      console.error('Failed to load matches:', error);
    }
  };

  const handleMatchUpdate = (data) => {
    // Update match in appropriate list
    toast.info(`Match update: ${data.type}`);
    loadMatches(); // Reload matches
  };

  const handleBallUpdate = (data) => {
    // Update live match data
    toast.info(`Ball update: ${data.runs} runs`);
  };

  const handleTossUpdate = (data) => {
    toast.info(`Toss: ${data.tossWonBy} chose to ${data.decision}`);
  };

  const joinMatchRoom = (matchId) => {
    if (socket) {
      socket.emit('join-match', matchId);
    }
  };

  const leaveMatchRoom = (matchId) => {
    if (socket) {
      socket.emit('leave-match', matchId);
    }
  };

  const getLiveMatch = async (matchId) => {
    try {
      const response = await axios.get(`/api/matches/${matchId}/live`);
      return response.data;
    } catch (error) {
      console.error('Failed to get live match:', error);
      throw error;
    }
  };

  const value = {
    socket,
    liveMatches,
    upcomingMatches,
    completedMatches,
    joinMatchRoom,
    leaveMatchRoom,
    getLiveMatch,
    loadMatches
  };

  return (
    <MatchContext.Provider value={value}>
      {children}
    </MatchContext.Provider>
  );
};