'use client';

import React, { useRef, useEffect, useState } from 'react';

export interface RippleProps {
  /** Disables ripple effect */
  disabled?: boolean;
  /** Hover state layer opacity (default: 0.08) */
  hoverOpacity?: number;
  /** Pressed state layer opacity (default: 0.18) */
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
  startTime: number;
}

export function Ripple({
  disabled = false,
  hoverOpacity = 0.08,
  pressedOpacity = 0.18,
  color = 'currentColor',
  centered = true,
  className = '',
  style = {},
}: RippleProps) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [waves, setWaves] = useState<RippleWave[]>([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || disabled) return;

    // Attach to closest interactive ancestor (.m3-nav-item, button, or direct parent)
    const target =
      container.closest('.m3-nav-item') ||
      container.closest('button') ||
      container.closest('a') ||
      container.parentElement;

    if (!target) return;

    const handlePointerEnter = () => setIsHovered(true);
    const handlePointerLeave = () => {
      setIsHovered(false);
      releaseAllWaves();
    };

    const handlePointerDown = (e: Event) => {
      const pe = e as PointerEvent;
      if (pe.button !== undefined && pe.button !== 0) return;

      const rect = container.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 2.2;
      const x = centered ? rect.width / 2 : pe.clientX - rect.left;
      const y = centered ? rect.height / 2 : pe.clientY - rect.top;

      const newWave: RippleWave = {
        id: Date.now() + Math.random(),
        x,
        y,
        size,
        holding: true,
        startTime: Date.now(),
      };

      setWaves((prev) => [...prev, newWave]);
    };

    const releaseAllWaves = () => {
      const MIN_PRESS_MS = 200;
      setWaves((prev) =>
        prev.map((w) => {
          if (!w.holding) return w;
          const elapsed = Date.now() - w.startTime;
          if (elapsed >= MIN_PRESS_MS) {
            return { ...w, holding: false };
          } else {
            // Guarantee minimum animation duration before fading out
            setTimeout(() => {
              setWaves((current) =>
                current.map((cw) => (cw.id === w.id ? { ...cw, holding: false } : cw))
              );
            }, MIN_PRESS_MS - elapsed);
            return w;
          }
        })
      );
    };

    target.addEventListener('pointerenter', handlePointerEnter);
    target.addEventListener('pointerleave', handlePointerLeave);
    target.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointerup', releaseAllWaves);
    window.addEventListener('pointercancel', releaseAllWaves);

    return () => {
      target.removeEventListener('pointerenter', handlePointerEnter);
      target.removeEventListener('pointerleave', handlePointerLeave);
      target.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', releaseAllWaves);
      window.removeEventListener('pointercancel', releaseAllWaves);
    };
  }, [disabled, centered]);

  const handleWaveFadeEnd = (id: number) => {
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
          className={`m3-ripple-wave-circle ${!wave.holding ? 'fade-out' : ''}`}
          onAnimationEnd={(e) => {
            if (e.animationName === 'm3RippleFadeOut') {
              handleWaveFadeEnd(wave.id);
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
