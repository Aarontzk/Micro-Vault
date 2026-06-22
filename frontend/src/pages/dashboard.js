import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import StrainList from './StrainList';

function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky nav — backdrop blur, 56px, bottom border */}
      <nav className="sticky top-0 z-40 h-14 bg-surface/80 backdrop-blur border-b border-edge">
        <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-full">
            <div className="flex items-center space-x-2">
              <img src="/logo192.png" alt="MicroVault Logo" className="h-7 w-7" />
              <span className="text-lg font-bold text-ink tracking-tighter">MicroVault</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-ink-secondary hidden sm:inline">
                {user?.full_name}{' '}
                <span className="text-neutral">({user?.role})</span>
              </span>
              <button onClick={handleLogout} className="mv-btn-danger mv-btn-sm">
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Content — Strain List */}
      <StrainList />
    </div>
  );
}

export default Dashboard;
