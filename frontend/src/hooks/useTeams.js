import { useState, useEffect } from 'react';
import { teamAPI } from '../services/api';

const useTeams = (params = {}) => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  });

  const fetchTeams = async (customParams = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = { ...params, ...customParams };
      const response = await teamAPI.getTeams(queryParams);
      
      setTeams(response.data.teams || []);
      setPagination({
        page: response.data.currentPage || 1,
        limit: queryParams.limit || 10,
        total: response.data.total || 0,
        pages: response.data.pages || 1
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch teams');
      console.error('Error fetching teams:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const createTeam = async (teamData) => {
    try {
      setLoading(true);
      const response = await teamAPI.createTeam(teamData);
      await fetchTeams(); // Refresh list
      return { success: true, data: response.data };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to create team';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const updateTeam = async (id, teamData) => {
    try {
      setLoading(true);
      const response = await teamAPI.updateTeam(id, teamData);
      await fetchTeams(); // Refresh list
      return { success: true, data: response.data };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to update team';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const deleteTeam = async (id) => {
    try {
      setLoading(true);
      await teamAPI.deleteTeam(id);
      await fetchTeams(); // Refresh list
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to delete team';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const addPlayerToTeam = async (teamId, playerId) => {
    try {
      setLoading(true);
      await teamAPI.addPlayer(teamId, playerId);
      await fetchTeams(); // Refresh list
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to add player';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const removePlayerFromTeam = async (teamId, playerId) => {
    try {
      setLoading(true);
      await teamAPI.removePlayer(teamId, playerId);
      await fetchTeams(); // Refresh list
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to remove player';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  return {
    teams,
    loading,
    error,
    pagination,
    fetchTeams,
    createTeam,
    updateTeam,
    deleteTeam,
    addPlayerToTeam,
    removePlayerFromTeam,
    setTeams
  };
};

export default useTeams;