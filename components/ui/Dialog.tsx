'use client';

import React, { useEffect, useRef } from 'react';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  headline?: string;
  icon?: string;
  destructive?: boolean;
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function Dialog({
  open,
  onClose,
  headline,
  icon,
  destructive = false,
  children,
  actions,
  className,
}: DialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  // Prevent background scrolling when dialog is open
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

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="m3-dialog-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        animation: 'fadeIn 0.2s cubic-bezier(0.2, 0, 0, 1)',
      }}
    >
      {/* M3 Scrim Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.55)',
          backdropFilter: 'blur(3px)',
          zIndex: 1,
        }}
      />

      {/* M3 Dialog Surface (28px radius, surface-container-high, 24px padding) */}
      <div
        ref={dialogRef}
        className={className}
        style={{
          position: 'relative',
          zIndex: 2,
          width: '100%',
          maxWidth: '460px',
          backgroundColor: 'var(--md-sys-color-surface-container-high)',
          border: '1px solid var(--md-sys-color-outline-variant)',
          borderRadius: '28px',
          padding: '1.75rem 1.75rem 1.5rem 1.75rem',
          boxShadow:
            '0 20px 25px -5px rgba(0, 0, 0, 0.25), 0 10px 10px -5px rgba(0, 0, 0, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          animation: 'scaleUp 0.2s cubic-bezier(0.2, 0, 0, 1)',
        }}
      >
        {/* Optional M3 Center Header Icon */}
        {icon && (
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              backgroundColor: destructive
                ? 'var(--md-sys-color-error-container)'
                : 'var(--md-sys-color-surface-container-highest)',
              color: destructive
                ? 'var(--md-sys-color-error)'
                : 'var(--md-sys-color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '0.25rem',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>
              {icon}
            </span>
          </div>
        )}

        {/* Headline */}
        {headline && (
          <h2
            id="m3-dialog-title"
            style={{
              fontFamily: 'var(--font-headline)',
              fontSize: '1.375rem',
              fontWeight: 700,
              color: 'var(--md-sys-color-on-surface)',
              lineHeight: 1.3,
              margin: 0,
              letterSpacing: '-0.015em',
            }}
          >
            {headline}
          </h2>
        )}

        {/* Supporting Content Body */}
        <div
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.9375rem',
            lineHeight: 1.55,
            color: 'var(--md-sys-color-on-surface-variant)',
          }}
        >
          {children}
        </div>

        {/* Action Buttons (Right-aligned, Cancel Text + Confirm Filled) */}
        {actions && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '0.75rem',
              marginTop: '0.75rem',
            }}
          >
            {actions}
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes scaleUp {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
