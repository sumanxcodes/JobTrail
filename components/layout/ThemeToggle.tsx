'use client';

import React, { useEffect, useState } from 'react';

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('jobtrail_theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
      // Check system preference
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(isDark ? 'dark' : 'light');
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('jobtrail_theme', nextTheme);
  };

  if (!mounted) {
    return (
      <div
        style={{
          width: '38px',
          height: '38px',
          borderRadius: '50%',
        }}
      />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      style={{
        width: '38px',
        height: '38px',
        borderRadius: '50%',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid var(--md-sys-color-outline-variant)',
        backgroundColor: 'var(--md-sys-color-surface-container-low)',
        color: 'var(--md-sys-color-on-surface)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--md-sys-color-surface-container-high)';
        e.currentTarget.style.borderColor = 'var(--md-sys-color-primary)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--md-sys-color-surface-container-low)';
        e.currentTarget.style.borderColor = 'var(--md-sys-color-outline-variant)';
      }}
    >
      <span
        className="material-symbols-outlined"
        style={{
          fontSize: '20px',
          color: theme === 'dark' ? '#ffb784' : '#24389c',
          transition: 'transform 0.25s ease',
        }}
      >
        {theme === 'dark' ? 'light_mode' : 'dark_mode'}
      </span>
    </button>
  );
}
