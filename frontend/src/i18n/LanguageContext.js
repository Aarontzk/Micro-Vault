import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { translations } from './translations';

const STORAGE_KEY = 'mv_lang';
const DEFAULT_LANG = 'id'; // Indonesian by default

const LanguageContext = createContext(null);

// Resolve a dotted path like "list.title" from an object.
function resolve(obj, path) {
  return path.split('.').reduce((acc, key) => (acc == null ? undefined : acc[key]), obj);
}

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    const saved = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null;
    return saved === 'id' || saved === 'en' ? saved : DEFAULT_LANG;
  });

  const setLang = useCallback((next) => {
    setLangState(next);
    try { window.localStorage.setItem(STORAGE_KEY, next); } catch { /* ignore */ }
  }, []);

  const toggleLang = useCallback(() => {
    setLang(lang === 'id' ? 'en' : 'id');
  }, [lang, setLang]);

  // t(path, vars?) — falls back to English, then the raw key.
  const t = useCallback((path, vars) => {
    let str = resolve(translations[lang], path);
    if (str == null) str = resolve(translations.en, path);
    if (str == null) return path;
    if (vars) {
      Object.keys(vars).forEach((k) => {
        str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), vars[k]);
      });
    }
    return str;
  }, [lang]);

  const value = useMemo(() => ({ lang, setLang, toggleLang, t }), [lang, setLang, toggleLang, t]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
