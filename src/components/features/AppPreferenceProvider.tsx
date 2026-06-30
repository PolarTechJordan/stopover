'use client';

/* eslint-disable react-hooks/set-state-in-effect */

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  APP_PREFERENCES_STORAGE_KEY,
  DEFAULT_APP_PREFERENCES,
  type AppPreferences,
  type LanguageCode,
  type TextScale,
  type ThemeMode,
} from '@/lib/appPreferences';

type AppPreferenceContextValue = AppPreferences & {
  setLanguage: (language: LanguageCode) => void;
  toggleLanguage: () => void;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  setTextScale: (scale: TextScale) => void;
  cycleTextScale: () => void;
};

const AppPreferenceContext = createContext<AppPreferenceContextValue | null>(null);

function readStoredPreferences(): AppPreferences {
  if (typeof window === 'undefined') {
    return DEFAULT_APP_PREFERENCES;
  }

  try {
    const stored = window.localStorage.getItem(APP_PREFERENCES_STORAGE_KEY);
    const parsed = stored ? (JSON.parse(stored) as Partial<AppPreferences>) : {};
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    return {
      language: parsed.language === 'en-US' || parsed.language === 'zh-CN' ? parsed.language : 'zh-CN',
      theme: parsed.theme === 'light' || parsed.theme === 'dark' ? parsed.theme : prefersDark ? 'dark' : 'light',
      textScale:
        parsed.textScale === 'compact' || parsed.textScale === 'comfortable' || parsed.textScale === 'large'
          ? parsed.textScale
          : 'comfortable',
    };
  } catch {
    return DEFAULT_APP_PREFERENCES;
  }
}

function writeDocumentPreferences(preferences: AppPreferences) {
  const root = document.documentElement;
  root.lang = preferences.language;
  root.dataset.lang = preferences.language;
  root.dataset.theme = preferences.theme;
  root.dataset.textScale = preferences.textScale;
  root.style.colorScheme = preferences.theme;
}

export function AppPreferenceProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useState<AppPreferences>(DEFAULT_APP_PREFERENCES);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const storedPreferences = readStoredPreferences();
    setPreferences(storedPreferences);
    setIsReady(true);
    writeDocumentPreferences(storedPreferences);
    window.localStorage.setItem(APP_PREFERENCES_STORAGE_KEY, JSON.stringify(storedPreferences));
  }, []);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    writeDocumentPreferences(preferences);
    window.localStorage.setItem(APP_PREFERENCES_STORAGE_KEY, JSON.stringify(preferences));
  }, [isReady, preferences]);

  const value = useMemo<AppPreferenceContextValue>(
    () => ({
      ...preferences,
      setLanguage: (language) => setPreferences((current) => ({ ...current, language })),
      toggleLanguage: () =>
        setPreferences((current) => ({ ...current, language: current.language === 'zh-CN' ? 'en-US' : 'zh-CN' })),
      setTheme: (theme) => setPreferences((current) => ({ ...current, theme })),
      toggleTheme: () =>
        setPreferences((current) => ({ ...current, theme: current.theme === 'light' ? 'dark' : 'light' })),
      setTextScale: (textScale) => setPreferences((current) => ({ ...current, textScale })),
      cycleTextScale: () =>
        setPreferences((current) => {
          const nextScale: Record<TextScale, TextScale> = {
            compact: 'comfortable',
            comfortable: 'large',
            large: 'compact',
          };
          return { ...current, textScale: nextScale[current.textScale] };
        }),
    }),
    [preferences],
  );

  return <AppPreferenceContext.Provider value={value}>{children}</AppPreferenceContext.Provider>;
}

export function useAppPreferences() {
  const value = useContext(AppPreferenceContext);
  if (!value) {
    throw new Error('useAppPreferences must be used inside AppPreferenceProvider');
  }
  return value;
}
