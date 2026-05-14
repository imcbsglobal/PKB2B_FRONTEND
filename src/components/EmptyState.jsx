import React from 'react';

export default function EmptyState({ 
  title = 'No data found', 
  description = 'Try adjusting your search or filters',
  icon = '📭',
  action = null 
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 20px',
        textAlign: 'center',
        color: 'var(--color-muted-fg)',
      }}
    >
      <div
        style={{
          fontSize: '64px',
          marginBottom: '16px',
          opacity: 0.6,
        }}
      >
        {icon}
      </div>
      <h3
        style={{
          fontSize: '18px',
          fontWeight: '600',
          color: 'var(--color-fg)',
          marginBottom: '8px',
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontSize: '14px',
          color: 'var(--color-muted-fg)',
          marginBottom: '24px',
          maxWidth: '400px',
        }}
      >
        {description}
      </p>
      {action && (
        <div>{action}</div>
      )}
    </div>
  );
}
