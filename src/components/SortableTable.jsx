import React, { useState, useMemo } from 'react';

export default function SortableTable({ columns = [], rows = [] }) {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const sortedRows = useMemo(() => {
    if (!sortConfig.key) return rows;

    return [...rows].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      if (aVal === bVal) return 0;
      
      const comparison = aVal < bVal ? -1 : 1;
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }, [rows, sortConfig]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                onClick={() => col.sortable !== false && handleSort(col.key)}
                style={{
                  padding: '16px',
                  textAlign: col.align || 'left',
                  borderBottom: '2px solid var(--color-border)',
                  whiteSpace: 'nowrap',
                  cursor: col.sortable !== false ? 'pointer' : 'default',
                  userSelect: 'none',
                  background: sortConfig.key === col.key ? 'var(--color-muted)' : 'transparent',
                  fontWeight: '600',
                  fontSize: '13px',
                  color: 'var(--color-muted-fg)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: col.align === 'center' ? 'center' : 'flex-start' }}>
                  {col.label}
                  {col.sortable !== false && sortConfig.key === col.key && (
                    <span style={{ fontSize: '12px' }}>
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedRows.map((row, index) => (
            <tr
              key={index}
              style={{
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-muted)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  style={{
                    padding: '16px',
                    borderBottom: '1px solid var(--color-border)',
                    textAlign: col.align || 'left',
                  }}
                >
                  {col.render ? col.render(row[col.key], row) : row[col.key] || '-'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
