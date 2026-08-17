'use client';

import React from 'react';
import Link from 'next/link';
import { Application } from '@/lib/types/database';
import { StatusBadge } from './StatusBadge';

interface ApplicationCardProps {
  application: Application;
}

function getInitials(name: string): string {
  if (!name) return 'JT';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  const diffInDays = Math.floor(diffInSeconds / (3600 * 24));

  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 30) return `${diffInDays}d ago`;
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) return `${diffInMonths}mo ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export function ApplicationCard({ application }: ApplicationCardProps) {
  const initials = getInitials(application.company);
  const timeLabel = timeAgo(application.updated_at || application.created_at);

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
          gap: '1rem',
          height: '100%',
          padding: '1.25rem',
        }}
      >
        {/* Header: Company Avatar + Title + Status */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', gap: '0.875rem', alignItems: 'center' }}>
            {/* Company Avatar / Monogram Badge */}
            <div
              className="company-avatar"
              style={{ width: '40px', height: '40px', fontSize: '0.875rem' }}
            >
              {initials}
            </div>

            <div>
              <h3
                style={{
                  fontSize: '1rem',
                  fontFamily: 'var(--font-headline)',
                  fontWeight: 700,
                  color: 'var(--md-sys-color-on-surface)',
                  lineHeight: 1.3,
                  marginBottom: '0.15rem',
                }}
              >
                {application.title}
              </h3>
              <p
                style={{
                  fontSize: '0.8125rem',
                  fontFamily: 'var(--font-body)',
                  color: 'var(--md-sys-color-on-surface-variant)',
                  fontWeight: 500,
                }}
              >
                {application.company}
              </p>
            </div>
          </div>

          <StatusBadge status={application.status} size="small" />
        </div>

        {/* Bottom Meta Tags: Location, Salary, Time Ago */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.75rem',
            fontSize: '0.8125rem',
            fontFamily: 'var(--font-body)',
            color: 'var(--md-sys-color-on-surface-variant)',
            marginTop: 'auto',
            paddingTop: '0.75rem',
            borderTop: '1px solid var(--md-sys-color-outline-variant)',
          }}
        >
          {application.location && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>
                location_on
              </span>
              {application.location}
            </span>
          )}

          {application.salary_range && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>
                payments
              </span>
              {application.salary_range}
            </span>
          )}

          {application.seniority && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>
                trending_up
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
              color: 'var(--md-sys-color-outline)',
              fontSize: '0.75rem',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
              history
            </span>
            {timeLabel}
          </span>
        </div>
      </div>
    </Link>
  );
}
