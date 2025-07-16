import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DashboardNavbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  return (
    <nav className="w-full bg-white shadow flex items-center justify-between px-6 py-3 mb-6">
      <div className="flex items-center gap-2">
        <span className="font-bold text-xl text-blue-700 tracking-wide">IQS Authority</span>
      </div>
      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700 text-lg">
              {user.name ? user.name.charAt(0).toUpperCase() : '?'}
            </div>
            <span className="font-medium text-gray-800 mr-2">{user.name || user.email}</span>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="ml-2 px-4 py-2 rounded bg-red-500 text-white font-semibold hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default DashboardNavbar;
