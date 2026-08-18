'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Application, ApplicationStatus, StatusHistory, APPLICATION_STATUSES } from '@/lib/types/database';
import { TextField, TextArea } from '@/components/ui/TextField';
import { FilledButton, OutlinedButton, TextButton } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { StatusBadge } from '@/components/applications/StatusBadge';
import { CircularProgress } from '@/components/ui/CircularProgress';

function getInitials(name: string): string {
  if (!name) return 'JT';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function formatTimelineDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch (_e) {
    return dateStr;
  }
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

  // Inline notes save state
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesSavedSuccess, setNotesSavedSuccess] = useState(false);

  // Status Change Dialog State (Fixes accidental timeline updates!)
  const [pendingStatus, setPendingStatus] = useState<ApplicationStatus | null>(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const [saving, setSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [copiedJd, setCopiedJd] = useState(false);
  const [jdExpanded, setJdExpanded] = useState(false);

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

  // Triggered when user clicks a status button in "Update Status"
  const handleInitiateStatusChange = (newStatus: ApplicationStatus) => {
    if (!application || application.status === newStatus) return;
    setPendingStatus(newStatus);
    setStatusDialogOpen(true);
  };

  // Confirmed status change execution
  const handleConfirmStatusChange = async () => {
    if (!application || !pendingStatus) return;

    setUpdatingStatus(true);
    const prevStatus = application.status;
    const targetStatus = pendingStatus;

    try {
      // 1. Update application status
      const { error: appError } = await supabase
        .from('applications')
        .update({ status: targetStatus, updated_at: new Date().toISOString() })
        .eq('id', applicationId);

      if (appError) throw appError;

      // 2. Insert status history record
      const { data: histRow, error: histError } = await supabase
        .from('status_history')
        .insert({
          application_id: applicationId,
          status: targetStatus,
          changed_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (histError) throw histError;

      setApplication((prev) => (prev ? { ...prev, status: targetStatus, updated_at: new Date().toISOString() } : null));
      setHistory((prev) => [histRow, ...prev]);
      setStatusDialogOpen(false);
      setPendingStatus(null);
      setSuccessMsg(`Status updated to ${targetStatus.toUpperCase()}`);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      console.error('Failed to update status:', err);
      setApplication((prev) => (prev ? { ...prev, status: prevStatus } : null));
      alert('Failed to update status. Please try again.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Delete an accidental timeline history event
  const handleDeleteHistoryEntry = async (historyId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Remove this status change from timeline history?')) return;

    try {
      const { error } = await supabase.from('status_history').delete().eq('id', historyId);
      if (error) throw error;
      setHistory((prev) => prev.filter((h) => h.id !== historyId));
    } catch (err) {
      console.error('Failed to delete history entry:', err);
      alert('Could not remove history event.');
    }
  };

  // Inline Quick Save Notes
  const handleSaveNotes = async () => {
    if (!application) return;
    setSavingNotes(true);

    try {
      const { error } = await supabase
        .from('applications')
        .update({ notes: notes.trim() || null, updated_at: new Date().toISOString() })
        .eq('id', applicationId);

      if (error) throw error;

      setApplication((prev) => (prev ? { ...prev, notes: notes.trim() || null } : null));
      setNotesSavedSuccess(true);
      setTimeout(() => setNotesSavedSuccess(false), 2500);
    } catch (err) {
      console.error('Failed to save notes:', err);
      alert('Failed to save notes.');
    } finally {
      setSavingNotes(false);
    }
  };

  // Full Edit Modal Save
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
      setSuccessMsg('Job details updated successfully.');
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

      router.push('/applications');
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete application.');
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  const handleCopyJd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!application?.raw_jd) return;
    navigator.clipboard.writeText(application.raw_jd);
    setCopiedJd(true);
    setTimeout(() => setCopiedJd(false), 2500);
  };

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '6rem 1rem',
          gap: '1.25rem',
        }}
      >
        <CircularProgress indeterminate />
        <p style={{ color: 'var(--md-sys-color-on-surface-variant)', fontSize: '0.9375rem' }}>
          Loading application...
        </p>
      </div>
    );
  }

  if (!application) {
    return (
      <div style={{ maxWidth: '600px', margin: '4rem auto', padding: '0 1rem' }}>
        <div className="m3-card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
          <h2
            style={{
              fontSize: '1.5rem',
              fontFamily: 'var(--font-headline)',
              fontWeight: 700,
              marginBottom: '1rem',
            }}
          >
            Application Not Found
          </h2>
          <p style={{ color: 'var(--md-sys-color-on-surface-variant)', marginBottom: '1.5rem' }}>
            {errorMsg || 'The requested application could not be found.'}
          </p>
          <Link href="/applications" style={{ textDecoration: 'none' }}>
            <FilledButton icon="arrow_back">Applications</FilledButton>
          </Link>
        </div>
      </div>
    );
  }

  const initials = getInitials(application.company);

  return (
    <div style={{ padding: '2rem 2rem 4rem 2rem', maxWidth: '1280px', margin: '0 auto' }}>
      {/* Top Breadcrumb Nav */}
      <div style={{ marginBottom: '1.25rem' }}>
        <Link href="/applications" style={{ textDecoration: 'none' }}>
          <TextButton icon="arrow_back">Back to Applications</TextButton>
        </Link>
      </div>

      {/* Feedback Alerts */}
      {successMsg && (
        <div
          style={{
            padding: '0.875rem 1.25rem',
            borderRadius: '14px',
            backgroundColor: 'var(--status-offer-bg)',
            color: 'var(--status-offer-text)',
            fontSize: '0.875rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.625rem',
            fontWeight: 600,
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
            check_circle
          </span>
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div
          style={{
            padding: '0.875rem 1.25rem',
            borderRadius: '14px',
            backgroundColor: 'var(--md-sys-color-error-container)',
            color: 'var(--md-sys-color-on-error-container)',
            fontSize: '0.875rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.625rem',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
            error
          </span>
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ================= 1. TOP HERO HEADER CARD (M3 Outlined Card) ================= */}
      <div
        className="m3-card"
        style={{
          padding: '1.5rem 1.75rem',
          marginBottom: '1.5rem',
          borderRadius: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
          backgroundColor: 'var(--md-sys-color-surface-container-low)',
          border: '1px solid var(--md-sys-color-outline-variant)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div
            className="company-avatar"
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              fontSize: '1.3rem',
              flexShrink: 0,
            }}
          >
            {initials}
          </div>

          <div>
            <h1
              style={{
                fontSize: '1.75rem',
                fontFamily: 'var(--font-headline)',
                fontWeight: 800,
                color: 'var(--md-sys-color-on-surface)',
                lineHeight: 1.2,
                marginBottom: '0.35rem',
                letterSpacing: '-0.025em',
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
              <span
                style={{
                  fontWeight: 700,
                  color: 'var(--md-sys-color-on-surface)',
                  fontFamily: 'var(--font-headline)',
                }}
              >
                {application.company}
              </span>

              {application.job_url && (
                <>
                  <span style={{ opacity: 0.4 }}>•</span>
                  <a
                    href={application.job_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: 'var(--md-sys-color-primary)',
                      textDecoration: 'none',
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      fontFamily: 'var(--font-headline)',
                      fontSize: '0.8125rem',
                    }}
                  >
                    <span>View Posting</span>
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                      open_in_new
                    </span>
                  </a>
                </>
              )}

              <span style={{ opacity: 0.4 }}>•</span>
              <StatusBadge status={application.status} size="small" />
            </div>
          </div>
        </div>

        {/* Header Right: Edit & Delete Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {!isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.5rem 1.1rem',
                  borderRadius: '9999px',
                  border: '1px solid var(--md-sys-color-outline-variant)',
                  backgroundColor: 'transparent',
                  color: 'var(--md-sys-color-on-surface)',
                  fontFamily: 'var(--font-headline)',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--md-sys-color-surface-container)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                  edit
                </span>
                <span>Edit</span>
              </button>

              <button
                onClick={() => setDeleteDialogOpen(true)}
                aria-label="Delete application"
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  border: '1px solid var(--md-sys-color-outline-variant)',
                  backgroundColor: 'transparent',
                  color: 'var(--md-sys-color-error)',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--md-sys-color-error-container)';
                  e.currentTarget.style.borderColor = 'var(--md-sys-color-error)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.borderColor = 'var(--md-sys-color-outline-variant)';
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                  delete
                </span>
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
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
                {saving ? 'Saving...' : 'Save Changes'}
              </FilledButton>
            </div>
          )}
        </div>
      </div>

      {/* ================= 2. MAIN 2-COLUMN GRID ================= */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 360px',
          gap: '1.5rem',
          alignItems: 'start',
        }}
      >
        {/* ================= LEFT COLUMN: METRIC CARDS + NOTES + RAW JD ================= */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {isEditing ? (
            /* Full Edit Form */
            <div
              className="m3-card"
              style={{
                padding: '1.75rem',
                backgroundColor: 'var(--md-sys-color-surface-container-low)',
                borderRadius: '20px',
                border: '1px solid var(--md-sys-color-outline-variant)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem',
              }}
            >
              <h3
                style={{
                  fontSize: '1.125rem',
                  fontFamily: 'var(--font-headline)',
                  fontWeight: 700,
                  color: 'var(--md-sys-color-on-surface)',
                }}
              >
                Edit Role Information
              </h3>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: '1rem',
                }}
              >
                <TextField
                  label="Company Name"
                  value={company}
                  onValueChange={setCompany}
                  required
                  leadingIcon="domain"
                />
                <TextField
                  label="Job Title"
                  value={title}
                  onValueChange={setTitle}
                  required
                  leadingIcon="badge"
                />
                <TextField
                  label="Location"
                  value={location}
                  onValueChange={setLocation}
                  leadingIcon="location_on"
                />
                <TextField
                  label="Salary Range"
                  value={salaryRange}
                  onValueChange={setSalaryRange}
                  leadingIcon="payments"
                />
                <TextField
                  label="Seniority Level"
                  value={seniority}
                  onValueChange={setSeniority}
                  leadingIcon="trending_up"
                />
                <TextField
                  label="Job Posting URL"
                  type="url"
                  value={jobUrl}
                  onValueChange={setJobUrl}
                  leadingIcon="link"
                />
              </div>

              <TextArea
                label="Notes & Key Requirements"
                value={notes}
                onValueChange={setNotes}
                rows={6}
              />
            </div>
          ) : (
            <>
              {/* Row 1 of Info Cards: Location (33%), Target Salary (33%), Seniority (33%) */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                  gap: '1rem',
                }}
              >
                {/* Location Card */}
                <div
                  className="m3-card"
                  style={{
                    padding: '1rem 1.25rem',
                    borderRadius: '16px',
                    backgroundColor: 'var(--md-sys-color-surface-container-low)',
                    border: '1px solid var(--md-sys-color-outline-variant)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.35rem',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.6875rem',
                      fontFamily: 'var(--font-headline)',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: 'var(--md-sys-color-on-surface-variant)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>
                      location_on
                    </span>
                    Location
                  </span>
                  <span
                    style={{
                      fontSize: '0.9375rem',
                      fontWeight: 700,
                      color: 'var(--md-sys-color-on-surface)',
                      lineHeight: 1.35,
                    }}
                  >
                    {application.location || 'Not Specified'}
                  </span>
                </div>

                {/* Target Salary Card */}
                <div
                  className="m3-card"
                  style={{
                    padding: '1rem 1.25rem',
                    borderRadius: '16px',
                    backgroundColor: 'var(--md-sys-color-surface-container-low)',
                    border: '1px solid var(--md-sys-color-outline-variant)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.35rem',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.6875rem',
                      fontFamily: 'var(--font-headline)',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: 'var(--md-sys-color-on-surface-variant)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>
                      payments
                    </span>
                    Target Salary
                  </span>
                  <span
                    style={{
                      fontSize: '0.9375rem',
                      fontWeight: 700,
                      color: 'var(--md-sys-color-on-surface)',
                      lineHeight: 1.35,
                    }}
                  >
                    {application.salary_range || 'Not Specified'}
                  </span>
                </div>

                {/* Seniority Card */}
                <div
                  className="m3-card"
                  style={{
                    padding: '1rem 1.25rem',
                    borderRadius: '16px',
                    backgroundColor: 'var(--md-sys-color-surface-container-low)',
                    border: '1px solid var(--md-sys-color-outline-variant)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.35rem',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.6875rem',
                      fontFamily: 'var(--font-headline)',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: 'var(--md-sys-color-on-surface-variant)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>
                      trending_up
                    </span>
                    Seniority
                  </span>
                  <span
                    style={{
                      fontSize: '0.9375rem',
                      fontWeight: 700,
                      color: 'var(--md-sys-color-on-surface)',
                      lineHeight: 1.35,
                    }}
                  >
                    {application.seniority || 'Not Specified'}
                  </span>
                </div>
              </div>

              {/* Row 2 of Info Cards: Source (33%) & Created/Updated Dates (66%) */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 2fr',
                  gap: '1rem',
                }}
              >
                {/* Source Card */}
                <div
                  className="m3-card"
                  style={{
                    padding: '1rem 1.25rem',
                    borderRadius: '16px',
                    backgroundColor: 'var(--md-sys-color-surface-container-low)',
                    border: '1px solid var(--md-sys-color-outline-variant)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.35rem',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.6875rem',
                      fontFamily: 'var(--font-headline)',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: 'var(--md-sys-color-on-surface-variant)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>
                      share
                    </span>
                    Source
                  </span>
                  <span
                    style={{
                      fontSize: '0.9375rem',
                      fontWeight: 700,
                      textTransform: 'capitalize',
                      color: 'var(--md-sys-color-on-surface)',
                    }}
                  >
                    {application.source_type || 'Manual'}
                  </span>
                </div>

                {/* Dates Dual-Pane Card */}
                <div
                  className="m3-card"
                  style={{
                    padding: '1rem 1.5rem',
                    borderRadius: '16px',
                    backgroundColor: 'var(--md-sys-color-surface-container-low)',
                    border: '1px solid var(--md-sys-color-outline-variant)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-around',
                  }}
                >
                  {/* Created On */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem' }}>
                    <span
                      style={{
                        fontSize: '0.6875rem',
                        fontFamily: 'var(--font-headline)',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: 'var(--md-sys-color-on-surface-variant)',
                      }}
                    >
                      Created On
                    </span>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--md-sys-color-on-surface)' }}>
                      {formatTimelineDate(application.created_at)}
                    </span>
                  </div>

                  {/* Vertical Hairline Divider */}
                  <div
                    style={{
                      width: '1px',
                      height: '30px',
                      backgroundColor: 'var(--md-sys-color-outline-variant)',
                    }}
                  />

                  {/* Last Updated */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem' }}>
                    <span
                      style={{
                        fontSize: '0.6875rem',
                        fontFamily: 'var(--font-headline)',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: 'var(--md-sys-color-on-surface-variant)',
                      }}
                    >
                      Last Updated
                    </span>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--md-sys-color-on-surface)' }}>
                      {formatTimelineDate(application.updated_at)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Application Notes Card with Direct Save */}
              <div
                className="m3-card"
                style={{
                  padding: '1.5rem',
                  borderRadius: '20px',
                  backgroundColor: 'var(--md-sys-color-surface-container-low)',
                  border: '1px solid var(--md-sys-color-outline-variant)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3
                    style={{
                      fontSize: '1rem',
                      fontFamily: 'var(--font-headline)',
                      fontWeight: 700,
                      color: 'var(--md-sys-color-on-surface)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--md-sys-color-primary)' }}>
                      notes
                    </span>
                    <span>Application Notes</span>
                  </h3>

                  <button
                    onClick={handleSaveNotes}
                    disabled={savingNotes}
                    style={{
                      border: 'none',
                      backgroundColor: 'transparent',
                      color: 'var(--md-sys-color-primary)',
                      fontFamily: 'var(--font-headline)',
                      fontSize: '0.8125rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                      {notesSavedSuccess ? 'check' : 'save'}
                    </span>
                    <span>{notesSavedSuccess ? 'Saved!' : savingNotes ? 'Saving...' : 'Save Notes'}</span>
                  </button>
                </div>

                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add interview dates, contacts, referral notes, or question prep here..."
                  rows={6}
                  style={{
                    width: '100%',
                    padding: '1rem 1.25rem',
                    borderRadius: '14px',
                    border: '1px solid var(--md-sys-color-outline-variant)',
                    backgroundColor: 'var(--md-sys-color-surface-container-lowest)',
                    color: 'var(--md-sys-color-on-surface)',
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.9375rem',
                    lineHeight: 1.6,
                    resize: 'vertical',
                    outline: 'none',
                    transition: 'border-color 0.2s ease',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = 'var(--md-sys-color-primary)')}
                  onBlur={(e) => (e.target.style.borderColor = 'var(--md-sys-color-outline-variant)')}
                />
              </div>

              {/* Collapsible Raw Job Description Card */}
              {application.raw_jd && (
                <div
                  className="m3-card"
                  style={{
                    padding: 0,
                    overflow: 'hidden',
                    borderRadius: '20px',
                    backgroundColor: 'var(--md-sys-color-surface-container-low)',
                    border: '1px solid var(--md-sys-color-outline-variant)',
                  }}
                >
                  <div
                    onClick={() => setJdExpanded((prev) => !prev)}
                    style={{
                      padding: '1.25rem 1.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      transition: 'background-color 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--md-sys-color-surface-container)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--md-sys-color-primary)' }}>
                        description
                      </span>
                      <span
                        style={{
                          fontFamily: 'var(--font-headline)',
                          fontWeight: 700,
                          fontSize: '0.9375rem',
                          color: 'var(--md-sys-color-on-surface)',
                        }}
                      >
                        Raw Job Description
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <button
                        onClick={handleCopyJd}
                        style={{
                          padding: '0.3rem 0.65rem',
                          borderRadius: '8px',
                          border: '1px solid var(--md-sys-color-outline-variant)',
                          backgroundColor: 'var(--md-sys-color-surface-container)',
                          color: copiedJd ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-on-surface-variant)',
                          fontSize: '0.75rem',
                          fontFamily: 'var(--font-headline)',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                          {copiedJd ? 'check' : 'content_copy'}
                        </span>
                        <span>{copiedJd ? 'Copied' : 'Copy'}</span>
                      </button>

                      <span
                        className="material-symbols-outlined"
                        style={{
                          fontSize: '20px',
                          color: 'var(--md-sys-color-on-surface-variant)',
                          transform: jdExpanded ? 'rotate(180deg)' : 'none',
                          transition: 'transform 0.2s ease',
                        }}
                      >
                        expand_more
                      </span>
                    </div>
                  </div>

                  {jdExpanded && (
                    <div
                      style={{
                        padding: '1.25rem 1.5rem',
                        borderTop: '1px solid var(--md-sys-color-outline-variant)',
                        backgroundColor: 'var(--md-sys-color-surface-container-lowest)',
                        maxHeight: '420px',
                        overflowY: 'auto',
                        whiteSpace: 'pre-wrap',
                        fontSize: '0.8125rem',
                        lineHeight: 1.6,
                        color: 'var(--md-sys-color-on-surface-variant)',
                      }}
                    >
                      {application.raw_jd}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* ================= RIGHT COLUMN: UPDATE STATUS + TIMELINE ================= */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Card 1: Update Status M3 Segmented Buttons Grid */}
          <div
            className="m3-card"
            style={{
              padding: '1.5rem',
              borderRadius: '20px',
              backgroundColor: 'var(--md-sys-color-surface-container-low)',
              border: '1px solid var(--md-sys-color-outline-variant)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            <h3
              style={{
                fontSize: '0.9375rem',
                fontFamily: 'var(--font-headline)',
                fontWeight: 700,
                color: 'var(--md-sys-color-on-surface)',
              }}
            >
              Update Status
            </h3>

            {/* Row 1: Draft, Applied, Interviewing */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
              {(['draft', 'applied', 'interviewing'] as ApplicationStatus[]).map((st) => {
                const isActive = application.status === st;
                return (
                  <button
                    key={st}
                    onClick={() => handleInitiateStatusChange(st)}
                    style={{
                      padding: '0.625rem 0.5rem',
                      borderRadius: '12px',
                      border: isActive
                        ? '1px solid transparent'
                        : '1px solid var(--md-sys-color-outline-variant)',
                      backgroundColor: isActive
                        ? 'var(--md-sys-color-secondary-container)'
                        : 'var(--md-sys-color-surface-container-lowest)',
                      color: isActive
                        ? 'var(--md-sys-color-on-secondary-container)'
                        : 'var(--md-sys-color-on-surface)',
                      fontFamily: 'var(--font-headline)',
                      fontSize: '0.8125rem',
                      fontWeight: isActive ? 700 : 500,
                      cursor: 'pointer',
                      textAlign: 'center',
                      textTransform: 'capitalize',
                      transition: 'all 0.15s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.25rem',
                    }}
                  >
                    {isActive && (
                      <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>
                        check
                      </span>
                    )}
                    <span>{st}</span>
                  </button>
                );
              })}
            </div>

            {/* Row 2: Offer, Rejected, Withdrawn */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
              {(['offer', 'rejected', 'withdrawn'] as ApplicationStatus[]).map((st) => {
                const isActive = application.status === st;
                return (
                  <button
                    key={st}
                    onClick={() => handleInitiateStatusChange(st)}
                    style={{
                      padding: '0.625rem 0.5rem',
                      borderRadius: '12px',
                      border: isActive
                        ? '1px solid transparent'
                        : '1px solid var(--md-sys-color-outline-variant)',
                      backgroundColor: isActive
                        ? 'var(--md-sys-color-secondary-container)'
                        : 'var(--md-sys-color-surface-container-lowest)',
                      color: isActive
                        ? 'var(--md-sys-color-on-secondary-container)'
                        : 'var(--md-sys-color-on-surface)',
                      fontFamily: 'var(--font-headline)',
                      fontSize: '0.8125rem',
                      fontWeight: isActive ? 700 : 500,
                      cursor: 'pointer',
                      textAlign: 'center',
                      textTransform: 'capitalize',
                      transition: 'all 0.15s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.25rem',
                    }}
                  >
                    {isActive && (
                      <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>
                        check
                      </span>
                    )}
                    <span>{st}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Card 2: Application Timeline with Deletion */}
          <div
            className="m3-card"
            style={{
              padding: '1.5rem',
              borderRadius: '20px',
              backgroundColor: 'var(--md-sys-color-surface-container-low)',
              border: '1px solid var(--md-sys-color-outline-variant)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
            }}
          >
            <h3
              style={{
                fontSize: '0.9375rem',
                fontFamily: 'var(--font-headline)',
                fontWeight: 700,
                color: 'var(--md-sys-color-on-surface)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--md-sys-color-primary)' }}>
                history
              </span>
              <span>Application Timeline</span>
            </h3>

            {history.length === 0 ? (
              <p style={{ color: 'var(--md-sys-color-on-surface-variant)', fontSize: '0.8125rem' }}>
                No timeline events recorded yet.
              </p>
            ) : (
              <div className="m3-timeline">
                {history.map((entry, idx) => {
                  const isLatest = idx === 0;
                  return (
                    <div key={entry.id || idx} className="m3-timeline-item">
                      <div className="m3-timeline-line" />
                      <div
                        className="m3-timeline-dot"
                        style={{
                          backgroundColor: isLatest
                            ? 'var(--md-sys-color-primary)'
                            : 'var(--md-sys-color-surface-container-high)',
                          borderColor: 'var(--md-sys-color-surface-container-low)',
                        }}
                      >
                        {isLatest ? (
                          <div
                            style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              backgroundColor: 'var(--md-sys-color-on-primary)',
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              backgroundColor: 'var(--md-sys-color-outline)',
                            }}
                          />
                        )}
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span
                            style={{
                              fontFamily: 'var(--font-headline)',
                              fontWeight: isLatest ? 700 : 600,
                              fontSize: '0.875rem',
                              textTransform: 'capitalize',
                              color: isLatest
                                ? 'var(--md-sys-color-on-surface)'
                                : 'var(--md-sys-color-on-surface-variant)',
                            }}
                          >
                            {entry.status === 'draft' ? 'Draft Created' : entry.status}
                          </span>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <span
                              style={{
                                fontSize: '0.75rem',
                                color: 'var(--md-sys-color-on-surface-variant)',
                              }}
                            >
                              {formatTimelineDate(entry.changed_at)}
                            </span>

                            {/* Trash icon to delete accidental misclick events */}
                            {history.length > 1 && (
                              <button
                                onClick={(e) => handleDeleteHistoryEntry(entry.id, e)}
                                title="Remove accidental status change"
                                aria-label="Delete status history event"
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: 'var(--md-sys-color-on-surface-variant)',
                                  cursor: 'pointer',
                                  padding: '0.15rem',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  opacity: 0.6,
                                  transition: 'opacity 0.15s ease, color 0.15s ease',
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.opacity = '1';
                                  e.currentTarget.style.color = 'var(--md-sys-color-error)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.opacity = '0.6';
                                  e.currentTarget.style.color = 'var(--md-sys-color-on-surface-variant)';
                                }}
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                                  delete
                                </span>
                              </button>
                            )}
                          </div>
                        </div>

                        <span
                          style={{
                            fontSize: '0.75rem',
                            color: 'var(--md-sys-color-on-surface-variant)',
                            lineHeight: 1.4,
                          }}
                        >
                          {entry.status === 'draft'
                            ? `Created initial application entry.`
                            : `Moved stage to ${entry.status}.`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ================= STATUS CHANGE CONFIRMATION DIALOG ================= */}
      <Dialog
        open={statusDialogOpen}
        onClose={() => setStatusDialogOpen(false)}
        headline="Update Application Status?"
        icon="swap_horiz"
        actions={
          <>
            <button
              onClick={() => setStatusDialogOpen(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--md-sys-color-primary)',
                fontFamily: 'var(--font-headline)',
                fontWeight: 700,
                fontSize: '0.875rem',
                cursor: 'pointer',
                padding: '0.5rem 1rem',
                borderRadius: '9999px',
              }}
            >
              Cancel
            </button>

            <button
              onClick={handleConfirmStatusChange}
              disabled={updatingStatus}
              style={{
                backgroundColor: 'var(--md-sys-color-primary)',
                color: 'var(--md-sys-color-on-primary)',
                border: 'none',
                fontFamily: 'var(--font-headline)',
                fontWeight: 700,
                fontSize: '0.875rem',
                cursor: 'pointer',
                padding: '0.5rem 1.25rem',
                borderRadius: '9999px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                transition: 'all 0.15s ease',
              }}
            >
              {updatingStatus ? 'Updating...' : `Set to ${pendingStatus || ''}`}
            </button>
          </>
        }
      >
        <p style={{ margin: 0, color: 'var(--md-sys-color-on-surface-variant)', lineHeight: 1.5 }}>
          Are you sure you want to transition this application from{' '}
          <strong style={{ textTransform: 'capitalize', color: 'var(--md-sys-color-on-surface)' }}>
            {application.status}
          </strong>{' '}
          to{' '}
          <strong style={{ textTransform: 'capitalize', color: 'var(--md-sys-color-primary)' }}>
            {pendingStatus}
          </strong>
          ? This will record a verified milestone in your timeline.
        </p>
      </Dialog>

      {/* ================= DESTRUCTIVE DELETE CONFIRMATION DIALOG (M3 Error Role) ================= */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        headline="Delete Application?"
        icon="delete"
        destructive={true}
        actions={
          <>
            <button
              onClick={() => setDeleteDialogOpen(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--md-sys-color-on-surface-variant)',
                fontFamily: 'var(--font-headline)',
                fontWeight: 700,
                fontSize: '0.875rem',
                cursor: 'pointer',
                padding: '0.5rem 1rem',
                borderRadius: '9999px',
              }}
            >
              Cancel
            </button>

            <button
              onClick={handleDelete}
              disabled={deleting}
              style={{
                backgroundColor: 'var(--md-sys-color-error)',
                color: 'var(--md-sys-color-on-error)',
                border: 'none',
                fontFamily: 'var(--font-headline)',
                fontWeight: 700,
                fontSize: '0.875rem',
                cursor: 'pointer',
                padding: '0.5rem 1.25rem',
                borderRadius: '9999px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                transition: 'filter 0.15s ease',
              }}
            >
              {deleting ? 'Deleting...' : 'Delete Application'}
            </button>
          </>
        }
      >
        <p style={{ margin: 0, color: 'var(--md-sys-color-on-surface-variant)', lineHeight: 1.5 }}>
          Are you sure you want to delete <strong>{application.title}</strong> at{' '}
          <strong>{application.company}</strong>? This action is permanent and cannot be undone.
        </p>
      </Dialog>
    </div>
  );
}
