'use client';

import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  icon?: string;
  trailingIcon?: boolean;
}

export function FilledButton({
  children,
  onClick,
  disabled,
  type = 'button',
  className = '',
  icon,
  trailingIcon,
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`m3-btn-filled ${icon ? 'has-icon' : ''} ${className}`}
    >
      {icon && !trailingIcon && (
        <span className="material-symbols-outlined m3-btn-icon">{icon}</span>
      )}
      <span>{children}</span>
      {icon && trailingIcon && (
        <span className="material-symbols-outlined m3-btn-icon">{icon}</span>
      )}
    </button>
  );
}

export function OutlinedButton({
  children,
  onClick,
  disabled,
  type = 'button',
  className = '',
  icon,
  trailingIcon,
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`m3-btn-outlined ${icon ? 'has-icon' : ''} ${className}`}
    >
      {icon && !trailingIcon && (
        <span className="material-symbols-outlined m3-btn-icon">{icon}</span>
      )}
      <span>{children}</span>
      {icon && trailingIcon && (
        <span className="material-symbols-outlined m3-btn-icon">{icon}</span>
      )}
    </button>
  );
}

export function TextButton({
  children,
  onClick,
  disabled,
  type = 'button',
  className = '',
  icon,
  trailingIcon,
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`m3-btn-text ${icon ? 'has-icon' : ''} ${className}`}
    >
      {icon && !trailingIcon && (
        <span className="material-symbols-outlined m3-btn-icon">{icon}</span>
      )}
      <span>{children}</span>
      {icon && trailingIcon && (
        <span className="material-symbols-outlined m3-btn-icon">{icon}</span>
      )}
    </button>
  );
}
