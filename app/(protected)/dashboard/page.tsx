'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Application, ApplicationStatus, APPLICATION_STATUSES } from '@/lib/types/database';
import { ApplicationCard } from '@/components/applications/ApplicationCard';
import { TextField } from '@/components/ui/TextField';
import { FilterChip, ChipSet } from '@/components/ui/Chip';
import { Select } from '@/components/ui/Select';
import { FilledButton, OutlinedButton, TextButton } from '@/components/ui/Button';
import { CircularProgress } from '@/components/ui/CircularProgress';

export default function DashboardPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<ApplicationStatus[]>([]);
  const [sortBy, setSortBy] = useState<'created_at_desc' | 'created_at_asc' | 'updated_at_desc'>('created_at_desc');
  const [showClosed, setShowClosed] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    async function fetchApplications() {
      setLoading(true);
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching applications:', error);
      } else {
        setApplications(data || []);
      }
      setLoading(false);
    }

    fetchApplications();
  }, [supabase]);

  const toggleStatusFilter = (status: ApplicationStatus) => {
    setSelectedStatuses((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
  };

  const filteredApplications = useMemo(() => {
    return applications
      .filter((app) => {
        // Search query filter (company or title)
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matches =
            app.company.toLowerCase().includes(q) ||
            app.title.toLowerCase().includes(q) ||
            (app.location && app.location.toLowerCase().includes(q));
          if (!matches) return false;
        }

        // Status chips filter
        if (selectedStatuses.length > 0) {
          if (!selectedStatuses.includes(app.status)) return false;
        }

        // Closed toggle filter
        if (!showClosed) {
          if (app.status === 'rejected' || app.status === 'withdrawn') {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'created_at_desc') {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        if (sortBy === 'created_at_asc') {
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        }
        if (sortBy === 'updated_at_desc') {
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        }
        return 0;
      });
  }, [applications, searchQuery, selectedStatuses, sortBy, showClosed]);

  return (
    <div className="container" style={{ padding: '1rem 1.25rem' }}>
      {/* Header with Title and New Button */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '2rem',
              fontWeight: 700,
              color: 'var(--md-sys-color-on-surface)',
              letterSpacing: '-0.02em',
            }}
          >
            My Applications
          </h1>
          <p style={{ color: 'var(--md-sys-color-on-surface-variant)', fontSize: '0.9375rem' }}>
            {applications.length} total applications tracked
          </p>
        </div>

        <Link href="/applications/new">
          <FilledButton icon="add">New Application</FilledButton>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="m3-card"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          marginBottom: '2rem',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1rem',
            alignItems: 'center',
          }}
        >
          <TextField
            placeholder="Search company, title, or location..."
            value={searchQuery}
            onValueChange={setSearchQuery}
            leadingIcon="search"
          />

          <Select
            label="Sort by"
            value={sortBy}
            onValueChange={(val) => setSortBy(val as any)}
            options={[
              { value: 'created_at_desc', label: 'Newest First (Created Date)' },
              { value: 'created_at_asc', label: 'Oldest First' },
              { value: 'updated_at_desc', label: 'Recently Updated' },
            ]}
          />
        </div>

        {/* Status Filter Chips */}
        <div>
          <span
            style={{
              fontSize: '0.8125rem',
              fontWeight: 500,
              color: 'var(--md-sys-color-on-surface-variant)',
              marginBottom: '0.5rem',
              display: 'block',
            }}
          >
            Filter by status:
          </span>
          <ChipSet>
            {APPLICATION_STATUSES.map((status) => (
              <FilterChip
                key={status.value}
                label={status.label}
                selected={selectedStatuses.includes(status.value)}
                onSelectedChange={() => toggleStatusFilter(status.value)}
              />
            ))}
          </ChipSet>
        </div>

        {/* Closed Filter Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <TextButton
            icon={showClosed ? 'visibility_off' : 'visibility'}
            onClick={() => setShowClosed(!showClosed)}
          >
            {showClosed ? 'Hide Rejected & Withdrawn' : 'Show All (Including Closed)'}
          </TextButton>
        </div>
      </div>

      {/* Applications List or Empty State */}
      {loading ? (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '4rem 0',
          }}
        >
          <CircularProgress />
        </div>
      ) : filteredApplications.length === 0 ? (
        <div
          className="m3-card"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '4rem 2rem',
            gap: '1.25rem',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'var(--md-sys-color-primary-container)',
              color: 'var(--md-sys-color-on-primary-container)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>
              post_add
            </span>
          </div>

          <div>
            <h2
              style={{
                fontSize: '1.35rem',
                fontWeight: 600,
                color: 'var(--md-sys-color-on-surface)',
                marginBottom: '0.5rem',
              }}
            >
              {applications.length === 0
                ? 'Add your first job application'
                : 'No applications match your filters'}
            </h2>
            <p
              style={{
                color: 'var(--md-sys-color-on-surface-variant)',
                maxWidth: '420px',
                fontSize: '0.9375rem',
              }}
            >
              {applications.length === 0
                ? 'Paste a link or job description to let AI parse the details automatically, or fill out the form manually.'
                : 'Try clearing your search or adjusting the selected status filters.'}
            </p>
          </div>

          {applications.length === 0 ? (
            <Link href="/applications/new">
              <FilledButton icon="add">Create Application</FilledButton>
            </Link>
          ) : (
            <OutlinedButton
              onClick={() => {
                setSearchQuery('');
                setSelectedStatuses([]);
                setShowClosed(true);
              }}
            >
              Reset Filters
            </OutlinedButton>
          )}
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {filteredApplications.map((app) => (
            <ApplicationCard key={app.id} application={app} />
          ))}
        </div>
      )}
    </div>
  );
}
