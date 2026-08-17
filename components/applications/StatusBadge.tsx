'use client';

import React from 'react';
import { ApplicationStatus, APPLICATION_STATUSES } from '@/lib/types/database';

interface StatusBadgeProps {
  status: ApplicationStatus;
  size?: 'small' | 'medium';
}

export function StatusBadge({ status, size = 'medium' }: StatusBadgeProps) {
  const meta = APPLICATION_STATUSES.find((s) => s.value === status) || {
    label: status,
    colorClass: 'status-draft',
  };

  const isSmall = size === 'small';

  return (
    <span
      className={meta.colorClass}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isSmall ? '0.2rem 0.5rem' : '0.35rem 0.75rem',
        borderRadius: '9999px',
        fontSize: isSmall ? '0.75rem' : '0.875rem',
        fontWeight: 500,
        letterSpacing: '0.02em',
        textTransform: 'capitalize',
      }}
    >
      {meta.label}
    </span>
  );
}
