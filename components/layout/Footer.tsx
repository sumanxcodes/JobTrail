import React from 'react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer
      style={{
        marginTop: 'auto',
        borderTop: '1px solid var(--md-sys-color-outline-variant)',
        backgroundColor: 'var(--md-sys-color-surface-container-lowest)',
        padding: '2.5rem 0',
        color: 'var(--md-sys-color-on-surface-variant)',
        fontFamily: 'var(--font-body)',
        fontSize: '0.875rem',
        transition: 'background-color 0.25s ease, border-color 0.25s ease',
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
        }}
      >
        {/* Top Row: Brand & Nav Links */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1.25rem',
          }}
        >
          {/* Brand */}
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontFamily: 'var(--font-headline)',
              fontWeight: 800,
              fontSize: '1.15rem',
              color: 'var(--md-sys-color-primary)',
              letterSpacing: '-0.02em',
              textDecoration: 'none',
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{
                fontSize: '22px',
                color: 'var(--md-sys-color-primary)',
                fontVariationSettings: "'FILL' 1",
              }}
            >
              work
            </span>
            <span>JobTrail</span>
          </Link>

          {/* Navigation Links */}
          <div
            style={{
              display: 'flex',
              gap: '1.5rem',
              alignItems: 'center',
              flexWrap: 'wrap',
              fontSize: '0.875rem',
              fontFamily: 'var(--font-headline)',
              fontWeight: 600,
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
              Dashboard
            </Link>
            <span
              style={{
                color: 'var(--md-sys-color-outline)',
                fontFamily: 'var(--font-body)',
                fontWeight: 400,
              }}
            >
              &copy; {new Date().getFullYear()} JobTrail. All rights reserved.
            </span>
          </div>
        </div>

        {/* Bottom AI & Data Handling Disclosure */}
        <div
          style={{
            fontSize: '0.8125rem',
            color: 'var(--md-sys-color-outline)',
            lineHeight: 1.6,
            borderTop: '1px solid var(--md-sys-color-surface-container-high)',
            paddingTop: '1rem',
          }}
        >
          Job descriptions submitted by the user are parsed via Anthropic Claude AI for structured field extraction
          and securely stored in Supabase with PostgreSQL Row-Level Security. We do not sell or monetize personal data.
        </div>
      </div>
    </footer>
  );
}
