import React from 'react';

export default function FormField({
  label,
  error,
  success,
  required,
  children,
  helperText,
}) {
  return (
    <div style={{ marginBottom: '20px' }}>
      {label && (
        <label
          style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '600',
            color: 'var(--color-fg)',
            marginBottom: '6px',
          }}
        >
          {label}
          {required && <span style={{ color: 'var(--color-destructive)', marginLeft: '4px' }}>*</span>}
        </label>
      )}
      
      <div style={{ position: 'relative' }}>
        {children}
        
        {(error || success) && (
          <div
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '18px',
            }}
          >
            {error && <span style={{ color: 'var(--color-destructive)' }}>✕</span>}
            {success && <span style={{ color: 'var(--color-success)' }}>✓</span>}
          </div>
        )}
      </div>

      {error && (
        <p
          style={{
            marginTop: '6px',
            fontSize: '13px',
            color: 'var(--color-destructive)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <span>!</span> {error}
        </p>
      )}

      {helperText && !error && (
        <p
          style={{
            marginTop: '6px',
            fontSize: '13px',
            color: 'var(--color-muted-fg)',
          }}
        >
          {helperText}
        </p>
      )}
    </div>
  );
}
