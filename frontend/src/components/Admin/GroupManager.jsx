import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FaTimes, FaUsers, FaPlus, FaTrash, FaRandom, FaSave } from 'react-icons/fa';

const GroupManager = ({ tournament, onClose, onSave }) => {
  const [groups, setGroups] = useState([]);
  const [availableTeams, setAvailableTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newGroupName, setNewGroupName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchTournamentData();
  }, [tournament]);

  const fetchTournamentData = async () => {
    try {
      setLoading(true);
      
      // Fetch tournament with groups
      const tournamentRes = await axios.get(`/api/tournaments/${tournament._id}`);
      const tournamentData = tournamentRes.data.tournament;
      
      // Fetch all teams
      const teamsRes = await axios.get('/api/teams?limit=100');
      
      // Initialize groups from tournament data
      const initialGroups = tournamentData.groups || [];
      if (initialGroups.length === 0) {
        // Create default groups if none exist
        initialGroups.push(
          { name: 'Group A', teams: [] },
          { name: 'Group B', teams: [] }
        );
      }
      
      setGroups(initialGroups);
      
      // Find teams not assigned to any group
      const assignedTeamIds = new Set();
      initialGroups.forEach(group => {
        group.teams.forEach(team => assignedTeamIds.add(team.toString()));
      });
      
      const unassignedTeams = teamsRes.data.teams.filter(
        team => !assignedTeamIds.has(team._id.toString())
      );
      
      setAvailableTeams(unassignedTeams);
    } catch (error) {
      toast.error('Failed to load tournament data');
      console.error('Error fetching tournament data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddGroup = () => {
    if (!newGroupName.trim()) {
      toast.error('Please enter a group name');
      return;
    }
    
    const groupExists = groups.some(g => g.name === newGroupName.trim());
    if (groupExists) {
      toast.error('Group name already exists');
      return;
    }
    
    setGroups(prev => [...prev, { name: newGroupName.trim(), teams: [] }]);
    setNewGroupName('');
    toast.success('Group added successfully');
  };

  const handleRemoveGroup = (groupIndex) => {
    const groupToRemove = groups[groupIndex];
    
    // Move teams back to available teams
    const teamsToMove = groupToRemove.teams.map(teamId => 
      availableTeams.find(t => t._id === teamId) || teamId
    );
    
    setAvailableTeams(prev => [...prev, ...teamsToMove]);
    setGroups(prev => prev.filter((_, index) => index !== groupIndex));
    toast.success('Group removed');
  };

  const handleAddTeamToGroup = (team, groupIndex) => {
    const group = groups[groupIndex];
    
    // Check if team already in group
    if (group.teams.includes(team._id)) {
      toast.error('Team already in this group');
      return;
    }
    
    // Update groups
    const updatedGroups = [...groups];
    updatedGroups[groupIndex].teams.push(team._id);
    setGroups(updatedGroups);
    
    // Remove from available teams
    setAvailableTeams(prev => prev.filter(t => t._id !== team._id));
    
    toast.success(`Added ${team.name} to ${group.name}`);
  };

  const handleRemoveTeamFromGroup = (teamId, groupIndex) => {
    const group = groups[groupIndex];
    const team = availableTeams.find(t => t._id === teamId) || { _id: teamId, name: 'Unknown Team' };
    
    // Update groups
    const updatedGroups = [...groups];
    updatedGroups[groupIndex].teams = updatedGroups[groupIndex].teams.filter(id => id !== teamId);
    setGroups(updatedGroups);
    
    // Add back to available teams if we have the team object
    if (team.name !== 'Unknown Team') {
      setAvailableTeams(prev => [...prev, team]);
    }
    
    toast.success(`Removed team from ${group.name}`);
  };

  const handleAutoDistribute = () => {
    if (availableTeams.length === 0) {
      toast.error('No teams available to distribute');
      return;
    }
    
    const updatedGroups = [...groups];
    let groupIndex = 0;
    
    // Distribute available teams equally among groups
    availableTeams.forEach(team => {
      updatedGroups[groupIndex].teams.push(team._id);
      groupIndex = (groupIndex + 1) % updatedGroups.length;
    });
    
    setGroups(updatedGroups);
    setAvailableTeams([]);
    toast.success('Teams distributed evenly among groups');
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      // Filter out empty groups
      const groupsToSave = groups.filter(group => group.name.trim() !== '');
      
      await axios.put(`/api/tournaments/${tournament._id}`, {
        groups: groupsToSave
      });
      
      toast.success('Groups saved successfully');
      onSave(); // Refresh parent component
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save groups');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading tournament data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Manage Groups</h2>
              <p className="text-gray-600">{tournament.name} - {tournament.season}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <FaTimes className="text-gray-500" />
            </button>
          </div>

          {/* Add Group Section */}
          <div className="mb-8 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-4">
              <input
                type="text"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="Enter new group name"
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={handleAddGroup}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
              >
                <FaPlus className="mr-2" />
                Add Group
              </button>
              <button
                onClick={handleAutoDistribute}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                disabled={availableTeams.length === 0}
              >
                <FaRandom className="mr-2" />
                Auto Distribute
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Available Teams */}
            <div className="lg:col-span-1">
              <div className="bg-white border border-gray-200 rounded-lg p-4 h-full">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <FaUsers className="mr-2" />
                  Available Teams ({availableTeams.length})
                </h3>
                
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {availableTeams.map(team => (
                    <div
                      key={team._id}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center">
                        {team.logo?.url && (
                          <img 
                            src={team.logo.url} 
                            alt={team.name}
                            className="w-8 h-8 rounded-full mr-3"
                          />
                        )}
                        <span className="font-medium">{team.name}</span>
                      </div>
                      <div className="flex space-x-2">
                        {groups.map((group, groupIndex) => (
                          <button
                            key={groupIndex}
                            onClick={() => handleAddTeamToGroup(team, groupIndex)}
                            className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                            title={`Add to ${group.name}`}
                          >
                            {group.name.charAt(0)}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                  
                  {availableTeams.length === 0 && (
                    <p className="text-center text-gray-500 py-8">All teams are assigned to groups</p>
                  )}
                </div>
              </div>
            </div>

            {/* Groups */}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {groups.map((group, groupIndex) => (
                  <div key={groupIndex} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-bold text-gray-800">
                        {group.name} ({group.teams.length} teams)
                      </h3>
                      <button
                        onClick={() => handleRemoveGroup(groupIndex)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        title="Remove Group"
                      >
                        <FaTrash />
                      </button>
                    </div>
                    
                    <div className="space-y-2 max-h-[350px] overflow-y-auto">
                      {group.teams.map((teamId, teamIndex) => {
                        const team = availableTeams.find(t => t._id === teamId) || 
                                    { _id: teamId, name: 'Loading...' };
                        
                        return (
                          <div
                            key={teamIndex}
                            className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                          >
                            <div className="flex items-center">
                              {team.logo?.url && (
                                <img 
                                  src={team.logo.url} 
                                  alt={team.name}
                                  className="w-8 h-8 rounded-full mr-3"
                                />
                              )}
                              <span className="font-medium">{team.name}</span>
                            </div>
                            <button
                              onClick={() => handleRemoveTeamFromGroup(teamId, groupIndex)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                              title="Remove from group"
                            >
                              <FaTimes />
                            </button>
                          </div>
                        );
                      })}
                      
                      {group.teams.length === 0 && (
                        <p className="text-center text-gray-500 py-8">No teams in this group</p>
                      )}
                    </div>
                    
                    <div className="mt-4 text-sm text-gray-600">
                      Drag teams from available list or use auto distribute
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{groups.length}</div>
                <div className="text-sm text-gray-600">Groups</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {groups.reduce((total, group) => total + group.teams.length, 0)}
                </div>
                <div className="text-sm text-gray-600">Assigned Teams</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{availableTeams.length}</div>
                <div className="text-sm text-gray-600">Available Teams</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {tournament.teams?.length || 0}
                </div>
                <div className="text-sm text-gray-600">Total in Tournament</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`px-6 py-3 rounded-lg text-white flex items-center ${
                isSaving
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <FaSave className="mr-2" />
                  Save Groups
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupManager;