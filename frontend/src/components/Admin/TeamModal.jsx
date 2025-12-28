import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

const TeamModal = ({ isOpen, onClose, onSubmit, initialData, isEdit }) => {
  const [formData, setFormData] = useState({
    name: '',
    shortName: '',
    coachName: '',
    captain: '',
    foundedYear: new Date().getFullYear(),
    homeGround: '',
    logo: null,
    description: ''
  });

  const [logoPreview, setLogoPreview] = useState(null);

  useEffect(() => {
    if (isEdit && initialData) {
      setFormData({
        name: initialData.name || '',
        shortName: initialData.shortName || '',
        coachName: initialData.coachName || '',
        captain: initialData.captain || '',
        foundedYear: initialData.foundedYear || new Date().getFullYear(),
        homeGround: initialData.homeGround || '',
        logo: null,
        description: initialData.description || ''
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
      shortName: '',
      coachName: '',
      captain: '',
      foundedYear: new Date().getFullYear(),
      homeGround: '',
      logo: null,
      description: ''
    });
    setLogoPreview(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
      toast.error('Team name is required');
      return;
    }
    
    if (!formData.shortName.trim()) {
      toast.error('Short name is required');
      return;
    }
    
    if (!formData.coachName.trim()) {
      toast.error('Coach name is required');
      return;
    }

    const submitData = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key] !== null && formData[key] !== undefined) {
        submitData.append(key, formData[key]);
      }
    });

    onSubmit(submitData);
    resetForm();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gray-800 p-6 border-b border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">
              {isEdit ? 'Edit Team' : 'Create New Team'}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Team Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Team Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="Enter team name"
                  required
                />
              </div>

              {/* Short Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Short Name *
                </label>
                <input
                  type="text"
                  name="shortName"
                  value={formData.shortName}
                  onChange={handleChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="E.g., MI, CSK"
                  required
                />
              </div>

              {/* Coach Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Coach Name *
                </label>
                <input
                  type="text"
                  name="coachName"
                  value={formData.coachName}
                  onChange={handleChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="Enter coach name"
                  required
                />
              </div>

              {/* Captain */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Captain
                </label>
                <input
                  type="text"
                  name="captain"
                  value={formData.captain}
                  onChange={handleChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="Enter captain name"
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* Founded Year */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Founded Year
                </label>
                <input
                  type="number"
                  name="foundedYear"
                  value={formData.foundedYear}
                  onChange={handleChange}
                  min="1800"
                  max={new Date().getFullYear()}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>

              {/* Home Ground */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Home Ground
                </label>
                <input
                  type="text"
                  name="homeGround"
                  value={formData.homeGround}
                  onChange={handleChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="Enter home ground"
                />
              </div>

              {/* Logo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Team Logo
                </label>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full border-2 border-dashed border-gray-600 flex items-center justify-center overflow-hidden bg-gray-900">
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
                    <label className="absolute -bottom-2 -right-2 bg-yellow-600 text-white rounded-full p-1 cursor-pointer hover:bg-yellow-700">
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
                      Upload team logo (max 5MB)
                    </p>
                    <p className="text-xs text-gray-500">
                      Recommended: 200x200px PNG/JPG
                    </p>
                  </div>
                </div>
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
              placeholder="Enter team description"
            />
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
              {isEdit ? 'Update Team' : 'Create Team'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeamModal;