import React from 'react';
import EmptyState from './EmptyState';

export default function Table({
  columns = [],
  rows = [],
}) {
  if (!rows || rows.length === 0) {
    return (
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key} style={{textAlign: col.align || 'left'}}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
        </table>
        <EmptyState title="No data available" description="Try adjusting your search or filters." icon="—" />
      </div>
    );
  }

  return (
    <div className="table-wrap">
      <table className="data-table">
        {/* HEADER */}
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} style={{textAlign: col.align || 'left'}}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>

        {/* BODY */}
        <tbody>
          {rows.map((row, rowIdx) => (
            <tr key={rowIdx}>
              {columns.map((col) => (
                <td key={`${rowIdx}-${col.key}`} style={{textAlign: col.align || 'left'}}>
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}