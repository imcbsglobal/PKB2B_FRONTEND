// ============================================================
// PEEKAY — Shared UI Components
// ============================================================

import React from 'react';

// ── Badge ──────────────────────────────────────────────────
export function Badge({ variant = 'default', children, className = '' }) {
  return (
    <span
      className={[
        'badge',
        `badge--${variant}`,
        className,
      ].filter(Boolean).join(' ')}
    >
      {children}
    </span>
  );
}

// ── Input ─────────────────────────────────────────────────
export function Input({
  label,
  error,
  hint,
  icon,
  iconRight,
  className = '',
  ...props
}) {
  return (
    <div className={['field', className].filter(Boolean).join(' ')}>
      {label && <label className="fieldLabel">{label}</label>}

      <div className="inputWrap">
        {icon && (
          <span className="inputIconLeft">{icon}</span>
        )}

        <input
          className={[
            'input',
            icon ? 'inputHasLeft' : '',
            iconRight ? 'inputHasRight' : '',
            error ? 'inputError' : '',
          ].filter(Boolean).join(' ')}
          {...props}
        />

        {iconRight && (
          <span className="inputIconRight">{iconRight}</span>
        )}
      </div>

      {error && <p className="fieldError">{error}</p>}
      {!error && hint && <p className="fieldHint">{hint}</p>}
    </div>
  );
}

// ── Select ────────────────────────────────────────────────
export function Select({
  label,
  error,
  hint,
  options = [],
  className = '',
  ...props
}) {
  return (
    <div className={['field', className].filter(Boolean).join(' ')}>
      {label && <label className="fieldLabel">{label}</label>}

      <div className="inputWrap">
        <select
          className={[
            'input',
            'select',
            error ? 'inputError' : '',
          ].filter(Boolean).join(' ')}
          {...props}
        >
          {options.map(opt =>
            typeof opt === 'string'
              ? (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              )
              : (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              )
          )}
        </select>

        <span className="selectChevron">▾</span>
      </div>

      {error && <p className="fieldError">{error}</p>}
      {!error && hint && <p className="fieldHint">{hint}</p>}
    </div>
  );
}

// ── Card ──────────────────────────────────────────────────
export function Card({
  header,
  footer,
  padding = 'md',
  className = '',
  children,
}) {
  return (
    <div className={['card', className].filter(Boolean).join(' ')}>
      {header && (
        <div className="cardHeader">{header}</div>
      )}

      <div className={['cardBody', `cardPad--${padding}`].join(' ')}>
        {children}
      </div>

      {footer && (
        <div className="cardFooter">{footer}</div>
      )}
    </div>
  );
}

// ── StatCard ──────────────────────────────────────────────
export function StatCard({
  label,
  value,
  delta,
  deltaLabel,
  icon,
  variant = 'default',
}) {
  const isPositive = delta > 0;

  return (
    <div className="statCard">
      <div className="statTop">
        <span className="statLabel">{label}</span>

        {icon && (
          <span className={['statIcon', `statIcon--${variant}`].join(' ')}>
            {icon}
          </span>
        )}
      </div>

      <p className="statValue">{value}</p>

      {delta !== undefined && (
        <p
          className={[
            'statDelta',
            isPositive ? 'deltaUp' : 'deltaDown',
          ].join(' ')}
        >
          {isPositive ? '▲' : '▼'} {Math.abs(delta)}%
          <span className="statDeltaLabel">
            {' '} {deltaLabel}
          </span>
        </p>
      )}
    </div>
  );
}

// ── Table ─────────────────────────────────────────────────
export function Table({
  columns = [],
  rows = [],
  onRowClick,
  loading,
  emptyMessage = 'No records found',
}) {
  return (
    <div className="tableWrap">
      <table className="table">
        <thead>
          <tr>
            {columns.map(col => (
              <th
                key={col.key}
                className="th"
                style={{ textAlign: col.align || 'left' }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="tdEmpty">
                <span className="tableSpinner" /> Loading…
              </td>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="tdEmpty">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row, i) => (
              <tr
                key={row.id ?? i}
                className={[
                  'tr',
                  onRowClick ? 'trClickable' : '',
                ].filter(Boolean).join(' ')}
                onClick={
                  onRowClick
                    ? () => onRowClick(row)
                    : undefined
                }
              >
                {columns.map(col => (
                  <td
                    key={col.key}
                    className="td"
                    style={{ textAlign: col.align || 'left' }}
                  >
                    {col.render
                      ? col.render(row[col.key], row)
                      : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}