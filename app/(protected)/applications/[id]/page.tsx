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
      <div className="container" style={{ maxWidth: '640px', padding: '2rem 1.25rem' }}>
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

  return (
    <div className="container" style={{ maxWidth: '840px', padding: '1rem 1.25rem' }}>
      {/* Header and Back Link */}
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
        <Link href="/dashboard">
          <TextButton icon="arrow_back">Back to Dashboard</TextButton>
        </Link>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {!isEditing ? (
            <>
              <OutlinedButton icon="edit" onClick={() => setIsEditing(true)}>
                Edit Details
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
                {saving ? <CircularProgress /> : 'Save Changes'}
              </FilledButton>
            </>
          )}
        </div>
      </div>

      {successMsg && (
        <div
          style={{
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            backgroundColor: 'var(--status-offer-bg)',
            color: 'var(--status-offer-text)',
            fontSize: '0.875rem',
            marginBottom: '1rem',
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
            marginBottom: '1rem',
          }}
        >
          {errorMsg}
        </div>
      )}

      {/* Main Details Card */}
      <div
        className="m3-card"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          marginBottom: '2rem',
        }}
      >
        {!isEditing ? (
          <>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: '1rem',
                borderBottom: '1px solid var(--md-sys-color-outline-variant)',
                paddingBottom: '1.25rem',
              }}
            >
              <div>
                <h1
                  style={{
                    fontSize: '1.75rem',
                    fontWeight: 700,
                    color: 'var(--md-sys-color-on-surface)',
                    marginBottom: '0.25rem',
                  }}
                >
                  {application.title}
                </h1>
                <p
                  style={{
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    color: 'var(--md-sys-color-primary)',
                  }}
                >
                  {application.company}
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--md-sys-color-on-surface-variant)' }}>
                  Current Status:
                </span>
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
              </div>
            </div>

            {/* Grid of Key Info */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1.25rem',
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: '0.8125rem',
                    color: 'var(--md-sys-color-on-surface-variant)',
                    display: 'block',
                    marginBottom: '0.25rem',
                  }}
                >
                  Location
                </span>
                <p style={{ fontWeight: 500 }}>{application.location || 'Not specified'}</p>
              </div>

              <div>
                <span
                  style={{
                    fontSize: '0.8125rem',
                    color: 'var(--md-sys-color-on-surface-variant)',
                    display: 'block',
                    marginBottom: '0.25rem',
                  }}
                >
                  Salary / Compensation
                </span>
                <p style={{ fontWeight: 500 }}>{application.salary_range || 'Not specified'}</p>
              </div>

              <div>
                <span
                  style={{
                    fontSize: '0.8125rem',
                    color: 'var(--md-sys-color-on-surface-variant)',
                    display: 'block',
                    marginBottom: '0.25rem',
                  }}
                >
                  Seniority Level
                </span>
                <p style={{ fontWeight: 500 }}>{application.seniority || 'Not specified'}</p>
              </div>

              <div>
                <span
                  style={{
                    fontSize: '0.8125rem',
                    color: 'var(--md-sys-color-on-surface-variant)',
                    display: 'block',
                    marginBottom: '0.25rem',
                  }}
                >
                  Job Posting URL
                </span>
                {application.job_url ? (
                  <a
                    href={application.job_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: 'var(--md-sys-color-primary)',
                      textDecoration: 'underline',
                      fontWeight: 500,
                      wordBreak: 'break-all',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                    }}
                  >
                    Open Link
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                      open_in_new
                    </span>
                  </a>
                ) : (
                  <p style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>None</p>
                )}
              </div>
            </div>

            {/* Notes */}
            {application.notes && (
              <div>
                <h3
                  style={{
                    fontSize: '1rem',
                    fontWeight: 600,
                    marginBottom: '0.5rem',
                    color: 'var(--md-sys-color-on-surface)',
                  }}
                >
                  Notes & Details
                </h3>
                <div
                  style={{
                    padding: '1rem',
                    borderRadius: '8px',
                    backgroundColor: 'var(--md-sys-color-surface-container)',
                    whiteSpace: 'pre-wrap',
                    fontSize: '0.9375rem',
                    lineHeight: 1.5,
                  }}
                >
                  {application.notes}
                </div>
              </div>
            )}

            {/* Raw JD (Accordion / Box) */}
            {application.raw_jd && (
              <div>
                <h3
                  style={{
                    fontSize: '1rem',
                    fontWeight: 600,
                    marginBottom: '0.5rem',
                    color: 'var(--md-sys-color-on-surface)',
                  }}
                >
                  Original Job Description (Preserved)
                </h3>
                <details
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    backgroundColor: 'var(--md-sys-color-surface-container-highest)',
                    fontSize: '0.875rem',
                  }}
                >
                  <summary style={{ cursor: 'pointer', fontWeight: 500 }}>
                    Click to expand full original text
                  </summary>
                  <div
                    style={{
                      marginTop: '0.75rem',
                      maxHeight: '300px',
                      overflowY: 'auto',
                      whiteSpace: 'pre-wrap',
                      lineHeight: 1.5,
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
          /* Editable Form */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Edit Job Application</h2>
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
                label="Salary / Compensation"
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
              rows={4}
            />
          </div>
        )}
      </div>

      {/* Status History Timeline */}
      <div className="m3-card">
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>
          Status Timeline
        </h2>
        {history.length === 0 ? (
          <p style={{ color: 'var(--md-sys-color-on-surface-variant)', fontSize: '0.9375rem' }}>
            No status changes recorded yet.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {history.map((entry, idx) => (
              <div
                key={entry.id || idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  paddingBottom: idx !== history.length - 1 ? '1rem' : 0,
                  borderBottom:
                    idx !== history.length - 1
                      ? '1px solid var(--md-sys-color-outline-variant)'
                      : 'none',
                }}
              >
                <StatusBadge status={entry.status} size="small" />
                <span
                  style={{
                    fontSize: '0.875rem',
                    color: 'var(--md-sys-color-on-surface-variant)',
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
          <strong>{application.company}</strong>? This action is permanent and cannot be undone.
        </p>
      </Dialog>
    </div>
  );
}
