'use client';

import React, { useState } from 'react';

export function ThemeToggle() {
  const [hasInteracted, setHasInteracted] = useState(false);

  const toggleTheme = () => {
    if (!hasInteracted) {
      setHasInteracted(true);
    }
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('jobtrail_theme', next);
  };

  return (
    <button
      onClick={toggleTheme}
      className={`theme-toggle-btn ${hasInteracted ? 'has-interacted' : ''}`}
      aria-label="Toggle light and dark theme"
      title="Toggle light and dark theme"
    >
      <span className="material-symbols-outlined theme-icon-sun">
        light_mode
      </span>
      <span className="material-symbols-outlined theme-icon-moon">
        dark_mode
      </span>
    </button>
  );
}
