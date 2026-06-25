import { render, screen } from '@testing-library/react';
import { LanguageProvider, useLanguage } from './i18n/LanguageContext';

function LoginCopySmoke() {
  const { t } = useLanguage();
  return (
    <main>
      <h1>{t('common.appName')}</h1>
      <button type="button">{t('auth.signIn')}</button>
    </main>
  );
}

test('renders default Indonesian app copy', () => {
  render(
    <LanguageProvider>
      <LoginCopySmoke />
    </LanguageProvider>,
  );

  expect(screen.getByRole('heading', { name: 'Repositori Isolat' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Masuk' })).toBeInTheDocument();
});
