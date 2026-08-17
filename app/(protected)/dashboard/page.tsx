'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Application, ApplicationStatus, APPLICATION_STATUSES } from '@/lib/types/database';
import { StatusBadge } from '@/components/applications/StatusBadge';
import { FilledButton, OutlinedButton } from '@/components/ui/Button';
import { CircularProgress } from '@/components/ui/CircularProgress';

function getInitials(name: string): string {
  if (!name) return 'JT';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export default function DashboardPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    async function fetchApplications() {
      setLoading(true);
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching applications for dashboard:', error);
      } else {
        setApplications(data || []);
      }
      setLoading(false);
    }

    fetchApplications();
  }, [supabase]);

  // Analytics Computations
  const stats = useMemo(() => {
    const total = applications.length;
    const drafts = applications.filter((a) => a.status === 'draft').length;
    const applied = applications.filter((a) => a.status === 'applied').length;
    const interviewing = applications.filter((a) => a.status === 'interviewing').length;
    const offers = applications.filter((a) => a.status === 'offer').length;
    const rejected = applications.filter((a) => a.status === 'rejected').length;
    const withdrawn = applications.filter((a) => a.status === 'withdrawn').length;

    const activePipeline = drafts + applied + interviewing;

    // Interview Rate: (Interviewing + Offers) / (Applied + Interviewing + Offers + Rejected)
    const processedApps = applied + interviewing + offers + rejected;
    const interviewRate = processedApps > 0 ? Math.round(((interviewing + offers) / processedApps) * 100) : 0;
    const offerRate = processedApps > 0 ? Math.round((offers / processedApps) * 100) : 0;

    return {
      total,
      drafts,
      applied,
      interviewing,
      offers,
      rejected,
      withdrawn,
      activePipeline,
      interviewRate,
      offerRate,
    };
  }, [applications]);

  const recentApplications = useMemo(() => {
    return applications.slice(0, 5);
  }, [applications]);

  return (
    <div style={{ padding: '2rem 2.5rem 4rem 2.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header & Primary Actions */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1.25rem',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '2rem',
              fontFamily: 'var(--font-headline)',
              fontWeight: 800,
              color: 'var(--md-sys-color-on-surface)',
              letterSpacing: '-0.02em',
              marginBottom: '0.25rem',
            }}
          >
            Dashboard
          </h1>
          <p
            style={{
              color: 'var(--md-sys-color-on-surface-variant)',
              fontSize: '0.9375rem',
              fontFamily: 'var(--font-body)',
            }}
          >
            Real-time pipeline health, conversion metrics, and job pursuit momentum.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link href="/applications" style={{ textDecoration: 'none' }}>
            <OutlinedButton icon="table_chart">Applications</OutlinedButton>
          </Link>
          <Link href="/applications/new" style={{ textDecoration: 'none' }}>
            <FilledButton icon="add">Add Job</FilledButton>
          </Link>
        </div>
      </div>

      {loading ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '5rem 1rem',
            gap: '1.25rem',
          }}
        >
          <CircularProgress indeterminate />
          <p style={{ color: 'var(--md-sys-color-on-surface-variant)', fontSize: '0.9375rem' }}>
            Loading dashboard data...
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Top 4 KPI Metric Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {/* Total Applications Card */}
            <div className="kpi-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span
                  style={{
                    fontSize: '0.8125rem',
                    fontFamily: 'var(--font-headline)',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    color: 'var(--md-sys-color-on-surface-variant)',
                  }}
                >
                  Total Applications
                </span>
                <div
                  className="kpi-icon-badge"
                  style={{
                    backgroundColor: 'var(--md-sys-color-primary-container)',
                    color: 'var(--md-sys-color-on-primary-container)',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                    layers
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.5rem' }}>
                <span
                  style={{
                    fontSize: '2.25rem',
                    fontFamily: 'var(--font-headline)',
                    fontWeight: 800,
                    color: 'var(--md-sys-color-on-surface)',
                  }}
                >
                  {stats.total}
                </span>
                <span style={{ fontSize: '0.8125rem', color: 'var(--md-sys-color-outline)' }}>
                  all-time
                </span>
              </div>
              <span style={{ fontSize: '0.8125rem', color: 'var(--md-sys-color-on-surface-variant)', marginTop: '0.25rem' }}>
                {stats.activePipeline} active in your pursuit pipeline
              </span>
            </div>

            {/* Active Pipeline Card */}
            <div className="kpi-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span
                  style={{
                    fontSize: '0.8125rem',
                    fontFamily: 'var(--font-headline)',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    color: 'var(--md-sys-color-on-surface-variant)',
                  }}
                >
                  Active Pipeline
                </span>
                <div
                  className="kpi-icon-badge"
                  style={{
                    backgroundColor: 'var(--md-sys-color-tertiary-container)',
                    color: 'var(--md-sys-color-on-tertiary-container)',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                    timelapse
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.5rem' }}>
                <span
                  style={{
                    fontSize: '2.25rem',
                    fontFamily: 'var(--font-headline)',
                    fontWeight: 800,
                    color: 'var(--md-sys-color-on-surface)',
                  }}
                >
                  {stats.activePipeline}
                </span>
                <span style={{ fontSize: '0.8125rem', color: 'var(--md-sys-color-outline)' }}>
                  in progress
                </span>
              </div>
              <span style={{ fontSize: '0.8125rem', color: 'var(--md-sys-color-on-surface-variant)', marginTop: '0.25rem' }}>
                {stats.interviewing} currently in interview rounds
              </span>
            </div>

            {/* Interview Conversion Rate Card */}
            <div className="kpi-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span
                  style={{
                    fontSize: '0.8125rem',
                    fontFamily: 'var(--font-headline)',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    color: 'var(--md-sys-color-on-surface-variant)',
                  }}
                >
                  Interview Rate
                </span>
                <div
                  className="kpi-icon-badge"
                  style={{
                    backgroundColor: 'var(--md-sys-color-secondary-container)',
                    color: 'var(--md-sys-color-on-secondary-container)',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                    trending_up
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.5rem' }}>
                <span
                  style={{
                    fontSize: '2.25rem',
                    fontFamily: 'var(--font-headline)',
                    fontWeight: 800,
                    color: 'var(--md-sys-color-on-surface)',
                  }}
                >
                  {stats.interviewRate}%
                </span>
                <span style={{ fontSize: '0.8125rem', color: 'var(--md-sys-color-outline)' }}>
                  conversion
                </span>
              </div>
              <span style={{ fontSize: '0.8125rem', color: 'var(--md-sys-color-on-surface-variant)', marginTop: '0.25rem' }}>
                Applied to interview progression ratio
              </span>
            </div>

            {/* Offers Received Card */}
            <div className="kpi-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span
                  style={{
                    fontSize: '0.8125rem',
                    fontFamily: 'var(--font-headline)',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    color: 'var(--md-sys-color-on-surface-variant)',
                  }}
                >
                  Offers Received
                </span>
                <div
                  className="kpi-icon-badge"
                  style={{
                    backgroundColor: 'var(--md-sys-color-primary-container)',
                    color: 'var(--md-sys-color-on-primary-container)',
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: '20px', fontVariationSettings: "'FILL' 1" }}
                  >
                    workspace_premium
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.5rem' }}>
                <span
                  style={{
                    fontSize: '2.25rem',
                    fontFamily: 'var(--font-headline)',
                    fontWeight: 800,
                    color: stats.offers > 0 ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-on-surface)',
                  }}
                >
                  {stats.offers}
                </span>
                <span style={{ fontSize: '0.8125rem', color: 'var(--md-sys-color-outline)' }}>
                  offers
                </span>
              </div>
              <span style={{ fontSize: '0.8125rem', color: 'var(--md-sys-color-on-surface-variant)', marginTop: '0.25rem' }}>
                {stats.offerRate}% final offer conversion rate
              </span>
            </div>
          </div>

          {/* Visual Analytics Grid: Conversion Funnel & Status Breakdown */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {/* Conversion Funnel Card */}
            <div className="m3-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <h3
                  style={{
                    fontSize: '1.125rem',
                    fontFamily: 'var(--font-headline)',
                    fontWeight: 700,
                    color: 'var(--md-sys-color-on-surface)',
                    marginBottom: '0.25rem',
                  }}
                >
                  Application Pipeline Funnel
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--md-sys-color-on-surface-variant)' }}>
                  Progression from draft preparation to job offer.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
                {/* Step 1: Draft */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                    <span style={{ fontWeight: 600, color: 'var(--md-sys-color-on-surface)' }}>1. Drafts</span>
                    <span style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>{stats.drafts} apps</span>
                  </div>
                  <div className="m3-funnel-bar">
                    <div
                      className="m3-funnel-fill"
                      style={{
                        width: `${stats.total > 0 ? (stats.drafts / stats.total) * 100 : 0}%`,
                        backgroundColor: 'var(--md-sys-color-outline)',
                      }}
                    />
                  </div>
                </div>

                {/* Step 2: Applied */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                    <span style={{ fontWeight: 600, color: 'var(--md-sys-color-on-surface)' }}>2. Applied & Submitted</span>
                    <span style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>{stats.applied} apps</span>
                  </div>
                  <div className="m3-funnel-bar">
                    <div
                      className="m3-funnel-fill"
                      style={{
                        width: `${stats.total > 0 ? (stats.applied / stats.total) * 100 : 0}%`,
                        backgroundColor: 'var(--md-sys-color-primary)',
                      }}
                    />
                  </div>
                </div>

                {/* Step 3: Interviewing */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                    <span style={{ fontWeight: 600, color: 'var(--md-sys-color-on-surface)' }}>3. Interviews & Rounds</span>
                    <span style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>{stats.interviewing} apps</span>
                  </div>
                  <div className="m3-funnel-bar">
                    <div
                      className="m3-funnel-fill"
                      style={{
                        width: `${stats.total > 0 ? (stats.interviewing / stats.total) * 100 : 0}%`,
                        backgroundColor: 'var(--md-sys-color-secondary)',
                      }}
                    />
                  </div>
                </div>

                {/* Step 4: Offer */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                    <span style={{ fontWeight: 600, color: stats.offers > 0 ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-on-surface)' }}>4. Job Offers</span>
                    <span style={{ color: stats.offers > 0 ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-on-surface-variant)', fontWeight: stats.offers > 0 ? 700 : 500 }}>{stats.offers} apps</span>
                  </div>
                  <div className="m3-funnel-bar">
                    <div
                      className="m3-funnel-fill"
                      style={{
                        width: `${stats.total > 0 ? (stats.offers / stats.total) * 100 : 0}%`,
                        backgroundColor: 'var(--md-sys-color-primary)',
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Status Distribution Card */}
            <div className="m3-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <h3
                  style={{
                    fontSize: '1.125rem',
                    fontFamily: 'var(--font-headline)',
                    fontWeight: 700,
                    color: 'var(--md-sys-color-on-surface)',
                    marginBottom: '0.25rem',
                  }}
                >
                  Status Distribution
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--md-sys-color-on-surface-variant)' }}>
                  Breakdown across all active and closed pursuit stages.
                </p>
              </div>

              {/* Segmented Progress Distribution Bar */}
              <div
                style={{
                  height: '14px',
                  borderRadius: '7px',
                  backgroundColor: 'var(--md-sys-color-surface-container-high)',
                  display: 'flex',
                  overflow: 'hidden',
                  marginTop: '0.5rem',
                }}
              >
                {stats.total > 0 && (
                  <>
                    <div style={{ width: `${(stats.drafts / stats.total) * 100}%`, backgroundColor: 'var(--status-draft-text)' }} title={`Drafts: ${stats.drafts}`} />
                    <div style={{ width: `${(stats.applied / stats.total) * 100}%`, backgroundColor: 'var(--status-applied-text)' }} title={`Applied: ${stats.applied}`} />
                    <div style={{ width: `${(stats.interviewing / stats.total) * 100}%`, backgroundColor: 'var(--status-interviewing-text)' }} title={`Interviewing: ${stats.interviewing}`} />
                    <div style={{ width: `${(stats.offers / stats.total) * 100}%`, backgroundColor: 'var(--status-offer-text)' }} title={`Offers: ${stats.offers}`} />
                    <div style={{ width: `${(stats.rejected / stats.total) * 100}%`, backgroundColor: 'var(--status-rejected-text)' }} title={`Rejected: ${stats.rejected}`} />
                    <div style={{ width: `${(stats.withdrawn / stats.total) * 100}%`, backgroundColor: 'var(--status-withdrawn-text)' }} title={`Withdrawn: ${stats.withdrawn}`} />
                  </>
                )}
              </div>

              {/* Status Legend Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.75rem',
                  marginTop: '0.5rem',
                }}
              >
                {APPLICATION_STATUSES.map((status) => {
                  const count =
                    status.value === 'draft'
                      ? stats.drafts
                      : status.value === 'applied'
                      ? stats.applied
                      : status.value === 'interviewing'
                      ? stats.interviewing
                      : status.value === 'offer'
                      ? stats.offers
                      : status.value === 'rejected'
                      ? stats.rejected
                      : stats.withdrawn;

                  const percent = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;

                  return (
                    <div
                      key={status.value}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.625rem 0.875rem',
                        borderRadius: '12px',
                        backgroundColor: 'var(--md-sys-color-surface-container-low)',
                        border: '1px solid var(--md-sys-color-outline-variant)',
                      }}
                    >
                      <span style={{ fontSize: '0.8125rem', fontFamily: 'var(--font-headline)', fontWeight: 600, color: 'var(--md-sys-color-on-surface)' }}>
                        {status.label}
                      </span>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--md-sys-color-on-surface-variant)', fontWeight: 500 }}>
                        {count} ({percent}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Recent Applications Quick Hub */}
          <div className="m3-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.5rem',
              }}
            >
              <div>
                <h3
                  style={{
                    fontSize: '1.125rem',
                    fontFamily: 'var(--font-headline)',
                    fontWeight: 700,
                    color: 'var(--md-sys-color-on-surface)',
                  }}
                >
                  Recent Applications
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--md-sys-color-on-surface-variant)' }}>
                  Latest pursuits updated in your pipeline.
                </p>
              </div>

              <Link
                href="/applications"
                style={{
                  fontSize: '0.8125rem',
                  fontFamily: 'var(--font-headline)',
                  fontWeight: 700,
                  color: 'var(--md-sys-color-primary)',
                  textDecoration: 'none',
                }}
              >
                View all applications →
              </Link>
            </div>

            {recentApplications.length === 0 ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '2.5rem 1rem',
                  gap: '0.75rem',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '16px',
                    backgroundColor: 'var(--md-sys-color-surface-container)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--md-sys-color-primary)',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>
                    work
                  </span>
                </div>
                <p style={{ color: 'var(--md-sys-color-on-surface)', fontWeight: 600, fontSize: '0.9375rem' }}>
                  No applications tracked yet
                </p>
                <p style={{ color: 'var(--md-sys-color-on-surface-variant)', fontSize: '0.8125rem', maxWidth: '360px' }}>
                  Add your first job pursuit using AI parsing to begin seeing insights and pipeline momentum.
                </p>
                <Link href="/applications/new" style={{ marginTop: '0.5rem', textDecoration: 'none' }}>
                  <FilledButton icon="add">Add Job</FilledButton>
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {recentApplications.map((app) => (
                  <Link
                    key={app.id}
                    href={`/applications/${app.id}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 1rem',
                      borderRadius: '16px',
                      backgroundColor: 'var(--md-sys-color-surface-container-low)',
                      border: '1px solid var(--md-sys-color-outline-variant)',
                      textDecoration: 'none',
                      transition: 'all 0.15s cubic-bezier(0.2, 0, 0, 1)',
                      gap: '1rem',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--md-sys-color-surface-container)';
                      e.currentTarget.style.borderColor = 'var(--md-sys-color-primary)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--md-sys-color-surface-container-low)';
                      e.currentTarget.style.borderColor = 'var(--md-sys-color-outline-variant)';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                      <div
                        className="company-avatar"
                        style={{ width: '40px', height: '40px', fontSize: '0.875rem' }}
                      >
                        {getInitials(app.company)}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                        <span
                          style={{
                            fontFamily: 'var(--font-headline)',
                            fontWeight: 700,
                            color: 'var(--md-sys-color-on-surface)',
                            fontSize: '0.9375rem',
                          }}
                        >
                          {app.company}
                        </span>
                        <span style={{ color: 'var(--md-sys-color-on-surface-variant)', fontSize: '0.8125rem' }}>
                          {app.title} {app.location ? `• ${app.location}` : ''}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <StatusBadge status={app.status} />
                      <span
                        className="material-symbols-outlined"
                        style={{ fontSize: '18px', color: 'var(--md-sys-color-outline)' }}
                      >
                        arrow_forward
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
