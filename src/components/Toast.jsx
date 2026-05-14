import React, { useEffect } from 'react';

export default function Toast({ message, type = 'info', onClose, duration = 3000 }) {
  useEffect(() => {
    if (duration) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const colors = {
    success: { bg: 'var(--color-success)', icon: '✓' },
    error: { bg: 'var(--color-destructive)', icon: '✕' },
    warning: { bg: 'var(--color-warning)', icon: '⚠' },
    info: { bg: 'var(--color-primary)', icon: 'ℹ' },
  };

  const { bg, icon } = colors[type] || colors.info;

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: bg,
        color: 'var(--color-fg)',
        padding: '16px 24px',
        borderRadius: '8px',
        border: '1px solid oklch(0.24 0.012 256 / 0.08)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        zIndex: 9999,
        minWidth: '300px',
        animation: 'slideIn 0.3s ease-out',
      }}
    >
      <span style={{ fontSize: '20px', fontWeight: 'bold' }}>{icon}</span>
      <span style={{ flex: 1, fontSize: '14px', fontWeight: '500' }}>{message}</span>
      <button
        onClick={onClose}
        style={{
          background: 'rgba(255,255,255,0.2)',
          border: 'none',
          color: 'var(--color-fg)',
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          cursor: 'pointer',
          fontSize: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        ×
      </button>
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(400px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
