'use client';

import React, { useEffect, useState } from 'react';

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('jobtrail_theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(isDark ? 'dark' : 'light');
    }
  }, []);

  const toggleTheme = () => {
    setIsAnimating(true);
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('jobtrail_theme', nextTheme);

    setTimeout(() => {
      setIsAnimating(false);
    }, 400);
  };

  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      style={{
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        position: 'relative',
        overflow: 'hidden',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid var(--md-sys-color-outline-variant)',
        backgroundColor: 'var(--md-sys-color-surface-container-low)',
        color: 'var(--md-sys-color-on-surface-variant)',
        cursor: 'pointer',
        outline: 'none',
        boxShadow: 'none',
        transform: isAnimating ? 'scale(0.92)' : 'scale(1)',
        transition:
          'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), background-color 0.25s ease, border-color 0.25s ease, color 0.25s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--md-sys-color-surface-container-high)';
        e.currentTarget.style.color = 'var(--md-sys-color-on-surface)';
        e.currentTarget.style.borderColor = 'var(--md-sys-color-outline)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--md-sys-color-surface-container-low)';
        e.currentTarget.style.color = 'var(--md-sys-color-on-surface-variant)';
        e.currentTarget.style.borderColor = 'var(--md-sys-color-outline-variant)';
      }}
    >
      {/* Sun Icon (Visible in Dark Mode to switch to Light) */}
      <span
        className="material-symbols-outlined"
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          fontSize: '20px',
          color: 'currentColor',
          transform: isDark
            ? 'translate(-50%, -50%) rotate(0deg) scale(1)'
            : 'translate(-50%, 140%) rotate(45deg) scale(0.5)',
          opacity: isDark ? 1 : 0,
          pointerEvents: 'none',
          transition:
            'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.25s cubic-bezier(0.2, 0, 0, 1)',
        }}
      >
        light_mode
      </span>

      {/* Moon Icon (Visible in Light Mode to switch to Dark) */}
      <span
        className="material-symbols-outlined"
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          fontSize: '20px',
          color: 'currentColor',
          transform: !isDark
            ? 'translate(-50%, -50%) rotate(0deg) scale(1)'
            : 'translate(-50%, -140%) rotate(-45deg) scale(0.5)',
          opacity: !isDark ? 1 : 0,
          pointerEvents: 'none',
          transition:
            'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.25s cubic-bezier(0.2, 0, 0, 1)',
        }}
      >
        dark_mode
      </span>
    </button>
  );
}
