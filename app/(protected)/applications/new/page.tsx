'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { TextField, TextArea } from '@/components/ui/TextField';
import { FilledButton, OutlinedButton, TextButton } from '@/components/ui/Button';
import { CircularProgress } from '@/components/ui/CircularProgress';
import { ParseStatus, SourceType } from '@/lib/types/database';

export default function NewApplicationPage() {
  const [inputMode, setInputMode] = useState<'link' | 'paste' | 'manual'>('link');
  const [linkInput, setLinkInput] = useState('');
  const [pasteInput, setPasteInput] = useState('');
  const [parsing, setParsing] = useState(false);
  const [parseMessage, setParseMessage] = useState<string | null>(null);
  const [parseMessageType, setParseMessageType] = useState<'info' | 'error' | 'success'>('info');

  // Form Fields for Manual Entry / AI Review
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
  const [isEditingFields, setIsEditingFields] = useState(false);
  const [saving, setSaving] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const router = useRouter();
  const supabase = createClient();

  const handleParse = async () => {
    const content = inputMode === 'link' ? linkInput.trim() : pasteInput.trim();
    if (!content) {
      setParseMessage(inputMode === 'link' ? 'Please enter a valid job URL.' : 'Please paste the job description text.');
      setParseMessageType('error');
      return;
    }

    setParsing(true);
    setParseMessage('AI is extracting company, role, location, salary, and requirements...');
    setParseMessageType('info');

    try {
      const { data, error } = await supabase.functions.invoke('parse-jd', {
        body: { mode: inputMode, content },
      });

      if (error) {
        throw error;
      }

      if (data?.status === 'rate_limited') {
        setParseMessage('Daily parsing limit reached — try again tomorrow, or add this one manually.');
        setParseMessageType('error');
        setInputMode('manual');
        setRawJd(content);
        if (inputMode === 'link') setJobUrl(content);
        setIsReviewing(true);
        setIsEditingFields(true);
        return;
      }

      if (data?.status === 'failed') {
        if (data.reason === 'fetch_failed') {
          setParseMessage("We couldn't read that page — paste the job description text instead.");
          setInputMode('paste');
        } else if (data.reason === 'content_too_short') {
          setParseMessage('The page content was too brief. Paste the job description text directly.');
          setInputMode('paste');
        } else {
          setParseMessage('AI extraction was unable to parse structured fields. Fill in details manually.');
          setInputMode('manual');
        }
        setParseMessageType('error');
        setRawJd(data.raw_jd || content);
        setParseStatus('failed');
        setSourceType(inputMode);
        setIsReviewing(true);
        setIsEditingFields(true);
        return;
      }

      // Success or Partial Success
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
      setIsEditingFields(false);
      setParseMessage(null);
    } catch (err: any) {
      console.error('Edge function error:', err);
      setParseMessage('Unable to connect to AI parser. You can proceed with manual entry.');
      setParseMessageType('error');
      setRawJd(content);
      if (inputMode === 'link') setJobUrl(content);
      setIsReviewing(true);
      setIsEditingFields(true);
    } finally {
      setParsing(false);
    }
  };

  const handleSave = async () => {
    if (!company.trim() || !title.trim()) {
      setValidationError('Company name and Job title are required to save.');
      setIsEditingFields(true);
      return;
    }

    setSaving(true);
    setValidationError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
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

      if (histError) throw histError;

      router.push(`/applications/${appData.id}`);
      router.refresh();
    } catch (err: any) {
      console.error('Save error:', err);
      setValidationError(err.message || 'Failed to save application.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '780px', padding: '1.5rem 1.5rem 3rem 1.5rem' }}>
      {/* Header Section */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '1.875rem',
              fontWeight: 700,
              color: 'var(--md-sys-color-on-surface)',
              marginBottom: '0.25rem',
            }}
          >
            {isReviewing ? 'Review Parsed Application' : 'Add Application'}
          </h1>
          <p style={{ color: 'var(--md-sys-color-on-surface-variant)', fontSize: '0.9375rem' }}>
            {isReviewing
              ? 'Review the details extracted by AI before saving to your tracker.'
              : 'Let AI parse the details so you can focus on applying.'}
          </p>
        </div>

        <Link href="/dashboard">
          <TextButton icon="close">Close</TextButton>
        </Link>
      </div>

      {/* Main Canvas Card */}
      <div
        className="m3-card"
        style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1.75rem' }}
      >
        {/* Step 1: Mode Segmented Control (if not reviewing) */}
        {!isReviewing && (
          <>
            <div className="segmented-control" style={{ width: '100%' }}>
              <button
                className={`segmented-control-btn ${inputMode === 'link' ? 'active' : ''}`}
                style={{ flex: 1 }}
                onClick={() => setInputMode('link')}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                    link
                  </span>
                  Paste Link
                </span>
              </button>
              <button
                className={`segmented-control-btn ${inputMode === 'paste' ? 'active' : ''}`}
                style={{ flex: 1 }}
                onClick={() => setInputMode('paste')}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                    description
                  </span>
                  Paste Job Description
                </span>
              </button>
            </div>

            {/* Parse Notification message */}
            {parseMessage && (
              <div
                style={{
                  padding: '0.875rem 1rem',
                  borderRadius: '10px',
                  backgroundColor:
                    parseMessageType === 'error'
                      ? 'var(--md-sys-color-error-container)'
                      : 'var(--md-sys-color-primary-container)',
                  color:
                    parseMessageType === 'error'
                      ? 'var(--md-sys-color-on-error-container)'
                      : 'var(--md-sys-color-on-primary-container)',
                  fontSize: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                }}
              >
                {parsing && <CircularProgress />}
                <span>{parseMessage}</span>
              </div>
            )}

            {/* Input Panels */}
            {inputMode === 'link' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <TextField
                  label="Job Posting URL"
                  placeholder="https://www.linkedin.com/jobs/view/... or https://..."
                  type="url"
                  value={linkInput}
                  onValueChange={setLinkInput}
                  leadingIcon="public"
                />

                <p
                  style={{
                    fontSize: '0.875rem',
                    color: 'var(--md-sys-color-on-surface-variant)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.5rem',
                    lineHeight: 1.5,
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: '18px', color: 'var(--md-sys-color-primary)', flexShrink: 0 }}
                  >
                    auto_awesome
                  </span>
                  Paste a link from LinkedIn, Indeed, Greenhouse, or any careers page. Our AI will automatically extract the title, company, location, salary, and requirements.
                </p>

                <div style={{ paddingTop: '0.5rem' }}>
                  <FilledButton
                    onClick={handleParse}
                    disabled={parsing}
                    icon="auto_awesome"
                    className="w-full"
                  >
                    {parsing ? 'Parsing with AI...' : 'Parse with AI'}
                  </FilledButton>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <TextArea
                  label="Job Description Text"
                  placeholder="Paste the full job description text here..."
                  value={pasteInput}
                  onValueChange={setPasteInput}
                  rows={8}
                />

                <p
                  style={{
                    fontSize: '0.875rem',
                    color: 'var(--md-sys-color-on-surface-variant)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                    info
                  </span>
                  Ideal for text copied from private job boards, emails, PDFs, or internal postings.
                </p>

                <div style={{ paddingTop: '0.5rem' }}>
                  <FilledButton
                    onClick={handleParse}
                    disabled={parsing}
                    icon="document_scanner"
                  >
                    {parsing ? 'Parsing Text with AI...' : 'Parse Text with AI'}
                  </FilledButton>
                </div>
              </div>
            )}

            {/* Manual Entry Fallback Button */}
            <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
              <TextButton
                onClick={() => {
                  setInputMode('manual');
                  setIsReviewing(true);
                  setIsEditingFields(true);
                }}
              >
                Enter details manually instead
              </TextButton>
            </div>
          </>
        )}

        {/* Step 2: Review / Edit Extracted Details */}
        {isReviewing && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Status chip banner */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.625rem 1rem',
                borderRadius: '9999px',
                backgroundColor: 'var(--md-sys-color-primary-container)',
                color: 'var(--md-sys-color-on-primary-container)',
                fontSize: '0.875rem',
                fontWeight: 500,
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                  check_circle
                </span>
                AI Extraction Complete
              </span>
              <span style={{ fontSize: '0.75rem', opacity: 0.85 }}>Source: {sourceType}</span>
            </div>

            {validationError && (
              <div
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  backgroundColor: 'var(--md-sys-color-error-container)',
                  color: 'var(--md-sys-color-on-error-container)',
                  fontSize: '0.875rem',
                }}
              >
                {validationError}
              </div>
            )}

            {/* Bento Form Fields */}
            {isEditingFields ? (
              /* Editable Inputs */
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
                  leadingIcon="business"
                />
                <TextField
                  label="Job Title *"
                  value={title}
                  onValueChange={setTitle}
                  required
                  leadingIcon="badge"
                />
                <TextField
                  label="Location"
                  placeholder="e.g. San Francisco, CA or Remote"
                  value={location}
                  onValueChange={setLocation}
                  leadingIcon="location_on"
                />
                <TextField
                  label="Salary Range"
                  placeholder="e.g. $150k - $200k"
                  value={salaryRange}
                  onValueChange={setSalaryRange}
                  leadingIcon="payments"
                />
                <TextField
                  label="Seniority Level"
                  placeholder="e.g. Senior, Lead, Mid-Level"
                  value={seniority}
                  onValueChange={setSeniority}
                  leadingIcon="stairs"
                />
                <TextField
                  label="Job Posting URL"
                  type="url"
                  value={jobUrl}
                  onValueChange={setJobUrl}
                  leadingIcon="link"
                />
                <div style={{ gridColumn: '1 / -1' }}>
                  <TextArea
                    label="Notes & Extracted Highlights"
                    value={notes}
                    onValueChange={setNotes}
                    rows={4}
                  />
                </div>
              </div>
            ) : (
              /* Bento Review Grid (from Stitch review-extracted.html) */
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: '1rem',
                }}
              >
                {/* Company Tile */}
                <div className="m3-bento-tile">
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '0.35rem',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: 'var(--md-sys-color-secondary)',
                      }}
                    >
                      Company
                    </span>
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: '15px', color: 'var(--md-sys-color-primary)' }}
                    >
                      auto_awesome
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: '1.05rem',
                      fontWeight: 600,
                      color: company ? 'var(--md-sys-color-on-surface)' : 'var(--md-sys-color-error)',
                    }}
                  >
                    {company || 'Missing - Click Edit Fields'}
                  </p>
                </div>

                {/* Job Title Tile */}
                <div className="m3-bento-tile">
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '0.35rem',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: 'var(--md-sys-color-secondary)',
                      }}
                    >
                      Job Title
                    </span>
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: '15px', color: 'var(--md-sys-color-primary)' }}
                    >
                      auto_awesome
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: '1.05rem',
                      fontWeight: 600,
                      color: title ? 'var(--md-sys-color-on-surface)' : 'var(--md-sys-color-error)',
                    }}
                  >
                    {title || 'Missing - Click Edit Fields'}
                  </p>
                </div>

                {/* Location Tile */}
                <div className="m3-bento-tile">
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '0.35rem',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: 'var(--md-sys-color-secondary)',
                      }}
                    >
                      Location
                    </span>
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: '15px', color: 'var(--md-sys-color-primary)' }}
                    >
                      auto_awesome
                    </span>
                  </div>
                  <p style={{ fontSize: '1.05rem', fontWeight: 500 }}>
                    {location || 'Not Specified'}
                  </p>
                </div>

                {/* Salary Range Tile */}
                <div className="m3-bento-tile">
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '0.35rem',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: 'var(--md-sys-color-secondary)',
                      }}
                    >
                      Salary Range
                    </span>
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: '15px', color: 'var(--md-sys-color-primary)' }}
                    >
                      auto_awesome
                    </span>
                  </div>
                  <p style={{ fontSize: '1.05rem', fontWeight: 500 }}>
                    {salaryRange || 'Not Specified'}
                  </p>
                </div>

                {/* Seniority Tile */}
                <div className="m3-bento-tile">
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '0.35rem',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: 'var(--md-sys-color-secondary)',
                      }}
                    >
                      Seniority
                    </span>
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: '15px', color: 'var(--md-sys-color-primary)' }}
                    >
                      auto_awesome
                    </span>
                  </div>
                  <p style={{ fontSize: '1.05rem', fontWeight: 500 }}>
                    {seniority || 'Not Specified'}
                  </p>
                </div>

                {/* Job URL Tile */}
                <div className="m3-bento-tile">
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '0.35rem',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: 'var(--md-sys-color-secondary)',
                      }}
                    >
                      Job URL
                    </span>
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: '15px', color: 'var(--md-sys-color-primary)' }}
                    >
                      auto_awesome
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: '0.9375rem',
                      fontWeight: 500,
                      color: 'var(--md-sys-color-primary)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {jobUrl || 'None'}
                  </p>
                </div>

                {/* Highlights / Summary Tile (Full Width) */}
                {notes && (
                  <div className="m3-bento-tile" style={{ gridColumn: '1 / -1' }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '0.5rem',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          color: 'var(--md-sys-color-secondary)',
                        }}
                      >
                        Extracted Highlights
                      </span>
                      <span
                        className="material-symbols-outlined"
                        style={{ fontSize: '15px', color: 'var(--md-sys-color-primary)' }}
                      >
                        auto_awesome
                      </span>
                    </div>
                    <p
                      style={{
                        fontSize: '0.9375rem',
                        lineHeight: 1.6,
                        color: 'var(--md-sys-color-on-surface-variant)',
                      }}
                    >
                      {notes}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Action Footer */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderTop: '1px solid var(--md-sys-color-outline-variant)',
                paddingTop: '1.25rem',
                flexWrap: 'wrap',
                gap: '0.75rem',
              }}
            >
              <TextButton
                onClick={() => {
                  setIsReviewing(false);
                  setIsEditingFields(false);
                }}
              >
                Start Over
              </TextButton>

              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <OutlinedButton
                  icon={isEditingFields ? 'visibility' : 'edit'}
                  onClick={() => setIsEditingFields(!isEditingFields)}
                >
                  {isEditingFields ? 'View Summary' : 'Edit Fields'}
                </OutlinedButton>

                <FilledButton onClick={handleSave} disabled={saving} icon="save">
                  {saving ? <CircularProgress /> : 'Save Application'}
                </FilledButton>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
