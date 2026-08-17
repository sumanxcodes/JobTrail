import React from 'react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer
      style={{
        marginTop: 'auto',
        borderTop: '1px solid var(--md-sys-color-outline-variant)',
        backgroundColor: 'var(--md-sys-color-surface-container-lowest)',
        padding: '1.5rem 0',
        color: 'var(--md-sys-color-on-surface-variant)',
        fontSize: '0.875rem',
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '0.75rem',
        }}
      >
        <p>
          Job description content submitted by the user is processed by a third-party AI provider
          (Anthropic) for field extraction, and stored in Supabase.{' '}
          <Link
            href="/privacy"
            style={{
              color: 'var(--md-sys-color-primary)',
              textDecoration: 'underline',
              fontWeight: 500,
            }}
          >
            Privacy & Data Handling
          </Link>
        </p>
        <p style={{ opacity: 0.8 }}>
          &copy; {new Date().getFullYear()} JobTrail. Built with Next.js & Material Web.
        </p>
      </div>
    </footer>
  );
}
