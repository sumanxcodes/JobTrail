'use client';

import React from 'react';
import Link from 'next/link';
import { Application } from '@/lib/types/database';
import { StatusBadge } from './StatusBadge';

interface ApplicationCardProps {
  application: Application;
}

export function ApplicationCard({ application }: ApplicationCardProps) {
  const formattedDate = new Date(application.created_at).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <Link
      href={`/applications/${application.id}`}
      style={{ display: 'block', textDecoration: 'none' }}
    >
      <div
        className="m3-card"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          cursor: 'pointer',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <div>
            <h3
              style={{
                fontSize: '1.125rem',
                fontWeight: 600,
                color: 'var(--md-sys-color-on-surface)',
                marginBottom: '0.25rem',
              }}
            >
              {application.title}
            </h3>
            <p
              style={{
                fontSize: '0.9375rem',
                fontWeight: 500,
                color: 'var(--md-sys-color-primary)',
              }}
            >
              {application.company}
            </p>
          </div>
          <StatusBadge status={application.status} />
        </div>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
            fontSize: '0.8125rem',
            color: 'var(--md-sys-color-on-surface-variant)',
            marginTop: 'auto',
            paddingTop: '0.5rem',
            borderTop: '1px solid var(--md-sys-color-outline-variant)',
          }}
        >
          {application.location && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                location_on
              </span>
              {application.location}
            </span>
          )}
          {application.salary_range && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                payments
              </span>
              {application.salary_range}
            </span>
          )}
          {application.seniority && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                badge
              </span>
              {application.seniority}
            </span>
          )}
          <span
            style={{
              marginLeft: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
              calendar_today
            </span>
            {formattedDate}
          </span>
        </div>
      </div>
    </Link>
  );
}
