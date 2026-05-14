import React from 'react';

export default function Spinner({ size = 'md', color = 'var(--color-primary)' }) {
  const sizes = {
    sm: '16px',
    md: '24px',
    lg: '40px',
  };

  return (
    <div
      style={{
        width: sizes[size],
        height: sizes[size],
        border: `3px solid oklch(0.24 0.012 256 / 0.1)`,
        borderTopColor: color,
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }}
    >
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export function FullPageSpinner({ message = 'Loading...' }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'oklch(0.985 0.002 247 / 0.9)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        zIndex: 9998,
      }}
    >
      <Spinner size="lg" />
      <p style={{ color: 'var(--color-muted-fg)', fontSize: '14px' }}>{message}</p>
    </div>
  );
}
