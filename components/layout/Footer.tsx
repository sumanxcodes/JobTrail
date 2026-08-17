import React from 'react';
import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';

export function Footer() {
  return (
    <footer
      style={{
        marginTop: 'auto',
        borderTop: '1px solid var(--md-sys-color-outline-variant)',
        backgroundColor: 'var(--md-sys-color-surface-container-lowest)',
        paddingTop: '3.5rem',
        paddingBottom: '2.5rem',
        color: 'var(--md-sys-color-on-surface-variant)',
        fontFamily: 'var(--font-body)',
        transition: 'background-color 0.25s ease, border-color 0.25s ease',
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '2.5rem',
        }}
      >
        {/* Main Content Grid: Brand Column + Navigation Columns */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '2.5rem',
          }}
        >
          {/* Brand & Value Proposition Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', maxWidth: '340px' }}>
            <Link
              href="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.625rem',
                fontFamily: 'var(--font-headline)',
                fontWeight: 800,
                fontSize: '1.25rem',
                color: 'var(--md-sys-color-primary)',
                letterSpacing: '-0.02em',
                textDecoration: 'none',
                width: 'fit-content',
              }}
            >
              <Logo size={24} color="var(--md-sys-color-primary)" />
              <span>JobTrail</span>
            </Link>

            <p
              style={{
                fontSize: '0.875rem',
                fontFamily: 'var(--font-body)',
                color: 'var(--md-sys-color-on-surface-variant)',
                lineHeight: 1.55,
              }}
            >
              Automated AI job application tracking. Extract roles, requirements, and salary insights directly from job descriptions.
            </p>

            {/* AI Security Trust Badge */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.35rem 0.75rem',
                borderRadius: '9999px',
                backgroundColor: 'var(--md-sys-color-surface-container-low)',
                border: '1px solid var(--md-sys-color-outline-variant)',
                fontSize: '0.75rem',
                fontFamily: 'var(--font-headline)',
                fontWeight: 600,
                color: 'var(--md-sys-color-on-surface-variant)',
                width: 'fit-content',
                marginTop: '0.25rem',
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{
                  fontSize: '15px',
                  color: 'var(--md-sys-color-primary)',
                  fontVariationSettings: "'FILL' 1",
                }}
              >
                verified_user
              </span>
              <span>Encrypted & Privacy-First</span>
            </div>
          </div>

          {/* Product Links Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <h4
              style={{
                fontSize: '0.8125rem',
                fontFamily: 'var(--font-headline)',
                fontWeight: 700,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                color: 'var(--md-sys-color-on-surface)',
              }}
            >
              Product
            </h4>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              <Link href="/dashboard" className="footer-link">
                Tracker Dashboard
              </Link>
              <Link href="/applications/new" className="footer-link">
                Add Application
              </Link>
            </nav>
          </div>

          {/* Account & Auth Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <h4
              style={{
                fontSize: '0.8125rem',
                fontFamily: 'var(--font-headline)',
                fontWeight: 700,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                color: 'var(--md-sys-color-on-surface)',
              }}
            >
              Account
            </h4>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              <Link href="/login" className="footer-link">
                Sign In
              </Link>
              <Link href="/signup" className="footer-link">
                Create Account
              </Link>
              <Link href="/reset-password" className="footer-link">
                Reset Password
              </Link>
            </nav>
          </div>

          {/* Legal & Compliance Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <h4
              style={{
                fontSize: '0.8125rem',
                fontFamily: 'var(--font-headline)',
                fontWeight: 700,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                color: 'var(--md-sys-color-on-surface)',
              }}
            >
              Trust & Legal
            </h4>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              <Link href="/privacy" className="footer-link">
                Privacy Policy & Disclosure
              </Link>
            </nav>
          </div>
        </div>

        {/* Bottom Section: AI Disclosure + Copyright Bar */}
        <div
          style={{
            borderTop: '1px solid var(--md-sys-color-outline-variant)',
            paddingTop: '1.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          {/* AI Disclosure Note */}
          <p
            style={{
              fontSize: '0.8125rem',
              fontFamily: 'var(--font-body)',
              color: 'var(--md-sys-color-outline)',
              lineHeight: 1.6,
              maxWidth: '850px',
            }}
          >
            Job descriptions submitted by users are processed securely via AI for structured field extraction
            and stored in Supabase with PostgreSQL Row-Level Security (RLS). We never sell, monetize, or share your personal career data.
          </p>

          {/* Bottom Copyright & Status */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
              fontSize: '0.8125rem',
              fontFamily: 'var(--font-body)',
              color: 'var(--md-sys-color-outline)',
            }}
          >
            <span>
              &copy; {new Date().getFullYear()} JobTrail. Built with Google Material Design 3.
            </span>

            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
              }}
            >
              <span
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--md-sys-color-primary)',
                  display: 'inline-block',
                }}
              />
              <span>Systems operational</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
