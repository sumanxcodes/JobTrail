'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Application, StatusHistory } from '@/lib/types/database';
import { TextField, TextArea } from '@/components/ui/TextField';
import { FilledButton, OutlinedButton, TextButton } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { StatusBadge } from '@/components/applications/StatusBadge';
import { StatusSelector } from '@/components/applications/StatusSelector';
import { CircularProgress } from '@/components/ui/CircularProgress';

function getInitials(name: string): string {
  if (!name) return 'JT';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export default function ApplicationDetailPage() {
  const params = useParams();
  const applicationId = params?.id as string;
  const router = useRouter();
  const supabase = createClient();

  const [application, setApplication] = useState<Application | null>(null);
  const [history, setHistory] = useState<StatusHistory[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit form state
  const [isEditing, setIsEditing] = useState(false);
  const [company, setCompany] = useState('');
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [salaryRange, setSalaryRange] = useState('');
  const [seniority, setSeniority] = useState('');
  const [jobUrl, setJobUrl] = useState('');
  const [notes, setNotes] = useState('');

  const [saving, setSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!applicationId) return;
      setLoading(true);

      // 1. Fetch application
      const { data: appData, error: appError } = await supabase
        .from('applications')
        .select('*')
        .eq('id', applicationId)
        .single();

      if (appError || !appData) {
        console.error('Failed to load application:', appError);
        setErrorMsg('Application not found or you do not have permission to view it.');
        setLoading(false);
        return;
      }

      setApplication(appData);
      setCompany(appData.company);
      setTitle(appData.title);
      setLocation(appData.location || '');
      setSalaryRange(appData.salary_range || '');
      setSeniority(appData.seniority || '');
      setJobUrl(appData.job_url || '');
      setNotes(appData.notes || '');

      // 2. Fetch status history
      const { data: histData, error: histError } = await supabase
        .from('status_history')
        .select('*')
        .eq('application_id', applicationId)
        .order('changed_at', { ascending: false });

      if (!histError) {
        setHistory(histData || []);
      }

      setLoading(false);
    }

    loadData();
  }, [applicationId, supabase]);

  const handleSaveEdit = async () => {
    if (!company.trim() || !title.trim()) {
      setErrorMsg('Company name and Job title are required.');
      return;
    }

    setSaving(true);
    setErrorMsg(null);

    try {
      const { error } = await supabase
        .from('applications')
        .update({
          company: company.trim(),
          title: title.trim(),
          location: location.trim() || null,
          salary_range: salaryRange.trim() || null,
          seniority: seniority.trim() || null,
          job_url: jobUrl.trim() || null,
          notes: notes.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', applicationId);

      if (error) throw error;

      setApplication((prev) =>
        prev
          ? {
              ...prev,
              company: company.trim(),
              title: title.trim(),
              location: location.trim() || null,
              salary_range: salaryRange.trim() || null,
              seniority: seniority.trim() || null,
              job_url: jobUrl.trim() || null,
              notes: notes.trim() || null,
              updated_at: new Date().toISOString(),
            }
          : null
      );

      setIsEditing(false);
      setSuccessMsg('Application updated successfully.');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update application.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const { error } = await supabase.from('applications').delete().eq('id', applicationId);
      if (error) throw error;

      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete application.');
      setDeleteDialogOpen(false);
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div
        className="container"
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '5rem 0',
        }}
      >
        <CircularProgress />
      </div>
    );
  }

  if (!application) {
    return (
      <div className="container" style={{ maxWidth: '640px', padding: '2rem 1.5rem' }}>
        <div className="m3-card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Application Not Found</h2>
          <p style={{ color: 'var(--md-sys-color-on-surface-variant)', marginBottom: '1.5rem' }}>
            {errorMsg || 'The requested application could not be found.'}
          </p>
          <Link href="/dashboard">
            <FilledButton icon="arrow_back">Return to Dashboard</FilledButton>
          </Link>
        </div>
      </div>
    );
  }

  const initials = getInitials(application.company);

  return (
    <div style={{ padding: '2rem 2.5rem 4rem 2.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Breadcrumb Navigation */}
      <div style={{ marginBottom: '1.5rem' }}>
        <Link href="/applications" style={{ textDecoration: 'none' }}>
          <TextButton icon="arrow_back">Back to Applications</TextButton>
        </Link>
      </div>

      {successMsg && (
        <div
          style={{
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            backgroundColor: 'var(--status-offer-bg)',
            color: 'var(--status-offer-text)',
            fontSize: '0.875rem',
            marginBottom: '1.25rem',
          }}
        >
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div
          style={{
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            backgroundColor: 'var(--md-sys-color-error-container)',
            color: 'var(--md-sys-color-on-error-container)',
            fontSize: '0.875rem',
            marginBottom: '1.25rem',
          }}
        >
          {errorMsg}
        </div>
      )}

      {/* Main Header Banner (Stitch Application Detail style) */}
      <div
        className="m3-card"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
          marginBottom: '2rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          {/* Company Avatar */}
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '14px',
              backgroundColor: 'var(--md-sys-color-surface-container)',
              border: '1px solid var(--md-sys-color-outline-variant)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '1.25rem',
              color: 'var(--md-sys-color-primary)',
              flexShrink: 0,
            }}
          >
            {initials}
          </div>

          <div>
            <h1
              style={{
                fontSize: '1.75rem',
                fontWeight: 700,
                color: 'var(--md-sys-color-on-surface)',
                lineHeight: 1.2,
                marginBottom: '0.35rem',
              }}
            >
              {application.title}
            </h1>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                fontSize: '0.9375rem',
                color: 'var(--md-sys-color-on-surface-variant)',
                flexWrap: 'wrap',
              }}
            >
              <span style={{ fontWeight: 600, color: 'var(--md-sys-color-on-surface)' }}>
                {application.company}
              </span>
              {application.job_url && (
                <>
                  <span>•</span>
                  <a
                    href={application.job_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: 'var(--md-sys-color-primary)',
                      textDecoration: 'underline',
                      fontWeight: 500,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                    }}
                  >
                    View Original Posting
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                      open_in_new
                    </span>
                  </a>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Header Right: Status Selector + Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <StatusSelector
            applicationId={application.id}
            currentStatus={application.status}
            onStatusChange={(newStatus) => {
              setApplication((prev) => (prev ? { ...prev, status: newStatus } : null));
              setHistory((prev) => [
                {
                  id: Math.random().toString(),
                  application_id: application.id,
                  status: newStatus,
                  changed_at: new Date().toISOString(),
                },
                ...prev,
              ]);
            }}
          />

          {!isEditing ? (
            <>
              <OutlinedButton icon="edit" onClick={() => setIsEditing(true)}>
                Edit
              </OutlinedButton>
              <OutlinedButton
                icon="delete"
                onClick={() => setDeleteDialogOpen(true)}
                className="status-rejected"
              >
                Delete
              </OutlinedButton>
            </>
          ) : (
            <>
              <OutlinedButton
                onClick={() => {
                  setIsEditing(false);
                  setCompany(application.company);
                  setTitle(application.title);
                  setLocation(application.location || '');
                  setSalaryRange(application.salary_range || '');
                  setSeniority(application.seniority || '');
                  setJobUrl(application.job_url || '');
                  setNotes(application.notes || '');
                }}
              >
                Cancel
              </OutlinedButton>
              <FilledButton icon="save" onClick={handleSaveEdit} disabled={saving}>
                {saving ? <CircularProgress /> : 'Save'}
              </FilledButton>
            </>
          )}
        </div>
      </div>

      {/* 2-Column Main Content Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem',
          alignItems: 'start',
        }}
      >
        {/* Left Column: Bento Grid Info + Notes + Raw JD */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: '2 1 500px' }}>
          {!isEditing ? (
            <>
              {/* Bento Info Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '1rem',
                }}
              >
                {/* Location */}
                <div className="m3-bento-tile">
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      color: 'var(--md-sys-color-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      marginBottom: '0.35rem',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>
                      location_on
                    </span>
                    Location
                  </span>
                  <p style={{ fontSize: '1rem', fontWeight: 600 }}>
                    {application.location || 'Not specified'}
                  </p>
                </div>

                {/* Salary */}
                <div className="m3-bento-tile">
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      color: 'var(--md-sys-color-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      marginBottom: '0.35rem',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>
                      payments
                    </span>
                    Salary Range
                  </span>
                  <p style={{ fontSize: '1rem', fontWeight: 600 }}>
                    {application.salary_range || 'Not specified'}
                  </p>
                </div>

                {/* Seniority */}
                <div className="m3-bento-tile">
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      color: 'var(--md-sys-color-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      marginBottom: '0.35rem',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>
                      stairs
                    </span>
                    Seniority
                  </span>
                  <p style={{ fontSize: '1rem', fontWeight: 600 }}>
                    {application.seniority || 'Not specified'}
                  </p>
                </div>

                {/* Source */}
                <div className="m3-bento-tile">
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      color: 'var(--md-sys-color-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      marginBottom: '0.35rem',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>
                      share
                    </span>
                    Source Type
                  </span>
                  <p style={{ fontSize: '1rem', fontWeight: 600, textTransform: 'capitalize' }}>
                    {application.source_type || 'Manual'}
                  </p>
                </div>

                {/* Timestamps Tile (Full Row) */}
                <div className="m3-bento-tile" style={{ gridColumn: '1 / -1' }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '1rem',
                    }}
                  >
                    <div>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          color: 'var(--md-sys-color-secondary)',
                          display: 'block',
                        }}
                      >
                        Created On
                      </span>
                      <span style={{ fontSize: '0.9375rem', fontWeight: 500 }}>
                        {new Date(application.created_at).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>

                    <div
                      style={{
                        width: '1px',
                        height: '24px',
                        backgroundColor: 'var(--md-sys-color-outline-variant)',
                      }}
                    />

                    <div>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          color: 'var(--md-sys-color-secondary)',
                          display: 'block',
                        }}
                      >
                        Last Updated
                      </span>
                      <span style={{ fontSize: '0.9375rem', fontWeight: 500 }}>
                        {new Date(application.updated_at).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes Card */}
              <div className="m3-card">
                <h3
                  style={{
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    marginBottom: '0.75rem',
                    color: 'var(--md-sys-color-on-surface)',
                  }}
                >
                  Notes & Details
                </h3>
                {application.notes ? (
                  <div
                    style={{
                      padding: '1rem',
                      borderRadius: '10px',
                      backgroundColor: 'var(--md-sys-color-surface-container-low)',
                      whiteSpace: 'pre-wrap',
                      fontSize: '0.9375rem',
                      lineHeight: 1.6,
                    }}
                  >
                    {application.notes}
                  </div>
                ) : (
                  <p style={{ color: 'var(--md-sys-color-on-surface-variant)', fontSize: '0.875rem' }}>
                    No additional notes. Click Edit to add notes, referral info, or salary discussions.
                  </p>
                )}
              </div>

              {/* Collapsible Preserved Raw JD */}
              {application.raw_jd && (
                <div className="m3-card">
                  <h3
                    style={{
                      fontSize: '1.125rem',
                      fontWeight: 600,
                      marginBottom: '0.75rem',
                      color: 'var(--md-sys-color-on-surface)',
                    }}
                  >
                    Original Job Description
                  </h3>
                  <details
                    style={{
                      padding: '0.875rem 1rem',
                      borderRadius: '10px',
                      backgroundColor: 'var(--md-sys-color-surface-container-high)',
                      fontSize: '0.875rem',
                    }}
                  >
                    <summary style={{ cursor: 'pointer', fontWeight: 600 }}>
                      Click to expand preserved job description
                    </summary>
                    <div
                      style={{
                        marginTop: '1rem',
                        maxHeight: '350px',
                        overflowY: 'auto',
                        whiteSpace: 'pre-wrap',
                        lineHeight: 1.6,
                        color: 'var(--md-sys-color-on-surface-variant)',
                      }}
                    >
                      {application.raw_jd}
                    </div>
                  </details>
                </div>
              )}
            </>
          ) : (
            /* Edit Form */
            <div className="m3-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Edit Job Details</h2>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                  gap: '1.25rem',
                }}
              >
                <TextField
                  label="Company Name *"
                  value={company}
                  onValueChange={setCompany}
                  required
                />
                <TextField label="Job Title *" value={title} onValueChange={setTitle} required />
                <TextField label="Location" value={location} onValueChange={setLocation} />
                <TextField
                  label="Salary Range"
                  value={salaryRange}
                  onValueChange={setSalaryRange}
                />
                <TextField
                  label="Seniority Level"
                  value={seniority}
                  onValueChange={setSeniority}
                />
                <TextField
                  label="Job Posting URL"
                  type="url"
                  value={jobUrl}
                  onValueChange={setJobUrl}
                />
              </div>
              <TextArea
                label="Notes & Details"
                value={notes}
                onValueChange={setNotes}
                rows={5}
              />
            </div>
          )}
        </div>

        {/* Right Column: Status Timeline Card */}
        <div style={{ flex: '1 1 300px' }}>
          <div className="m3-card">
            <h3
              style={{
                fontSize: '1.125rem',
                fontWeight: 600,
                marginBottom: '1.25rem',
                color: 'var(--md-sys-color-on-surface)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <span className="material-symbols-outlined" style={{ color: 'var(--md-sys-color-primary)' }}>
                timeline
              </span>
              Status Timeline
            </h3>

            {history.length === 0 ? (
              <p style={{ color: 'var(--md-sys-color-on-surface-variant)', fontSize: '0.875rem' }}>
                No status changes recorded yet.
              </p>
            ) : (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  position: 'relative',
                }}
              >
                {history.map((entry, idx) => (
                  <div
                    key={entry.id || idx}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.25rem',
                      paddingLeft: '1rem',
                      borderLeft: '2px solid var(--md-sys-color-primary)',
                      position: 'relative',
                    }}
                  >
                    {/* Timeline bullet dot */}
                    <div
                      style={{
                        position: 'absolute',
                        left: '-6px',
                        top: '4px',
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--md-sys-color-primary)',
                      }}
                    />
                    <StatusBadge status={entry.status} size="small" />
                    <span
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--md-sys-color-on-surface-variant)',
                        marginTop: '0.15rem',
                      }}
                    >
                      {new Date(entry.changed_at).toLocaleString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        headline="Delete Application?"
        actions={
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <TextButton onClick={() => setDeleteDialogOpen(false)}>Cancel</TextButton>
            <FilledButton onClick={handleDelete} disabled={deleting} className="status-rejected">
              {deleting ? 'Deleting...' : 'Delete Application'}
            </FilledButton>
          </div>
        }
      >
        <p style={{ color: 'var(--md-sys-color-on-surface-variant)', lineHeight: 1.5 }}>
          Are you sure you want to delete <strong>{application.title}</strong> at{' '}
          <strong>{application.company}</strong>? All associated status history will be permanently
          removed.
        </p>
      </Dialog>
    </div>
  );
}
