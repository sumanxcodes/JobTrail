'use client';

import React, { useRef, useEffect } from 'react';
import '@material/web/select/outlined-select.js';
import '@material/web/select/select-option.js';

interface SelectOptionItem {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOptionItem[];
  label?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export function Select({
  value,
  onValueChange,
  options,
  label,
  required,
  disabled,
  className,
}: SelectProps) {
  const ref = useRef<HTMLElement & { value: string }>(null);

  useEffect(() => {
    if (ref.current && ref.current.value !== value) {
      ref.current.value = value;
    }
  }, [value]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handler = (e: Event) => {
      onValueChange((e.target as HTMLSelectElement).value);
    };
    el.addEventListener('change', handler);
    return () => el.removeEventListener('change', handler);
  }, [onValueChange]);

  return (
    <md-outlined-select
      ref={ref}
      label={label}
      required={required || undefined}
      disabled={disabled || undefined}
      class={className}
      style={{ width: '100%' }}
    >
      {options.map((opt) => (
        <md-select-option
          key={opt.value}
          value={opt.value}
          selected={opt.value === value || undefined}
        >
          <div slot="headline">{opt.label}</div>
        </md-select-option>
      ))}
    </md-outlined-select>
  );
}
