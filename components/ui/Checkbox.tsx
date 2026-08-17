'use client';

import React, { useRef, useEffect } from 'react';
import '@material/web/checkbox/checkbox.js';

interface CheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export function Checkbox({
  checked,
  onCheckedChange,
  disabled,
  className,
}: CheckboxProps) {
  const ref = useRef<HTMLElement & { checked: boolean }>(null);

  useEffect(() => {
    if (ref.current && ref.current.checked !== checked) {
      ref.current.checked = checked;
    }
  }, [checked]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handler = (e: Event) => {
      const target = e.target as HTMLElement & { checked: boolean };
      onCheckedChange(target.checked);
    };
    el.addEventListener('change', handler);
    return () => el.removeEventListener('change', handler);
  }, [onCheckedChange]);

  return (
    <md-checkbox
      ref={ref}
      checked={checked || undefined}
      disabled={disabled || undefined}
      class={className}
    />
  );
}
