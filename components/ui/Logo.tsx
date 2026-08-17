import React from 'react';

interface LogoProps {
  size?: number;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function Logo({
  size = 28,
  color = 'var(--md-sys-color-primary)',
  className = '',
  style = {},
}: LogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      style={{
        display: 'inline-block',
        verticalAlign: 'middle',
        flexShrink: 0,
        ...style,
      }}
    >
      <path
        d="m87.668 95v-52.168c0-20.895-16.941-37.832-37.836-37.832s-37.832 16.938-37.832 37.832v52.168h11v-44h11.828v11h11.391v11h11.391v11h11.391v11z"
        fillRule="evenodd"
        fill={color}
      />
    </svg>
  );
}
