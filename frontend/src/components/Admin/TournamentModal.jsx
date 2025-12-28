import React, { useState, useEffect } from 'react';
import { FaTimes, FaCalendarAlt } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const TournamentModal = ({ tournament, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    tournamentId: '',
    season: new Date().getFullYear().toString(),
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    format: 'T20',
    totalOvers: 20,
    maxPlayersPerTeam: 15,
    status: 'upcoming'
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatOptions = [
    { value: 'T20', label: 'T20 (20 Overs)' },
    { value: 'ODI', label: 'ODI (50 Overs)' },
    { value: 'Test', label: 'Test Match' },
    { value: 'Custom', label: 'Custom Format' }
  ];

  const statusOptions = [
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'ongoing', label: 'Ongoing' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  useEffect(() => {
    if (tournament) {
      setFormData({
        name: tournament.name || '',
        tournamentId: tournament.tournamentId || '',
        season: tournament.season || new Date().getFullYear().toString(),
        startDate: new Date(tournament.startDate) || new Date(),
        endDate: new Date(tournament.endDate) || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        format: tournament.format || 'T20',
        totalOvers: tournament.totalOvers || 20,
        maxPlayersPerTeam: tournament.maxPlayersPerTeam || 15,
        status: tournament.status || 'upcoming'
      });
    }
  }, [tournament]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Tournament name is required';
    }
    
    if (!formData.tournamentId.trim()) {
      newErrors.tournamentId = 'Tournament ID is required';
    } else if (!/^[A-Z0-9]+$/.test(formData.tournamentId)) {
      newErrors.tournamentId = 'Tournament ID should contain only uppercase letters and numbers';
    }
    
    if (!formData.season.trim()) {
      newErrors.season = 'Season is required';
    }
    
    if (formData.endDate <= formData.startDate) {
      newErrors.endDate = 'End date must be after start date';
    }
    
    if (formData.startDate < new Date()) {
      newErrors.startDate = 'Start date cannot be in the past';
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

  const handleDateChange = (date, field) => {
    setFormData(prev => ({
      ...prev,
      [field]: date
    }));
    
    // Clear error when date is modified
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    try {
      const dataToSave = {
        ...formData,
        startDate: formData.startDate.toISOString(),
        endDate: formData.endDate.toISOString()
      };
      
      await onSave(dataToSave);
    } catch (error) {
      console.error('Error saving tournament:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateTournamentId = () => {
    const name = formData.name.trim();
    if (name) {
      const words = name.split(' ');
      const initials = words.map(word => word.charAt(0).toUpperCase()).join('');
      const season = formData.season.slice(-2);
      const tournamentId = `${initials}${season}`;
      
      setFormData(prev => ({
        ...prev,
        tournamentId
      }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {tournament ? 'Edit Tournament' : 'Create New Tournament'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <FaTimes className="text-gray-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Tournament Name *
                    </label>
                    <button
                      type="button"
                      onClick={generateTournamentId}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Generate ID
                    </button>
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Indian Premier League"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tournament ID *
                  </label>
                  <input
                    type="text"
                    name="tournamentId"
                    value={formData.tournamentId}
                    onChange={handleChange}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.tournamentId ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="e.g., IPL2024"
                    style={{ textTransform: 'uppercase' }}
                  />
                  {errors.tournamentId && (
                    <p className="mt-1 text-sm text-red-600">{errors.tournamentId}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Season *
                  </label>
                  <input
                    type="text"
                    name="season"
                    value={formData.season}
                    onChange={handleChange}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.season ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="e.g., 2024"
                  />
                  {errors.season && (
                    <p className="mt-1 text-sm text-red-600">{errors.season}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date *
                  </label>
                  <div className="relative">
                    <DatePicker
                      selected={formData.startDate}
                      onChange={(date) => handleDateChange(date, 'startDate')}
                      minDate={new Date()}
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.startDate ? 'border-red-300' : 'border-gray-300'
                      }`}
                      dateFormat="dd/MM/yyyy"
                    />
                    <FaCalendarAlt className="absolute right-3 top-3 text-gray-400" />
                  </div>
                  {errors.startDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date *
                  </label>
                  <div className="relative">
                    <DatePicker
                      selected={formData.endDate}
                      onChange={(date) => handleDateChange(date, 'endDate')}
                      minDate={formData.startDate}
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.endDate ? 'border-red-300' : 'border-gray-300'
                      }`}
                      dateFormat="dd/MM/yyyy"
                    />
                    <FaCalendarAlt className="absolute right-3 top-3 text-gray-400" />
                  </div>
                  {errors.endDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
                  )}
                </div>
              </div>

              {/* Format and Settings */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Match Format *
                  </label>
                  <select
                    name="format"
                    value={formData.format}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {formatOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                {formData.format !== 'Test' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Overs per Inning
                    </label>
                    <input
                      type="number"
                      name="totalOvers"
                      value={formData.totalOvers}
                      onChange={handleChange}
                      min="1"
                      max="50"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Players per Team
                </label>
                <input
                  type="number"
                  name="maxPlayersPerTeam"
                  value={formData.maxPlayersPerTeam}
                  onChange={handleChange}
                  min="11"
                  max="20"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Minimum 11 players required per team, maximum 20 allowed
                </p>
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
                  tournament ? 'Update Tournament' : 'Create Tournament'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TournamentModal;