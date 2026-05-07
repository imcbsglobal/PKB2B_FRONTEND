// ============================================================
// PEEKAY — Pagination Component
// ============================================================

import React from 'react';

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

function getPageNumbers(current, total) {

  if (total <= 7) {
    return Array.from(
      { length: total },
      (_, i) => i + 1
    );
  }

  const pages = [];

  const showLeft = current > 4;

  const showRight = current < total - 3;

  pages.push(1);

  if (showLeft) {
    pages.push('…');
  }

  const start = showLeft
    ? Math.max(2, current - 1)
    : 2;

  const end = showRight
    ? Math.min(total - 1, current + 1)
    : total - 1;

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (showRight) {
    pages.push('…');
  }

  pages.push(total);

  return pages;
}

export default function Pagination({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  pageSize = 10,
  onPageChange = () => {},
  onPageSizeChange = null,
  showInfo = true,
  className = '',
}) {

  const pages = getPageNumbers(
    currentPage,
    totalPages
  );

  const startRow =
    totalItems === 0
      ? 0
      : (currentPage - 1) * pageSize + 1;

  const endRow = Math.min(
    currentPage * pageSize,
    totalItems
  );

  function go(page) {

    if (
      page < 1 ||
      page > totalPages ||
      page === currentPage
    ) {
      return;
    }

    onPageChange(page);
  }

  return (
    <div
      className={[
        'pagination-root',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >

      {/* Info */}
      {showInfo && totalItems > 0 && (
        <p className="pagination-info">

          Showing
          {' '}
          <strong>
            {startRow}–{endRow}
          </strong>

          {' '}of{' '}

          <strong>
            {totalItems}
          </strong>

          {' '}records

        </p>
      )}

      {/* Pages */}
      <nav
        className="pagination-nav"
        aria-label="Pagination"
      >

        {/* Prev */}
        <button
          className="pagination-btn pagination-icon"
          onClick={() => go(currentPage - 1)}
          disabled={currentPage === 1}
        >
          ‹
        </button>

        {pages.map((p, idx) =>

          p === '…'
            ? (
              <span
                key={`ellipsis-${idx}`}
                className="pagination-ellipsis"
              >
                …
              </span>
            )
            : (
              <button
                key={p}
                className={[
                  'pagination-btn',
                  p === currentPage
                    ? 'pagination-active'
                    : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => go(p)}
              >
                {p}
              </button>
            )
        )}

        {/* Next */}
        <button
          className="pagination-btn pagination-icon"
          onClick={() => go(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          ›
        </button>

      </nav>

      {/* Size selector */}
      {onPageSizeChange && (

        <label className="pagination-size-label">

          Rows

          <select
            className="pagination-size-select"
            value={pageSize}
            onChange={e =>
              onPageSizeChange(
                Number(e.target.value)
              )
            }
          >

            {PAGE_SIZE_OPTIONS.map(s => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}

          </select>

        </label>
      )}

    </div>
  );
}