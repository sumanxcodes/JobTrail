'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Application, ApplicationStatus, StatusHistory, APPLICATION_STATUSES } from '@/lib/types/database';
import { StatusBadge } from '@/components/applications/StatusBadge';
import { Dialog } from '@/components/ui/Dialog';
import { TextField, TextArea } from '@/components/ui/TextField';
import { FilledButton, OutlinedButton, TextButton } from '@/components/ui/Button';
import { CircularProgress } from '@/components/ui/CircularProgress';

interface ApplicationDetailSheetProps {
  applicationId: string | null;
  open: boolean;
  onClose: () => void;
  onUpdated?: (updatedApp: Application) => void;
  onDeleted?: (deletedAppId: string) => void;
}

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
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch (_e) {
    return dateStr;
  }
}

export function ApplicationDetailSheet({
  applicationId,
  open,
  onClose,
  onUpdated,
  onDeleted,
}: ApplicationDetailSheetProps) {
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState<'overview' | 'jd' | 'timeline'>('overview');
  const [application, setApplication] = useState<Application | null>(null);
  const [history, setHistory] = useState<StatusHistory[]>([]);
  const [loading, setLoading] = useState(false);

  // Edit Metadata State
  const [isEditing, setIsEditing] = useState(false);
  const [company, setCompany] = useState('');
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [salaryRange, setSalaryRange] = useState('');
  const [seniority, setSeniority] = useState('');
  const [jobUrl, setJobUrl] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  // Quick Notes State
  const [notes, setNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesSavedSuccess, setNotesSavedSuccess] = useState(false);

  // Status Change Dialog State
  const [pendingStatus, setPendingStatus] = useState<ApplicationStatus | null>(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Delete Dialog State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Copy JD state
  const [copiedJd, setCopiedJd] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Load application and history concurrently when applicationId changes
  useEffect(() => {
    async function loadData() {
      if (!applicationId || !open) return;
      setLoading(true);
      setActiveTab('overview');
      setIsEditing(false);

      const [
        { data: appData, error: appError },
        { data: histData, error: histError },
      ] = await Promise.all([
        supabase.from('applications').select('*').eq('id', applicationId).single(),
        supabase
          .from('status_history')
          .select('*')
          .eq('application_id', applicationId)
          .order('changed_at', { ascending: false }),
      ]);

      if (appError || !appData) {
        console.error('Failed to load application in sheet:', appError);
        setFeedbackMsg({ text: 'Could not load application details.', type: 'error' });
      } else {
        setApplication(appData);
        setCompany(appData.company);
        setTitle(appData.title);
        setLocation(appData.location || '');
        setSalaryRange(appData.salary_range || '');
        setSeniority(appData.seniority || '');
        setJobUrl(appData.job_url || '');
        setNotes(appData.notes || '');
      }

      if (!histError && histData) {
        setHistory(histData);
      }

      setLoading(false);
    }

    loadData();
  }, [applicationId, open, supabase]);

  // Lock background scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open && !statusDialogOpen && !deleteDialogOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, statusDialogOpen, deleteDialogOpen, onClose]);

  // Status Change Execution
  const handleInitiateStatusChange = (newStatus: ApplicationStatus) => {
    if (!application || application.status === newStatus) return;
    setPendingStatus(newStatus);
    setStatusDialogOpen(true);
  };

  const handleConfirmStatusChange = async () => {
    if (!application || !pendingStatus) return;
    setUpdatingStatus(true);
    const targetStatus = pendingStatus;

    try {
      const now = new Date().toISOString();
      const { error: appError } = await supabase
        .from('applications')
        .update({ status: targetStatus, updated_at: now })
        .eq('id', application.id);

      if (appError) throw appError;

      const { data: histRow, error: histError } = await supabase
        .from('status_history')
        .insert({
          application_id: application.id,
          status: targetStatus,
          changed_at: now,
        })
        .select()
        .single();

      if (histError) console.error('Status history error:', histError);

      const updated = { ...application, status: targetStatus, updated_at: now };
      setApplication(updated);
      if (histRow) setHistory((prev) => [histRow as StatusHistory, ...prev]);

      setStatusDialogOpen(false);
      setPendingStatus(null);
      setFeedbackMsg({ text: `Status updated to "${targetStatus}".`, type: 'success' });
      setTimeout(() => setFeedbackMsg(null), 3000);
      onUpdated?.(updated);
    } catch (err: any) {
      console.error('Status update error:', err);
      setFeedbackMsg({ text: err.message || 'Failed to update status.', type: 'error' });
      setTimeout(() => setFeedbackMsg(null), 4000);
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Quick Notes Save
  const handleSaveNotes = async () => {
    if (!application) return;
    setSavingNotes(true);
    try {
      const { error } = await supabase
        .from('applications')
        .update({ notes: notes.trim() || null, updated_at: new Date().toISOString() })
        .eq('id', application.id);

      if (error) throw error;

      const updated = { ...application, notes: notes.trim() || null };
      setApplication(updated);
      setNotesSavedSuccess(true);
      setTimeout(() => setNotesSavedSuccess(false), 2500);
      onUpdated?.(updated);
    } catch (err: any) {
      console.error('Save notes error:', err);
      setFeedbackMsg({ text: err.message || 'Failed to save notes.', type: 'error' });
    } finally {
      setSavingNotes(false);
    }
  };

  // Save Metadata Form
  const handleSaveMetadata = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!application) return;
    if (!company.trim() || !title.trim()) {
      setFeedbackMsg({ text: 'Company name and Job Title are required.', type: 'error' });
      return;
    }

    setSavingEdit(true);
    try {
      const payload = {
        company: company.trim(),
        title: title.trim(),
        location: location.trim() || null,
        salary_range: salaryRange.trim() || null,
        seniority: seniority.trim() || null,
        job_url: jobUrl.trim() || null,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('applications')
        .update(payload)
        .eq('id', application.id);

      if (error) throw error;

      const updated = { ...application, ...payload };
      setApplication(updated);
      setIsEditing(false);
      setFeedbackMsg({ text: 'Job details updated successfully.', type: 'success' });
      setTimeout(() => setFeedbackMsg(null), 3000);
      onUpdated?.(updated);
    } catch (err: any) {
      console.error('Save metadata error:', err);
      setFeedbackMsg({ text: err.message || 'Failed to save changes.', type: 'error' });
    } finally {
      setSavingEdit(false);
    }
  };

  // Delete Execution
  const handleConfirmDelete = async () => {
    if (!application) return;
    setDeleting(true);
    try {
      const { error } = await supabase
        .from('applications')
        .delete()
        .eq('id', application.id);

      if (error) throw error;

      setDeleteDialogOpen(false);
      onDeleted?.(application.id);
      onClose();
    } catch (err: any) {
      console.error('Delete error:', err);
      setFeedbackMsg({ text: err.message || 'Failed to delete application.', type: 'error' });
    } finally {
      setDeleting(false);
    }
  };

  const handleCopyJd = () => {
    if (!application?.raw_jd) return;
    navigator.clipboard.writeText(application.raw_jd);
    setCopiedJd(true);
    setTimeout(() => setCopiedJd(false), 2000);
  };

  if (!open) return null;

  return (
    <>
      {/* M3 Scrim Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.45)',
          backdropFilter: 'blur(3px)',
          zIndex: 9998,
          animation: 'fadeIn 0.2s cubic-bezier(0.2, 0, 0, 1) forwards',
        }}
      />

      {/* M3 Standard Modal Side Sheet (500px, 28px Leading Edge Radius) */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="m3-detail-title"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: 'min(500px, 100vw)',
          height: '100vh',
          backgroundColor: 'var(--md-sys-color-surface-container-low)',
          borderLeft: '1px solid var(--md-sys-color-outline-variant)',
          borderTopLeftRadius: '28px',
          borderBottomLeftRadius: '28px',
          boxShadow: '-8px 0 32px rgba(0, 0, 0, 0.15)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideInRight 0.3s cubic-bezier(0.05, 0.7, 0.1, 1.0) forwards',
          transform: 'translateZ(0)',
          willChange: 'transform',
          overflow: 'hidden',
        }}
      >
        {/* M3 Side Sheet Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--md-sys-color-outline-variant)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            backgroundColor: 'var(--md-sys-color-surface-container-low)',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', overflow: 'hidden' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '14px',
                backgroundColor: 'var(--md-sys-color-surface-container-high)',
                color: 'var(--md-sys-color-primary)',
                fontFamily: 'var(--font-headline)',
                fontWeight: 800,
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                border: '1px solid var(--md-sys-color-outline-variant)',
                boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
              }}
            >
              {application ? getInitials(application.company) : 'JT'}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', gap: '0.1rem' }}>
              <span
                style={{
                  fontSize: '0.8125rem',
                  fontFamily: 'var(--font-headline)',
                  fontWeight: 600,
                  color: 'var(--md-sys-color-on-surface-variant)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {application?.company || 'Loading...'}
              </span>
              <h2
                id="m3-detail-title"
                style={{
                  margin: 0,
                  fontSize: '1.1875rem',
                  fontFamily: 'var(--font-headline)',
                  fontWeight: 800,
                  color: 'var(--md-sys-color-on-surface)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.25,
                }}
              >
                {application?.title || 'Job Details'}
              </h2>
            </div>
          </div>

          {/* M3 Header Icon Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexShrink: 0 }}>
            {application && (
              <Link
                href={`/applications/${application.id}`}
                title="Open dedicated page"
                aria-label="Open dedicated full page"
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--md-sys-color-on-surface-variant)',
                  textDecoration: 'none',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--md-sys-color-surface-container-high)';
                  e.currentTarget.style.color = 'var(--md-sys-color-on-surface)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--md-sys-color-on-surface-variant)';
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                  open_in_new
                </span>
              </Link>
            )}

            <button
              onClick={onClose}
              aria-label="Close details"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                border: 'none',
                backgroundColor: 'transparent',
                color: 'var(--md-sys-color-on-surface-variant)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--md-sys-color-surface-container-high)';
                e.currentTarget.style.color = 'var(--md-sys-color-on-surface)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--md-sys-color-on-surface-variant)';
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                close
              </span>
            </button>
          </div>
        </div>

        {/* M3 Primary Tabs Bar */}
        <div
          style={{
            display: 'flex',
            backgroundColor: 'var(--md-sys-color-surface-container-low)',
            borderBottom: '1px solid var(--md-sys-color-outline-variant)',
            padding: '0 1.5rem',
            gap: '0.75rem',
            flexShrink: 0,
            overflowX: 'auto',
          }}
        >
          {[
            { key: 'overview', label: 'Overview', icon: 'space_dashboard' },
            { key: 'jd', label: 'Job Description', icon: 'description', count: application?.raw_jd ? '✓' : undefined },
            { key: 'timeline', label: 'Timeline', icon: 'history', count: history.length > 0 ? history.length : undefined },
          ].map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.75rem 0.5rem',
                  border: 'none',
                  borderBottom: isActive
                    ? '3px solid var(--md-sys-color-primary)'
                    : '3px solid transparent',
                  backgroundColor: 'transparent',
                  color: isActive
                    ? 'var(--md-sys-color-primary)'
                    : 'var(--md-sys-color-on-surface-variant)',
                  fontFamily: 'var(--font-headline)',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                  outline: 'none',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                  {tab.icon}
                </span>
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    style={{
                      fontSize: '0.6875rem',
                      padding: '0.1rem 0.45rem',
                      borderRadius: '9999px',
                      backgroundColor: isActive
                        ? 'var(--md-sys-color-primary-container)'
                        : 'var(--md-sys-color-surface-container-highest)',
                      color: isActive
                        ? 'var(--md-sys-color-on-primary-container)'
                        : 'var(--md-sys-color-on-surface-variant)',
                      fontWeight: 700,
                    }}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Feedback Alert Toast */}
        {feedbackMsg && (
          <div
            style={{
              padding: '0.75rem 1.25rem',
              backgroundColor:
                feedbackMsg.type === 'success'
                  ? 'var(--md-sys-color-primary-container)'
                  : 'var(--md-sys-color-error-container)',
              color:
                feedbackMsg.type === 'success'
                  ? 'var(--md-sys-color-on-primary-container)'
                  : 'var(--md-sys-color-on-error-container)',
              fontSize: '0.875rem',
              fontFamily: 'var(--font-headline)',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              animation: 'fadeIn 0.2s ease',
            }}
          >
            <span>{feedbackMsg.text}</span>
            <button
              onClick={() => setFeedbackMsg(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                close
              </span>
            </button>
          </div>
        )}

        {/* Scrollable Content Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '220px' }}>
              <CircularProgress />
            </div>
          ) : !application ? (
            <div style={{ textAlign: 'center', color: 'var(--md-sys-color-on-surface-variant)', padding: '2rem 0' }}>
              Application not found.
            </div>
          ) : (
            <>
              {/* TAB 1: OVERVIEW */}
              {activeTab === 'overview' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {/* Card 1: Pipeline Progression Funnel (Linear Stepper + Exit States) */}
                  <div
                    style={{
                      padding: '1.25rem 1.5rem',
                      backgroundColor: 'var(--md-sys-color-surface-container)',
                      borderRadius: '20px',
                      border: '1px solid var(--md-sys-color-outline-variant)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.875rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span
                        style={{
                          fontSize: '0.6875rem',
                          fontFamily: 'var(--font-headline)',
                          fontWeight: 700,
                          color: 'var(--md-sys-color-primary)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.08em',
                        }}
                      >
                        Pipeline Progression
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--md-sys-color-on-surface-variant)' }}>
                        Stage: <strong style={{ textTransform: 'capitalize', color: 'var(--md-sys-color-on-surface)' }}>{application.status}</strong>
                      </span>
                    </div>

                    {/* Primary Linear Stages Grid */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4, 1fr)',
                        gap: '0.35rem',
                        padding: '0.25rem',
                        backgroundColor: 'var(--md-sys-color-surface-container-low)',
                        borderRadius: '12px',
                        border: '1px solid var(--md-sys-color-outline-variant)',
                      }}
                    >
                      {[
                        { value: 'draft', label: 'Draft' },
                        { value: 'applied', label: 'Applied' },
                        { value: 'interviewing', label: 'Interview' },
                        { value: 'offer', label: 'Offer' },
                      ].map((stage) => {
                        const isCurrent = application.status === stage.value;
                        return (
                          <button
                            key={stage.value}
                            onClick={() => handleInitiateStatusChange(stage.value as ApplicationStatus)}
                            disabled={isCurrent}
                            style={{
                              padding: '0.5rem 0.25rem',
                              borderRadius: '9px',
                              border: 'none',
                              backgroundColor: isCurrent
                                ? 'var(--md-sys-color-secondary-container)'
                                : 'transparent',
                              color: isCurrent
                                ? 'var(--md-sys-color-on-secondary-container)'
                                : 'var(--md-sys-color-on-surface-variant)',
                              fontFamily: 'var(--font-headline)',
                              fontWeight: isCurrent ? 700 : 500,
                              fontSize: '0.8125rem',
                              cursor: isCurrent ? 'default' : 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.25rem',
                              transition: 'all 0.15s ease',
                              outline: 'none',
                            }}
                            onMouseEnter={(e) => {
                              if (!isCurrent) {
                                e.currentTarget.style.backgroundColor = 'var(--md-sys-color-surface-container-high)';
                                e.currentTarget.style.color = 'var(--md-sys-color-on-surface)';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!isCurrent) {
                                e.currentTarget.style.backgroundColor = 'transparent';
                                e.currentTarget.style.color = 'var(--md-sys-color-on-surface-variant)';
                              }
                            }}
                          >
                            {isCurrent && (
                              <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>
                                check
                              </span>
                            )}
                            <span>{stage.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Secondary Terminal Exit States */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.25rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--md-sys-color-on-surface-variant)' }}>
                        Terminal outcomes:
                      </span>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {[
                          { value: 'rejected', label: 'Rejected', icon: 'cancel' },
                          { value: 'withdrawn', label: 'Withdrawn', icon: 'remove_circle_outline' },
                        ].map((term) => {
                          const isCurrent = application.status === term.value;
                          return (
                            <button
                              key={term.value}
                              onClick={() => handleInitiateStatusChange(term.value as ApplicationStatus)}
                              disabled={isCurrent}
                              style={{
                                padding: '0.25rem 0.625rem',
                                borderRadius: '9999px',
                                border: isCurrent
                                  ? '1px solid transparent'
                                  : '1px solid var(--md-sys-color-outline-variant)',
                                backgroundColor: isCurrent
                                  ? 'var(--md-sys-color-error-container)'
                                  : 'transparent',
                                color: isCurrent
                                  ? 'var(--md-sys-color-on-error-container)'
                                  : 'var(--md-sys-color-on-surface-variant)',
                                fontFamily: 'var(--font-headline)',
                                fontWeight: isCurrent ? 700 : 500,
                                fontSize: '0.75rem',
                                cursor: isCurrent ? 'default' : 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                                transition: 'all 0.15s ease',
                              }}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>
                                {term.icon}
                              </span>
                              <span>{term.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Core Job Specifications (Clean Key-Value Rows) */}
                  <div
                    style={{
                      padding: '1.25rem 1.5rem',
                      backgroundColor: 'var(--md-sys-color-surface-container)',
                      borderRadius: '20px',
                      border: '1px solid var(--md-sys-color-outline-variant)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span
                        style={{
                          fontSize: '0.6875rem',
                          fontFamily: 'var(--font-headline)',
                          fontWeight: 700,
                          color: 'var(--md-sys-color-primary)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.08em',
                        }}
                      >
                        Job Specifications
                      </span>
                      <button
                        onClick={() => setIsEditing(!isEditing)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--md-sys-color-primary)',
                          fontFamily: 'var(--font-headline)',
                          fontWeight: 700,
                          fontSize: '0.8125rem',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '8px',
                          transition: 'background-color 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--md-sys-color-surface-container-high)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                          {isEditing ? 'close' : 'edit'}
                        </span>
                        <span>{isEditing ? 'Cancel' : 'Edit'}</span>
                      </button>
                    </div>

                    {isEditing ? (
                      <form onSubmit={handleSaveMetadata} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <TextField
                          label="Company"
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
                          placeholder="e.g. Remote, Melbourne, VIC"
                          leadingIcon="location_on"
                        />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                          <TextField
                            label="Salary Range"
                            value={salaryRange}
                            onValueChange={setSalaryRange}
                            placeholder="e.g. $120k - $140k"
                            leadingIcon="payments"
                          />
                          <TextField
                            label="Seniority"
                            value={seniority}
                            onValueChange={setSeniority}
                            placeholder="e.g. Mid, Senior"
                            leadingIcon="trending_up"
                          />
                        </div>
                        <TextField
                          label="Job Posting URL"
                          type="url"
                          value={jobUrl}
                          onValueChange={setJobUrl}
                          placeholder="https://..."
                          leadingIcon="link"
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--md-sys-color-outline-variant)' }}>
                          <button
                            type="button"
                            onClick={() => setDeleteDialogOpen(true)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--md-sys-color-error)',
                              fontFamily: 'var(--font-headline)',
                              fontWeight: 600,
                              fontSize: '0.8125rem',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              padding: '0.4rem 0.6rem',
                              borderRadius: '8px',
                            }}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                              delete
                            </span>
                            <span>Delete Job</span>
                          </button>

                          <FilledButton type="submit" disabled={savingEdit}>
                            {savingEdit ? 'Saving...' : 'Save Changes'}
                          </FilledButton>
                        </div>
                      </form>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                        {/* Location Row */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                          <span
                            className="material-symbols-outlined"
                            style={{ fontSize: '18px', color: 'var(--md-sys-color-primary)', marginTop: '0.1rem', flexShrink: 0 }}
                          >
                            location_on
                          </span>
                          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                            <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--md-sys-color-on-surface-variant)' }}>
                              Location
                            </span>
                            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--md-sys-color-on-surface)', lineHeight: 1.4 }}>
                              {application.location || 'Not Specified'}
                            </span>
                          </div>
                        </div>

                        {/* Salary Row */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                          <span
                            className="material-symbols-outlined"
                            style={{ fontSize: '18px', color: 'var(--md-sys-color-primary)', marginTop: '0.1rem', flexShrink: 0 }}
                          >
                            payments
                          </span>
                          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                            <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--md-sys-color-on-surface-variant)' }}>
                              Compensation & Salary
                            </span>
                            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--md-sys-color-on-surface)', lineHeight: 1.4 }}>
                              {application.salary_range || 'Not Specified'}
                            </span>
                          </div>
                        </div>

                        {/* Seniority & Source Row */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', paddingTop: '0.25rem', borderTop: '1px solid var(--md-sys-color-outline-variant)' }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem' }}>
                            <span
                              className="material-symbols-outlined"
                              style={{ fontSize: '18px', color: 'var(--md-sys-color-primary)', marginTop: '0.1rem', flexShrink: 0 }}
                            >
                              trending_up
                            </span>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--md-sys-color-on-surface-variant)' }}>
                                Seniority
                              </span>
                              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--md-sys-color-on-surface)' }}>
                                {application.seniority || 'Not Specified'}
                              </span>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem' }}>
                            <span
                              className="material-symbols-outlined"
                              style={{ fontSize: '18px', color: 'var(--md-sys-color-primary)', marginTop: '0.1rem', flexShrink: 0 }}
                            >
                              link
                            </span>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--md-sys-color-on-surface-variant)' }}>
                                Posting
                              </span>
                              {application.job_url ? (
                                <a
                                  href={application.job_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  style={{
                                    fontSize: '0.875rem',
                                    color: 'var(--md-sys-color-primary)',
                                    textDecoration: 'none',
                                    fontWeight: 700,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.2rem',
                                  }}
                                >
                                  <span>View Link</span>
                                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                                    open_in_new
                                  </span>
                                </a>
                              ) : (
                                <span style={{ fontSize: '0.875rem', color: 'var(--md-sys-color-on-surface-variant)' }}>
                                  None
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card 3: Notes & Context (Integrated Document Pad) */}
                  <div
                    style={{
                      padding: '1.25rem 1.5rem',
                      backgroundColor: 'var(--md-sys-color-surface-container)',
                      borderRadius: '20px',
                      border: '1px solid var(--md-sys-color-outline-variant)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.875rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span
                        style={{
                          fontSize: '0.6875rem',
                          fontFamily: 'var(--font-headline)',
                          fontWeight: 700,
                          color: 'var(--md-sys-color-primary)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.08em',
                        }}
                      >
                        Interview Notes & Prep
                      </span>
                      {notesSavedSuccess && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--md-sys-color-primary)', fontWeight: 700 }}>
                          ✓ Notes Saved
                        </span>
                      )}
                    </div>

                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={5}
                      placeholder="Add recruiter contacts, interview dates, questions, or referral notes here..."
                      style={{
                        width: '100%',
                        padding: '0.875rem 1rem',
                        borderRadius: '12px',
                        border: '1px solid var(--md-sys-color-outline-variant)',
                        backgroundColor: 'var(--md-sys-color-surface-container-low)',
                        color: 'var(--md-sys-color-on-surface)',
                        fontFamily: 'var(--font-body)',
                        fontSize: '0.875rem',
                        lineHeight: 1.6,
                        resize: 'vertical',
                        outline: 'none',
                        transition: 'border-color 0.2s ease, background-color 0.2s ease',
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = 'var(--md-sys-color-primary)';
                        e.target.style.backgroundColor = 'var(--md-sys-color-surface-container-lowest)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'var(--md-sys-color-outline-variant)';
                        e.target.style.backgroundColor = 'var(--md-sys-color-surface-container-low)';
                      }}
                    />

                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <OutlinedButton onClick={handleSaveNotes} disabled={savingNotes}>
                        {savingNotes ? 'Saving...' : 'Save Notes'}
                      </OutlinedButton>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: JOB DESCRIPTION */}
              {activeTab === 'jd' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--md-sys-color-on-surface-variant)', fontWeight: 600 }}>
                      Original Posting Text
                    </span>
                    {application.raw_jd && (
                      <button
                        onClick={handleCopyJd}
                        style={{
                          background: 'none',
                          border: '1px solid var(--md-sys-color-outline-variant)',
                          borderRadius: '8px',
                          padding: '0.35rem 0.75rem',
                          color: 'var(--md-sys-color-primary)',
                          fontFamily: 'var(--font-headline)',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>
                          {copiedJd ? 'check' : 'content_copy'}
                        </span>
                        <span>{copiedJd ? 'Copied' : 'Copy Text'}</span>
                      </button>
                    )}
                  </div>

                  {application.raw_jd ? (
                    <div
                      style={{
                        padding: '1.25rem',
                        backgroundColor: 'var(--md-sys-color-surface-container)',
                        borderRadius: '20px',
                        border: '1px solid var(--md-sys-color-outline-variant)',
                        fontFamily: 'var(--font-body)',
                        fontSize: '0.875rem',
                        lineHeight: 1.65,
                        color: 'var(--md-sys-color-on-surface)',
                        whiteSpace: 'pre-wrap',
                        maxHeight: '65vh',
                        overflowY: 'auto',
                      }}
                    >
                      {application.raw_jd}
                    </div>
                  ) : (
                    <div
                      style={{
                        textAlign: 'center',
                        padding: '3rem 1.5rem',
                        backgroundColor: 'var(--md-sys-color-surface-container)',
                        borderRadius: '20px',
                        color: 'var(--md-sys-color-on-surface-variant)',
                        border: '1px solid var(--md-sys-color-outline-variant)',
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '36px', opacity: 0.5, marginBottom: '0.5rem' }}>
                        article
                      </span>
                      <p style={{ margin: 0, fontSize: '0.875rem' }}>No full job description saved for this role.</p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: TIMELINE HISTORY */}
              {activeTab === 'timeline' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <span
                    style={{
                      fontSize: '0.6875rem',
                      fontFamily: 'var(--font-headline)',
                      fontWeight: 700,
                      color: 'var(--md-sys-color-primary)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                    }}
                  >
                    Application Audit Trail ({history.length} events)
                  </span>

                  {history.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--md-sys-color-on-surface-variant)' }}>
                      No history recorded yet.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', position: 'relative' }}>
                      {history.map((event, idx) => (
                        <div
                          key={event.id}
                          style={{
                            display: 'flex',
                            gap: '0.875rem',
                            alignItems: 'flex-start',
                            padding: '0.875rem 1rem',
                            backgroundColor: 'var(--md-sys-color-surface-container)',
                            borderRadius: '16px',
                            border: '1px solid var(--md-sys-color-outline-variant)',
                          }}
                        >
                          <div
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '50%',
                              backgroundColor: idx === 0 ? 'var(--md-sys-color-primary-container)' : 'var(--md-sys-color-surface-container-highest)',
                              color: idx === 0 ? 'var(--md-sys-color-on-primary-container)' : 'var(--md-sys-color-on-surface-variant)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                              {idx === 0 ? 'check_circle' : 'schedule'}
                            </span>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--md-sys-color-on-surface)' }}>
                                Stage updated to
                              </span>
                              <StatusBadge status={event.status} size="small" />
                            </div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--md-sys-color-on-surface-variant)' }}>
                              {formatTimelineDate(event.changed_at)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </aside>

      {/* Confirmation Dialog: Status Change */}
      <Dialog
        open={statusDialogOpen}
        onClose={() => setStatusDialogOpen(false)}
        headline="Update Application Stage?"
        icon="sync_alt"
        actions={
          <>
            <button
              onClick={() => setStatusDialogOpen(false)}
              disabled={updatingStatus}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--md-sys-color-on-surface-variant)',
                fontFamily: 'var(--font-headline)',
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: 'pointer',
                padding: '0.5rem 1rem',
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
              }}
            >
              {updatingStatus ? 'Updating...' : 'Confirm Stage Change'}
            </button>
          </>
        }
      >
        <p style={{ margin: 0, color: 'var(--md-sys-color-on-surface-variant)' }}>
          Change stage from{' '}
          <strong>{application?.status}</strong> to{' '}
          <strong>{pendingStatus}</strong>? This will create a new entry in your audit timeline.
        </p>
      </Dialog>

      {/* Confirmation Dialog: Delete Application */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        headline="Delete Application?"
        icon="delete_forever"
        destructive={true}
        actions={
          <>
            <button
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleting}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--md-sys-color-on-surface-variant)',
                fontFamily: 'var(--font-headline)',
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: 'pointer',
                padding: '0.5rem 1rem',
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmDelete}
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
              }}
            >
              {deleting ? 'Deleting...' : 'Delete Application'}
            </button>
          </>
        }
      >
        <p style={{ margin: 0, color: 'var(--md-sys-color-on-surface-variant)' }}>
          Are you sure you want to permanently delete{' '}
          <strong>{application?.title}</strong> at{' '}
          <strong>{application?.company}</strong>? This action cannot be undone.
        </p>
      </Dialog>
    </>
  );
}
