import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import LanguageToggle from '../components/LanguageToggle';

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useLanguage();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const result = await login(formData.email, formData.password);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error || t('auth.loginFailed'));
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute top-4 right-4">
        <LanguageToggle />
      </div>
      <div className="max-w-md w-full">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="flex justify-center">
            <img src="/logo192.png" alt="Repositori Isolat Logo" className="h-16 w-16" />
          </div>
          <h1 className="mt-5 text-4xl font-bold text-ink tracking-tighter">
            {t('common.appName')}
          </h1>
          <p className="mt-2 text-sm text-ink-secondary">{t('common.tagline')}</p>
        </div>

        {/* Card */}
        <div className="mv-panel p-8">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-error/10 border border-error/30 text-error px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="mv-label">{t('auth.email')}</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="mv-input"
                placeholder={t('auth.emailPlaceholder')}
              />
            </div>

            <div>
              <label htmlFor="password" className="mv-label">{t('auth.password')}</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="mv-input"
                placeholder="••••••••"
              />
            </div>

            <button type="submit" disabled={loading} className="mv-btn-primary mv-btn-lg w-full">
              {loading ? t('auth.signingIn') : t('auth.signIn')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
