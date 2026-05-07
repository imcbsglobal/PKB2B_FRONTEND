// ============================================================
// PEEKAY — usePagination Hook
// Centralises page state and derived values.
//
// Usage:
//   const pagination = usePagination({ totalItems: orders.length, initialPageSize: 25 });
//
//   <Table rows={pagination.paginate(orders)} ... />
//   <Pagination
//     currentPage={pagination.currentPage}
//     totalPages={pagination.totalPages}
//     totalItems={pagination.totalItems}
//     pageSize={pagination.pageSize}
//     onPageChange={pagination.setPage}
//     onPageSizeChange={pagination.setPageSize}
//   />
// ============================================================

import { useState, useMemo } from 'react';

/**
 * @param {object} opts
 * @param {number} opts.totalItems
 * @param {number} [opts.initialPage=1]
 * @param {number} [opts.initialPageSize=10]
 */
export default function usePagination({
  totalItems       = 0,
  initialPage      = 1,
  initialPageSize  = 10,
} = {}) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize,    setPageSizeRaw] = useState(initialPageSize);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalItems / pageSize)),
    [totalItems, pageSize]
  );

  function setPage(page) {
    setCurrentPage(Math.min(Math.max(1, page), totalPages));
  }

  function setPageSize(size) {
    setPageSizeRaw(size);
    setCurrentPage(1);          // reset to page 1 when size changes
  }

  /**
   * Slice a full array to the current page window.
   * @template T
   * @param {T[]} items
   * @returns {T[]}
   */
  function paginate(items) {
    const start = (currentPage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }

  return {
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    setPage,
    setPageSize,
    paginate,
  };
}