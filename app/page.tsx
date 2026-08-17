import React from 'react';
import Link from 'next/link';
import { FilledButton, OutlinedButton } from '@/components/ui/Button';

export default function LandingPage() {
  return (
    <div className="container" style={{ padding: '3rem 1.25rem' }}>
      {/* Hero Section */}
      <section
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          maxWidth: '780px',
          margin: '0 auto 4rem auto',
          gap: '1.5rem',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.35rem 0.85rem',
            borderRadius: '9999px',
            backgroundColor: 'var(--md-sys-color-primary-container)',
            color: 'var(--md-sys-color-on-primary-container)',
            fontSize: '0.875rem',
            fontWeight: 500,
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
            auto_awesome
          </span>
          <span>AI-Powered Application Tracking</span>
        </div>

        <h1
          style={{
            fontSize: '2.75rem',
            lineHeight: 1.15,
            fontWeight: 700,
            color: 'var(--md-sys-color-on-surface)',
            letterSpacing: '-0.02em',
          }}
        >
          Streamline your job search from application to offer.
        </h1>

        <p
          style={{
            fontSize: '1.2rem',
            lineHeight: 1.6,
            color: 'var(--md-sys-color-on-surface-variant)',
          }}
        >
          Paste a job link or description text. JobTrail uses AI to extract key company, role,
          and compensation details into a clean, searchable pipeline.
        </p>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
          <Link href="/signup">
            <FilledButton icon="arrow_forward" trailingIcon>
              Get Started for Free
            </FilledButton>
          </Link>
          <Link href="/login">
            <OutlinedButton>Sign In to Account</OutlinedButton>
          </Link>
        </div>
      </section>

      {/* Feature Walkthrough */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem',
          marginBottom: '4rem',
        }}
      >
        <div className="m3-card">
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: 'var(--md-sys-color-primary-container)',
              color: 'var(--md-sys-color-on-primary-container)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>
              content_paste
            </span>
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            1. Paste Link or JD
          </h2>
          <p style={{ color: 'var(--md-sys-color-on-surface-variant)', lineHeight: 1.5 }}>
            Paste a link from LinkedIn, Indeed, or any career page, or paste the raw description
            directly.
          </p>
        </div>

        <div className="m3-card">
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: 'var(--md-sys-color-secondary-container)',
              color: 'var(--md-sys-color-on-secondary-container)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>
              smart_toy
            </span>
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            2. AI Extracts Key Fields
          </h2>
          <p style={{ color: 'var(--md-sys-color-on-surface-variant)', lineHeight: 1.5 }}>
            Instant parsing identifies company name, title, salary, seniority, and location with
            user review before saving.
          </p>
        </div>

        <div className="m3-card">
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: 'var(--md-sys-color-tertiary-container)',
              color: 'var(--md-sys-color-on-tertiary-container)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>
              view_timeline
            </span>
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            3. Track Status & History
          </h2>
          <p style={{ color: 'var(--md-sys-color-on-surface-variant)', lineHeight: 1.5 }}>
            Manage the application pipeline through 6 stages from draft to interview and offer with
            full timestamp history.
          </p>
        </div>
      </section>
    </div>
  );
}
