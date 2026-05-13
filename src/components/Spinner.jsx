import React from 'react';

export default function Spinner({ size = 'md', color = '#3b82f6' }) {
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
        border: `3px solid rgba(0,0,0,0.1)`,
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
        background: 'rgba(255,255,255,0.9)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        zIndex: 9998,
      }}
    >
      <Spinner size="lg" />
      <p style={{ color: '#6b7280', fontSize: '14px' }}>{message}</p>
    </div>
  );
}
