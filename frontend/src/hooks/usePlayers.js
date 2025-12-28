import { useState, useEffect } from 'react';
import { playerAPI } from '../services/api';

const usePlayers = (params = {}) => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 1
  });

  const fetchPlayers = async (customParams = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = { ...params, ...customParams };
      const response = await playerAPI.getPlayers(queryParams);
      
      setPlayers(response.data.players || []);
      setPagination({
        page: response.data.currentPage || 1,
        limit: queryParams.limit || 20,
        total: response.data.total || 0,
        pages: response.data.pages || 1
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch players');
      console.error('Error fetching players:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayers();
  }, []);

  const searchPlayers = async (query) => {
    try {
      setLoading(true);
      const response = await playerAPI.searchPlayers(query);
      setPlayers(response.data.players || []);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to search players';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const createPlayer = async (playerData) => {
    try {
      setLoading(true);
      const response = await playerAPI.createPlayer(playerData);
      await fetchPlayers(); // Refresh list
      return { success: true, data: response.data };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to create player';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const updatePlayer = async (id, playerData) => {
    try {
      setLoading(true);
      const response = await playerAPI.updatePlayer(id, playerData);
      await fetchPlayers(); // Refresh list
      return { success: true, data: response.data };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to update player';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const deletePlayer = async (id) => {
    try {
      setLoading(true);
      await playerAPI.deletePlayer(id);
      await fetchPlayers(); // Refresh list
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to delete player';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const getPlayerStats = async (id) => {
    try {
      setLoading(true);
      const response = await playerAPI.getPlayerStats(id);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to get player stats';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  return {
    players,
    loading,
    error,
    pagination,
    fetchPlayers,
    searchPlayers,
    createPlayer,
    updatePlayer,
    deletePlayer,
    getPlayerStats,
    setPlayers
  };
};

export default usePlayers;