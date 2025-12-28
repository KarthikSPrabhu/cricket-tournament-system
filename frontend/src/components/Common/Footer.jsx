import React from 'react';
import { Link } from 'react-router-dom';
import { CgCricket } from 'react-icons/cg';
import { FaTwitter, FaFacebook, FaInstagram, FaYoutube } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div>
            <Link to="/" className="flex items-center space-x-2">
              <CgCricket className="h-8 w-8 text-yellow-500" />
              <span className="text-xl font-bold">CricketPro</span>
            </Link>
            <p className="mt-4 text-gray-400">
              Professional cricket tournament management system with live scoring and statistics.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/matches" className="text-gray-400 hover:text-white">Matches</Link></li>
              <li><Link to="/leaderboard" className="text-gray-400 hover:text-white">Leaderboard</Link></li>
              <li><Link to="/players" className="text-gray-400 hover:text-white">Players</Link></li>
              <li><Link to="/stats" className="text-gray-400 hover:text-white">Statistics</Link></li>
            </ul>
          </div>

          {/* Admin Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Admin</h3>
            <ul className="space-y-2">
              <li><Link to="/admin/login" className="text-gray-400 hover:text-white">Admin Login</Link></li>
              <li><Link to="/admin/dashboard" className="text-gray-400 hover:text-white">Dashboard</Link></li>
              <li><Link to="/admin/live-scoring" className="text-gray-400 hover:text-white">Live Scoring</Link></li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-blue-400">
                <FaTwitter className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-600">
                <FaFacebook className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-pink-600">
                <FaInstagram className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-red-600">
                <FaYoutube className="h-6 w-6" />
              </a>
            </div>
            <div className="mt-6">
              <p className="text-gray-400">Contact: support@cricketpro.com</p>
              <p className="text-gray-400">Phone: +1 (555) 123-4567</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-gray-400">
          <p>&copy; {currentYear} CricketPro Tournament System. All rights reserved.</p>
          <p className="mt-2">Developed with ❤️ for cricket lovers worldwide</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;