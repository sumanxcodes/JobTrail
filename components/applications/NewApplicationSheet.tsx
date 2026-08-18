'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { TextField, TextArea } from '@/components/ui/TextField';
import { FilledButton, OutlinedButton, TextButton } from '@/components/ui/Button';
import { CircularProgress } from '@/components/ui/CircularProgress';
import { Application, ParseStatus, SourceType } from '@/lib/types/database';

interface NewApplicationSheetProps {
  open: boolean;
  onClose: () => void;
  onCreated: (newApp: Application) => void;
}

export function NewApplicationSheet({ open, onClose, onCreated }: NewApplicationSheetProps) {
  const [inputMode, setInputMode] = useState<'link' | 'paste' | 'manual'>('link');
  const [linkInput, setLinkInput] = useState('');
  const [pasteInput, setPasteInput] = useState('');
  const [parsing, setParsing] = useState(false);
  const [parseMessage, setParseMessage] = useState<string | null>(null);
  const [parseMessageType, setParseMessageType] = useState<'info' | 'error' | 'success'>('info');

  // Form Fields
  const [company, setCompany] = useState('');
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [salaryRange, setSalaryRange] = useState('');
  const [seniority, setSeniority] = useState('');
  const [jobUrl, setJobUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [rawJd, setRawJd] = useState('');
  const [sourceType, setSourceType] = useState<SourceType>('link');
  const [parseStatus, setParseStatus] = useState<ParseStatus | null>(null);

  const [isReviewing, setIsReviewing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const supabase = createClient();

  // Prevent background scrolling when side sheet is open
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
      if (e.key === 'Escape' && open) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  const handleReset = () => {
    setInputMode('link');
    setLinkInput('');
    setPasteInput('');
    setCompany('');
    setTitle('');
    setLocation('');
    setSalaryRange('');
    setSeniority('');
    setJobUrl('');
    setNotes('');
    setRawJd('');
    setParseMessage(null);
    setValidationError(null);
    setIsReviewing(false);
    setSaving(false);
    setParsing(false);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleParse = async () => {
    const content = inputMode === 'link' ? linkInput.trim() : pasteInput.trim();
    if (!content) {
      setParseMessage(
        inputMode === 'link'
          ? 'Please enter a valid job URL.'
          : 'Please paste the job description text.'
      );
      setParseMessageType('error');
      return;
    }

    setParsing(true);
    setParseMessage('AI is extracting company, role, location, salary, and requirements...');
    setParseMessageType('info');

    try {
      const response = await fetch('/api/parse-jd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: inputMode, content }),
      });

      const data = await response.json();

      if (!response.ok && data?.error) {
        throw new Error(data.error);
      }

      if (data?.status === 'rate_limited') {
        setParseMessage('Daily extraction limit reached. You can add details manually.');
        setParseMessageType('error');
        setInputMode('manual');
        setRawJd(content);
        if (inputMode === 'link') setJobUrl(content);
        setIsReviewing(true);
        return;
      }

      if (data?.status === 'failed') {
        if (data.reason === 'fetch_failed') {
          setParseMessage("Couldn't read URL — paste the job text directly instead.");
          setInputMode('paste');
        } else if (data.error_message) {
          setParseMessage(`AI Engine: ${data.error_message}`);
          setInputMode('manual');
        } else {
          setParseMessage('AI extraction was unable to parse structured fields. Fill in details manually.');
          setInputMode('manual');
        }
        setParseMessageType('error');
        setRawJd(data.raw_jd || content);
        setParseStatus('failed');
        setSourceType(inputMode);
        setIsReviewing(true);
        return;
      }

      // Success
      const extracted = data?.extracted || {};
      setCompany(extracted.company || '');
      setTitle(extracted.title || '');
      setLocation(extracted.location || '');
      setSalaryRange(extracted.salary_range || '');
      setSeniority(extracted.seniority || '');
      setJobUrl(extracted.job_url || (inputMode === 'link' ? content : ''));
      if (extracted.requirements_summary) {
        setNotes(extracted.requirements_summary);
      }
      setRawJd(data?.raw_jd || content);
      setSourceType(inputMode);
      setParseStatus(data?.status || 'success');
      setIsReviewing(true);
      setParseMessage(null);
    } catch (err: any) {
      console.error('AI Parser error:', err);
      setParseMessage('Could not connect to AI parser. Please enter details manually.');
      setParseMessageType('error');
      setRawJd(content);
      if (inputMode === 'link') setJobUrl(content);
      setIsReviewing(true);
    } finally {
      setParsing(false);
    }
  };

  const handleSave = async () => {
    if (!company.trim() || !title.trim()) {
      setValidationError('Company name and Job title are required.');
      return;
    }

    setSaving(true);
    setValidationError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('User is not authenticated.');
      }

      // 1. Insert application row
      const { data: appData, error: appError } = await supabase
        .from('applications')
        .insert({
          user_id: user.id,
          company: company.trim(),
          title: title.trim(),
          location: location.trim() || null,
          salary_range: salaryRange.trim() || null,
          seniority: seniority.trim() || null,
          job_url: jobUrl.trim() || null,
          raw_jd: rawJd ? rawJd.slice(0, 50000) : null,
          parse_status: parseStatus || (inputMode === 'manual' ? 'manual' : 'partial'),
          status: 'draft',
          source_type: inputMode === 'manual' ? 'manual' : sourceType,
          notes: notes.trim() || null,
        })
        .select()
        .single();

      if (appError) throw appError;

      // 2. Insert initial status_history row
      const { error: histError } = await supabase.from('status_history').insert({
        application_id: appData.id,
        status: 'draft',
      });

      if (histError) console.error('Status history error:', histError);

      onCreated(appData as Application);
      handleClose();
    } catch (err: any) {
      console.error('Save error:', err);
      setValidationError(err.message || 'Failed to save application.');
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <>
      {/* M3 Scrim Overlay */}
      <div
        onClick={handleClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.45)',
          backdropFilter: 'blur(3px)',
          zIndex: 9998,
          animation: 'fadeIn 0.2s cubic-bezier(0.2, 0, 0, 1) forwards',
        }}
      />

      {/* M3 Standard Modal Side Sheet (480px, 28px Leading Radius, surface-container-low) */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="m3-sidesheet-title"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: 'min(480px, 100vw)',
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
        {/* Side Sheet Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--md-sys-color-outline-variant)',
            flexShrink: 0,
          }}
        >
          <div>
            <h2
              id="m3-sidesheet-title"
              style={{
                fontSize: '1.25rem',
                fontFamily: 'var(--font-headline)',
                fontWeight: 800,
                color: 'var(--md-sys-color-on-surface)',
                letterSpacing: '-0.02em',
                marginBottom: '0.15rem',
              }}
            >
              {isReviewing ? 'Review Application' : 'Add New Application'}
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--md-sys-color-on-surface-variant)', margin: 0 }}>
              {isReviewing
                ? 'Verify and adjust extracted fields before saving.'
                : 'Extract details automatically with AI or enter manually.'}
            </p>
          </div>

          <button
            onClick={handleClose}
            aria-label="Close side sheet"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              border: 'none',
              backgroundColor: 'transparent',
              color: 'var(--md-sys-color-on-surface-variant)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--md-sys-color-surface-container)';
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

        {/* Scrollable Side Sheet Body */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
          }}
        >
          {/* M3 Segmented Button Controller */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.35rem',
              padding: '0.25rem',
              borderRadius: '16px',
              backgroundColor: 'var(--md-sys-color-surface-container)',
              border: '1px solid var(--md-sys-color-outline-variant)',
            }}
          >
            <button
              onClick={() => {
                setInputMode('link');
                setIsReviewing(false);
              }}
              style={{
                padding: '0.5rem 0.25rem',
                borderRadius: '12px',
                border: 'none',
                backgroundColor:
                  inputMode === 'link' && !isReviewing
                    ? 'var(--md-sys-color-secondary-container)'
                    : 'transparent',
                color:
                  inputMode === 'link' && !isReviewing
                    ? 'var(--md-sys-color-on-secondary-container)'
                    : 'var(--md-sys-color-on-surface-variant)',
                fontFamily: 'var(--font-headline)',
                fontSize: '0.8125rem',
                fontWeight: inputMode === 'link' && !isReviewing ? 700 : 500,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.3rem',
                transition: 'all 0.15s ease',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                link
              </span>
              <span>Paste Link</span>
            </button>

            <button
              onClick={() => {
                setInputMode('paste');
                setIsReviewing(false);
              }}
              style={{
                padding: '0.5rem 0.25rem',
                borderRadius: '12px',
                border: 'none',
                backgroundColor:
                  inputMode === 'paste' && !isReviewing
                    ? 'var(--md-sys-color-secondary-container)'
                    : 'transparent',
                color:
                  inputMode === 'paste' && !isReviewing
                    ? 'var(--md-sys-color-on-secondary-container)'
                    : 'var(--md-sys-color-on-surface-variant)',
                fontFamily: 'var(--font-headline)',
                fontSize: '0.8125rem',
                fontWeight: inputMode === 'paste' && !isReviewing ? 700 : 500,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.3rem',
                transition: 'all 0.15s ease',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                description
              </span>
              <span>Paste Text</span>
            </button>

            <button
              onClick={() => {
                setInputMode('manual');
                setIsReviewing(false);
              }}
              style={{
                padding: '0.5rem 0.25rem',
                borderRadius: '12px',
                border: 'none',
                backgroundColor:
                  inputMode === 'manual' && !isReviewing
                    ? 'var(--md-sys-color-secondary-container)'
                    : 'transparent',
                color:
                  inputMode === 'manual' && !isReviewing
                    ? 'var(--md-sys-color-on-secondary-container)'
                    : 'var(--md-sys-color-on-surface-variant)',
                fontFamily: 'var(--font-headline)',
                fontSize: '0.8125rem',
                fontWeight: inputMode === 'manual' && !isReviewing ? 700 : 500,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.3rem',
                transition: 'all 0.15s ease',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                edit
              </span>
              <span>Manual</span>
            </button>
          </div>

          {/* Feedback Status / Error Banner */}
          {parseMessage && (
            <div
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '14px',
                backgroundColor:
                  parseMessageType === 'error'
                    ? 'var(--md-sys-color-error-container)'
                    : 'var(--md-sys-color-secondary-container)',
                color:
                  parseMessageType === 'error'
                    ? 'var(--md-sys-color-on-error-container)'
                    : 'var(--md-sys-color-on-secondary-container)',
                fontSize: '0.8125rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.625rem',
                fontWeight: 600,
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                {parseMessageType === 'error' ? 'error_outline' : 'info'}
              </span>
              <span>{parseMessage}</span>
            </div>
          )}

          {/* Mode 1: Paste Link */}
          {inputMode === 'link' && !isReviewing && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <TextField
                label="Job Posting URL"
                placeholder="https://jobs.lever.co/company/job-id..."
                type="url"
                value={linkInput}
                onValueChange={setLinkInput}
                leadingIcon="link"
              />

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.75rem',
                  color: 'var(--md-sys-color-on-surface-variant)',
                  lineHeight: 1.3,
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: '16px', color: 'var(--md-sys-color-primary)' }}
                >
                  info
                </span>
                <span>Supports public links (LinkedIn, Greenhouse, Lever, Ashby, Workable, etc.).</span>
              </div>

              {/* AI Pipeline Card */}
              <div
                className="m3-card"
                style={{
                  padding: '1.25rem',
                  borderRadius: '16px',
                  backgroundColor: 'var(--md-sys-color-surface-container)',
                  border: '1px solid var(--md-sys-color-outline-variant)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: '18px', color: 'var(--md-sys-color-primary)' }}
                  >
                    auto_awesome
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-headline)',
                      fontSize: '0.8125rem',
                      fontWeight: 700,
                      color: 'var(--md-sys-color-on-surface)',
                    }}
                  >
                    Automated AI Extraction
                  </span>
                </div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--md-sys-color-on-surface-variant)', lineHeight: 1.5, margin: 0 }}>
                  Extracts and structures all core fields in seconds:
                </p>
                <ul
                  style={{
                    margin: 0,
                    paddingLeft: '1.25rem',
                    fontSize: '0.8125rem',
                    color: 'var(--md-sys-color-on-surface-variant)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.25rem',
                  }}
                >
                  <li>Company Name, Role Title & Seniority</li>
                  <li>Location & Hybrid/Remote Policy</li>
                  <li>Salary Range & Compensation</li>
                  <li>Key Requirements & Qualifications</li>
                </ul>
              </div>
            </div>
          )}

          {/* Mode 2: Paste Text */}
          {inputMode === 'paste' && !isReviewing && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <TextArea
                label="Job Description Text"
                placeholder="Paste the full job post description text here..."
                rows={10}
                value={pasteInput}
                onValueChange={setPasteInput}
              />

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.75rem',
                  color: 'var(--md-sys-color-on-surface-variant)',
                  lineHeight: 1.3,
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: '16px', color: 'var(--md-sys-color-primary)' }}
                >
                  info
                </span>
                <span>Paste the complete posting — AI will filter and format key information.</span>
              </div>
            </div>
          )}

          {/* Mode 3: Manual Entry OR AI Review Mode */}
          {(inputMode === 'manual' || isReviewing) && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {validationError && (
                <div
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '12px',
                    backgroundColor: 'var(--md-sys-color-error-container)',
                    color: 'var(--md-sys-color-on-error-container)',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                  }}
                >
                  {validationError}
                </div>
              )}

              {isReviewing && parseStatus === 'success' && (
                <div
                  style={{
                    padding: '0.625rem 0.875rem',
                    borderRadius: '12px',
                    backgroundColor: 'var(--md-sys-color-primary-container)',
                    color: 'var(--md-sys-color-on-primary-container)',
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                    auto_awesome
                  </span>
                  Extracted with AI
                </div>
              )}

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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <TextField
                  label="Seniority Level"
                  value={seniority}
                  onValueChange={setSeniority}
                  leadingIcon="trending_up"
                />

                <TextField
                  label="Job Post URL"
                  value={jobUrl}
                  onValueChange={setJobUrl}
                  type="url"
                  leadingIcon="link"
                />
              </div>

              <TextArea
                label="Notes & Key Requirements"
                rows={4}
                value={notes}
                onValueChange={setNotes}
              />
            </div>
          )}
        </div>

        {/* Sticky Action Footer */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid var(--md-sys-color-outline-variant)',
            backgroundColor: 'var(--md-sys-color-surface-container-low)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
            gap: '1rem',
          }}
        >
          {isReviewing ? (
            <OutlinedButton icon="arrow_back" onClick={() => setIsReviewing(false)}>
              Start Over
            </OutlinedButton>
          ) : (
            <TextButton onClick={handleClose}>Cancel</TextButton>
          )}

          {/* Primary Action */}
          {!isReviewing && inputMode === 'link' && (
            <FilledButton
              onClick={handleParse}
              disabled={parsing || !linkInput.trim()}
              icon="auto_awesome"
            >
              {parsing ? 'Extracting...' : 'Extract with AI'}
            </FilledButton>
          )}

          {!isReviewing && inputMode === 'paste' && (
            <FilledButton
              onClick={handleParse}
              disabled={parsing || !pasteInput.trim()}
              icon="auto_awesome"
            >
              {parsing ? 'Extracting...' : 'Extract with AI'}
            </FilledButton>
          )}

          {(inputMode === 'manual' || isReviewing) && (
            <FilledButton onClick={handleSave} disabled={saving} icon="check">
              {saving ? 'Saving...' : 'Save Application'}
            </FilledButton>
          )}
        </div>
      </aside>
    </>
  );
}
