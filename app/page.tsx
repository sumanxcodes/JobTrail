import React from 'react';
import Link from 'next/link';
import { InteractiveDemo } from '@/components/landing/InteractiveDemo';

export default function LandingPage() {
  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Curved Hero Background */}
      <div className="hero-curve-bg" />

      {/* Hero Section */}
      <section
        className="container"
        style={{
          paddingTop: '4.5rem',
          paddingBottom: '3.5rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Pill Badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.45rem 1.125rem',
            borderRadius: '9999px',
            backgroundColor: 'var(--md-sys-color-secondary-container)',
            color: 'var(--md-sys-color-on-secondary-container)',
            fontSize: '0.8125rem',
            fontWeight: 600,
            border: '1px solid var(--md-sys-color-outline-variant)',
            marginBottom: '1.75rem',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
            bolt
          </span>
          <span>Automated Job Application Tracking</span>
        </div>

        {/* Hero Title */}
        <h1
          style={{
            fontSize: 'clamp(2.5rem, 5.5vw, 4.25rem)',
            fontWeight: 800,
            color: 'var(--md-sys-color-on-surface)',
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
            marginBottom: '1.5rem',
            maxWidth: '860px',
          }}
        >
          Your job search, <br />
          <span style={{ color: 'var(--md-sys-color-primary)' }}>perfectly organized.</span>
        </h1>

        {/* Hero Subtitle */}
        <p
          style={{
            fontSize: '1.25rem',
            lineHeight: 1.6,
            color: 'var(--md-sys-color-on-surface-variant)',
            maxWidth: '680px',
            marginBottom: '2.25rem',
          }}
        >
          Paste a job description → AI extracts the details → Track your applications from applied to
          hired, effortlessly.
        </p>

        {/* CTA Buttons */}
        <div
          style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            alignItems: 'center',
            flexWrap: 'wrap',
            marginBottom: '3rem',
          }}
        >
          <Link href="/signup" className="btn-pill-primary" style={{ minHeight: '48px' }}>
            <span>Get Started Free</span>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
              arrow_forward
            </span>
          </Link>

          <a href="#interactive-demo" className="btn-pill-secondary" style={{ minHeight: '48px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
              play_circle
            </span>
            <span>Try Interactive Demo</span>
          </a>
        </div>

        {/* Trust & Security Badges Strip */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '2rem',
            flexWrap: 'wrap',
            fontSize: '0.8125rem',
            fontWeight: 500,
            color: 'var(--md-sys-color-on-surface-variant)',
            padding: '0.75rem 1.5rem',
            borderRadius: '9999px',
            backgroundColor: 'var(--md-sys-color-surface-container-low)',
            border: '1px solid var(--md-sys-color-outline-variant)',
            marginBottom: '2rem',
          }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--md-sys-color-primary)' }}>
              auto_awesome
            </span>
            Claude 3.5 Sonnet
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--md-sys-color-primary)' }}>
              lock
            </span>
            Row-Level Postgres Security
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--md-sys-color-primary)' }}>
              verified_user
            </span>
            Zero Data Reselling
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--md-sys-color-primary)' }}>
              flash_on
            </span>
            100% Free to Use
          </span>
        </div>

        {/* Interactive Live Demo */}
        <div id="interactive-demo" style={{ width: '100%', scrollMarginTop: '80px', marginTop: '1rem' }}>
          <InteractiveDemo />
        </div>
      </section>

      {/* Visual Demonstration Bento Grid: How It Works */}
      <section
        style={{
          backgroundColor: 'var(--md-sys-color-surface-container-lowest)',
          padding: '5rem 0',
          borderTop: '1px solid var(--md-sys-color-outline-variant)',
          borderBottom: '1px solid var(--md-sys-color-outline-variant)',
        }}
      >
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <h2
              style={{
                fontSize: '2.25rem',
                fontWeight: 700,
                color: 'var(--md-sys-color-on-surface)',
                letterSpacing: '-0.02em',
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
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {/* Step 1: Paste Details */}
            <div className="stitch-feature-card">
              <div className="card-watermark">
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: '120px', color: 'var(--md-sys-color-primary)' }}
                >
                  content_paste
                </span>
              </div>

              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--md-sys-color-primary-container)',
                  color: 'var(--md-sys-color-on-primary-container)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>
                  content_paste
                </span>
              </div>

              <h3
                style={{
                  fontSize: '1.35rem',
                  fontWeight: 600,
                  color: 'var(--md-sys-color-on-surface)',
                  marginBottom: '0.5rem',
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                1. Paste Details
              </h3>
              <p
                style={{
                  fontSize: '0.9375rem',
                  lineHeight: 1.55,
                  color: 'var(--md-sys-color-on-surface-variant)',
                  marginBottom: '2rem',
                  position: 'relative',
                  zIndex: 1,
                  flexGrow: 1,
                }}
              >
                Simply drop a link or paste the text of any job description you find online.
              </p>

              {/* Visual Mockup Preview */}
              <div
                style={{
                  backgroundColor: 'var(--md-sys-color-surface)',
                  borderRadius: '14px',
                  padding: '1rem',
                  border: '1px solid var(--md-sys-color-outline-variant)',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                <div style={{ display: 'flex', gap: '6px', marginBottom: '0.75rem' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--md-sys-color-outline-variant)' }} />
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--md-sys-color-outline-variant)' }} />
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--md-sys-color-outline-variant)' }} />
                </div>
                <div style={{ width: '100%', height: '8px', borderRadius: '9999px', backgroundColor: 'var(--md-sys-color-surface-container-highest)', marginBottom: '6px' }} />
                <div style={{ width: '75%', height: '8px', borderRadius: '9999px', backgroundColor: 'var(--md-sys-color-surface-container-highest)', marginBottom: '1rem' }} />
                <div
                  style={{
                    backgroundColor: 'var(--md-sys-color-surface-container)',
                    borderRadius: '8px',
                    border: '1px dashed var(--md-sys-color-outline-variant)',
                    padding: '0.875rem',
                    textAlign: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    color: 'var(--md-sys-color-outline)',
                  }}
                >
                  [Paste Job Description Here]
                </div>
              </div>
            </div>

            {/* Step 2: AI Extracts */}
            <div className="stitch-feature-card">
              <div className="card-watermark">
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: '120px', color: 'var(--md-sys-color-primary)' }}
                >
                  auto_awesome
                </span>
              </div>

              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--md-sys-color-primary-container)',
                  color: 'var(--md-sys-color-on-primary-container)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>
                  auto_awesome
                </span>
              </div>

              <h3
                style={{
                  fontSize: '1.35rem',
                  fontWeight: 600,
                  color: 'var(--md-sys-color-on-surface)',
                  marginBottom: '0.5rem',
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                2. AI Extracts
              </h3>
              <p
                style={{
                  fontSize: '0.9375rem',
                  lineHeight: 1.55,
                  color: 'var(--md-sys-color-on-surface-variant)',
                  marginBottom: '2rem',
                  position: 'relative',
                  zIndex: 1,
                  flexGrow: 1,
                }}
              >
                Our AI instantly pulls out the role, salary, skills, and company information.
              </p>

              <div
                style={{
                  backgroundColor: 'var(--md-sys-color-surface)',
                  borderRadius: '14px',
                  padding: '1rem',
                  border: '1px solid var(--md-sys-color-outline-variant)',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                  position: 'relative',
                  zIndex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.5rem', borderBottom: '1px solid var(--md-sys-color-outline-variant)' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--md-sys-color-on-surface-variant)' }}>Extracted Data</span>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--md-sys-color-primary)' }}>check_circle</span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ backgroundColor: 'var(--md-sys-color-secondary-container)', color: 'var(--md-sys-color-on-secondary-container)', padding: '0.25rem 0.625rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600 }}>Frontend Dev</span>
                  <span style={{ backgroundColor: 'var(--md-sys-color-tertiary-container)', color: 'var(--md-sys-color-on-tertiary-container)', padding: '0.25rem 0.625rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600 }}>$120k-$150k</span>
                </div>
                <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                  <span style={{ backgroundColor: 'var(--md-sys-color-surface-container-highest)', color: 'var(--md-sys-color-on-surface)', padding: '0.15rem 0.5rem', borderRadius: '9999px', fontSize: '0.6875rem', fontWeight: 500 }}>React</span>
                  <span style={{ backgroundColor: 'var(--md-sys-color-surface-container-highest)', color: 'var(--md-sys-color-on-surface)', padding: '0.15rem 0.5rem', borderRadius: '9999px', fontSize: '0.6875rem', fontWeight: 500 }}>TypeScript</span>
                  <span style={{ backgroundColor: 'var(--md-sys-color-surface-container-highest)', color: 'var(--md-sys-color-on-surface)', padding: '0.15rem 0.5rem', borderRadius: '9999px', fontSize: '0.6875rem', fontWeight: 500 }}>Tailwind</span>
                </div>
              </div>
            </div>

            {/* Step 3: Track Progress */}
            <div className="stitch-feature-card">
              <div className="card-watermark">
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: '120px', color: 'var(--md-sys-color-primary)' }}
                >
                  view_kanban
                </span>
              </div>

              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--md-sys-color-primary-container)',
                  color: 'var(--md-sys-color-on-primary-container)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>
                  view_kanban
                </span>
              </div>

              <h3
                style={{
                  fontSize: '1.35rem',
                  fontWeight: 600,
                  color: 'var(--md-sys-color-on-surface)',
                  marginBottom: '0.5rem',
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                3. Track Progress
              </h3>
              <p
                style={{
                  fontSize: '0.9375rem',
                  lineHeight: 1.55,
                  color: 'var(--md-sys-color-on-surface-variant)',
                  marginBottom: '2rem',
                  position: 'relative',
                  zIndex: 1,
                  flexGrow: 1,
                }}
              >
                Manage your pipeline visually. Know exactly where you stand with every company.
              </p>

              <div
                style={{
                  backgroundColor: 'var(--md-sys-color-surface)',
                  borderRadius: '14px',
                  padding: '0.75rem',
                  border: '1px solid var(--md-sys-color-outline-variant)',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                  position: 'relative',
                  zIndex: 1,
                  display: 'flex',
                  gap: '0.5rem',
                }}
              >
                <div style={{ flex: 1, backgroundColor: 'var(--md-sys-color-surface-container-lowest)', borderRadius: '8px', padding: '0.5rem', border: '1px solid var(--md-sys-color-outline-variant)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <span style={{ fontSize: '0.625rem', fontWeight: 600, color: 'var(--md-sys-color-on-surface-variant)' }}>Applied</span>
                  <div style={{ backgroundColor: 'var(--md-sys-color-surface-container)', height: '24px', borderRadius: '4px' }} />
                  <div style={{ backgroundColor: 'var(--md-sys-color-surface-container)', height: '28px', borderRadius: '4px' }} />
                </div>
                <div style={{ flex: 1, backgroundColor: 'var(--md-sys-color-surface-container-lowest)', borderRadius: '8px', padding: '0.5rem', border: '1px solid var(--md-sys-color-primary)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <span style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--md-sys-color-primary)' }}>Interviewing</span>
                  <div style={{ backgroundColor: 'var(--md-sys-color-primary-container)', height: '36px', borderRadius: '4px', padding: '0.35rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '3px' }}>
                    <div style={{ width: '75%', height: '4px', backgroundColor: 'var(--md-sys-color-primary)', borderRadius: '2px' }} />
                    <div style={{ width: '45%', height: '3px', backgroundColor: 'var(--md-sys-color-outline-variant)', borderRadius: '2px' }} />
                  </div>
                </div>
                <div style={{ flex: 1, backgroundColor: 'var(--md-sys-color-surface-container-lowest)', borderRadius: '8px', padding: '0.5rem', border: '1px solid var(--md-sys-color-outline-variant)', opacity: 0.5, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <span style={{ fontSize: '0.625rem', fontWeight: 600, color: 'var(--md-sys-color-on-surface-variant)' }}>Offer</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Matrix: Spreadsheets vs JobTrail */}
      <section className="container" style={{ padding: '5rem 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <h2
            style={{
              fontSize: '2.25rem',
              fontWeight: 700,
              color: 'var(--md-sys-color-on-surface)',
              letterSpacing: '-0.02em',
              marginBottom: '0.5rem',
            }}
          >
            Why JobTrail vs. Spreadsheets?
          </h2>
          <p style={{ color: 'var(--md-sys-color-on-surface-variant)', fontSize: '1.05rem' }}>
            Built specifically to eliminate friction from the modern job search.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.5rem',
            maxWidth: '1000px',
            margin: '0 auto',
          }}
        >
          {/* Card 1: Time per Application */}
          <div className="m3-card" style={{ padding: '2rem' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
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
                timer
              </span>
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem' }}>
              5 Seconds vs. 10 Minutes
            </h3>
            <p style={{ color: 'var(--md-sys-color-on-surface-variant)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
              No more copying and pasting job titles, company names, and salaries row by row. Drop a link and let Claude AI do the data entry.
            </p>
          </div>

          {/* Card 2: Preserved Original JDs */}
          <div className="m3-card" style={{ padding: '2rem' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
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
                history_edu
              </span>
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem' }}>
              Never Lose a Job Post
            </h3>
            <p style={{ color: 'var(--md-sys-color-on-surface-variant)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
              When a posting is taken down before your interview, JobTrail keeps a full raw snapshot of the original requirements so you are always prepared.
            </p>
          </div>

          {/* Card 3: Interactive Pipeline Timeline */}
          <div className="m3-card" style={{ padding: '2rem' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
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
                timeline
              </span>
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem' }}>
              Automated Timeline Logs
            </h3>
            <p style={{ color: 'var(--md-sys-color-on-surface-variant)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
              Track when you applied, when interviews were scheduled, and response turnaround times with automatic timestamped status tracking.
            </p>
          </div>
        </div>
      </section>

      {/* Deep-Dive Feature Section: Intelligent Data Extraction */}
      <section
        style={{
          backgroundColor: 'var(--md-sys-color-surface-container-lowest)',
          padding: '5rem 0',
          borderTop: '1px solid var(--md-sys-color-outline-variant)',
          borderBottom: '1px solid var(--md-sys-color-outline-variant)',
        }}
      >
        <div className="container">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '3.5rem',
              flexWrap: 'wrap',
            }}
          >
            {/* Left Column: Descriptions */}
            <div style={{ flex: '1 1 400px' }}>
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
                  marginBottom: '1.5rem',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>
                  psychology
                </span>
              </div>

              <h2
                style={{
                  fontSize: '2rem',
                  fontWeight: 700,
                  color: 'var(--md-sys-color-on-surface)',
                  letterSpacing: '-0.02em',
                  marginBottom: '1rem',
                }}
              >
                Intelligent Data Extraction
              </h2>

              <p
                style={{
                  fontSize: '1.05rem',
                  lineHeight: 1.6,
                  color: 'var(--md-sys-color-on-surface-variant)',
                  marginBottom: '1.75rem',
                }}
              >
                Stop manually typing out company names, job titles, and messy salary ranges. Our
                fine-tuned AI reads the unstructured text of any job posting and structures it
                instantly into your personal database.
              </p>

              <ul
                style={{
                  listStyle: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.875rem',
                  fontSize: '0.9375rem',
                  color: 'var(--md-sys-color-on-surface-variant)',
                }}
              >
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span
                    className="material-symbols-outlined"
                    style={{ color: 'var(--md-sys-color-primary)', fontSize: '20px' }}
                  >
                    check
                  </span>
                  <span>Identifies tech stack and core requirements</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span
                    className="material-symbols-outlined"
                    style={{ color: 'var(--md-sys-color-primary)', fontSize: '20px' }}
                  >
                    check
                  </span>
                  <span>Normalizes job titles and seniority levels</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span
                    className="material-symbols-outlined"
                    style={{ color: 'var(--md-sys-color-primary)', fontSize: '20px' }}
                  >
                    check
                  </span>
                  <span>Extracts compensation packages and remote status</span>
                </li>
              </ul>
            </div>

            {/* Right Column: Visual Transformation Card */}
            <div
              style={{
                flex: '1 1 400px',
                backgroundColor: 'var(--md-sys-color-surface-container-high)',
                borderRadius: '28px',
                padding: '2.5rem 2rem',
                border: '1px solid var(--md-sys-color-outline-variant)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '1rem',
                position: 'relative',
                boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
              }}
            >
              <div
                style={{
                  width: '85%',
                  backgroundColor: 'var(--md-sys-color-surface)',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  border: '1px solid var(--md-sys-color-outline-variant)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  transform: 'rotate(-2deg)',
                }}
              >
                <div style={{ width: '45%', height: '8px', backgroundColor: 'var(--md-sys-color-outline-variant)', borderRadius: '4px', marginBottom: '10px' }} />
                <div style={{ width: '90%', height: '6px', backgroundColor: 'var(--md-sys-color-outline-variant)', borderRadius: '4px', marginBottom: '8px', opacity: 0.6 }} />
                <div style={{ width: '75%', height: '6px', backgroundColor: 'var(--md-sys-color-outline-variant)', borderRadius: '4px', opacity: 0.6 }} />
              </div>

              <div>
                <span className="material-symbols-outlined" style={{ color: 'var(--md-sys-color-primary)', fontSize: '24px' }}>
                  arrow_downward
                </span>
              </div>

              <div
                style={{
                  width: '85%',
                  backgroundColor: 'var(--md-sys-color-primary-container)',
                  color: 'var(--md-sys-color-on-primary-container)',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  boxShadow: '0 4px 12px rgba(36,56,156,0.18)',
                  transform: 'rotate(1deg)',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>
                  database
                </span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9375rem', marginBottom: '2px' }}>
                    Structured Entry Created
                  </div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.85 }}>Ready for tracking</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Closing Call to Action Banner (M3 Elevated Container) */}
      <section className="container" style={{ padding: '5rem 1.5rem 6rem 1.5rem' }}>
        <div
          style={{
            backgroundColor: 'var(--md-sys-color-surface-container-high)',
            borderRadius: '28px',
            padding: '3.5rem 2rem',
            textAlign: 'center',
            border: '1px solid var(--md-sys-color-outline-variant)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1.5rem',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.04)',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'var(--md-sys-color-primary-container)',
              color: 'var(--md-sys-color-on-primary-container)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>
              rocket_launch
            </span>
          </div>

          <h2
            style={{
              fontSize: '2.25rem',
              fontWeight: 800,
              color: 'var(--md-sys-color-on-surface)',
              letterSpacing: '-0.02em',
              maxWidth: '600px',
            }}
          >
            Ready to take control of your job search?
          </h2>

          <p
            style={{
              color: 'var(--md-sys-color-on-surface-variant)',
              fontSize: '1.1rem',
              maxWidth: '520px',
              lineHeight: 1.6,
            }}
          >
            Join job seekers organizing their active pipeline with zero manual data entry.
          </p>

          <div style={{ marginTop: '0.5rem' }}>
            <Link href="/signup" className="btn-pill-primary" style={{ minHeight: '48px', padding: '0.875rem 2.5rem' }}>
              <span>Get Started Free</span>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                arrow_forward
              </span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
