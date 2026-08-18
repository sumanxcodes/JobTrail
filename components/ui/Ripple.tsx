'use client';

import React, { useRef, useEffect, useState } from 'react';

export interface RippleProps {
  /** Disables ripple effect */
  disabled?: boolean;
  /** Hover state layer opacity (default: 0.08) */
  hoverOpacity?: number;
  /** Pressed state layer opacity (default: 0.12) */
  pressedOpacity?: number;
  /** Custom ripple color (default: currentColor) */
  color?: string;
  /** Center-origin ripple (default: true for M3 icon buttons / nav rail pills) */
  centered?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

interface RippleWave {
  id: number;
  x: number;
  y: number;
  size: number;
  holding: boolean;
}

export function Ripple({
  disabled = false,
  hoverOpacity = 0.08,
  pressedOpacity = 0.12,
  color = 'currentColor',
  centered = true,
  className = '',
  style = {},
}: RippleProps) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [waves, setWaves] = useState<RippleWave[]>([]);

  useEffect(() => {
    const parent = containerRef.current?.parentElement;
    if (!parent || disabled) return;

    const handlePointerEnter = () => setIsHovered(true);
    const handlePointerLeave = () => {
      setIsHovered(false);
      setWaves((prev) => prev.map((w) => ({ ...w, holding: false })));
    };

    const handlePointerDown = (e: PointerEvent) => {
      // Only respond to primary click/touch
      if (e.button !== 0) return;

      const rect = parent.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 2;
      const x = centered ? rect.width / 2 : e.clientX - rect.left;
      const y = centered ? rect.height / 2 : e.clientY - rect.top;

      const newWave: RippleWave = {
        id: Date.now() + Math.random(),
        x,
        y,
        size,
        holding: true,
      };

      setWaves((prev) => [...prev, newWave]);
    };

    const handlePointerUp = () => {
      setWaves((prev) => prev.map((w) => ({ ...w, holding: false })));
    };

    parent.addEventListener('pointerenter', handlePointerEnter);
    parent.addEventListener('pointerleave', handlePointerLeave);
    parent.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);

    return () => {
      parent.removeEventListener('pointerenter', handlePointerEnter);
      parent.removeEventListener('pointerleave', handlePointerLeave);
      parent.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [disabled, centered]);

  const handleWaveAnimationEnd = (id: number) => {
    setWaves((prev) => prev.filter((w) => w.id !== id));
  };

  return (
    <span
      ref={containerRef}
      className={`m3-ripple-surface ${className}`}
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        borderRadius: 'inherit',
        pointerEvents: 'none',
        zIndex: 1,
        ...style,
      }}
    >
      {/* M3 Hover State Layer */}
      <span
        className="m3-state-layer"
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 'inherit',
          backgroundColor: color,
          opacity: isHovered && !disabled ? hoverOpacity : 0,
          transition: 'opacity 150ms cubic-bezier(0.2, 0, 0, 1)',
        }}
      />

      {/* M3 Expanding Radial Ripple Waves */}
      {waves.map((wave) => (
        <span
          key={wave.id}
          className={`m3-ripple-anim ${!wave.holding ? 'fade-out' : ''}`}
          onAnimationEnd={(e) => {
            if (e.animationName === 'm3RippleFadeOut') {
              handleWaveAnimationEnd(wave.id);
            }
          }}
          style={{
            position: 'absolute',
            left: `${wave.x - wave.size / 2}px`,
            top: `${wave.y - wave.size / 2}px`,
            width: `${wave.size}px`,
            height: `${wave.size}px`,
            borderRadius: '50%',
            backgroundColor: color,
            opacity: pressedOpacity,
          }}
        />
      ))}
    </span>
  );
}
