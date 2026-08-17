'use client';

import React, { useRef, useEffect } from 'react';
import '@material/web/button/filled-button.js';
import '@material/web/button/outlined-button.js';
import '@material/web/button/text-button.js';
import '@material/web/button/elevated-button.js';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: (e: MouseEvent) => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  icon?: string;
  trailingIcon?: boolean;
}

export function FilledButton({
  children,
  onClick,
  disabled,
  className,
  icon,
  trailingIcon,
}: ButtonProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !onClick) return;
    const handler = (e: Event) => onClick(e as MouseEvent);
    el.addEventListener('click', handler);
    return () => el.removeEventListener('click', handler);
  }, [onClick]);

  return (
    <md-filled-button
      ref={ref}
      disabled={disabled || undefined}
      class={className}
      trailing-icon={trailingIcon || undefined}
      has-icon={Boolean(icon) || undefined}
    >
      {icon && (
        <span
          slot="icon"
          className="material-symbols-outlined"
          style={{
            fontSize: '18px',
            width: '18px',
            height: '18px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            lineHeight: 1,
          }}
        >
          {icon}
        </span>
      )}
      {children}
    </md-filled-button>
  );
}

export function OutlinedButton({
  children,
  onClick,
  disabled,
  className,
  icon,
  trailingIcon,
}: ButtonProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !onClick) return;
    const handler = (e: Event) => onClick(e as MouseEvent);
    el.addEventListener('click', handler);
    return () => el.removeEventListener('click', handler);
  }, [onClick]);

  return (
    <md-outlined-button
      ref={ref}
      disabled={disabled || undefined}
      class={className}
      trailing-icon={trailingIcon || undefined}
      has-icon={Boolean(icon) || undefined}
    >
      {icon && (
        <span
          slot="icon"
          className="material-symbols-outlined"
          style={{
            fontSize: '18px',
            width: '18px',
            height: '18px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            lineHeight: 1,
          }}
        >
          {icon}
        </span>
      )}
      {children}
    </md-outlined-button>
  );
}

export function TextButton({
  children,
  onClick,
  disabled,
  className,
  icon,
  trailingIcon,
}: ButtonProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !onClick) return;
    const handler = (e: Event) => onClick(e as MouseEvent);
    el.addEventListener('click', handler);
    return () => el.removeEventListener('click', handler);
  }, [onClick]);

  return (
    <md-text-button
      ref={ref}
      disabled={disabled || undefined}
      class={className}
      trailing-icon={trailingIcon || undefined}
      has-icon={Boolean(icon) || undefined}
    >
      {icon && (
        <span
          slot="icon"
          className="material-symbols-outlined"
          style={{
            fontSize: '18px',
            width: '18px',
            height: '18px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            lineHeight: 1,
          }}
        >
          {icon}
        </span>
      )}
      {children}
    </md-text-button>
  );
}
