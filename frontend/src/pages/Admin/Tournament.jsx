import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaCalendarAlt,
  FaTrophy,
  FaUsers,
  FaEye,
  FaCog,
  FaChartLine,
  FaUpload
} from 'react-icons/fa';
import TournamentModal from '../../components/Admin/TournamentModal';
import GroupManager from '../../components/Admin/GroupManager';

const Tournament = () => {
  const [tournaments, setTournaments] = useState([]);
  const [filteredTournaments, setFilteredTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showGroupManager, setShowGroupManager] = useState(false);
  const [editingTournament, setEditingTournament] = useState(null);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  const navigate = useNavigate();

  useEffect(() => {
    fetchTournaments();
  }, [currentPage, statusFilter]);

  const fetchTournaments = async () => {
    try {
      setLoading(true);
      let url = `/api/tournaments?page=${currentPage}&limit=${itemsPerPage}`;
      
      if (statusFilter !== 'all') {
        url += `&status=${statusFilter}`;
      }
      
      const response = await axios.get(url);
      setTournaments(response.data.tournaments || []);
      setFilteredTournaments(response.data.tournaments || []);
      setTotalPages(response.data.pages || 1);
    } catch (error) {
      toast.error('Failed to load tournaments');
      console.error('Error fetching tournaments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    
    if (!term) {
      setFilteredTournaments(tournaments);
      return;
    }
    
    const filtered = tournaments.filter(tournament => 
      tournament.name.toLowerCase().includes(term) ||
      tournament.tournamentId.toLowerCase().includes(term) ||
      tournament.season.toLowerCase().includes(term)
    );
    
    setFilteredTournaments(filtered);
  };

  const handleCreateTournament = () => {
    setEditingTournament(null);
    setShowModal(true);
  };

  const handleEditTournament = (tournament) => {
    setEditingTournament(tournament);
    setShowModal(true);
  };

  const handleDeleteTournament = async (tournamentId) => {
    if (!window.confirm('Are you sure you want to delete this tournament? This will also delete all associated matches and statistics.')) {
      return;
    }
    
    try {
      await axios.delete(`/api/tournaments/${tournamentId}`);
      toast.success('Tournament deleted successfully');
      fetchTournaments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete tournament');
    }
  };

  const handleSaveTournament = async (tournamentData) => {
    try {
      if (editingTournament) {
        await axios.put(`/api/tournaments/${editingTournament._id}`, tournamentData);
        toast.success('Tournament updated successfully');
      } else {
        await axios.post('/api/tournaments', tournamentData);
        toast.success('Tournament created successfully');
      }
      
      setShowModal(false);
      fetchTournaments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save tournament');
    }
  };

  const handleManageGroups = (tournament) => {
    setSelectedTournament(tournament);
    setShowGroupManager(true);
  };

  const handleViewDetails = (tournamentId) => {
    navigate(`/tournaments/${tournamentId}`);
  };

  const handleManageTeams = (tournamentId) => {
    navigate(`/admin/teams?tournamentId=${tournamentId}`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ongoing': return 'bg-green-100 text-green-800';
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getFormatColor = (format) => {
    switch (format) {
      case 'T20': return 'bg-purple-100 text-purple-800';
      case 'ODI': return 'bg-indigo-100 text-indigo-800';
      case 'Test': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'ongoing', label: 'Ongoing' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Tournament Management</h1>
          <p className="text-gray-600">Create and manage cricket tournaments</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleCreateTournament}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
          >
            <FaPlus className="mr-2" />
            Create Tournament
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Tournaments
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Search by name, ID, or season..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quick Stats
            </label>
            <div className="flex items-center justify-between">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{tournaments.length}</div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {tournaments.filter(t => t.status === 'ongoing').length}
                </div>
                <div className="text-sm text-gray-600">Ongoing</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {tournaments.filter(t => t.status === 'upcoming').length}
                </div>
                <div className="text-sm text-gray-600">Upcoming</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tournaments Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTournaments.map((tournament) => (
            <div 
              key={tournament._id}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              {/* Tournament Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold mb-1">{tournament.name}</h3>
                    <p className="text-blue-100">{tournament.season}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(tournament.status)}`}>
                    {tournament.status.toUpperCase()}
                  </span>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <FaTrophy className="mr-2" />
                    <span className="text-sm">ID: {tournament.tournamentId}</span>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${getFormatColor(tournament.format)}`}>
                    {tournament.format}
                  </span>
                </div>
              </div>

              {/* Tournament Details */}
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <div className="text-sm text-gray-600">Start Date</div>
                    <div className="font-medium">
                      {new Date(tournament.startDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">End Date</div>
                    <div className="font-medium">
                      {new Date(tournament.endDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Teams</div>
                    <div className="font-medium flex items-center">
                      <FaUsers className="mr-2 text-gray-400" />
                      {tournament.teams?.length || 0}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Matches</div>
                    <div className="font-medium">{tournament.matches?.length || 0}</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleViewDetails(tournament._id)}
                    className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 flex items-center justify-center"
                  >
                    <FaEye className="mr-2" />
                    View
                  </button>
                  <button
                    onClick={() => handleEditTournament(tournament)}
                    className="p-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 flex items-center justify-center"
                  >
                    <FaEdit className="mr-2" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleManageGroups(tournament)}
                    className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 flex items-center justify-center"
                  >
                    <FaCog className="mr-2" />
                    Groups
                  </button>
                  <button
                    onClick={() => handleManageTeams(tournament._id)}
                    className="p-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 flex items-center justify-center"
                  >
                    <FaUsers className="mr-2" />
                    Teams
                  </button>
                </div>

                {/* Delete Button */}
                <button
                  onClick={() => handleDeleteTournament(tournament._id)}
                  className="w-full mt-4 p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 flex items-center justify-center"
                >
                  <FaTrash className="mr-2" />
                  Delete Tournament
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-lg ${
                currentPage === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Previous
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-4 py-2 rounded-lg ${
                    currentPage === pageNum
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-lg ${
                currentPage === totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredTournaments.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl shadow-lg">
          <FaTrophy className="text-6xl text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-700 mb-2">No Tournaments Found</h3>
          <p className="text-gray-600 mb-6">Create your first tournament to get started</p>
          <button
            onClick={handleCreateTournament}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Create Tournament
          </button>
        </div>
      )}

      {/* Tournament Modal */}
      {showModal && (
        <TournamentModal
          tournament={editingTournament}
          onClose={() => setShowModal(false)}
          onSave={handleSaveTournament}
        />
      )}

      {/* Group Manager Modal */}
      {showGroupManager && selectedTournament && (
        <GroupManager
          tournament={selectedTournament}
          onClose={() => setShowGroupManager(false)}
          onSave={fetchTournaments}
        />
      )}
    </div>
  );
};

export default Tournament;