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

type TabType = 'overview' | 'raw_jd' | 'history';

export default function ApplicationDetailPage() {
  const params = useParams();
  const applicationId = params?.id as string;
  const router = useRouter();
  const supabase = createClient();

  const [application, setApplication] = useState<Application | null>(null);
  const [history, setHistory] = useState<StatusHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('overview');

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
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [copiedJd, setCopiedJd] = useState(false);

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

  const handleStatusChange = async (nextStatus: ApplicationStatus) => {
    if (!application || application.status === nextStatus) return;

    setUpdatingStatus(true);
    const prevStatus = application.status;

    // Optimistic UI update
    setApplication((prev) => (prev ? { ...prev, status: nextStatus } : null));

    try {
      // 1. Update application status
      const { error: appError } = await supabase
        .from('applications')
        .update({ status: nextStatus, updated_at: new Date().toISOString() })
        .eq('id', applicationId);

      if (appError) throw appError;

      // 2. Insert status history record
      const { data: histRow, error: histError } = await supabase
        .from('status_history')
        .insert({
          application_id: applicationId,
          status: nextStatus,
          changed_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (histError) throw histError;

      setHistory((prev) => [histRow, ...prev]);
      setSuccessMsg(`Status updated to ${nextStatus.toUpperCase()}`);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      console.error('Failed to update status:', err);
      // Revert on failure
      setApplication((prev) => (prev ? { ...prev, status: prevStatus } : null));
      alert('Failed to update status. Please try again.');
    } finally {
      setUpdatingStatus(false);
    }
  };

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

  const handleCopyJd = () => {
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

  // Pipeline step order
  const pipelineStages: ApplicationStatus[] = ['draft', 'applied', 'interviewing', 'offer'];
  const currentStageIdx = pipelineStages.indexOf(application.status);

  return (
    <div style={{ padding: '2rem 2rem 4rem 2rem', maxWidth: '1240px', margin: '0 auto' }}>
      {/* Top Breadcrumb Nav */}
      <div style={{ marginBottom: '1.25rem' }}>
        <Link href="/applications" style={{ textDecoration: 'none' }}>
          <TextButton icon="arrow_back">Back to Applications</TextButton>
        </Link>
      </div>

      {/* Notifications */}
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

      {/* ================= OPTION 2: GOOGLE M3 WORKSPACE HEADER HERO ================= */}
      <div
        className="m3-card"
        style={{
          padding: '1.75rem 2rem',
          marginBottom: '1.5rem',
          borderRadius: '24px',
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
              width: '60px',
              height: '60px',
              borderRadius: '18px',
              fontSize: '1.35rem',
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
                    <span>Original Posting</span>
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                      open_in_new
                    </span>
                  </a>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Header Right: M3 Interactive Status Chip + Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* M3 Status Dropdown Pill */}
          <div style={{ position: 'relative' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.4rem 0.875rem',
                borderRadius: '9999px',
                border: '1px solid var(--md-sys-color-outline-variant)',
                backgroundColor: 'var(--md-sys-color-surface-container-high)',
                cursor: 'pointer',
              }}
            >
              <StatusBadge status={application.status} size="medium" />
              <span
                className="material-symbols-outlined"
                style={{ fontSize: '18px', color: 'var(--md-sys-color-on-surface-variant)' }}
              >
                expand_more
              </span>
            </div>

            <select
              value={application.status}
              onChange={(e) => handleStatusChange(e.target.value as ApplicationStatus)}
              disabled={updatingStatus}
              aria-label="Change status"
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
              {APPLICATION_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {!isEditing ? (
            <>
              <OutlinedButton icon="edit" onClick={() => setIsEditing(true)}>
                Edit
              </OutlinedButton>
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
                {saving ? 'Saving...' : 'Save'}
              </FilledButton>
            </div>
          )}
        </div>
      </div>

      {/* ================= OPTION 2: 2-COLUMN TABBED WORKSPACE ================= */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 360px',
          gap: '1.5rem',
          alignItems: 'start',
        }}
      >
        {/* ================= LEFT COLUMN: TABBED PANELS ================= */}
        <div
          className="m3-card"
          style={{
            padding: 0,
            overflow: 'hidden',
            backgroundColor: 'var(--md-sys-color-surface-container-low)',
            borderRadius: '24px',
            border: '1px solid var(--md-sys-color-outline-variant)',
          }}
        >
          {/* M3 Segmented Primary Tabs */}
          {!isEditing && (
            <div
              style={{
                display: 'flex',
                borderBottom: '1px solid var(--md-sys-color-outline-variant)',
                backgroundColor: 'var(--md-sys-color-surface-container)',
                padding: '0.25rem 0.5rem 0 0.5rem',
                gap: '0.25rem',
                overflowX: 'auto',
              }}
            >
              <button
                onClick={() => setActiveTab('overview')}
                style={{
                  padding: '0.875rem 1.25rem',
                  border: 'none',
                  borderBottom:
                    activeTab === 'overview'
                      ? '3px solid var(--md-sys-color-primary)'
                      : '3px solid transparent',
                  backgroundColor: 'transparent',
                  color:
                    activeTab === 'overview'
                      ? 'var(--md-sys-color-primary)'
                      : 'var(--md-sys-color-on-surface-variant)',
                  fontFamily: 'var(--font-headline)',
                  fontSize: '0.875rem',
                  fontWeight: activeTab === 'overview' ? 700 : 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                  description
                </span>
                <span>Overview & Notes</span>
              </button>

              <button
                onClick={() => setActiveTab('raw_jd')}
                style={{
                  padding: '0.875rem 1.25rem',
                  border: 'none',
                  borderBottom:
                    activeTab === 'raw_jd'
                      ? '3px solid var(--md-sys-color-primary)'
                      : '3px solid transparent',
                  backgroundColor: 'transparent',
                  color:
                    activeTab === 'raw_jd'
                      ? 'var(--md-sys-color-primary)'
                      : 'var(--md-sys-color-on-surface-variant)',
                  fontFamily: 'var(--font-headline)',
                  fontSize: '0.875rem',
                  fontWeight: activeTab === 'raw_jd' ? 700 : 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                  article
                </span>
                <span>Original Job Posting</span>
              </button>

              <button
                onClick={() => setActiveTab('history')}
                style={{
                  padding: '0.875rem 1.25rem',
                  border: 'none',
                  borderBottom:
                    activeTab === 'history'
                      ? '3px solid var(--md-sys-color-primary)'
                      : '3px solid transparent',
                  backgroundColor: 'transparent',
                  color:
                    activeTab === 'history'
                      ? 'var(--md-sys-color-primary)'
                      : 'var(--md-sys-color-on-surface-variant)',
                  fontFamily: 'var(--font-headline)',
                  fontSize: '0.875rem',
                  fontWeight: activeTab === 'history' ? 700 : 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                  history
                </span>
                <span>Activity Log ({history.length})</span>
              </button>
            </div>
          )}

          {/* Tab Content Body */}
          <div style={{ padding: '2rem' }}>
            {isEditing ? (
              /* Edit Form */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <h3
                  style={{
                    fontSize: '1.125rem',
                    fontFamily: 'var(--font-headline)',
                    fontWeight: 700,
                    color: 'var(--md-sys-color-on-surface)',
                  }}
                >
                  Edit Job Information
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
            ) : activeTab === 'overview' ? (
              /* TAB 1: OVERVIEW & NOTES */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                <div>
                  <h3
                    style={{
                      fontSize: '0.75rem',
                      fontFamily: 'var(--font-headline)',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      color: 'var(--md-sys-color-on-surface-variant)',
                      marginBottom: '0.75rem',
                    }}
                  >
                    Notes & Key Requirements
                  </h3>

                  {application.notes ? (
                    <div
                      style={{
                        padding: '1.25rem 1.5rem',
                        borderRadius: '16px',
                        border: '1px solid var(--md-sys-color-outline-variant)',
                        backgroundColor: 'var(--md-sys-color-surface-container)',
                        whiteSpace: 'pre-wrap',
                        fontSize: '0.9375rem',
                        lineHeight: 1.65,
                        color: 'var(--md-sys-color-on-surface)',
                      }}
                    >
                      {application.notes}
                    </div>
                  ) : (
                    <div
                      style={{
                        padding: '2rem',
                        borderRadius: '16px',
                        border: '1px dashed var(--md-sys-color-outline-variant)',
                        textAlign: 'center',
                      }}
                    >
                      <p style={{ color: 'var(--md-sys-color-on-surface-variant)', fontSize: '0.875rem' }}>
                        No notes added yet. Click <strong>Edit</strong> in the top header to add notes, salary expectations, or interview details.
                      </p>
                    </div>
                  )}
                </div>

                {/* Quick Attributes Summary Chips */}
                <div>
                  <h3
                    style={{
                      fontSize: '0.75rem',
                      fontFamily: 'var(--font-headline)',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      color: 'var(--md-sys-color-on-surface-variant)',
                      marginBottom: '0.75rem',
                    }}
                  >
                    Role Highlights
                  </h3>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.625rem' }}>
                    {application.location && (
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          padding: '0.4rem 0.85rem',
                          borderRadius: '9999px',
                          backgroundColor: 'var(--md-sys-color-surface-container)',
                          border: '1px solid var(--md-sys-color-outline-variant)',
                          fontSize: '0.8125rem',
                          fontWeight: 600,
                          color: 'var(--md-sys-color-on-surface)',
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                          location_on
                        </span>
                        <span>{application.location}</span>
                      </div>
                    )}

                    {application.salary_range && (
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          padding: '0.4rem 0.85rem',
                          borderRadius: '9999px',
                          backgroundColor: 'var(--md-sys-color-surface-container)',
                          border: '1px solid var(--md-sys-color-outline-variant)',
                          fontSize: '0.8125rem',
                          fontWeight: 600,
                          color: 'var(--md-sys-color-on-surface)',
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                          payments
                        </span>
                        <span>{application.salary_range}</span>
                      </div>
                    )}

                    {application.seniority && (
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          padding: '0.4rem 0.85rem',
                          borderRadius: '9999px',
                          backgroundColor: 'var(--md-sys-color-surface-container)',
                          border: '1px solid var(--md-sys-color-outline-variant)',
                          fontSize: '0.8125rem',
                          fontWeight: 600,
                          color: 'var(--md-sys-color-on-surface)',
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                          trending_up
                        </span>
                        <span>{application.seniority}</span>
                      </div>
                    )}

                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        padding: '0.4rem 0.85rem',
                        borderRadius: '9999px',
                        backgroundColor: 'var(--md-sys-color-surface-container)',
                        border: '1px solid var(--md-sys-color-outline-variant)',
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                        textTransform: 'capitalize',
                        color: 'var(--md-sys-color-on-surface)',
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                        share
                      </span>
                      <span>Source: {application.source_type || 'Manual'}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : activeTab === 'raw_jd' ? (
              /* TAB 2: ORIGINAL JOB POSTING */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3
                    style={{
                      fontSize: '0.75rem',
                      fontFamily: 'var(--font-headline)',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      color: 'var(--md-sys-color-on-surface-variant)',
                    }}
                  >
                    Full Job Description Text
                  </h3>

                  <button
                    onClick={handleCopyJd}
                    style={{
                      padding: '0.35rem 0.75rem',
                      borderRadius: '8px',
                      border: '1px solid var(--md-sys-color-outline-variant)',
                      backgroundColor: 'var(--md-sys-color-surface-container)',
                      color: copiedJd ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-on-surface)',
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
                    <span>{copiedJd ? 'Copied!' : 'Copy Full Text'}</span>
                  </button>
                </div>

                {application.raw_jd ? (
                  <div
                    style={{
                      padding: '1.5rem',
                      borderRadius: '16px',
                      border: '1px solid var(--md-sys-color-outline-variant)',
                      backgroundColor: 'var(--md-sys-color-surface-container-lowest)',
                      maxHeight: '520px',
                      overflowY: 'auto',
                      whiteSpace: 'pre-wrap',
                      fontSize: '0.875rem',
                      lineHeight: 1.65,
                      color: 'var(--md-sys-color-on-surface)',
                      fontFamily: 'var(--font-body)',
                    }}
                  >
                    {application.raw_jd}
                  </div>
                ) : (
                  <div
                    style={{
                      padding: '3rem 2rem',
                      borderRadius: '16px',
                      border: '1px dashed var(--md-sys-color-outline-variant)',
                      textAlign: 'center',
                    }}
                  >
                    <p style={{ color: 'var(--md-sys-color-on-surface-variant)', fontSize: '0.875rem' }}>
                      No raw job description preserved for this manual entry.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              /* TAB 3: ACTIVITY LOG */
              <div>
                <h3
                  style={{
                    fontSize: '0.75rem',
                    fontFamily: 'var(--font-headline)',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: 'var(--md-sys-color-on-surface-variant)',
                    marginBottom: '1.25rem',
                  }}
                >
                  Status History & Activity
                </h3>

                {history.length === 0 ? (
                  <p style={{ color: 'var(--md-sys-color-on-surface-variant)', fontSize: '0.875rem' }}>
                    No status transitions recorded.
                  </p>
                ) : (
                  <div className="m3-timeline">
                    {history.map((entry, idx) => (
                      <div key={entry.id || idx} className="m3-timeline-item">
                        <div className="m3-timeline-line" />
                        <div className="m3-timeline-dot">
                          <span
                            className="material-symbols-outlined"
                            style={{ fontSize: '14px', color: 'var(--md-sys-color-primary)' }}
                          >
                            radio_button_checked
                          </span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
                          <StatusBadge status={entry.status} size="medium" />
                          <span
                            style={{
                              fontSize: '0.75rem',
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
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ================= RIGHT COLUMN: M3 PROPERTIES & PIPELINE STEPPER ================= */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Card 1: Pipeline Progress Stepper */}
          <div
            className="m3-card"
            style={{
              padding: '1.5rem',
              backgroundColor: 'var(--md-sys-color-surface-container-low)',
              borderRadius: '24px',
              border: '1px solid var(--md-sys-color-outline-variant)',
            }}
          >
            <span
              style={{
                fontSize: '0.6875rem',
                fontFamily: 'var(--font-headline)',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--md-sys-color-on-surface-variant)',
                display: 'block',
                marginBottom: '1rem',
              }}
            >
              Hiring Pipeline
            </span>

            {/* Stepper Pipeline Indicators */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {pipelineStages.map((stage, idx) => {
                const isPassed = currentStageIdx >= idx;
                const isCurrent = application.status === stage;

                return (
                  <button
                    key={stage}
                    onClick={() => handleStatusChange(stage)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.625rem 0.875rem',
                      borderRadius: '12px',
                      border: isCurrent
                        ? '1.5px solid var(--md-sys-color-primary)'
                        : '1px solid var(--md-sys-color-outline-variant)',
                      backgroundColor: isCurrent
                        ? 'var(--md-sys-color-secondary-container)'
                        : 'transparent',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      textAlign: 'left',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                      <span
                        className="material-symbols-outlined"
                        style={{
                          fontSize: '18px',
                          color: isPassed
                            ? 'var(--md-sys-color-primary)'
                            : 'var(--md-sys-color-on-surface-variant)',
                        }}
                      >
                        {isPassed ? 'check_circle' : 'radio_button_unchecked'}
                      </span>
                      <span
                        style={{
                          fontSize: '0.875rem',
                          fontFamily: 'var(--font-headline)',
                          fontWeight: isCurrent ? 700 : 500,
                          textTransform: 'capitalize',
                          color: isCurrent
                            ? 'var(--md-sys-color-on-secondary-container)'
                            : 'var(--md-sys-color-on-surface)',
                        }}
                      >
                        {stage}
                      </span>
                    </div>

                    {isCurrent && (
                      <span
                        style={{
                          fontSize: '0.6875rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          color: 'var(--md-sys-color-primary)',
                        }}
                      >
                        Current
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Card 2: M3 Structured Properties Sheet */}
          <div
            className="m3-card"
            style={{
              padding: '1.5rem',
              backgroundColor: 'var(--md-sys-color-surface-container-low)',
              borderRadius: '24px',
              border: '1px solid var(--md-sys-color-outline-variant)',
            }}
          >
            <span
              style={{
                fontSize: '0.6875rem',
                fontFamily: 'var(--font-headline)',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--md-sys-color-on-surface-variant)',
                display: 'block',
                marginBottom: '1rem',
              }}
            >
              Job Attributes
            </span>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {/* Location */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--md-sys-color-on-surface-variant)' }}>
                  Location
                </span>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--md-sys-color-on-surface)', textAlign: 'right' }}>
                  {application.location || '—'}
                </span>
              </div>

              {/* Salary */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--md-sys-color-on-surface-variant)' }}>
                  Salary Range
                </span>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--md-sys-color-on-surface)' }}>
                  {application.salary_range || '—'}
                </span>
              </div>

              {/* Seniority */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--md-sys-color-on-surface-variant)' }}>
                  Seniority Level
                </span>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--md-sys-color-on-surface)' }}>
                  {application.seniority || '—'}
                </span>
              </div>

              {/* Source */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--md-sys-color-on-surface-variant)' }}>
                  Source Type
                </span>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, textTransform: 'capitalize', color: 'var(--md-sys-color-on-surface)' }}>
                  {application.source_type || 'Manual'}
                </span>
              </div>

              {/* Date Created */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--md-sys-color-on-surface-variant)' }}>
                  Date Added
                </span>
                <span style={{ fontSize: '0.8125rem', color: 'var(--md-sys-color-on-surface)' }}>
                  {new Date(application.created_at).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>

              {/* Last Updated */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--md-sys-color-on-surface-variant)' }}>
                  Last Updated
                </span>
                <span style={{ fontSize: '0.8125rem', color: 'var(--md-sys-color-on-surface)' }}>
                  {new Date(application.updated_at).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>
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
            <FilledButton onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Deleting...' : 'Delete Application'}
            </FilledButton>
          </div>
        }
      >
        <p style={{ color: 'var(--md-sys-color-on-surface-variant)', lineHeight: 1.5 }}>
          Are you sure you want to delete <strong>{application.title}</strong> at{' '}
          <strong>{application.company}</strong>? This action will permanently remove this record and its status history.
        </p>
      </Dialog>
    </div>
  );
}
