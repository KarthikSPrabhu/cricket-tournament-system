import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { CgCricket } from 'react-icons/cg';
import { HiMenu, HiX } from 'react-icons/hi';

const Navbar = ({ isAdmin }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate(isAdmin ? '/admin/login' : '/');
  };

  const adminLinks = [
    { name: 'Dashboard', path: '/admin/dashboard' },
    { name: 'Teams', path: '/admin/teams' },
    { name: 'Players', path: '/admin/players' },
    { name: 'Tournaments', path: '/admin/tournaments' },
    { name: 'Live Scoring', path: '/admin/live-scoring' },
  ];

  const viewerLinks = [
    { name: 'Home', path: '/' },
    { name: 'Live Matches', path: '/live' },
    { name: 'Matches', path: '/matches' },
    { name: 'Leaderboard', path: '/leaderboard' },
    { name: 'Players', path: '/players' },
    { name: 'Statistics', path: '/stats' },
  ];

  const links = isAdmin ? adminLinks : viewerLinks;

  return (
    <nav className="bg-gray-900 text-white fixed w-full z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to={isAdmin ? '/admin/dashboard' : '/'} className="flex items-center space-x-2">
              <CgCricket className="h-8 w-8 text-yellow-500" />
              <span className="text-xl font-bold">CricketPro</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {links.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700 transition"
                >
                  {link.name}
                </Link>
              ))}
              {user && (
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 rounded-md text-sm font-medium bg-red-600 hover:bg-red-700 transition"
                >
                  Logout
                </button>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md hover:bg-gray-700"
            >
              {isOpen ? <HiX className="h-6 w-6" /> : <HiMenu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-gray-800">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {links.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-700"
              >
                {link.name}
              </Link>
            ))}
            {user && (
              <button
                onClick={handleLogout}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium bg-red-600 hover:bg-red-700"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;