'use client';

import React, { useRef, useEffect } from 'react';
import '@material/web/textfield/outlined-text-field.js';

interface TextFieldProps {
  value: string;
  onValueChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'url' | 'number' | 'textarea';
  required?: boolean;
  disabled?: boolean;
  error?: boolean;
  errorText?: string;
  supportingText?: string;
  rows?: number;
  className?: string;
  leadingIcon?: string;
}

export function TextField({
  value,
  onValueChange,
  label,
  placeholder,
  type = 'text',
  required,
  disabled,
  error,
  errorText,
  supportingText,
  rows,
  className,
  leadingIcon,
}: TextFieldProps) {
  const ref = useRef<HTMLElement & { value: string; error: boolean; errorText: string }>(null);

  // Property binding for value
  useEffect(() => {
    if (ref.current && ref.current.value !== value) {
      ref.current.value = value;
    }
  }, [value]);

  // Property binding for error
  useEffect(() => {
    if (ref.current) {
      ref.current.error = !!error;
      if (errorText) {
        ref.current.errorText = errorText;
      }
    }
  }, [error, errorText]);

  // Event listener for native input event
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handler = (e: Event) => {
      onValueChange((e.target as HTMLInputElement).value);
    };
    el.addEventListener('input', handler);
    return () => el.removeEventListener('input', handler);
  }, [onValueChange]);

  return (
    <md-outlined-text-field
      ref={ref}
      label={label}
      placeholder={placeholder}
      type={type === 'textarea' ? 'textarea' : type}
      rows={rows}
      disabled={disabled || undefined}
      supporting-text={supportingText}
      class={className}
      style={{ width: '100%' }}
    >
      {leadingIcon && (
        <span
          slot="leading-icon"
          className="material-symbols-outlined"
          style={{
            fontSize: '20px',
            color: 'var(--md-sys-color-on-surface-variant)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {leadingIcon}
        </span>
      )}
    </md-outlined-text-field>
  );
}

export function TextArea(props: Omit<TextFieldProps, 'type'> & { rows?: number }) {
  return <TextField {...props} type="textarea" rows={props.rows || 4} />;
}
