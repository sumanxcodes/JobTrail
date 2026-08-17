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
  const [updatingStatus, setUpdatingStatus] = useState(false);
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
          Loading job details...
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
    <div style={{ padding: '2rem 2rem 4rem 2rem', maxWidth: '1240px', margin: '0 auto' }}>
      {/* Top Breadcrumb Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <Link href="/applications" style={{ textDecoration: 'none' }}>
          <TextButton icon="arrow_back">Back to Applications</TextButton>
        </Link>

        {isEditing && (
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

      {/* 2-Column Unified Workspace Dossier */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 340px',
          gap: '1.5rem',
          alignItems: 'start',
        }}
      >
        {/* ================= LEFT COLUMN: PRIMARY JOB DOSSIER ================= */}
        <div
          className="m3-card"
          style={{
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.75rem',
            backgroundColor: 'var(--md-sys-color-surface-container-low)',
            borderRadius: '24px',
            border: '1px solid var(--md-sys-color-outline-variant)',
          }}
        >
          {/* Header Title Section */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.25rem' }}>
            <div
              className="company-avatar"
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '18px',
                fontSize: '1.25rem',
                flexShrink: 0,
              }}
            >
              {initials}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <h1
                style={{
                  fontSize: '1.875rem',
                  fontFamily: 'var(--font-headline)',
                  fontWeight: 800,
                  color: 'var(--md-sys-color-on-surface)',
                  lineHeight: 1.2,
                  marginBottom: '0.35rem',
                  letterSpacing: '-0.025em',
                  wordBreak: 'break-word',
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
                    <span style={{ opacity: 0.5 }}>•</span>
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
                      <span>Original Post</span>
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                        open_in_new
                      </span>
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: '1px', backgroundColor: 'var(--md-sys-color-outline-variant)' }} />

          {/* If Editing Mode: Render Edit Inputs */}
          {isEditing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h3
                style={{
                  fontSize: '1rem',
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
                rows={5}
              />
            </div>
          ) : (
            <>
              {/* Key Attributes 4-Grid Ribbon */}
              <div>
                <h3
                  style={{
                    fontSize: '0.6875rem',
                    fontFamily: 'var(--font-headline)',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: 'var(--md-sys-color-on-surface-variant)',
                    marginBottom: '0.875rem',
                  }}
                >
                  Key Job Attributes
                </h3>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1.25rem',
                    padding: '1.25rem',
                    borderRadius: '16px',
                    backgroundColor: 'var(--md-sys-color-surface-container)',
                    border: '1px solid var(--md-sys-color-outline-variant)',
                  }}
                >
                  {/* Location */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
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
                        fontWeight: 600,
                        color: 'var(--md-sys-color-on-surface)',
                      }}
                    >
                      {application.location || '—'}
                    </span>
                  </div>

                  {/* Salary Range */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
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
                      Salary Range
                    </span>
                    <span
                      style={{
                        fontSize: '0.9375rem',
                        fontWeight: 600,
                        color: 'var(--md-sys-color-on-surface)',
                      }}
                    >
                      {application.salary_range || '—'}
                    </span>
                  </div>

                  {/* Seniority */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
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
                        fontWeight: 600,
                        color: 'var(--md-sys-color-on-surface)',
                      }}
                    >
                      {application.seniority || '—'}
                    </span>
                  </div>

                  {/* Source Type */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
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
                        fontWeight: 600,
                        textTransform: 'capitalize',
                        color: 'var(--md-sys-color-on-surface)',
                      }}
                    >
                      {application.source_type || 'Manual'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Notes & Key Requirements Section */}
              <div>
                <h3
                  style={{
                    fontSize: '0.6875rem',
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
                      padding: '1.25rem',
                      borderRadius: '16px',
                      backgroundColor: 'var(--md-sys-color-surface-container)',
                      border: '1px solid var(--md-sys-color-outline-variant)',
                      whiteSpace: 'pre-wrap',
                      fontSize: '0.875rem',
                      lineHeight: 1.6,
                      color: 'var(--md-sys-color-on-surface)',
                    }}
                  >
                    {application.notes}
                  </div>
                ) : (
                  <div
                    style={{
                      padding: '1.25rem',
                      borderRadius: '16px',
                      backgroundColor: 'var(--md-sys-color-surface-container)',
                      border: '1px dashed var(--md-sys-color-outline-variant)',
                      textAlign: 'center',
                    }}
                  >
                    <p style={{ color: 'var(--md-sys-color-on-surface-variant)', fontSize: '0.8125rem' }}>
                      No notes recorded yet. Click <strong>Edit Job</strong> to add interview prep, key contacts, or notes.
                    </p>
                  </div>
                )}
              </div>

              {/* Preserved Job Description Accordion */}
              {application.raw_jd && (
                <div>
                  <div
                    onClick={() => setJdExpanded((prev) => !prev)}
                    style={{
                      padding: '1rem 1.25rem',
                      borderRadius: jdExpanded ? '16px 16px 0 0' : '16px',
                      backgroundColor: 'var(--md-sys-color-surface-container)',
                      border: '1px solid var(--md-sys-color-outline-variant)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span
                        className="material-symbols-outlined"
                        style={{
                          fontSize: '18px',
                          color: 'var(--md-sys-color-primary)',
                          transform: jdExpanded ? 'rotate(90deg)' : 'none',
                          transition: 'transform 0.2s ease',
                        }}
                      >
                        chevron_right
                      </span>
                      <span
                        style={{
                          fontFamily: 'var(--font-headline)',
                          fontWeight: 700,
                          fontSize: '0.875rem',
                          color: 'var(--md-sys-color-on-surface)',
                        }}
                      >
                        Preserved Job Description
                      </span>
                    </div>

                    <button
                      onClick={handleCopyJd}
                      style={{
                        padding: '0.3rem 0.65rem',
                        borderRadius: '8px',
                        border: '1px solid var(--md-sys-color-outline-variant)',
                        backgroundColor: 'var(--md-sys-color-surface-container-low)',
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
                      <span>{copiedJd ? 'Copied!' : 'Copy Text'}</span>
                    </button>
                  </div>

                  {jdExpanded && (
                    <div
                      style={{
                        padding: '1.25rem',
                        backgroundColor: 'var(--md-sys-color-surface-container-low)',
                        border: '1px solid var(--md-sys-color-outline-variant)',
                        borderTop: 'none',
                        borderRadius: '0 0 16px 16px',
                        maxHeight: '380px',
                        overflowY: 'auto',
                        whiteSpace: 'pre-wrap',
                        fontSize: '0.8125rem',
                        lineHeight: 1.6,
                        color: 'var(--md-sys-color-on-surface-variant)',
                        fontFamily: 'var(--font-body)',
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

        {/* ================= RIGHT COLUMN: SIDEBAR & TIMELINE ================= */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Card 1: Pipeline Status & Interactive Selector */}
          <div
            className="m3-card"
            style={{
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
              backgroundColor: 'var(--md-sys-color-surface-container-low)',
              borderRadius: '24px',
              border: '1px solid var(--md-sys-color-outline-variant)',
            }}
          >
            <div>
              <span
                style={{
                  fontSize: '0.6875rem',
                  fontFamily: 'var(--font-headline)',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: 'var(--md-sys-color-on-surface-variant)',
                  display: 'block',
                  marginBottom: '0.5rem',
                }}
              >
                Current Stage
              </span>

              {/* Interactive Status Selector Pill Dropdown */}
              <div style={{ position: 'relative', width: '100%' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.5rem 0.875rem',
                    borderRadius: '14px',
                    border: '1px solid var(--md-sys-color-outline-variant)',
                    backgroundColor: 'var(--md-sys-color-surface-container)',
                    cursor: 'pointer',
                  }}
                >
                  <StatusBadge status={application.status} size="medium" />
                  <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--md-sys-color-on-surface-variant)' }}>
                    unfold_more
                  </span>
                </div>

                <select
                  value={application.status}
                  onChange={(e) => handleStatusChange(e.target.value as ApplicationStatus)}
                  disabled={updatingStatus}
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
            </div>

            {/* Vertical Activity Timeline */}
            <div>
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
                Status History
              </span>

              {history.length === 0 ? (
                <p style={{ color: 'var(--md-sys-color-on-surface-variant)', fontSize: '0.8125rem' }}>
                  No status changes recorded.
                </p>
              ) : (
                <div className="m3-timeline">
                  {history.map((entry, idx) => (
                    <div key={entry.id || idx} className="m3-timeline-item">
                      <div className="m3-timeline-line" />
                      <div className="m3-timeline-dot">
                        <span
                          className="material-symbols-outlined"
                          style={{ fontSize: '13px', color: 'var(--md-sys-color-primary)' }}
                        >
                          radio_button_checked
                        </span>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', flex: 1 }}>
                        <StatusBadge status={entry.status} size="small" />
                        <span
                          style={{
                            fontSize: '0.75rem',
                            color: 'var(--md-sys-color-on-surface-variant)',
                          }}
                        >
                          {new Date(entry.changed_at).toLocaleString(undefined, {
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
          </div>

          {/* Card 2: Quick Management Actions */}
          <div
            className="m3-card"
            style={{
              padding: '1.25rem 1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
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
              }}
            >
              Management
            </span>

            {!isEditing && (
              <OutlinedButton icon="edit" onClick={() => setIsEditing(true)}>
                Edit Job Details
              </OutlinedButton>
            )}

            <button
              onClick={() => setDeleteDialogOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                height: '40px',
                padding: '0 20px',
                borderRadius: '9999px',
                backgroundColor: 'transparent',
                color: 'var(--md-sys-color-error)',
                border: '1px solid var(--md-sys-color-error)',
                fontFamily: 'var(--font-headline)',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--md-sys-color-error-container)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                delete
              </span>
              <span>Delete Job</span>
            </button>
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
              {deleting ? 'Deleting...' : 'Delete'}
            </FilledButton>
          </div>
        }
      >
        <p style={{ color: 'var(--md-sys-color-on-surface-variant)', lineHeight: 1.5 }}>
          Are you sure you want to delete <strong>{application.title}</strong> at{' '}
          <strong>{application.company}</strong>? All associated status history records will be permanently removed.
        </p>
      </Dialog>
    </div>
  );
}
