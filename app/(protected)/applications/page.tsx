'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Application, ApplicationStatus, APPLICATION_STATUSES } from '@/lib/types/database';
import { StatusBadge } from '@/components/applications/StatusBadge';
import { TextField } from '@/components/ui/TextField';
import { FilledButton, OutlinedButton } from '@/components/ui/Button';
import { CircularProgress } from '@/components/ui/CircularProgress';
import { NewApplicationSheet } from '@/components/applications/NewApplicationSheet';

function getInitials(name: string): string {
  if (!name) return 'JT';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStatus, setActiveStatus] = useState<ApplicationStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'updated_desc' | 'created_desc' | 'company_asc'>('updated_desc');
  const [isNewSheetOpen, setIsNewSheetOpen] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  // Auto-open drawer if ?new=1 query param is present
  useEffect(() => {
    if (searchParams.get('new') === '1' || searchParams.get('new') === 'true') {
      setIsNewSheetOpen(true);
    }
  }, [searchParams]);

  useEffect(() => {
    async function fetchApplications() {
      setLoading(true);
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching applications:', error);
      } else {
        setApplications(data || []);
      }
      setLoading(false);
    }

    fetchApplications();
  }, [supabase]);

  // Calculate status counts for filter badges
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: applications.length };
    APPLICATION_STATUSES.forEach((s) => {
      counts[s.value] = applications.filter((a) => a.status === s.value).length;
    });
    return counts;
  }, [applications]);

  // Filter and sort applications
  const filteredApplications = useMemo(() => {
    return applications
      .filter((app) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matches =
            app.company.toLowerCase().includes(q) ||
            app.title.toLowerCase().includes(q) ||
            (app.location && app.location.toLowerCase().includes(q));
          if (!matches) return false;
        }

        // Status filter
        if (activeStatus !== 'all') {
          if (app.status !== activeStatus) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'updated_desc') {
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        }
        if (sortBy === 'created_desc') {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        if (sortBy === 'company_asc') {
          return a.company.localeCompare(b.company);
        }
        return 0;
      });
  }, [applications, searchQuery, activeStatus, sortBy]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!window.confirm('Are you sure you want to delete this application?')) {
      return;
    }

    try {
      const { error } = await supabase.from('applications').delete().eq('id', id);
      if (error) throw error;
      setApplications((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete application.');
    }
  };

  return (
    <div style={{ maxWidth: '1280px', padding: '2rem 1.5rem 4rem 1.5rem', margin: '0 auto' }}>
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem',
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
            Applications
          </h1>
          <p
            style={{
              color: 'var(--md-sys-color-on-surface-variant)',
              fontSize: '0.9375rem',
              fontFamily: 'var(--font-body)',
            }}
          >
            Search, filter, and track all your active job pursuits.
          </p>
        </div>

        <FilledButton icon="add" onClick={() => setIsNewSheetOpen(true)}>
          Add Job
        </FilledButton>
      </div>

      {/* Unified M3 Workspace Card (Toolbar + Data Table inside One Container) */}
      <div
        className="m3-card"
        style={{
          padding: 0,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'var(--md-sys-color-surface-container-low)',
          border: '1px solid var(--md-sys-color-outline-variant)',
          borderRadius: '24px',
        }}
      >
        {/* Integrated Toolbar Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            borderBottom: '1px solid var(--md-sys-color-outline-variant)',
          }}
        >
          {/* Row 1: Search Input & Sort Selector */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ flex: 1, minWidth: '240px', maxWidth: '460px' }}>
              <TextField
                label="Search company, title, location..."
                value={searchQuery}
                onValueChange={setSearchQuery}
                leadingIcon="search"
              />
            </div>

            {/* M3 Sort Selector Chip */}
            <div
              style={{
                position: 'relative',
                display: 'inline-flex',
                alignItems: 'center',
                height: '40px',
                padding: '0 1rem 0 0.875rem',
                borderRadius: '9999px',
                border: '1px solid var(--md-sys-color-outline-variant)',
                backgroundColor: 'var(--md-sys-color-surface-container-low)',
                color: 'var(--md-sys-color-on-surface)',
                gap: '0.5rem',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease, border-color 0.2s ease',
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{
                  fontSize: '18px',
                  color: 'var(--md-sys-color-on-surface-variant)',
                  pointerEvents: 'none',
                }}
              >
                sort
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-headline)',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: 'var(--md-sys-color-on-surface-variant)',
                  pointerEvents: 'none',
                }}
              >
                Sort:
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-headline)',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  color: 'var(--md-sys-color-on-surface)',
                  pointerEvents: 'none',
                }}
              >
                {sortBy === 'updated_desc'
                  ? 'Recently Updated'
                  : sortBy === 'created_desc'
                  ? 'Recently Created'
                  : 'Company (A-Z)'}
              </span>
              <span
                className="material-symbols-outlined"
                style={{
                  fontSize: '18px',
                  color: 'var(--md-sys-color-on-surface-variant)',
                  pointerEvents: 'none',
                }}
              >
                expand_more
              </span>

              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                aria-label="Sort applications"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  opacity: 0,
                  cursor: 'pointer',
                  appearance: 'none',
                }}
              >
                <option value="updated_desc">Recently Updated</option>
                <option value="created_desc">Recently Created</option>
                <option value="company_asc">Company (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Row 2: Status Filter Chips */}
          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
              overflowX: 'auto',
              paddingBottom: '0.25rem',
              scrollbarWidth: 'none',
            }}
          >
            <button
              onClick={() => setActiveStatus('all')}
              style={{
                padding: '0.35rem 0.85rem',
                borderRadius: '9999px',
                border: activeStatus === 'all' ? '1px solid transparent' : '1px solid var(--md-sys-color-outline-variant)',
                backgroundColor:
                  activeStatus === 'all'
                    ? 'var(--md-sys-color-secondary-container)'
                    : 'transparent',
                color:
                  activeStatus === 'all'
                    ? 'var(--md-sys-color-on-secondary-container)'
                    : 'var(--md-sys-color-on-surface-variant)',
                fontFamily: 'var(--font-headline)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              <span>All</span>
              <span
                style={{
                  fontSize: '0.75rem',
                  padding: '0.05rem 0.4rem',
                  borderRadius: '9999px',
                  backgroundColor: activeStatus === 'all' ? 'rgba(0,0,0,0.08)' : 'var(--md-sys-color-surface-container-high)',
                  color: 'inherit',
                  fontWeight: 700,
                }}
              >
                {statusCounts.all || 0}
              </span>
            </button>

            {APPLICATION_STATUSES.map((status) => {
              const isActive = activeStatus === status.value;
              const count = statusCounts[status.value] || 0;
              return (
                <button
                  key={status.value}
                  onClick={() => setActiveStatus(status.value)}
                  style={{
                    padding: '0.35rem 0.85rem',
                    borderRadius: '9999px',
                    border: isActive ? '1px solid transparent' : '1px solid var(--md-sys-color-outline-variant)',
                    backgroundColor: isActive
                      ? 'var(--md-sys-color-secondary-container)'
                      : 'transparent',
                    color: isActive
                      ? 'var(--md-sys-color-on-secondary-container)'
                      : 'var(--md-sys-color-on-surface-variant)',
                    fontFamily: 'var(--font-headline)',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span>{status.label}</span>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      padding: '0.05rem 0.4rem',
                      borderRadius: '9999px',
                      backgroundColor: isActive ? 'rgba(0,0,0,0.08)' : 'var(--md-sys-color-surface-container-high)',
                      color: 'inherit',
                      fontWeight: 700,
                    }}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content Area: Loading / Empty / Data Table */}
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
            <p style={{ color: 'var(--md-sys-color-on-surface-variant)', fontSize: '0.875rem' }}>
              Loading applications...
            </p>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4rem 1.5rem',
              textAlign: 'center',
              gap: '1.25rem',
            }}
          >
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '16px',
                backgroundColor: 'var(--md-sys-color-surface-container-high)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--md-sys-color-primary)',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '26px' }}>
                work_outline
              </span>
            </div>

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
                {searchQuery || activeStatus !== 'all'
                  ? 'No matching applications'
                  : 'No applications tracked yet'}
              </h3>

              <p
                style={{
                  color: 'var(--md-sys-color-on-surface-variant)',
                  maxWidth: '400px',
                  fontSize: '0.8125rem',
                  lineHeight: 1.5,
                }}
              >
                {searchQuery || activeStatus !== 'all'
                  ? 'Try adjusting your search keywords or switching status filters.'
                  : 'Add your first job application using automated AI parsing or manual entry.'}
              </p>
            </div>

            <div style={{ marginTop: '0.25rem' }}>
              <FilledButton icon="add" onClick={() => setIsNewSheetOpen(true)}>
                Add Job
              </FilledButton>
            </div>
          </div>
        ) : (
          /* M3 Data Table */
          <div style={{ overflowX: 'auto', width: '100%' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr
                  style={{
                    borderBottom: '1px solid var(--md-sys-color-outline-variant)',
                    backgroundColor: 'var(--md-sys-color-surface-container)',
                  }}
                >
                  <th
                    style={{
                      padding: '0.875rem 1.5rem',
                      fontSize: '0.6875rem',
                      fontFamily: 'var(--font-headline)',
                      fontWeight: 700,
                      color: 'var(--md-sys-color-on-surface-variant)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      width: '32%',
                    }}
                  >
                    Company & Role
                  </th>
                  <th
                    style={{
                      padding: '0.875rem 1rem',
                      fontSize: '0.6875rem',
                      fontFamily: 'var(--font-headline)',
                      fontWeight: 700,
                      color: 'var(--md-sys-color-on-surface-variant)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      width: '14%',
                    }}
                  >
                    Status
                  </th>
                  <th
                    style={{
                      padding: '0.875rem 1rem',
                      fontSize: '0.6875rem',
                      fontFamily: 'var(--font-headline)',
                      fontWeight: 700,
                      color: 'var(--md-sys-color-on-surface-variant)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      width: '24%',
                    }}
                  >
                    Location
                  </th>
                  <th
                    style={{
                      padding: '0.875rem 1rem',
                      fontSize: '0.6875rem',
                      fontFamily: 'var(--font-headline)',
                      fontWeight: 700,
                      color: 'var(--md-sys-color-on-surface-variant)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      width: '12%',
                    }}
                  >
                    Applied
                  </th>
                  <th
                    style={{
                      padding: '0.875rem 1rem',
                      fontSize: '0.6875rem',
                      fontFamily: 'var(--font-headline)',
                      fontWeight: 700,
                      color: 'var(--md-sys-color-on-surface-variant)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      width: '12%',
                    }}
                  >
                    Salary
                  </th>
                  <th
                    style={{
                      padding: '0.875rem 1.5rem',
                      fontSize: '0.6875rem',
                      fontFamily: 'var(--font-headline)',
                      fontWeight: 700,
                      color: 'var(--md-sys-color-on-surface-variant)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      textAlign: 'right',
                      width: '6%',
                    }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredApplications.map((app) => (
                  <tr
                    key={app.id}
                    onClick={() => router.push(`/applications/${app.id}`)}
                    style={{
                      borderBottom: '1px solid var(--md-sys-color-outline-variant)',
                      cursor: 'pointer',
                      transition: 'background-color 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor =
                        'var(--md-sys-color-surface-container)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    {/* Company & Role */}
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                        <div
                          className="company-avatar"
                          style={{ width: '40px', height: '40px', fontSize: '0.875rem' }}
                        >
                          {getInitials(app.company)}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span
                            style={{
                              fontFamily: 'var(--font-headline)',
                              fontWeight: 700,
                              fontSize: '0.9375rem',
                              color: 'var(--md-sys-color-on-surface)',
                            }}
                          >
                            {app.company}
                          </span>
                          <span
                            style={{
                              fontSize: '0.8125rem',
                              color: 'var(--md-sys-color-on-surface-variant)',
                              fontWeight: 500,
                            }}
                          >
                            {app.title}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td style={{ padding: '1rem 1rem' }}>
                      <StatusBadge status={app.status} size="small" />
                    </td>

                    {/* Location */}
                    <td style={{ padding: '1rem 1rem' }}>
                      <span
                        style={{
                          fontSize: '0.8125rem',
                          color: 'var(--md-sys-color-on-surface-variant)',
                        }}
                      >
                        {app.location || '—'}
                      </span>
                    </td>

                    {/* Applied Date */}
                    <td style={{ padding: '1rem 1rem' }}>
                      <span
                        style={{
                          fontSize: '0.8125rem',
                          color: 'var(--md-sys-color-on-surface-variant)',
                        }}
                      >
                        {new Date(app.created_at).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </td>

                    {/* Salary */}
                    <td style={{ padding: '1rem 1rem' }}>
                      <span
                        style={{
                          fontSize: '0.8125rem',
                          color: 'var(--md-sys-color-on-surface-variant)',
                        }}
                      >
                        {app.salary_range || '—'}
                      </span>
                    </td>

                    {/* Row Action Icons */}
                    <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                        }}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/applications/${app.id}`);
                          }}
                          title="View details"
                          aria-label="View application details"
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            border: 'none',
                            backgroundColor: 'transparent',
                            color: 'var(--md-sys-color-on-surface-variant)',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'background-color 0.15s ease',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor =
                              'var(--md-sys-color-surface-container-high)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                            visibility
                          </span>
                        </button>

                        <button
                          onClick={(e) => handleDelete(app.id, e)}
                          title="Delete application"
                          aria-label="Delete application"
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            border: 'none',
                            backgroundColor: 'transparent',
                            color: 'var(--md-sys-color-error)',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'background-color 0.15s ease',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor =
                              'var(--md-sys-color-error-container)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                            delete
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* M3 Side Sheet Drawer for In-Context Creation */}
      <NewApplicationSheet
        open={isNewSheetOpen}
        onClose={() => setIsNewSheetOpen(false)}
        onCreated={(newApp) => {
          setApplications((prev) => [newApp, ...prev]);
        }}
      />
    </div>
  );
}
