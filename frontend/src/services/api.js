import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/api/auth/login', credentials),
  register: (userData) => api.post('/api/auth/register', userData),
  getMe: () => api.get('/api/auth/me'),
  updateProfile: (profileData) => api.put('/api/auth/update', profileData),
  changePassword: (passwordData) => api.put('/api/auth/change-password', passwordData),
  logout: () => api.post('/api/auth/logout'),
};

// Team API
export const teamAPI = {
  getTeams: (params) => api.get('/api/teams', { params }),
  getTeam: (id) => api.get(`/api/teams/${id}`),
  createTeam: (formData) => api.post('/api/teams', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateTeam: (id, formData) => api.put(`/api/teams/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteTeam: (id) => api.delete(`/api/teams/${id}`),
  addPlayer: (teamId, playerId) => api.post(`/api/teams/${teamId}/players`, { playerId }),
  removePlayer: (teamId, playerId) => api.delete(`/api/teams/${teamId}/players/${playerId}`),
  getTeamStats: (teamId) => api.get(`/api/teams/${teamId}/stats`),
};

// Player API
export const playerAPI = {
  getPlayers: (params) => api.get('/api/players', { params }),
  getPlayer: (id) => api.get(`/api/players/${id}`),
  searchPlayers: (query) => api.get('/api/players/search', { params: { query } }),
  createPlayer: (formData) => api.post('/api/players', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updatePlayer: (id, formData) => api.put(`/api/players/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deletePlayer: (id) => api.delete(`/api/players/${id}`),
  getPlayerStats: (id) => api.get(`/api/players/${id}/statistics`),
};

// Tournament API
export const tournamentAPI = {
  getTournaments: (params) => api.get('/api/tournaments', { params }),
  getTournament: (id) => api.get(`/api/tournaments/${id}`),
  createTournament: (data) => api.post('/api/tournaments', data),
  updateTournament: (id, data) => api.put(`/api/tournaments/${id}`, data),
  deleteTournament: (id) => api.delete(`/api/tournaments/${id}`),
  addTeam: (tournamentId, teamId) => api.post(`/api/tournaments/${tournamentId}/teams`, { teamId }),
  removeTeam: (tournamentId, teamId) => api.delete(`/api/tournaments/${tournamentId}/teams/${teamId}`),
  getStandings: (tournamentId) => api.get(`/api/tournaments/${tournamentId}/standings`),
  getStatistics: (tournamentId) => api.get(`/api/tournaments/${tournamentId}/statistics`),
  uploadMedia: (tournamentId, formData) => api.post(`/api/tournaments/${tournamentId}/media`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

// Match API
export const matchAPI = {
  getMatches: (params) => api.get('/api/matches', { params }),
  getMatch: (id) => api.get(`/api/matches/${id}`),
  createMatch: (data) => api.post('/api/matches', data),
  updateMatch: (id, data) => api.put(`/api/matches/${id}`, data),
  deleteMatch: (id) => api.delete(`/api/matches/${id}`),
  updateToss: (id, data) => api.post(`/api/matches/${id}/toss`, data),
  startScoring: (id, data) => api.post(`/api/matches/${id}/start-scoring`, data),
  recordBall: (id, data) => api.post(`/api/matches/${id}/ball`, data),
  endInnings: (id) => api.post(`/api/matches/${id}/end-innings`),
  getLiveMatch: (id) => api.get(`/api/matches/live/${id}`),
};

// Public API
export const publicAPI = {
  getLiveMatches: () => api.get('/api/public/live-matches'),
  getUpcomingMatches: () => api.get('/api/public/upcoming-matches'),
  getCompletedMatches: () => api.get('/api/public/completed-matches'),
  getActiveTournaments: () => api.get('/api/public/active-tournaments'),
  getTopBatsmen: () => api.get('/api/public/leaderboard/batsmen'),
  getTopBowlers: () => api.get('/api/public/leaderboard/bowlers'),
  getPointsTable: (tournamentId) => api.get(`/api/public/points-table/${tournamentId}`),
  getMatchStats: (matchId) => api.get(`/api/public/match-stats/${matchId}`),
};

export default api;