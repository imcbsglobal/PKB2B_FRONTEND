import React from 'react';

export default function Pagination({
  currentPage = 1,
  totalItems = 0,
  itemsPerPage = 10,
  onPageChange = () => {},
}) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (totalPages <= 1) return null;

  const handlePrevious = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };

  const handlePageClick = (page) => {
    onPageChange(page);
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div style={styles.container}>
      {/* Previous Button */}
      <button onClick={handlePrevious} disabled={currentPage === 1} style={{ ...styles.btn, ...(currentPage === 1 ? styles.btnDisabled : {}) }} aria-label="Previous page">
        Prev
      </button>

      {/* First page + ellipsis */}
      {pageNumbers[0] > 1 && (
        <>
          <button
            onClick={() => handlePageClick(1)}
            style={styles.btn}
            aria-label="Page 1"
          >
            1
          </button>
          {pageNumbers[0] > 2 && <span style={styles.ellipsis}>…</span>}
        </>
      )}

      {/* Page numbers */}
      {pageNumbers.map((page) => (
        <button
          key={page}
          onClick={() => handlePageClick(page)}
          aria-current={currentPage === page ? 'page' : undefined}
          style={{
            ...styles.btn,
            ...(currentPage === page ? styles.btnActive : {}),
          }}
        >
          {page}
        </button>
      ))}

      {/* Last page + ellipsis */}
      {pageNumbers[pageNumbers.length - 1] < totalPages && (
        <>
          {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
            <span style={styles.ellipsis}>…</span>
          )}
          <button
            onClick={() => handlePageClick(totalPages)}
            style={styles.btn}
            aria-label={`Page ${totalPages}`}
          >
            {totalPages}
          </button>
        </>
      )}

      {/* Next Button */}
      <button onClick={handleNext} disabled={currentPage >= totalPages} style={{ ...styles.btn, ...(currentPage >= totalPages ? styles.btnDisabled : {}) }} aria-label="Next page">
        Next
      </button>

      {/* Info text */}
      <span style={styles.info}>
        Page {currentPage} of {totalPages}
      </span>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '8px',
    margin: '16px 0 12px',
    flexWrap: 'wrap',
    padding: '12px',
  },
  btn: {
    padding: '8px 12px',
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-card)',
    color: 'var(--color-fg)',
    borderRadius: 'var(--radius)',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
  },
  btnActive: {
    backgroundColor: 'var(--color-primary)',
    borderColor: 'var(--color-primary)',
    color: 'var(--color-fg)',
    fontWeight: '600',
  },
  btnDisabled: {
    backgroundColor: 'var(--color-muted)',
    color: 'var(--color-muted-fg)',
    cursor: 'not-allowed',
    opacity: 0.6,
  },
  ellipsis: {
    padding: '0 4px',
    color: 'var(--color-muted-fg)',
  },
  info: {
    fontSize: '13px',
    color: 'var(--color-muted-fg)',
    marginLeft: '16px',
  },
};

