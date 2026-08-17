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
          gap: '3rem',
          maxWidth: '1100px',
        }}
      >
        {/* Top Section: Split Layout (Brand on Left, Link Columns Grouped on Right) */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '3rem',
          }}
        >
          {/* Left Column: Brand & Tagline */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.875rem',
              maxWidth: '320px',
              flexShrink: 0,
            }}
          >
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
              }}
            >
              <Logo size={26} color="var(--md-sys-color-primary)" />
              <span>JobTrail</span>
            </Link>

            <p
              style={{
                fontSize: '0.875rem',
                fontFamily: 'var(--font-body)',
                color: 'var(--md-sys-color-on-surface-variant)',
                lineHeight: 1.6,
              }}
            >
              Intelligent job application tracking. Extract roles, requirements, and insights automatically from job posts.
            </p>

            {/* Privacy trust tag */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                fontSize: '0.75rem',
                fontFamily: 'var(--font-headline)',
                fontWeight: 600,
                color: 'var(--md-sys-color-on-surface-variant)',
                marginTop: '0.25rem',
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{
                  fontSize: '16px',
                  color: 'var(--md-sys-color-primary)',
                  fontVariationSettings: "'FILL' 1",
                }}
              >
                verified_user
              </span>
              <span>Encrypted & Privacy-First</span>
            </div>
          </div>

          {/* Right Section: Compact Link Columns */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '3.5rem',
            }}
          >
            {/* Product Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', minWidth: '120px' }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-headline)',
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: 'var(--md-sys-color-on-surface)',
                }}
              >
                Product
              </span>
              <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                <Link href="/dashboard" className="footer-link">
                  Dashboard
                </Link>
                <Link href="/applications/new" className="footer-link">
                  Add Application
                </Link>
              </nav>
            </div>

            {/* Account Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', minWidth: '120px' }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-headline)',
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: 'var(--md-sys-color-on-surface)',
                }}
              >
                Account
              </span>
              <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                <Link href="/login" className="footer-link">
                  Sign In
                </Link>
                <Link href="/signup" className="footer-link">
                  Sign Up
                </Link>
                <Link href="/reset-password" className="footer-link">
                  Reset Password
                </Link>
              </nav>
            </div>

            {/* Legal Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', minWidth: '120px' }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-headline)',
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: 'var(--md-sys-color-on-surface)',
                }}
              >
                Legal
              </span>
              <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                <Link href="/privacy" className="footer-link">
                  Privacy Policy
                </Link>
              </nav>
            </div>
          </div>
        </div>

        {/* Bottom Section: AI Disclaimer & Copyright */}
        <div
          style={{
            borderTop: '1px solid var(--md-sys-color-outline-variant)',
            paddingTop: '1.75rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            fontSize: '0.8125rem',
            fontFamily: 'var(--font-body)',
            color: 'var(--md-sys-color-outline)',
          }}
        >
          <span>
            &copy; {new Date().getFullYear()} JobTrail. All rights reserved.
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
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
