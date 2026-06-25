import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import LanguageToggle from '../components/LanguageToggle';
import StrainList from './StrainList';

function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { t } = useLanguage();

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
              <img src="/logo192.png" alt="Repositori Isolat Logo" className="h-7 w-7" />
              <span className="text-lg font-bold text-ink tracking-tighter">{t('common.appName')}</span>
            </div>
            <div className="flex items-center gap-3">
              <LanguageToggle />
              <span className="text-sm text-ink-secondary hidden md:inline">
                {user?.full_name}{' '}
                <span className="text-neutral">({user?.role})</span>
              </span>
              <button onClick={handleLogout} className="mv-btn-danger mv-btn-sm">
                {t('nav.logout')}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <StrainList />
    </div>
  );
}

export default Dashboard;
