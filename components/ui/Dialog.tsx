'use client';

import React, { useRef, useEffect } from 'react';
import '@material/web/dialog/dialog.js';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  headline?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function Dialog({
  open,
  onClose,
  headline,
  children,
  actions,
  className,
}: DialogProps) {
  const ref = useRef<HTMLElement & { show: () => void; close: () => void; open: boolean }>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (open && !el.open) {
      el.show();
    } else if (!open && el.open) {
      el.close();
    }
  }, [open]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleClosed = () => {
      onClose();
    };

    el.addEventListener('closed', handleClosed);
    return () => el.removeEventListener('closed', handleClosed);
  }, [onClose]);

  return (
    <md-dialog ref={ref} class={className}>
      {headline && <div slot="headline">{headline}</div>}
      <form slot="content" method="dialog" onSubmit={(e) => e.preventDefault()}>
        {children}
      </form>
      {actions && <div slot="actions">{actions}</div>}
    </md-dialog>
  );
}
