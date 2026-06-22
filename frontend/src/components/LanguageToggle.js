import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';

// Segmented ID / EN switch.
function LanguageToggle() {
  const { lang, setLang } = useLanguage();
  const opts = [
    ['id', 'ID'],
    ['en', 'EN'],
  ];
  return (
    <div className="inline-flex items-center rounded-md border border-edge bg-surface p-0.5" role="group" aria-label="Language">
      {opts.map(([code, label]) => (
        <button
          key={code}
          type="button"
          onClick={() => setLang(code)}
          aria-pressed={lang === code}
          className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
            lang === code ? 'bg-primary text-white' : 'text-ink-secondary hover:text-ink'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export default LanguageToggle;
