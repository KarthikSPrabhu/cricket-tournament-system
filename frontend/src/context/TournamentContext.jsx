import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const TournamentContext = createContext();

export const useTournament = () => {
  const context = useContext(TournamentContext);
  if (!context) {
    throw new Error('useTournament must be used within a TournamentProvider');
  }
  return context;
};

export const TournamentProvider = ({ children }) => {
  const [tournaments, setTournaments] = useState([]);
  const [currentTournament, setCurrentTournament] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTournaments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/tournaments');
      setTournaments(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch tournaments');
    } finally {
      setLoading(false);
    }
  };

  const fetchTournamentById = async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/tournaments/${id}`);
      setCurrentTournament(response.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch tournament');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createTournament = async (tournamentData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.post('/tournaments', tournamentData);
      setTournaments(prev => [response.data, ...prev]);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create tournament');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateTournament = async (id, tournamentData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.put(`/tournaments/${id}`, tournamentData);
      setTournaments(prev => prev.map(t => t._id === id ? response.data : t));
      if (currentTournament?._id === id) {
        setCurrentTournament(response.data);
      }
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update tournament');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteTournament = async (id) => {
    try {
      setLoading(true);
      setError(null);
      await api.delete(`/tournaments/${id}`);
      setTournaments(prev => prev.filter(t => t._id !== id));
      if (currentTournament?._id === id) {
        setCurrentTournament(null);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete tournament');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getActiveTournaments = () => {
    const now = new Date();
    return tournaments.filter(t => {
      const endDate = new Date(t.endDate);
      return endDate >= now;
    });
  };

  const getPastTournaments = () => {
    const now = new Date();
    return tournaments.filter(t => {
      const endDate = new Date(t.endDate);
      return endDate < now;
    });
  };

  useEffect(() => {
    fetchTournaments();
  }, []);

  const value = {
    tournaments,
    currentTournament,
    loading,
    error,
    fetchTournaments,
    fetchTournamentById,
    createTournament,
    updateTournament,
    deleteTournament,
    getActiveTournaments,
    getPastTournaments,
    setCurrentTournament
  };

  return (
    <TournamentContext.Provider value={value}>
      {children}
    </TournamentContext.Provider>
  );
};