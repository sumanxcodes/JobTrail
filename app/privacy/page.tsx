import React from 'react';
import Link from 'next/link';
import { TextButton } from '@/components/ui/Button';

export default function PrivacyPage() {
  return (
    <div className="container" style={{ maxWidth: '720px', padding: '2rem 1.25rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link href="/">
          <TextButton icon="arrow_back">Back to Home</TextButton>
        </Link>
      </div>

      <h1
        style={{
          fontSize: '2rem',
          fontWeight: 700,
          marginBottom: '1.5rem',
          color: 'var(--md-sys-color-on-surface)',
        }}
      >
        Privacy & Data Handling Disclosure
      </h1>

      <div
        className="m3-card"
        style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', lineHeight: 1.6 }}
      >
        <section>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            1. Third-Party AI Processing
          </h2>
          <p style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
            Job description content (whether pasted as text or fetched from a URL) submitted by you
            is processed by a third-party AI provider (Anthropic Claude API) solely for the purpose
            of extracting structured fields (e.g., company name, role title, salary range,
            seniority).
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            2. Data Storage & Isolation
          </h2>
          <p style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
            Your application records, notes, and raw job descriptions are stored securely in a
            PostgreSQL database powered by Supabase. Access is strictly isolated per user using
            PostgreSQL Row Level Security (RLS) policies. No other user can access your data.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            3. Account & Data Deletion
          </h2>
          <p style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
            You have full control over your saved applications and can edit or permanently delete
            any application at any time directly from the application details page.
          </p>
        </section>
      </div>
    </div>
  );
}
