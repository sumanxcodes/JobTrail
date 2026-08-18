'use client';

import React, { useState } from 'react';

interface RippleItem {
  key: number;
}

export function useM3Ripple() {
  const [ripples, setRipples] = useState<RippleItem[]>([]);

  const createRipple = () => {
    const newRipple: RippleItem = {
      key: Date.now() + Math.random(),
    };
    setRipples((prev) => [...prev, newRipple]);
  };

  const removeRipple = (key: number) => {
    setRipples((prev) => prev.filter((r) => r.key !== key));
  };

  return { ripples, createRipple, removeRipple };
}

export function RippleContainer({
  ripples,
  onRippleEnd,
  color = 'currentColor',
}: {
  ripples: RippleItem[];
  onRippleEnd: (key: number) => void;
  color?: string;
}) {
  return (
    <span
      className="m3-ripple-container"
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        borderRadius: 'inherit',
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {ripples.map((ripple) => (
        <span
          key={ripple.key}
          className="m3-center-ripple-wave"
          onAnimationEnd={() => onRippleEnd(ripple.key)}
          style={{
            position: 'absolute',
            width: '100%',
            aspectRatio: '1 / 1',
            borderRadius: '50%',
            backgroundColor: color,
          }}
        />
      ))}
    </span>
  );
}
