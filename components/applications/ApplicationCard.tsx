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
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Top subtle corner decoration */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '80px',
            height: '80px',
            backgroundColor: 'var(--md-sys-color-primary-container)',
            opacity: 0.15,
            borderBottomLeftRadius: '100%',
            pointerEvents: 'none',
          }}
        />

        {/* Header: Company Avatar + Title + Status */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '0.75rem',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <div style={{ display: 'flex', gap: '0.875rem', alignItems: 'center' }}>
            {/* Company Avatar / Logo Badge */}
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                backgroundColor: 'var(--md-sys-color-surface-container)',
                border: '1px solid var(--md-sys-color-outline-variant)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.875rem',
                color: 'var(--md-sys-color-primary)',
                flexShrink: 0,
              }}
            >
              {initials}
            </div>

            <div>
              <h3
                style={{
                  fontSize: '1.0625rem',
                  fontWeight: 600,
                  color: 'var(--md-sys-color-on-surface)',
                  lineHeight: 1.3,
                }}
              >
                {application.title}
              </h3>
              <p
                style={{
                  fontSize: '0.875rem',
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
            gap: '0.875rem',
            fontSize: '0.8125rem',
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
                stairs
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
