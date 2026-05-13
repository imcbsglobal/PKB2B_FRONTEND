import React from 'react';

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
        <div className="table-empty">
          📭 No data available
        </div>
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