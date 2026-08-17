'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Application, ApplicationStatus, APPLICATION_STATUSES } from '@/lib/types/database';
import { ApplicationCard } from '@/components/applications/ApplicationCard';
import { TextField } from '@/components/ui/TextField';
import { Select } from '@/components/ui/Select';
import { FilledButton, OutlinedButton, TextButton } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { CircularProgress } from '@/components/ui/CircularProgress';

export default function DashboardPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStatusTab, setActiveStatusTab] = useState<ApplicationStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'updated_at_desc' | 'created_at_desc' | 'created_at_asc'>('updated_at_desc');
  const [showClosed, setShowClosed] = useState(true);

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

  const filteredApplications = useMemo(() => {
    return applications
      .filter((app) => {
        // Search query filter (company, title, location)
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matches =
            app.company.toLowerCase().includes(q) ||
            app.title.toLowerCase().includes(q) ||
            (app.location && app.location.toLowerCase().includes(q));
          if (!matches) return false;
        }

        // Active Status Tab Filter
        if (activeStatusTab !== 'all') {
          if (app.status !== activeStatusTab) return false;
        }

        // Closed toggle filter (if false, hide rejected & withdrawn unless specifically tabbed)
        if (!showClosed && activeStatusTab === 'all') {
          if (app.status === 'rejected' || app.status === 'withdrawn') {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'updated_at_desc') {
          return new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime();
        }
        if (sortBy === 'created_at_desc') {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        if (sortBy === 'created_at_asc') {
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        }
        return 0;
      });
  }, [applications, searchQuery, activeStatusTab, sortBy, showClosed]);

  // Calculate status counts for badges
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: applications.length };
    APPLICATION_STATUSES.forEach((s) => {
      counts[s.value] = applications.filter((a) => a.status === s.value).length;
    });
    return counts;
  }, [applications]);

  return (
    <div className="container" style={{ padding: '1.5rem 1.5rem 3rem 1.5rem' }}>
      {/* Header & Main Actions */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1.25rem',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '2.25rem',
              fontWeight: 700,
              color: 'var(--md-sys-color-on-surface)',
              letterSpacing: '-0.02em',
              marginBottom: '0.25rem',
            }}
          >
            My Applications
          </h1>
          <p style={{ color: 'var(--md-sys-color-on-surface-variant)', fontSize: '1rem' }}>
            Track and manage your active job pursuits.
          </p>
        </div>

        <Link href="/applications/new">
          <FilledButton icon="add">Add Application</FilledButton>
        </Link>
      </div>

      {/* Filter and Search Bar Card */}
      <div
        className="m3-card"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          marginBottom: '2rem',
        }}
      >
        {/* Top Row: Search & Sort & Show Closed */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ flex: '1 1 320px', maxWidth: '480px' }}>
            <TextField
              placeholder="Search by company, title, or location..."
              value={searchQuery}
              onValueChange={setSearchQuery}
              leadingIcon="search"
            />
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1.25rem',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ minWidth: '180px' }}>
              <Select
                label="Sort by"
                value={sortBy}
                onValueChange={(val) => setSortBy(val as any)}
                options={[
                  { value: 'updated_at_desc', label: 'Updated Date' },
                  { value: 'created_at_desc', label: 'Newest Created' },
                  { value: 'created_at_asc', label: 'Oldest Created' },
                ]}
              />
            </div>

            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
                fontSize: '0.875rem',
                color: 'var(--md-sys-color-on-surface-variant)',
                fontWeight: 500,
                userSelect: 'none',
              }}
            >
              <Checkbox
                checked={showClosed}
                onCheckedChange={setShowClosed}
              />
              <span>Show closed (Rejected/Withdrawn)</span>
            </label>
          </div>
        </div>

        {/* Bottom Row: Segmented Control Status Tabs */}
        <div style={{ overflowX: 'auto', paddingBottom: '2px' }}>
          <div className="segmented-control">
            <button
              className={`segmented-control-btn ${activeStatusTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveStatusTab('all')}
            >
              All ({statusCounts.all || 0})
            </button>
            {APPLICATION_STATUSES.map((status) => (
              <button
                key={status.value}
                className={`segmented-control-btn ${activeStatusTab === status.value ? 'active' : ''}`}
                onClick={() => setActiveStatusTab(status.value)}
              >
                {status.label} ({statusCounts[status.value] || 0})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Applications Grid or Empty State */}
      {loading ? (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '5rem 0',
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
              work_outline
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
                ? 'No applications tracked yet'
                : 'No applications match your filter'}
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
                : 'Try adjusting your status tab, clearing search, or toggling "Show closed".'}
            </p>
          </div>

          {applications.length === 0 ? (
            <Link href="/applications/new">
              <FilledButton icon="add">Add First Application</FilledButton>
            </Link>
          ) : (
            <OutlinedButton
              onClick={() => {
                setSearchQuery('');
                setActiveStatusTab('all');
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
