'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Application, ApplicationStatus, APPLICATION_STATUSES } from '@/lib/types/database';
import { StatusBadge } from '@/components/applications/StatusBadge';
import { FilledButton, OutlinedButton } from '@/components/ui/Button';
import { CircularProgress } from '@/components/ui/CircularProgress';
import { NewApplicationSheet } from '@/components/applications/NewApplicationSheet';
import { ApplicationDetailSheet } from '@/components/applications/ApplicationDetailSheet';

function getInitials(name: string): string {
  if (!name) return 'JT';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export default function DashboardPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [isNewSheetOpen, setIsNewSheetOpen] = useState(false);

  // In-context Application Detail Sheet state
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  const fetchApplications = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('applications')
      .select('id, user_id, company, title, location, salary_range, seniority, status, created_at, updated_at, source_type, parse_status, notes')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching applications for dashboard:', error);
    } else {
      setApplications((data as unknown as Application[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
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
    <div style={{ maxWidth: '1280px', padding: '2rem 2rem 4rem 2rem', margin: '0 auto' }}>
      {/* Header & Primary Actions */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
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
              letterSpacing: '-0.025em',
              marginBottom: '0.2rem',
            }}
          >
            Dashboard
          </h1>
          <p
            style={{
              color: 'var(--md-sys-color-on-surface-variant)',
              fontSize: '0.9375rem',
              fontFamily: 'var(--font-body)',
              margin: 0,
            }}
          >
            Real-time pipeline health, conversion metrics, and job pursuit momentum.
          </p>
        </div>

        <FilledButton icon="add" onClick={() => setIsNewSheetOpen(true)}>
          Add Job
        </FilledButton>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
          <CircularProgress />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Top Row: 4 Essential KPI Stat Metric Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {/* Total Applications Card */}
            <div
              style={{
                backgroundColor: 'var(--md-sys-color-surface-container-low)',
                borderRadius: '24px',
                padding: '1.5rem',
                border: '1px solid var(--md-sys-color-outline-variant)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span
                  style={{
                    fontSize: '0.8125rem',
                    fontFamily: 'var(--font-headline)',
                    fontWeight: 700,
                    color: 'var(--md-sys-color-on-surface-variant)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Total Tracked
                </span>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '12px',
                    backgroundColor: 'var(--md-sys-color-surface-container-high)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--md-sys-color-primary)',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                    inventory_2
                  </span>
                </div>
              </div>

              <div style={{ marginTop: '1.25rem' }}>
                <span
                  style={{
                    fontSize: '2.5rem',
                    fontFamily: 'var(--font-headline)',
                    fontWeight: 800,
                    color: 'var(--md-sys-color-on-surface)',
                    lineHeight: 1,
                  }}
                >
                  {stats.total}
                </span>
                <p
                  style={{
                    fontSize: '0.8125rem',
                    color: 'var(--md-sys-color-on-surface-variant)',
                    marginTop: '0.5rem',
                    marginBottom: 0,
                  }}
                >
                  {stats.activePipeline} active pursuits in progress
                </p>
              </div>
            </div>

            {/* In Review / Interviewing Card */}
            <div
              style={{
                backgroundColor: 'var(--md-sys-color-surface-container-low)',
                borderRadius: '24px',
                padding: '1.5rem',
                border: '1px solid var(--md-sys-color-outline-variant)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span
                  style={{
                    fontSize: '0.8125rem',
                    fontFamily: 'var(--font-headline)',
                    fontWeight: 700,
                    color: 'var(--md-sys-color-on-surface-variant)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Interviewing
                </span>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(56, 101, 0, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--md-sys-color-primary)',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                    record_voice_over
                  </span>
                </div>
              </div>

              <div style={{ marginTop: '1.25rem' }}>
                <span
                  style={{
                    fontSize: '2.5rem',
                    fontFamily: 'var(--font-headline)',
                    fontWeight: 800,
                    color: 'var(--md-sys-color-primary)',
                    lineHeight: 1,
                  }}
                >
                  {stats.interviewing}
                </span>
                <p
                  style={{
                    fontSize: '0.8125rem',
                    color: 'var(--md-sys-color-on-surface-variant)',
                    marginTop: '0.5rem',
                    marginBottom: 0,
                  }}
                >
                  {stats.applied} submitted & waiting response
                </p>
              </div>
            </div>

            {/* Offers Received Card */}
            <div
              style={{
                backgroundColor: 'var(--md-sys-color-surface-container-low)',
                borderRadius: '24px',
                padding: '1.5rem',
                border: '1px solid var(--md-sys-color-outline-variant)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span
                  style={{
                    fontSize: '0.8125rem',
                    fontFamily: 'var(--font-headline)',
                    fontWeight: 700,
                    color: 'var(--md-sys-color-on-surface-variant)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Offers
                </span>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(56, 101, 0, 0.18)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#2e7d32',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                    emoji_events
                  </span>
                </div>
              </div>

              <div style={{ marginTop: '1.25rem' }}>
                <span
                  style={{
                    fontSize: '2.5rem',
                    fontFamily: 'var(--font-headline)',
                    fontWeight: 800,
                    color: '#2e7d32',
                    lineHeight: 1,
                  }}
                >
                  {stats.offers}
                </span>
                <p
                  style={{
                    fontSize: '0.8125rem',
                    color: 'var(--md-sys-color-on-surface-variant)',
                    marginTop: '0.5rem',
                    marginBottom: 0,
                  }}
                >
                  {stats.offerRate}% conversion from applied
                </p>
              </div>
            </div>

            {/* Conversion / Response Rate Card */}
            <div
              style={{
                backgroundColor: 'var(--md-sys-color-surface-container-low)',
                borderRadius: '24px',
                padding: '1.5rem',
                border: '1px solid var(--md-sys-color-outline-variant)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span
                  style={{
                    fontSize: '0.8125rem',
                    fontFamily: 'var(--font-headline)',
                    fontWeight: 700,
                    color: 'var(--md-sys-color-on-surface-variant)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Interview Rate
                </span>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '12px',
                    backgroundColor: 'var(--md-sys-color-surface-container-high)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--md-sys-color-primary)',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                    trending_up
                  </span>
                </div>
              </div>

              <div style={{ marginTop: '1.25rem' }}>
                <span
                  style={{
                    fontSize: '2.5rem',
                    fontFamily: 'var(--font-headline)',
                    fontWeight: 800,
                    color: 'var(--md-sys-color-on-surface)',
                    lineHeight: 1,
                  }}
                >
                  {stats.interviewRate}%
                </span>
                <p
                  style={{
                    fontSize: '0.8125rem',
                    color: 'var(--md-sys-color-on-surface-variant)',
                    marginTop: '0.5rem',
                    marginBottom: 0,
                  }}
                >
                  Applied $\rightarrow$ Interview progression
                </p>
              </div>
            </div>
          </div>

          {/* Middle Row: Funnel Pipeline Distribution */}
          <div
            style={{
              backgroundColor: 'var(--md-sys-color-surface-container-low)',
              borderRadius: '28px',
              padding: '1.75rem',
              border: '1px solid var(--md-sys-color-outline-variant)',
            }}
          >
            <div style={{ marginBottom: '1.25rem' }}>
              <h2
                style={{
                  fontSize: '1.125rem',
                  fontFamily: 'var(--font-headline)',
                  fontWeight: 700,
                  color: 'var(--md-sys-color-on-surface)',
                  margin: 0,
                }}
              >
                Application Pipeline Funnel
              </h2>
              <p
                style={{
                  fontSize: '0.8125rem',
                  color: 'var(--md-sys-color-on-surface-variant)',
                  margin: '0.25rem 0 0 0',
                }}
              >
                Current distribution of your job pursuits across stages.
              </p>
            </div>

            {/* Horizontal Segmented Progress Bar */}
            <div
              style={{
                height: '14px',
                borderRadius: '7px',
                backgroundColor: 'var(--md-sys-color-surface-container-highest)',
                display: 'flex',
                overflow: 'hidden',
                marginBottom: '1.5rem',
                gap: '2px',
              }}
            >
              {stats.total === 0 ? (
                <div style={{ width: '100%', backgroundColor: 'var(--md-sys-color-surface-container-high)' }} />
              ) : (
                <>
                  <div
                    style={{
                      width: `${(stats.drafts / stats.total) * 100}%`,
                      backgroundColor: 'var(--status-draft-bg)',
                    }}
                    title={`Draft: ${stats.drafts}`}
                  />
                  <div
                    style={{
                      width: `${(stats.applied / stats.total) * 100}%`,
                      backgroundColor: 'var(--status-applied-bg)',
                    }}
                    title={`Applied: ${stats.applied}`}
                  />
                  <div
                    style={{
                      width: `${(stats.interviewing / stats.total) * 100}%`,
                      backgroundColor: 'var(--status-interviewing-bg)',
                    }}
                    title={`Interviewing: ${stats.interviewing}`}
                  />
                  <div
                    style={{
                      width: `${(stats.offers / stats.total) * 100}%`,
                      backgroundColor: 'var(--status-offer-bg)',
                    }}
                    title={`Offer: ${stats.offers}`}
                  />
                  <div
                    style={{
                      width: `${(stats.rejected / stats.total) * 100}%`,
                      backgroundColor: 'var(--status-rejected-bg)',
                    }}
                    title={`Rejected: ${stats.rejected}`}
                  />
                  <div
                    style={{
                      width: `${(stats.withdrawn / stats.total) * 100}%`,
                      backgroundColor: 'var(--status-withdrawn-bg)',
                    }}
                    title={`Withdrawn: ${stats.withdrawn}`}
                  />
                </>
              )}
            </div>

            {/* Legend & Breakdown Chips */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '0.875rem',
              }}
            >
              {[
                { label: 'Draft', count: stats.drafts, bg: 'var(--status-draft-bg)', text: 'var(--status-draft-text)' },
                { label: 'Applied', count: stats.applied, bg: 'var(--status-applied-bg)', text: 'var(--status-applied-text)' },
                { label: 'Interviewing', count: stats.interviewing, bg: 'var(--status-interviewing-bg)', text: 'var(--status-interviewing-text)' },
                { label: 'Offer', count: stats.offers, bg: 'var(--status-offer-bg)', text: 'var(--status-offer-text)' },
                { label: 'Rejected', count: stats.rejected, bg: 'var(--status-rejected-bg)', text: 'var(--status-rejected-text)' },
                { label: 'Withdrawn', count: stats.withdrawn, bg: 'var(--status-withdrawn-bg)', text: 'var(--status-withdrawn-text)' },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '16px',
                    backgroundColor: 'var(--md-sys-color-surface-container)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div
                      style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        backgroundColor: item.bg,
                      }}
                    />
                    <span style={{ fontSize: '0.8125rem', fontFamily: 'var(--font-headline)', fontWeight: 600 }}>
                      {item.label}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.875rem', fontWeight: 800, fontFamily: 'var(--font-headline)' }}>
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Section: Recent Applications Quick Inspection List */}
          <div
            style={{
              backgroundColor: 'var(--md-sys-color-surface-container-low)',
              borderRadius: '28px',
              padding: '1.75rem',
              border: '1px solid var(--md-sys-color-outline-variant)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.25rem',
                flexWrap: 'wrap',
                gap: '0.75rem',
              }}
            >
              <div>
                <h2
                  style={{
                    fontSize: '1.125rem',
                    fontFamily: 'var(--font-headline)',
                    fontWeight: 700,
                    color: 'var(--md-sys-color-on-surface)',
                    margin: 0,
                  }}
                >
                  Recent Applications
                </h2>
                <p
                  style={{
                    fontSize: '0.8125rem',
                    color: 'var(--md-sys-color-on-surface-variant)',
                    margin: '0.25rem 0 0 0',
                  }}
                >
                  Click any role to inspect or update in the side sheet.
                </p>
              </div>

              <Link
                href="/applications"
                prefetch={true}
                style={{
                  fontSize: '0.875rem',
                  fontFamily: 'var(--font-headline)',
                  fontWeight: 700,
                  color: 'var(--md-sys-color-primary)',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                }}
              >
                <span>View Full Table ({stats.total})</span>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                  arrow_forward
                </span>
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
                <p style={{ color: 'var(--md-sys-color-on-surface-variant)', fontSize: '0.8125rem', maxWidth: '360px', margin: 0 }}>
                  Add your first job pursuit using AI parsing to begin seeing insights and pipeline momentum.
                </p>
                <div style={{ marginTop: '0.5rem' }}>
                  <FilledButton icon="add" onClick={() => setIsNewSheetOpen(true)}>
                    Add Job
                  </FilledButton>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {recentApplications.map((app) => (
                  <div
                    key={app.id}
                    onClick={() => {
                      setSelectedAppId(app.id);
                      setIsDetailSheetOpen(true);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.875rem 1.25rem',
                      borderRadius: '16px',
                      backgroundColor: 'var(--md-sys-color-surface-container-low)',
                      border: '1px solid var(--md-sys-color-outline-variant)',
                      cursor: 'pointer',
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
                      <StatusBadge status={app.status} size="small" />
                      <span
                        className="material-symbols-outlined"
                        style={{ fontSize: '18px', color: 'var(--md-sys-color-outline)' }}
                      >
                        side_navigation
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Direct Add Job Side Sheet Integration on Dashboard */}
      <NewApplicationSheet
        open={isNewSheetOpen}
        onClose={() => setIsNewSheetOpen(false)}
        onCreated={(newApp) => {
          setIsNewSheetOpen(false);
          fetchApplications();
          setSelectedAppId(newApp.id);
          setIsDetailSheetOpen(true);
        }}
      />

      {/* In-Context Application Detail Side Sheet */}
      <ApplicationDetailSheet
        applicationId={selectedAppId}
        open={isDetailSheetOpen}
        onClose={() => {
          setIsDetailSheetOpen(false);
          setSelectedAppId(null);
        }}
        onUpdated={(updatedApp) => {
          setApplications((prev) =>
            prev.map((a) => (a.id === updatedApp.id ? { ...a, ...updatedApp } : a))
          );
        }}
        onDeleted={(deletedId) => {
          setApplications((prev) => prev.filter((a) => a.id !== deletedId));
        }}
      />
    </div>
  );
}
