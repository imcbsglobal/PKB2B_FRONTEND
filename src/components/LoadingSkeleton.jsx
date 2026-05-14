import React from 'react';

export default function LoadingSkeleton({ rows = 5, columns = 4 }) {
  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <table style={{
        width: '100%',
        minWidth: '1000px',
        borderCollapse: 'collapse',
      }}>
        <thead>
          <tr>
            {Array(columns).fill(0).map((_, i) => (
              <th key={i} style={{
                padding: '16px',
                textAlign: 'left',
                borderBottom: '1px solid var(--color-border)',
              }}>
                <div style={{
                  height: '16px',
                  background: 'var(--color-muted)',
                  borderRadius: '4px',
                  animation: 'pulse 2s infinite',
                }} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array(rows).fill(0).map((_, rowIdx) => (
            <tr key={rowIdx}>
              {Array(columns).fill(0).map((_, colIdx) => (
                <td key={colIdx} style={{
                  padding: '16px',
                  borderBottom: '1px solid var(--color-border)',
                }}>
                  <div style={{
                    height: '14px',
                    background: 'var(--color-muted)',
                    borderRadius: '4px',
                    animation: 'pulse 2s infinite',
                  }} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
