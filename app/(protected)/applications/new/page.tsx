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
    <div style={{ maxWidth: '840px', padding: '2rem 1.5rem 4rem 1.5rem', margin: '0 auto' }}>
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
              fontFamily: 'var(--font-headline)',
              fontWeight: 800,
              color: 'var(--md-sys-color-on-surface)',
              letterSpacing: '-0.02em',
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

        <Link href="/applications" style={{ textDecoration: 'none' }}>
          <OutlinedButton icon="close">Close</OutlinedButton>
        </Link>
      </div>

      {/* Main Canvas Card */}
      <div
        className="m3-card"
        style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '2rem' }}
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
                  borderRadius: '12px',
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
                {parsing && <CircularProgress indeterminate />}
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
                    fontSize: '0.8125rem',
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
                    info
                  </span>
                  Works best with public job links (LinkedIn, Greenhouse, Lever, Ashby, Workable, etc.).
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                  <button
                    onClick={() => {
                      setInputMode('manual');
                      setIsReviewing(true);
                      setIsEditingFields(true);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--md-sys-color-primary)',
                      fontFamily: 'var(--font-headline)',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textDecoration: 'underline',
                    }}
                  >
                    Enter manually instead
                  </button>

                  <FilledButton onClick={handleParse} disabled={parsing || !linkInput.trim()} icon="auto_awesome">
                    {parsing ? 'Parsing with AI...' : 'Parse Job Posting'}
                  </FilledButton>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <TextArea
                  label="Job Description Text"
                  placeholder="Paste the full job description text here..."
                  rows={8}
                  value={pasteInput}
                  onValueChange={setPasteInput}
                />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                  <button
                    onClick={() => {
                      setInputMode('manual');
                      setIsReviewing(true);
                      setIsEditingFields(true);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--md-sys-color-primary)',
                      fontFamily: 'var(--font-headline)',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textDecoration: 'underline',
                    }}
                  >
                    Enter manually instead
                  </button>

                  <FilledButton onClick={handleParse} disabled={parsing || !pasteInput.trim()} icon="auto_awesome">
                    {parsing ? 'Parsing with AI...' : 'Parse Job Text'}
                  </FilledButton>
                </div>
              </div>
            )}
          </>
        )}

        {/* Step 2: AI Review Mode */}
        {isReviewing && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {validationError && (
              <div
                style={{
                  padding: '0.875rem 1rem',
                  borderRadius: '12px',
                  backgroundColor: 'var(--md-sys-color-error-container)',
                  color: 'var(--md-sys-color-on-error-container)',
                  fontSize: '0.875rem',
                }}
              >
                {validationError}
              </div>
            )}

            {/* Structured M3 Form Sections */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '1.25rem',
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
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: '1.25rem',
                }}
              >
                <TextField
                  label="Location (City, State, or Remote)"
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
                  label="Seniority / Level"
                  value={seniority}
                  onValueChange={setSeniority}
                  leadingIcon="trending_up"
                />
              </div>

              <TextField
                label="Job Posting URL"
                value={jobUrl}
                onValueChange={setJobUrl}
                type="url"
                leadingIcon="link"
              />

              <TextArea
                label="Extracted Key Requirements & Notes"
                rows={4}
                value={notes}
                onValueChange={setNotes}
              />
            </div>

            {/* Review Action Controls */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '1rem',
                borderTop: '1px solid var(--md-sys-color-outline-variant)',
                flexWrap: 'wrap',
                gap: '1rem',
              }}
            >
              <OutlinedButton
                icon="arrow_back"
                onClick={() => {
                  setIsReviewing(false);
                  setValidationError(null);
                }}
              >
                Start Over
              </OutlinedButton>

              <FilledButton onClick={handleSave} disabled={saving} icon="check">
                {saving ? 'Saving...' : 'Save Application'}
              </FilledButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
