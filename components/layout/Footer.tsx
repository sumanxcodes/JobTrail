import React from 'react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer
      style={{
        marginTop: 'auto',
        borderTop: '1px solid var(--md-sys-color-outline-variant)',
        backgroundColor: 'var(--md-sys-color-surface-container-lowest)',
        padding: '2rem 0',
        color: 'var(--md-sys-color-on-surface-variant)',
        fontSize: '0.875rem',
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div
            style={{
              fontWeight: 700,
              fontSize: '1.1rem',
              color: 'var(--md-sys-color-on-surface)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--md-sys-color-primary)' }}>
              work
            </span>
            <span>JobTrail</span>
          </div>

          <div
            style={{
              display: 'flex',
              gap: '1.5rem',
              alignItems: 'center',
              flexWrap: 'wrap',
              fontSize: '0.875rem',
            }}
          >
            <Link
              href="/privacy"
              style={{
                color: 'var(--md-sys-color-on-surface-variant)',
                transition: 'color 0.15s ease',
              }}
            >
              Privacy & Data Disclosure
            </Link>
            <Link
              href="/dashboard"
              style={{
                color: 'var(--md-sys-color-on-surface-variant)',
                transition: 'color 0.15s ease',
              }}
            >
              Tracker Dashboard
            </Link>
            <span style={{ opacity: 0.7 }}>
              &copy; {new Date().getFullYear()} JobTrail. All rights reserved.
            </span>
          </div>
        </div>

        <div
          style={{
            fontSize: '0.8125rem',
            color: 'var(--md-sys-color-outline)',
            lineHeight: 1.5,
            borderTop: '1px solid var(--md-sys-color-surface-container-high)',
            paddingTop: '0.875rem',
          }}
        >
          Job descriptions submitted by the user are parsed via AI for structured field extraction
          and stored securely in Supabase. We do not sell your personal data.
        </div>
      </div>
    </footer>
  );
}
