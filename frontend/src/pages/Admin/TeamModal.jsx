import React, { useState, useEffect } from 'react';
import { FaTimes, FaUpload, FaCamera } from 'react-icons/fa';

const TeamModal = ({ team, tournaments, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    teamId: '',
    coach: '',
    homeGround: '',
    foundedYear: '',
    tournamentId: '',
    logo: null
  });
  
  const [previewImage, setPreviewImage] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (team) {
      setFormData({
        name: team.name || '',
        teamId: team.teamId || '',
        coach: team.coach || '',
        homeGround: team.homeGround || '',
        foundedYear: team.foundedYear || '',
        tournamentId: team.tournamentId?._id || '',
        logo: null
      });
      if (team.logo?.url) {
        setPreviewImage(team.logo.url);
      }
    }
  }, [team]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Team name is required';
    }
    
    if (!formData.teamId.trim()) {
      newErrors.teamId = 'Team ID is required';
    } else if (!/^[A-Z0-9]+$/.test(formData.teamId)) {
      newErrors.teamId = 'Team ID should contain only uppercase letters and numbers';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is modified
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setErrors(prev => ({
          ...prev,
          logo: 'Image size should be less than 5MB'
        }));
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({
          ...prev,
          logo: 'Please upload an image file'
        }));
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        logo: file
      }));
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
      
      // Clear error
      if (errors.logo) {
        setErrors(prev => ({
          ...prev,
          logo: ''
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Error saving team:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateTeamId = () => {
    const name = formData.name.trim();
    if (name) {
      const initials = name
        .split(' ')
        .map(word => word.charAt(0).toUpperCase())
        .join('');
      const randomNum = Math.floor(100 + Math.random() * 900);
      const teamId = `${initials}${randomNum}`;
      
      setFormData(prev => ({
        ...prev,
        teamId
      }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {team ? 'Edit Team' : 'Create New Team'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <FaTimes className="text-gray-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column - Image Upload */}
              <div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Team Logo
                  </label>
                  <div className="flex items-center justify-center">
                    <div className="relative">
                      <div className="w-48 h-48 rounded-full border-4 border-gray-200 overflow-hidden bg-gray-100">
                        {previewImage ? (
                          <img
                            src={previewImage}
                            alt="Team Logo Preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <FaCamera className="text-gray-400 text-4xl" />
                          </div>
                        )}
                      </div>
                      <label
                        htmlFor="logo-upload"
                        className="absolute bottom-2 right-2 bg-blue-600 text-white p-3 rounded-full cursor-pointer hover:bg-blue-700"
                      >
                        <FaUpload />
                        <input
                          id="logo-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                  {errors.logo && (
                    <p className="mt-2 text-sm text-red-600">{errors.logo}</p>
                  )}
                  <p className="mt-2 text-sm text-gray-500 text-center">
                    Upload team logo (Max 5MB, PNG/JPG)
                  </p>
                </div>
              </div>

              {/* Right Column - Form Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Team Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter team name"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Team ID *
                    </label>
                    <button
                      type="button"
                      onClick={generateTeamId}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Generate ID
                    </button>
                  </div>
                  <input
                    type="text"
                    name="teamId"
                    value={formData.teamId}
                    onChange={handleChange}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.teamId ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="E.g., CSK2024"
                    style={{ textTransform: 'uppercase' }}
                  />
                  {errors.teamId && (
                    <p className="mt-1 text-sm text-red-600">{errors.teamId}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tournament
                  </label>
                  <select
                    name="tournamentId"
                    value={formData.tournamentId}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Tournament</option>
                    {tournaments.map(tournament => (
                      <option key={tournament._id} value={tournament._id}>
                        {tournament.name} ({tournament.season})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Coach
                  </label>
                  <input
                    type="text"
                    name="coach"
                    value={formData.coach}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter coach name"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Home Ground
                    </label>
                    <input
                      type="text"
                      name="homeGround"
                      value={formData.homeGround}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Stadium name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Founded Year
                    </label>
                    <input
                      type="number"
                      name="foundedYear"
                      value={formData.foundedYear}
                      onChange={handleChange}
                      min="1800"
                      max={new Date().getFullYear()}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="YYYY"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-6 py-3 rounded-lg text-white ${
                  isSubmitting
                    ? 'bg-blue-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  team ? 'Update Team' : 'Create Team'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TeamModal;