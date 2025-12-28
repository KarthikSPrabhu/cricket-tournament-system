import React, { useState, useEffect } from 'react';
import { FaTimes, FaUpload, FaUser, FaRandom } from 'react-icons/fa';

const PlayerModal = ({ player, teams, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    playerId: '',
    name: '',
    age: '',
    phone: '',
    email: '',
    role: 'batsman',
    battingStyle: '',
    bowlingStyle: '',
    isCaptain: false,
    isWicketKeeper: false,
    teamId: '',
    photo: null
  });
  
  const [previewImage, setPreviewImage] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Role-specific styles
  const battingStyles = [
    { value: '', label: 'Select batting style' },
    { value: 'right-handed', label: 'Right Handed' },
    { value: 'left-handed', label: 'Left Handed' }
  ];

  const bowlingStyles = [
    { value: '', label: 'Select bowling style' },
    { value: 'right-arm fast', label: 'Right Arm Fast' },
    { value: 'right-arm medium', label: 'Right Arm Medium' },
    { value: 'right-arm spin', label: 'Right Arm Spin' },
    { value: 'left-arm fast', label: 'Left Arm Fast' },
    { value: 'left-arm medium', label: 'Left Arm Medium' },
    { value: 'left-arm spin', label: 'Left Arm Spin' }
  ];

  const roles = [
    { value: 'batsman', label: 'Batsman' },
    { value: 'bowler', label: 'Bowler' },
    { value: 'allrounder', label: 'All-Rounder' },
    { value: 'wicketkeeper', label: 'Wicket Keeper' }
  ];

  useEffect(() => {
    if (player) {
      setFormData({
        playerId: player.playerId || '',
        name: player.name || '',
        age: player.age || '',
        phone: player.phone || '',
        email: player.email || '',
        role: player.role || 'batsman',
        battingStyle: player.battingStyle || '',
        bowlingStyle: player.bowlingStyle || '',
        isCaptain: player.isCaptain || false,
        isWicketKeeper: player.isWicketKeeper || false,
        teamId: player.team?._id || '',
        photo: null
      });
      if (player.photo?.url) {
        setPreviewImage(player.photo.url);
      }
    }
  }, [player]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.playerId.trim()) {
      newErrors.playerId = 'Player ID is required';
    } else if (!/^[A-Z0-9]+$/.test(formData.playerId)) {
      newErrors.playerId = 'Player ID should contain only uppercase letters and numbers';
    }
    
    if (!formData.name.trim()) {
      newErrors.name = 'Player name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[0-9]{10}$/.test(formData.phone)) {
      newErrors.phone = 'Phone number must be 10 digits';
    }
    
    if (!formData.age) {
      newErrors.age = 'Age is required';
    } else if (formData.age < 16 || formData.age > 50) {
      newErrors.age = 'Age must be between 16 and 50';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when field is modified
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Auto-set wicketkeeper if role is wicketkeeper
    if (name === 'role' && value === 'wicketkeeper') {
      setFormData(prev => ({
        ...prev,
        isWicketKeeper: true
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setErrors(prev => ({
          ...prev,
          photo: 'Image size should be less than 5MB'
        }));
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({
          ...prev,
          photo: 'Please upload an image file'
        }));
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        photo: file
      }));
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
      
      // Clear error
      if (errors.photo) {
        setErrors(prev => ({
          ...prev,
          photo: ''
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
      console.error('Error saving player:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const generatePlayerId = () => {
    const name = formData.name.trim();
    if (name) {
      const initials = name
        .split(' ')
        .map(word => word.charAt(0).toUpperCase())
        .join('');
      const randomNum = Math.floor(100 + Math.random() * 900);
      const playerId = `${initials}${randomNum}`;
      
      setFormData(prev => ({
        ...prev,
        playerId
      }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {player ? 'Edit Player' : 'Create New Player'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <FaTimes className="text-gray-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Image Upload */}
              <div className="lg:col-span-1">
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Player Photo
                  </label>
                  <div className="flex items-center justify-center">
                    <div className="relative">
                      <div className="w-48 h-48 rounded-full border-4 border-gray-200 overflow-hidden bg-gray-100">
                        {previewImage ? (
                          <img
                            src={previewImage}
                            alt="Player Photo Preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <FaUser className="text-gray-400 text-4xl" />
                          </div>
                        )}
                      </div>
                      <label
                        htmlFor="photo-upload"
                        className="absolute bottom-2 right-2 bg-blue-600 text-white p-3 rounded-full cursor-pointer hover:bg-blue-700"
                      >
                        <FaUpload />
                        <input
                          id="photo-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                  {errors.photo && (
                    <p className="mt-2 text-sm text-red-600">{errors.photo}</p>
                  )}
                  <p className="mt-2 text-sm text-gray-500 text-center">
                    Upload player photo (Max 5MB, PNG/JPG)
                  </p>
                </div>

                {/* Team Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Team
                  </label>
                  <select
                    name="teamId"
                    value={formData.teamId}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">No Team (Free Agent)</option>
                    {teams.map(team => (
                      <option key={team._id} value={team._id}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Captain/Wicketkeeper Checkboxes */}
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="isCaptain"
                      checked={formData.isCaptain}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Team Captain</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="isWicketKeeper"
                      checked={formData.isWicketKeeper}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Wicket Keeper</span>
                  </label>
                </div>
              </div>

              {/* Middle Column - Basic Info */}
              <div className="lg:col-span-2 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Player ID *
                      </label>
                      <button
                        type="button"
                        onClick={generatePlayerId}
                        className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                      >
                        <FaRandom className="mr-1" />
                        Generate
                      </button>
                    </div>
                    <input
                      type="text"
                      name="playerId"
                      value={formData.playerId}
                      onChange={handleChange}
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.playerId ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="E.g., PLAYER001"
                      style={{ textTransform: 'uppercase' }}
                    />
                    {errors.playerId && (
                      <p className="mt-1 text-sm text-red-600">{errors.playerId}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.name ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter full name"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Age *
                    </label>
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleChange}
                      min="16"
                      max="50"
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.age ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter age"
                    />
                    {errors.age && (
                      <p className="mt-1 text-sm text-red-600">{errors.age}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role *
                    </label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {roles.map(role => (
                        <option key={role.value} value={role.value}>
                          {role.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="player@example.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.phone ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="9876543210"
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                  )}
                </div>

                {/* Style Selection */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Batting Style
                    </label>
                    <select
                      name="battingStyle"
                      value={formData.battingStyle}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {battingStyles.map(style => (
                        <option key={style.value} value={style.value}>
                          {style.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bowling Style
                    </label>
                    <select
                      name="bowlingStyle"
                      value={formData.bowlingStyle}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {bowlingStyles.map(style => (
                        <option key={style.value} value={style.value}>
                          {style.label}
                        </option>
                      ))}
                    </select>
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
                  player ? 'Update Player' : 'Create Player'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PlayerModal;