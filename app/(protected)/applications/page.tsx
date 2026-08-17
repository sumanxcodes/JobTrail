'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Application, ApplicationStatus, APPLICATION_STATUSES } from '@/lib/types/database';
import { StatusBadge } from '@/components/applications/StatusBadge';
import { TextField } from '@/components/ui/TextField';
import { FilledButton, OutlinedButton } from '@/components/ui/Button';
import { CircularProgress } from '@/components/ui/CircularProgress';

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

  const supabase = createClient();

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
          return new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime();
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
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this application?')) return;

    const { error } = await supabase.from('applications').delete().eq('id', id);
    if (!error) {
      setApplications((prev) => prev.filter((a) => a.id !== id));
    }
  };

  return (
    <div style={{ padding: '2rem 2.5rem 4rem 2.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header & Main Actions */}
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

        <Link href="/applications/new" style={{ textDecoration: 'none' }}>
          <FilledButton icon="add">Add Application</FilledButton>
        </Link>
      </div>

      {/* Search & Filter Toolbar */}
      <div
        className="m3-card"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          marginBottom: '1.5rem',
          padding: '1.25rem 1.5rem',
        }}
      >
        {/* Search Bar & Sort Dropdown */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ flex: 1, minWidth: '240px', maxWidth: '480px' }}>
            <TextField
              label="Search company, title, location..."
              value={searchQuery}
              onValueChange={setSearchQuery}
              leadingIcon="search"
            />
          </div>

          {/* Sort Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span
              style={{
                fontSize: '0.8125rem',
                fontFamily: 'var(--font-headline)',
                fontWeight: 600,
                color: 'var(--md-sys-color-on-surface-variant)',
              }}
            >
              Sort:
            </span>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              style={{
                padding: '0.5rem 0.875rem',
                borderRadius: '12px',
                border: '1px solid var(--md-sys-color-outline-variant)',
                backgroundColor: 'var(--md-sys-color-surface-container-low)',
                color: 'var(--md-sys-color-on-surface)',
                fontFamily: 'var(--font-headline)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value="updated_desc">Recently Updated</option>
              <option value="created_desc">Recently Created</option>
              <option value="company_asc">Company (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Status Filter Chips */}
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
              padding: '0.375rem 0.875rem',
              borderRadius: '9999px',
              border: '1px solid',
              borderColor:
                activeStatus === 'all'
                  ? 'var(--md-sys-color-primary)'
                  : 'var(--md-sys-color-outline-variant)',
              backgroundColor:
                activeStatus === 'all'
                  ? 'var(--md-sys-color-primary-container)'
                  : 'var(--md-sys-color-surface-container-low)',
              color:
                activeStatus === 'all'
                  ? 'var(--md-sys-color-on-primary-container)'
                  : 'var(--md-sys-color-on-surface-variant)',
              fontFamily: 'var(--font-headline)',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease',
            }}
          >
            <span>All</span>
            <span
              style={{
                fontSize: '0.75rem',
                padding: '0.1rem 0.4rem',
                borderRadius: '9999px',
                backgroundColor: 'var(--md-sys-color-surface-container-highest)',
                color: 'var(--md-sys-color-on-surface)',
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
                  padding: '0.375rem 0.875rem',
                  borderRadius: '9999px',
                  border: '1px solid',
                  borderColor: isActive
                    ? 'var(--md-sys-color-primary)'
                    : 'var(--md-sys-color-outline-variant)',
                  backgroundColor: isActive
                    ? 'var(--md-sys-color-primary-container)'
                    : 'var(--md-sys-color-surface-container-low)',
                  color: isActive
                    ? 'var(--md-sys-color-on-primary-container)'
                    : 'var(--md-sys-color-on-surface-variant)',
                  fontFamily: 'var(--font-headline)',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                }}
              >
                <span>{status.label}</span>
                <span
                  style={{
                    fontSize: '0.75rem',
                    padding: '0.1rem 0.4rem',
                    borderRadius: '9999px',
                    backgroundColor: 'var(--md-sys-color-surface-container-highest)',
                    color: 'var(--md-sys-color-on-surface)',
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content: Table or Loading / Empty States */}
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
            Loading applications...
          </p>
        </div>
      ) : filteredApplications.length === 0 ? (
        <div
          className="m3-card"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4rem 1.5rem',
            textAlign: 'center',
            gap: '1rem',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '28px',
              backgroundColor: 'var(--md-sys-color-surface-container-high)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--md-sys-color-on-surface-variant)',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>
              work_outline
            </span>
          </div>

          <h3
            style={{
              fontSize: '1.25rem',
              fontFamily: 'var(--font-headline)',
              fontWeight: 700,
              color: 'var(--md-sys-color-on-surface)',
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
              fontSize: '0.875rem',
              lineHeight: 1.5,
            }}
          >
            {searchQuery || activeStatus !== 'all'
              ? 'Try changing your search keywords or switching status filters.'
              : 'Add your first job application with automated AI job description extraction.'}
          </p>

          <Link href="/applications/new" style={{ textDecoration: 'none', marginTop: '0.5rem' }}>
            <FilledButton icon="add">Add Application</FilledButton>
          </Link>
        </div>
      ) : (
        /* M3 Data Table */
        <div className="m3-data-table-container">
          <div className="m3-table-wrapper">
            <table className="m3-data-table">
              <thead>
                <tr>
                  <th className="m3-table-th">Company & Role</th>
                  <th className="m3-table-th">Status</th>
                  <th className="m3-table-th">Location</th>
                  <th className="m3-table-th">Applied Date</th>
                  <th className="m3-table-th">Salary Range</th>
                  <th className="m3-table-th" style={{ textAlign: 'right' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredApplications.map((app) => (
                  <tr key={app.id} className="m3-table-row">
                    {/* Company & Role with Avatar */}
                    <td className="m3-table-td">
                      <Link
                        href={`/applications/${app.id}`}
                        style={{
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.875rem',
                        }}
                      >
                        <div
                          className="company-avatar"
                          style={{ width: '38px', height: '38px', fontSize: '0.8125rem' }}
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
                          <span
                            style={{
                              fontFamily: 'var(--font-body)',
                              color: 'var(--md-sys-color-on-surface-variant)',
                              fontSize: '0.8125rem',
                            }}
                          >
                            {app.title}
                          </span>
                        </div>
                      </Link>
                    </td>

                    {/* Status */}
                    <td className="m3-table-td">
                      <StatusBadge status={app.status} />
                    </td>

                    {/* Location */}
                    <td className="m3-table-td">
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          color: 'var(--md-sys-color-on-surface-variant)',
                          fontSize: '0.8125rem',
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                          location_on
                        </span>
                        {app.location || '—'}
                      </span>
                    </td>

                    {/* Applied Date */}
                    <td className="m3-table-td">
                      <span style={{ fontSize: '0.8125rem', color: 'var(--md-sys-color-on-surface-variant)' }}>
                        {new Date(app.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </td>

                    {/* Salary Range */}
                    <td className="m3-table-td">
                      <span style={{ fontSize: '0.8125rem', color: 'var(--md-sys-color-on-surface)' }}>
                        {app.salary_range || '—'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="m3-table-td" style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Link href={`/applications/${app.id}`} style={{ textDecoration: 'none' }}>
                          <button
                            title="View details"
                            aria-label="View application details"
                            style={{
                              background: 'none',
                              border: '1px solid var(--md-sys-color-outline-variant)',
                              borderRadius: '8px',
                              padding: '0.35rem 0.6rem',
                              color: 'var(--md-sys-color-primary)',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              fontFamily: 'var(--font-headline)',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                            }}
                          >
                            <span>View</span>
                            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                              arrow_forward
                            </span>
                          </button>
                        </Link>

                        <button
                          onClick={(e) => handleDelete(app.id, e)}
                          title="Delete application"
                          aria-label="Delete application"
                          style={{
                            background: 'none',
                            border: '1px solid var(--md-sys-color-outline-variant)',
                            borderRadius: '8px',
                            padding: '0.35rem',
                            color: 'var(--md-sys-color-error)',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
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
        </div>
      )}
    </div>
  );
}
