import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Navbar from '../Common/Navbar';
import Loader from '../Common/Loader';

const AdminLayout = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader />;
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/admin/login" />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar isAdmin={true} />
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;