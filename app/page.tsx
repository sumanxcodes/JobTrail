import React from 'react';
import Link from 'next/link';
import { FilledButton, OutlinedButton } from '@/components/ui/Button';

export default function LandingPage() {
  return (
    <div className="container" style={{ padding: '2rem 1.5rem 4rem 1.5rem' }}>
      {/* Hero Section */}
      <section
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          maxWidth: '820px',
          margin: '2rem auto 5rem auto',
          gap: '1.5rem',
        }}
      >
        {/* Subtle pill badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.4rem 1rem',
            borderRadius: '9999px',
            backgroundColor: 'var(--md-sys-color-secondary-container)',
            color: 'var(--md-sys-color-on-secondary-container)',
            fontSize: '0.8125rem',
            fontWeight: 600,
            border: '1px solid var(--md-sys-color-outline-variant)',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
            bolt
          </span>
          <span>Automated Job Application Tracking</span>
        </div>

        <h1
          style={{
            fontSize: '3.25rem',
            lineHeight: 1.15,
            fontWeight: 700,
            color: 'var(--md-sys-color-on-surface)',
            letterSpacing: '-0.03em',
          }}
        >
          Your job search, <br />
          <span style={{ color: 'var(--md-sys-color-primary)' }}>perfectly organized.</span>
        </h1>

        <p
          style={{
            fontSize: '1.25rem',
            lineHeight: 1.6,
            color: 'var(--md-sys-color-on-surface-variant)',
            maxWidth: '680px',
          }}
        >
          Paste a job description → AI extracts the details → Track your applications from draft to
          interview and offer, effortlessly.
        </p>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
          <Link href="/signup">
            <FilledButton icon="arrow_forward" trailingIcon>
              Get Started Free
            </FilledButton>
          </Link>
          <Link href="/login">
            <OutlinedButton>Log in to Account</OutlinedButton>
          </Link>
        </div>
      </section>

      {/* How it Works / 3-Step Bento Grid */}
      <section style={{ marginBottom: '5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2
            style={{
              fontSize: '2rem',
              fontWeight: 700,
              color: 'var(--md-sys-color-on-surface)',
              marginBottom: '0.5rem',
            }}
          >
            How it works
          </h2>
          <p style={{ color: 'var(--md-sys-color-on-surface-variant)', fontSize: '1.05rem' }}>
            Three simple steps to take control of your career trajectory.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {/* Step 1: Paste Details */}
          <div
            className="m3-card"
            style={{
              display: 'flex',
              flexDirection: 'column',
              padding: '2rem',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
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
                marginBottom: '1.25rem',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>
                content_paste
              </span>
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              1. Paste Details
            </h3>
            <p
              style={{
                color: 'var(--md-sys-color-on-surface-variant)',
                lineHeight: 1.5,
                fontSize: '0.9375rem',
                marginBottom: '1.5rem',
              }}
            >
              Simply drop a URL from LinkedIn, Indeed, or Greenhouse, or paste the text of any job description.
            </p>

            <div
              style={{
                marginTop: 'auto',
                padding: '1rem',
                borderRadius: '10px',
                backgroundColor: 'var(--md-sys-color-surface-container)',
                border: '1px solid var(--md-sys-color-outline-variant)',
                fontSize: '0.8125rem',
                color: 'var(--md-sys-color-outline)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                link
              </span>
              <span>https://linkedin.com/jobs/view/...</span>
            </div>
          </div>

          {/* Step 2: AI Extracts */}
          <div
            className="m3-card"
            style={{
              display: 'flex',
              flexDirection: 'column',
              padding: '2rem',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
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
                marginBottom: '1.25rem',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>
                auto_awesome
              </span>
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              2. AI Extracts
            </h3>
            <p
              style={{
                color: 'var(--md-sys-color-on-surface-variant)',
                lineHeight: 1.5,
                fontSize: '0.9375rem',
                marginBottom: '1.5rem',
              }}
            >
              Claude AI instantly identifies company name, title, salary, seniority, location, and key highlights for user review.
            </p>

            <div
              style={{
                marginTop: 'auto',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                backgroundColor: 'var(--md-sys-color-surface-container)',
                border: '1px solid var(--md-sys-color-outline-variant)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.35rem',
                fontSize: '0.8125rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                <span>Security Engineer</span>
                <span style={{ color: 'var(--md-sys-color-primary)' }}>$160k - $200k</span>
              </div>
              <span style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>Google • Mountain View, CA</span>
            </div>
          </div>

          {/* Step 3: Track Pipeline */}
          <div
            className="m3-card"
            style={{
              display: 'flex',
              flexDirection: 'column',
              padding: '2rem',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
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
                marginBottom: '1.25rem',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>
                view_timeline
              </span>
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              3. Track Pipeline
            </h3>
            <p
              style={{
                color: 'var(--md-sys-color-on-surface-variant)',
                lineHeight: 1.5,
                fontSize: '0.9375rem',
                marginBottom: '1.5rem',
              }}
            >
              Update your application status through 6 stages with automatic timestamps and timeline logging.
            </p>

            <div
              style={{
                marginTop: 'auto',
                display: 'flex',
                gap: '0.5rem',
                flexWrap: 'wrap',
              }}
            >
              <span className="status-applied" style={{ padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600 }}>Applied</span>
              <span className="status-interviewing" style={{ padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600 }}>Interviewing</span>
              <span className="status-offer" style={{ padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600 }}>Offer</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
