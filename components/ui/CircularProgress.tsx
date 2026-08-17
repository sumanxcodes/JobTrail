'use client';

import React from 'react';
import '@material/web/progress/circular-progress.js';

interface CircularProgressProps {
  indeterminate?: boolean;
  value?: number;
  max?: number;
  className?: string;
  fourColor?: boolean;
}

export function CircularProgress({
  indeterminate = true,
  value,
  max,
  className,
  fourColor,
}: CircularProgressProps) {
  return (
    <md-circular-progress
      indeterminate={indeterminate || undefined}
      value={value}
      max={max}
      four-color={fourColor || undefined}
      class={className}
    />
  );
}
