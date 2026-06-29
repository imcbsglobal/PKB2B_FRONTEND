import { useState, useMemo, useEffect, useRef } from 'react';

export function usePagination(items = [], itemsPerPage = 10) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(items.length / itemsPerPage);

  // Reset to page 1 whenever the filtered list actually changes (items reference or length)
  const prevItemsRef = useRef(items);
  useEffect(() => {
    if (prevItemsRef.current !== items) {
      prevItemsRef.current = items;
      setCurrentPage(1);
    }
  }, [items]);

  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return items.slice(start, start + itemsPerPage);
  }, [items, currentPage, itemsPerPage]);

  const onPageChange = (page) => {
    const p = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return {
    currentPage,
    totalPages,
    currentItems,
    onPageChange,
    goToPage: onPageChange,
    totalItems: items.length,
  };
}
