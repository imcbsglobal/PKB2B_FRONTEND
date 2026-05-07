// ============================================================
// PEEKAY — Button Component
// ============================================================

import React from 'react';

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  icon = null,
  iconRight = null,
  type = 'button',
  onClick,
  className = '',
  children,
  ...rest
}) {

  const isDisabled = disabled || loading;

  const cls = [
    'btn',
    `btn--${variant}`,
    `btn--${size}`,
    fullWidth ? 'btn--full' : '',
    loading ? 'btn--loading' : '',
    isDisabled ? 'btn--disabled' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      className={cls}
      disabled={isDisabled}
      onClick={onClick}
      {...rest}
    >

      {loading && (
        <span
          className="spinner"
          aria-hidden="true"
        />
      )}

      {!loading && icon && (
        <span
          className="iconLeft"
          aria-hidden="true"
        >
          {icon}
        </span>
      )}

      {children && (
        <span className="label">
          {children}
        </span>
      )}

      {!loading && iconRight && (
        <span
          className="iconRight"
          aria-hidden="true"
        >
          {iconRight}
        </span>
      )}

    </button>
  );
}