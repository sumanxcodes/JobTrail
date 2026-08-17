'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { TextField, TextArea } from '@/components/ui/TextField';
import { FilledButton, OutlinedButton, TextButton } from '@/components/ui/Button';
import { CircularProgress } from '@/components/ui/CircularProgress';
import { FilterChip, ChipSet } from '@/components/ui/Chip';
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
    setParseMessage('Parsing job details with Claude AI...');
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
        return;
      }

      if (data?.status === 'failed') {
        if (data.reason === 'fetch_failed') {
          setParseMessage("We couldn't read that page — paste the job description text instead.");
          setInputMode('paste');
        } else if (data.reason === 'content_too_short') {
          setParseMessage('The page did not contain enough text. Please paste the job description directly.');
          setInputMode('paste');
        } else {
          setParseMessage('AI extraction failed. Please review and fill in the details manually.');
        }
        setParseMessageType('error');
        setRawJd(data.raw_jd || content);
        setParseStatus('failed');
        setSourceType(inputMode);
        setIsReviewing(true);
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
        setNotes(`Summary: ${extracted.requirements_summary}`);
      }
      setRawJd(data?.raw_jd || content);
      setSourceType(inputMode);
      setParseStatus(data?.status || 'success');
      setIsReviewing(true);
      setParseMessage('Extraction complete! Review the fields below before saving.');
      setParseMessageType('success');
    } catch (err: any) {
      console.error('Edge function error:', err);
      setParseMessage('Unable to connect to parser. You can proceed with manual entry.');
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
      setValidationError('Company name and Job title are required fields.');
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
    <div className="container" style={{ maxWidth: '720px', padding: '1rem 1.25rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link href="/dashboard">
          <TextButton icon="arrow_back">Back to Dashboard</TextButton>
        </Link>
      </div>

      <div className="m3-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <h1
            style={{
              fontSize: '1.75rem',
              fontWeight: 700,
              color: 'var(--md-sys-color-on-surface)',
              marginBottom: '0.25rem',
            }}
          >
            Add New Job Application
          </h1>
          <p style={{ color: 'var(--md-sys-color-on-surface-variant)', fontSize: '0.9375rem' }}>
            Choose how you would like to input the job details.
          </p>
        </div>

        {/* Input Mode Selector */}
        {!isReviewing && (
          <div>
            <span
              style={{
                fontSize: '0.875rem',
                fontWeight: 500,
                color: 'var(--md-sys-color-on-surface-variant)',
                marginBottom: '0.5rem',
                display: 'block',
              }}
            >
              Input Method:
            </span>
            <ChipSet>
              <FilterChip
                label="Paste a Link"
                icon="link"
                selected={inputMode === 'link'}
                onSelectedChange={() => setInputMode('link')}
              />
              <FilterChip
                label="Paste Job Description"
                icon="description"
                selected={inputMode === 'paste'}
                onSelectedChange={() => setInputMode('paste')}
              />
              <FilterChip
                label="Manual Entry"
                icon="edit"
                selected={inputMode === 'manual'}
                onSelectedChange={() => {
                  setInputMode('manual');
                  setIsReviewing(true);
                }}
              />
            </ChipSet>
          </div>
        )}

        {/* Parsing Progress / Messages */}
        {parseMessage && (
          <div
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              backgroundColor:
                parseMessageType === 'error'
                  ? 'var(--md-sys-color-error-container)'
                  : parseMessageType === 'success'
                  ? 'var(--status-offer-bg)'
                  : 'var(--md-sys-color-primary-container)',
              color:
                parseMessageType === 'error'
                  ? 'var(--md-sys-color-on-error-container)'
                  : parseMessageType === 'success'
                  ? 'var(--status-offer-text)'
                  : 'var(--md-sys-color-on-primary-container)',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            {parsing && <CircularProgress />}
            <span>{parseMessage}</span>
          </div>
        )}

        {/* Link / Paste Extraction Step */}
        {!isReviewing && inputMode !== 'manual' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {inputMode === 'link' ? (
              <TextField
                label="Job Posting URL"
                placeholder="https://www.linkedin.com/jobs/view/..."
                type="url"
                value={linkInput}
                onValueChange={setLinkInput}
                leadingIcon="link"
              />
            ) : (
              <TextArea
                label="Job Description Text"
                placeholder="Paste the full job description text here..."
                value={pasteInput}
                onValueChange={setPasteInput}
                rows={8}
              />
            )}

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <OutlinedButton
                onClick={() => {
                  setInputMode('manual');
                  setIsReviewing(true);
                }}
              >
                Skip to Manual Entry
              </OutlinedButton>

              <FilledButton onClick={handleParse} disabled={parsing} icon="auto_awesome">
                {parsing ? 'Parsing with AI...' : 'Parse with AI'}
              </FilledButton>
            </div>
          </div>
        )}

        {/* Review / Manual Entry Form */}
        {isReviewing && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
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

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1.25rem',
              }}
            >
              <TextField
                label="Company Name *"
                value={company}
                onValueChange={setCompany}
                required
                leadingIcon="business"
                error={!company && !!validationError}
              />

              <TextField
                label="Job Title *"
                value={title}
                onValueChange={setTitle}
                required
                leadingIcon="badge"
                error={!title && !!validationError}
              />

              <TextField
                label="Location"
                placeholder="e.g. San Francisco, CA or Remote"
                value={location}
                onValueChange={setLocation}
                leadingIcon="location_on"
              />

              <TextField
                label="Salary / Compensation"
                placeholder="e.g. $140,000 - $170,000"
                value={salaryRange}
                onValueChange={setSalaryRange}
                leadingIcon="payments"
              />

              <TextField
                label="Seniority Level"
                placeholder="e.g. Senior, Mid-level, Lead"
                value={seniority}
                onValueChange={setSeniority}
                leadingIcon="trending_up"
              />

              <TextField
                label="Job Posting URL"
                placeholder="https://..."
                type="url"
                value={jobUrl}
                onValueChange={setJobUrl}
                leadingIcon="link"
              />
            </div>

            <TextArea
              label="Notes & Requirements"
              placeholder="Additional notes, key requirements, referral contacts, etc."
              value={notes}
              onValueChange={setNotes}
              rows={4}
            />

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderTop: '1px solid var(--md-sys-color-outline-variant)',
                paddingTop: '1.25rem',
                flexWrap: 'wrap',
                gap: '1rem',
              }}
            >
              <TextButton
                onClick={() => {
                  setIsReviewing(false);
                  setParseMessage(null);
                }}
              >
                Change Input Mode
              </TextButton>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <Link href="/dashboard">
                  <OutlinedButton>Cancel</OutlinedButton>
                </Link>
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
