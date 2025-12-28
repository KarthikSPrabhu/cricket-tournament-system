import React from 'react';

const Loader = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="relative">
        <div className="h-32 w-32 rounded-full border-t-8 border-b-8 border-yellow-500"></div>
        <div className="absolute top-0 left-0 h-32 w-32 rounded-full border-t-8 border-b-8 border-blue-500 animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-20 w-20 rounded-full border-8 border-transparent border-t-gray-700 animate-spin"></div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white font-bold text-lg mt-24">Loading...</div>
        </div>
      </div>
    </div>
  );
};

export const Spinner = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-4',
    lg: 'h-12 w-12 border-6'
  };

  return (
    <div className={`animate-spin rounded-full ${sizeClasses[size]} border-t-transparent border-yellow-500`}></div>
  );
};

export default Loader;