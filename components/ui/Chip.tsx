'use client';

import React, { useRef, useEffect } from 'react';
import '@material/web/chips/chip-set.js';
import '@material/web/chips/filter-chip.js';
import '@material/web/chips/assist-chip.js';

interface FilterChipProps {
  label: string;
  selected: boolean;
  onSelectedChange?: (selected: boolean) => void;
  disabled?: boolean;
  className?: string;
  icon?: string;
}

export function FilterChip({
  label,
  selected,
  onSelectedChange,
  disabled,
  className,
  icon,
}: FilterChipProps) {
  const ref = useRef<HTMLElement & { selected: boolean }>(null);

  useEffect(() => {
    if (ref.current && ref.current.selected !== selected) {
      ref.current.selected = selected;
    }
  }, [selected]);

  useEffect(() => {
    const el = ref.current;
    if (!el || !onSelectedChange) return;
    const handler = (e: Event) => {
      const target = e.target as HTMLElement & { selected: boolean };
      onSelectedChange(target.selected);
    };
    el.addEventListener('click', handler);
    return () => el.removeEventListener('click', handler);
  }, [onSelectedChange]);

  return (
    <md-filter-chip
      ref={ref}
      label={label}
      selected={selected || undefined}
      disabled={disabled || undefined}
      class={className}
    >
      {icon && <span slot="icon" className="material-symbols-outlined">{icon}</span>}
    </md-filter-chip>
  );
}

export function AssistChip({
  label,
  onClick,
  disabled,
  className,
  icon,
}: {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  icon?: string;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !onClick) return;
    const handler = () => onClick();
    el.addEventListener('click', handler);
    return () => el.removeEventListener('click', handler);
  }, [onClick]);

  return (
    <md-assist-chip
      ref={ref}
      label={label}
      disabled={disabled || undefined}
      class={className}
    >
      {icon && <span slot="icon" className="material-symbols-outlined">{icon}</span>}
    </md-assist-chip>
  );
}

export function ChipSet({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <md-chip-set class={className}>
      {children}
    </md-chip-set>
  );
}
