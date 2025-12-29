import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { toast } from 'react-hot-toast';
import useTeams from '../../hooks/useTeams';

const TournamentModal = ({ isOpen, onClose, onSubmit, initialData, isEdit }) => {
  const [formData, setFormData] = useState({
    name: '',
    format: 'league',
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    teams: [],
    description: '',
    prizeMoney: '', 
    rules: '',
    logo: null
  });

  const [logoPreview, setLogoPreview] = useState(null);
  const { teams, loading: teamsLoading } = useTeams();

  useEffect(() => {
    if (isEdit && initialData) {
      setFormData({
        name: initialData.name || '',
        format: initialData.format || 'league',
        startDate: initialData.startDate ? new Date(initialData.startDate) : new Date(),
        endDate: initialData.endDate ? new Date(initialData.endDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        teams: initialData.teams?.map(t => t._id || t) || [],
        description: initialData.description || '',
        prizeMoney: initialData.prizeMoney || '',
        rules: initialData.rules || '',
        logo: null
      });
      if (initialData.logo) {
        setLogoPreview(initialData.logo);
      }
    } else {
      resetForm();
    }
  }, [isEdit, initialData, isOpen]);

  const resetForm = () => {
    setFormData({
      name: '',
      format: 'league',
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      teams: [],
      description: '',
      prizeMoney: '',
      rules: '',
      logo: null
    });
    setLogoPreview(null);
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    
    if (type === 'select-multiple') {
      const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
      setFormData(prev => ({ ...prev, [name]: selectedOptions }));
    } else if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: e.target.checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleDateChange = (name, date) => {
    setFormData(prev => ({ ...prev, [name]: date }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should be less than 5MB');
        return;
      }
      setFormData(prev => ({ ...prev, logo: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      toast.error('Tournament name is required');
      return;
    }
    
    if (!formData.startDate || !formData.endDate) {
      toast.error('Start and end dates are required');
      return;
    }
    
    if (formData.startDate > formData.endDate) {
      toast.error('End date must be after start date');
      return;
    }
    
    if (formData.teams.length < 2) {
      toast.error('Select at least 2 teams');
      return;
    }

    const submitData = new FormData();
    Object.keys(formData).forEach(key => {
      if (key === 'startDate' || key === 'endDate') {
        submitData.append(key, formData[key].toISOString());
      } else if (key === 'teams') {
        formData[key].forEach((teamId, index) => {
          submitData.append(`teams[${index}]`, teamId);
        });
      } else if (formData[key] !== null && formData[key] !== undefined) {
        submitData.append(key, formData[key]);
      }
    });

    onSubmit(submitData);
    resetForm();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gray-800 p-6 border-b border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">
              {isEdit ? 'Edit Tournament' : 'Create New Tournament'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Tournament Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tournament Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="Enter tournament name"
                  required
                />
              </div>

              {/* Format */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Format *
                </label>
                <select
                  name="format"
                  value={formData.format}
                  onChange={handleChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  required
                >
                  <option value="league">League</option>
                  <option value="knockout">Knockout</option>
                  <option value="league_knockout">League + Knockout</option>
                </select>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Start Date *
                  </label>
                  <DatePicker
                    selected={formData.startDate}
                    onChange={(date) => handleDateChange('startDate', date)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    dateFormat="MMMM d, yyyy"
                    minDate={new Date()}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    End Date *
                  </label>
                  <DatePicker
                    selected={formData.endDate}
                    onChange={(date) => handleDateChange('endDate', date)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    dateFormat="MMMM d, yyyy"
                    minDate={formData.startDate}
                  />
                </div>
              </div>

              {/* Teams Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Select Teams * (Min: 2)
                </label>
                <select
                  name="teams"
                  multiple
                  value={formData.teams}
                  onChange={handleChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 min-h-32"
                  required
                >
                  {teamsLoading ? (
                    <option disabled>Loading teams...</option>
                  ) : (
                    teams.map(team => (
                      <option key={team._id} value={team._id}>
                        {team.name} ({team.shortName})
                      </option>
                    ))
                  )}
                </select>
                <p className="text-xs text-gray-400 mt-2">
                  Hold Ctrl/Cmd to select multiple teams
                </p>
                <p className="text-sm text-gray-300 mt-1">
                  Selected: {formData.teams.length} teams
                </p>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* Prize Money */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Prize Money
                </label>
                <input
                  type="text"
                  name="prizeMoney"
                  value={formData.prizeMoney}
                  onChange={handleChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="E.g., $1,000,000"
                />
              </div>

              {/* Logo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tournament Logo
                </label>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-600 flex items-center justify-center overflow-hidden bg-gray-900">
                      {logoPreview ? (
                        <img
                          src={logoPreview}
                          alt="Logo preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-gray-500">Logo</span>
                      )}
                    </div>
                    <label className="absolute -bottom-2 -right-2 bg-yellow-600 text-white rounded-full p-2 cursor-pointer hover:bg-yellow-700">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-400">
                      Upload tournament logo (max 5MB)
                    </p>
                    <p className="text-xs text-gray-500">
                      Recommended: 300x300px PNG/JPG
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="Enter tournament description"
                />
              </div>

              {/* Rules */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Rules & Regulations
                </label>
                <textarea
                  name="rules"
                  value={formData.rules}
                  onChange={handleChange}
                  rows="3"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="Enter tournament rules"
                />
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition"
            >
              {isEdit ? 'Update Tournament' : 'Create Tournament'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TournamentModal;