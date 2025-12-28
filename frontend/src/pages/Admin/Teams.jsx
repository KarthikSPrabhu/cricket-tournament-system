import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaSearch, 
  FaFilter,
  FaUsers,
  FaUpload,
  FaEye,
  FaDownload
} from 'react-icons/fa';
import TeamModal from '../../components/Admin/TeamModal';
import DataTable from '../../components/Common/DataTable';

const Teams = () => {
  const [teams, setTeams] = useState([]);
  const [filteredTeams, setFilteredTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [tournaments, setTournaments] = useState([]);
  const [selectedTournament, setSelectedTournament] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchTeams();
    fetchTournaments();
  }, [currentPage, selectedTournament]);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      let url = `/api/teams?page=${currentPage}&limit=${itemsPerPage}`;
      if (selectedTournament !== 'all') {
        url += `&tournamentId=${selectedTournament}`;
      }
      
      const response = await axios.get(url);
      setTeams(response.data.teams || []);
      setFilteredTeams(response.data.teams || []);
      setTotalPages(response.data.pages || 1);
    } catch (error) {
      toast.error('Failed to load teams');
      console.error('Error fetching teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTournaments = async () => {
    try {
      const response = await axios.get('/api/tournaments?limit=100');
      setTournaments(response.data.tournaments || []);
    } catch (error) {
      console.error('Error fetching tournaments:', error);
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    
    if (!term) {
      setFilteredTeams(teams);
      return;
    }
    
    const filtered = teams.filter(team => 
      team.name.toLowerCase().includes(term) ||
      team.teamId.toLowerCase().includes(term) ||
      team.coach?.toLowerCase().includes(term)
    );
    
    setFilteredTeams(filtered);
  };

  const handleCreateTeam = () => {
    setEditingTeam(null);
    setShowModal(true);
  };

  const handleEditTeam = (team) => {
    setEditingTeam(team);
    setShowModal(true);
  };

  const handleDeleteTeam = async (teamId) => {
    if (!window.confirm('Are you sure you want to delete this team?')) {
      return;
    }
    
    try {
      await axios.delete(`/api/teams/${teamId}`);
      toast.success('Team deleted successfully');
      fetchTeams();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete team');
    }
  };

  const handleSaveTeam = async (teamData) => {
    try {
      const formData = new FormData();
      
      Object.keys(teamData).forEach(key => {
        if (key === 'logo' && teamData[key] instanceof File) {
          formData.append('logo', teamData[key]);
        } else if (teamData[key] !== null && teamData[key] !== undefined) {
          formData.append(key, teamData[key]);
        }
      });
      
      if (editingTeam) {
        await axios.put(`/api/teams/${editingTeam._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Team updated successfully');
      } else {
        await axios.post('/api/teams', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Team created successfully');
      }
      
      setShowModal(false);
      fetchTeams();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save team');
    }
  };

  const handleExportTeams = () => {
    // Export teams to CSV
    const csvContent = [
      ['Team ID', 'Name', 'Coach', 'Home Ground', 'Founded Year', 'Players Count'],
      ...teams.map(team => [
        team.teamId,
        team.name,
        team.coach || '',
        team.homeGround || '',
        team.foundedYear || '',
        team.players?.length || 0
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `teams_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const columns = [
    {
      header: 'Team',
      accessor: 'name',
      cell: (row) => (
        <div className="flex items-center">
          <img 
            src={row.logo?.url || '/team-placeholder.png'} 
            alt={row.name}
            className="w-10 h-10 rounded-full mr-3"
          />
          <div>
            <div className="font-medium">{row.name}</div>
            <div className="text-sm text-gray-500">{row.teamId}</div>
          </div>
        </div>
      )
    },
    {
      header: 'Tournament',
      accessor: 'tournamentId',
      cell: (row) => row.tournamentId?.name || 'Not assigned'
    },
    {
      header: 'Coach',
      accessor: 'coach'
    },
    {
      header: 'Players',
      accessor: 'players',
      cell: (row) => (
        <div className="flex items-center">
          <FaUsers className="mr-2 text-gray-400" />
          <span>{row.players?.length || 0}</span>
        </div>
      )
    },
    {
      header: 'Matches',
      accessor: 'matchesPlayed',
      cell: (row) => (
        <div className="text-center">
          <div className="font-bold">{row.matchesPlayed || 0}</div>
          <div className="text-xs text-gray-500">
            {row.matchesWon || 0}W - {row.matchesLost || 0}L
          </div>
        </div>
      )
    },
    {
      header: 'Actions',
      accessor: '_id',
      cell: (row) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleEditTeam(row)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
            title="Edit"
          >
            <FaEdit />
          </button>
          <button
            onClick={() => handleDeleteTeam(row._id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
            title="Delete"
          >
            <FaTrash />
          </button>
          <a
            href={`/teams/${row._id}`}
            className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
            title="View Details"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaEye />
          </a>
        </div>
      )
    }
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Team Management</h1>
          <p className="text-gray-600">Manage all cricket teams in the tournament</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleExportTeams}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center"
          >
            <FaDownload className="mr-2" />
            Export
          </button>
          <button
            onClick={handleCreateTeam}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
          >
            <FaPlus className="mr-2" />
            Add Team
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaSearch className="inline mr-2" />
              Search Teams
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Search by name, ID, or coach..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaFilter className="inline mr-2" />
              Filter by Tournament
            </label>
            <select
              value={selectedTournament}
              onChange={(e) => setSelectedTournament(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Tournaments</option>
              {tournaments.map(tournament => (
                <option key={tournament._id} value={tournament._id}>
                  {tournament.name} ({tournament.season})
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quick Stats
            </label>
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{teams.length}</div>
                <div className="text-sm text-gray-600">Total Teams</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {teams.reduce((sum, team) => sum + (team.players?.length || 0), 0)}
                </div>
                <div className="text-sm text-gray-600">Total Players</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Teams Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            <DataTable
              columns={columns}
              data={filteredTeams}
              emptyMessage="No teams found. Create your first team!"
            />
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-700">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, teams.length)} of {teams.length} teams
                  </div>
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
              </div>
            )}
          </>
        )}
      </div>

      {/* Team Modal */}
      {showModal && (
        <TeamModal
          team={editingTeam}
          tournaments={tournaments}
          onClose={() => setShowModal(false)}
          onSave={handleSaveTeam}
        />
      )}
    </div>
  );
};

export default Teams;