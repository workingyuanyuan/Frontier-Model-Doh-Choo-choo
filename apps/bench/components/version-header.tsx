'use client';

import { useLayoutEffect, useState } from 'react';

export type ThemeId = 'light' | 'dark' | 'blue';

const THEME_STORAGE_KEY = 'fm-dcc-theme';
const THEME_IDS: ThemeId[] = ['light', 'dark', 'blue'];

const isThemeId = (value: string | null): value is ThemeId =>
  value !== null && THEME_IDS.includes(value as ThemeId);

function ThemeIcon({ theme }: { theme: ThemeId }) {
  if (theme === 'light') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="3.25" />
        <path d="M12 2.5v2.25M12 19.25v2.25M2.5 12h2.25M19.25 12h2.25M5.28 5.28l1.59 1.59M17.13 17.13l1.59 1.59M18.72 5.28l-1.59 1.59M6.87 17.13l-1.59 1.59" />
      </svg>
    );
  }

  if (theme === 'dark') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M19.7 15.3A8 8 0 0 1 8.7 4.3 8.25 8.25 0 1 0 19.7 15.3Z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2.75c2.85 3.38 6.25 7.13 6.25 11.05a6.25 6.25 0 1 1-12.5 0C5.75 9.88 9.15 6.13 12 2.75Z" />
      <path d="M8.75 14.25c.3 1.65 1.35 2.65 3 2.95" />
    </svg>
  );
}

export function VersionHeader({
  developerMode,
  onDeveloperModeChange,
}: {
  developerMode: boolean;
  onDeveloperModeChange: (enabled: boolean) => void;
}) {
  const [theme, setTheme] = useState<ThemeId>('blue');

  useLayoutEffect(() => {
    let storedTheme: string | null = null;
    try {
      storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    } catch {
      // Storage may be unavailable in privacy-restricted contexts.
    }
    const documentTheme = document.documentElement.getAttribute('data-theme');
    const resolvedTheme = isThemeId(storedTheme)
      ? storedTheme
      : isThemeId(documentTheme)
        ? documentTheme
        : 'blue';
    document.documentElement.setAttribute('data-theme', resolvedTheme);
    setTheme(resolvedTheme);
  }, []);

  const selectTheme = (nextTheme: ThemeId) => {
    document.documentElement.setAttribute('data-theme', nextTheme);
    setTheme(nextTheme);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    } catch {
      // The active theme still applies for this page session.
    }
  };

  return (
    <header className="site-header">
      <div>
        <a className="brand" href="#top">
          <span className="brand-mark" aria-hidden="true" />
          <span>
            <strong>FM-DCC</strong>
            <small>Frontier Model Doh Choo-choo</small>
          </span>
        </a>
      </div>
      <div className="header-controls">
        <div className="theme-switcher" role="group" aria-label="Theme">
          {THEME_IDS.map((themeId) => (
            <button
              key={themeId}
              type="button"
              className={`theme-option theme-option-${themeId}`}
              aria-label={`${themeId[0]!.toUpperCase()}${themeId.slice(1)} theme`}
              aria-pressed={theme === themeId}
              title={`${themeId[0]!.toUpperCase()}${themeId.slice(1)} theme`}
              onClick={() => selectTheme(themeId)}
            >
              <ThemeIcon theme={themeId} />
            </button>
          ))}
        </div>
        <button
          type="button"
          className="developer-mode-switch"
          role="switch"
          aria-label="Developer mode"
          aria-checked={developerMode}
          title={
            developerMode ? 'Hide excluded models' : 'Show excluded models'
          }
          onClick={() => onDeveloperModeChange(!developerMode)}
        >
          <span className="developer-mode-switch-knob" aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}
