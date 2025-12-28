import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaSearch, 
  FaFilter,
  FaUser,
  FaDownload,
  FaEye,
  FaTshirt,
  FaBaseballBall,
  FaUserTie
} from 'react-icons/fa';
import PlayerModal from '../../components/Admin/PlayerModal';
import DataTable from '../../components/Common/DataTable';

const Players = () => {
  const [players, setPlayers] = useState([]);
  const [filteredPlayers, setFilteredPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState('all');
  const [selectedRole, setSelectedRole] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 15;

  useEffect(() => {
    fetchPlayers();
    fetchTeams();
  }, [currentPage, selectedTeam, selectedRole]);

  const fetchPlayers = async () => {
    try {
      setLoading(true);
      let url = `/api/players?page=${currentPage}&limit=${itemsPerPage}`;
      
      if (selectedTeam !== 'all') {
        url += `&teamId=${selectedTeam}`;
      }
      
      if (selectedRole !== 'all') {
        url += `&role=${selectedRole}`;
      }
      
      const response = await axios.get(url);
      setPlayers(response.data.players || []);
      setFilteredPlayers(response.data.players || []);
      setTotalPages(response.data.pages || 1);
    } catch (error) {
      toast.error('Failed to load players');
      console.error('Error fetching players:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeams = async () => {
    try {
      const response = await axios.get('/api/teams?limit=100');
      setTeams(response.data.teams || []);
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    
    if (!term) {
      setFilteredPlayers(players);
      return;
    }
    
    const filtered = players.filter(player => 
      player.name.toLowerCase().includes(term) ||
      player.playerId.toLowerCase().includes(term) ||
      player.email.toLowerCase().includes(term) ||
      player.phone.includes(term)
    );
    
    setFilteredPlayers(filtered);
  };

  const handleCreatePlayer = () => {
    setEditingPlayer(null);
    setShowModal(true);
  };

  const handleEditPlayer = (player) => {
    setEditingPlayer(player);
    setShowModal(true);
  };

  const handleDeletePlayer = async (playerId) => {
    if (!window.confirm('Are you sure you want to delete this player?')) {
      return;
    }
    
    try {
      await axios.delete(`/api/players/${playerId}`);
      toast.success('Player deleted successfully');
      fetchPlayers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete player');
    }
  };

  const handleSavePlayer = async (playerData) => {
    try {
      const formData = new FormData();
      
      Object.keys(playerData).forEach(key => {
        if (key === 'photo' && playerData[key] instanceof File) {
          formData.append('photo', playerData[key]);
        } else if (playerData[key] !== null && playerData[key] !== undefined) {
          formData.append(key, playerData[key]);
        }
      });
      
      if (editingPlayer) {
        await axios.put(`/api/players/${editingPlayer._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Player updated successfully');
      } else {
        await axios.post('/api/players', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Player created successfully');
      }
      
      setShowModal(false);
      fetchPlayers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save player');
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'batsman':
        return <FaTshirt className="text-green-600" />;
      case 'bowler':
        return <FaBaseballBall className="text-red-600" />;
      case 'allrounder':
        return <FaUser className="text-blue-600" />;
      case 'wicketkeeper':
        return <FaUserTie className="text-purple-600" />;
      default:
        return <FaUser className="text-gray-600" />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'batsman': return 'bg-green-100 text-green-800';
      case 'bowler': return 'bg-red-100 text-red-800';
      case 'allrounder': return 'bg-blue-100 text-blue-800';
      case 'wicketkeeper': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const columns = [
    {
      header: 'Player',
      accessor: 'name',
      cell: (row) => (
        <div className="flex items-center">
          <img 
            src={row.photo?.url || '/player-placeholder.png'} 
            alt={row.name}
            className="w-10 h-10 rounded-full mr-3"
          />
          <div>
            <div className="font-medium">{row.name}</div>
            <div className="text-sm text-gray-500">{row.playerId}</div>
          </div>
        </div>
      )
    },
    {
      header: 'Role',
      accessor: 'role',
      cell: (row) => (
        <div className="flex items-center">
          {getRoleIcon(row.role)}
          <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(row.role)}`}>
            {row.role.charAt(0).toUpperCase() + row.role.slice(1)}
          </span>
        </div>
      )
    },
    {
      header: 'Team',
      accessor: 'team',
      cell: (row) => (
        <div className="flex items-center">
          {row.team?.logo?.url && (
            <img 
              src={row.team.logo.url} 
              alt={row.team.name}
              className="w-6 h-6 rounded-full mr-2"
            />
          )}
          <span>{row.team?.name || 'No Team'}</span>
        </div>
      )
    },
    {
      header: 'Age',
      accessor: 'age'
    },
    {
      header: 'Statistics',
      accessor: 'statistics',
      cell: (row) => (
        <div className="text-sm">
          <div className="flex space-x-4">
            <div>
              <div className="font-bold">{row.statistics?.runs || 0}</div>
              <div className="text-xs text-gray-500">Runs</div>
            </div>
            {row.role !== 'batsman' && (
              <div>
                <div className="font-bold">{row.statistics?.wickets || 0}</div>
                <div className="text-xs text-gray-500">Wickets</div>
              </div>
            )}
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
            onClick={() => handleEditPlayer(row)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
            title="Edit"
          >
            <FaEdit />
          </button>
          <button
            onClick={() => handleDeletePlayer(row._id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
            title="Delete"
          >
            <FaTrash />
          </button>
          <a
            href={`/players/${row._id}`}
            className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
            title="View Profile"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaEye />
          </a>
        </div>
      )
    }
  ];

  const roleOptions = [
    { value: 'all', label: 'All Roles' },
    { value: 'batsman', label: 'Batsman' },
    { value: 'bowler', label: 'Bowler' },
    { value: 'allrounder', label: 'All-Rounder' },
    { value: 'wicketkeeper', label: 'Wicket Keeper' }
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Player Management</h1>
          <p className="text-gray-600">Manage all players in the tournament</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleCreatePlayer}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
          >
            <FaPlus className="mr-2" />
            Add Player
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaSearch className="inline mr-2" />
              Search Players
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Search by name, ID, or email..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaFilter className="inline mr-2" />
              Filter by Team
            </label>
            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Teams</option>
              {teams.map(team => (
                <option key={team._id} value={team._id}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Role
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {roleOptions.map(option => (
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
                <div className="text-2xl font-bold text-blue-600">{players.length}</div>
                <div className="text-sm text-gray-600">Total Players</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {players.filter(p => p.team).length}
                </div>
                <div className="text-sm text-gray-600">Assigned</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {players.filter(p => !p.team).length}
                </div>
                <div className="text-sm text-gray-600">Unassigned</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Players Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            <DataTable
              columns={columns}
              data={filteredPlayers}
              emptyMessage="No players found. Add your first player!"
            />
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-700">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, players.length)} of {players.length} players
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

      {/* Player Modal */}
      {showModal && (
        <PlayerModal
          player={editingPlayer}
          teams={teams}
          onClose={() => setShowModal(false)}
          onSave={handleSavePlayer}
        />
      )}
    </div>
  );
};

export default Players;