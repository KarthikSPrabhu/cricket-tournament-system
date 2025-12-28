import { useState, useEffect, useCallback } from 'react';
import { useSocket } from './useSocket';
import api from '../services/api';

export const useLiveMatch = (matchId) => {
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { socket, joinMatchRoom, leaveMatchRoom } = useSocket();

  const fetchMatch = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/matches/${matchId}`);
      setMatch(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch match');
    } finally {
      setLoading(false);
    }
  }, [matchId]);

  useEffect(() => {
    fetchMatch();
    
    if (matchId && socket) {
      joinMatchRoom(matchId);
      
      socket.on('ball-update', (data) => {
        if (data.matchId === matchId) {
          setMatch(prev => ({
            ...prev,
            ...data.match,
            currentInnings: data.innings,
            recentBalls: [data.ball, ...(prev.recentBalls || []).slice(0, 9)]
          }));
        }
      });

      socket.on('match-status', (data) => {
        if (data.matchId === matchId) {
          setMatch(prev => ({
            ...prev,
            ...data.match
          }));
        }
      });

      return () => {
        leaveMatchRoom(matchId);
        socket.off('ball-update');
        socket.off('match-status');
      };
    }
  }, [matchId, socket, fetchMatch, joinMatchRoom, leaveMatchRoom]);

  const updateMatch = async (data) => {
    try {
      const response = await api.put(`/matches/${matchId}`, data);
      setMatch(response.data);
      return response.data;
    } catch (err) {
      throw err.response?.data || err;
    }
  };

  const addBall = async (ballData) => {
    try {
      const response = await api.post(`/matches/${matchId}/ball`, ballData);
      return response.data;
    } catch (err) {
      throw err.response?.data || err;
    }
  };

  const updateToss = async (tossData) => {
    try {
      const response = await api.post(`/matches/${matchId}/toss`, tossData);
      setMatch(response.data);
      return response.data;
    } catch (err) {
      throw err.response?.data || err;
    }
  };

  return {
    match,
    loading,
    error,
    fetchMatch,
    updateMatch,
    addBall,
    updateToss
  };
};