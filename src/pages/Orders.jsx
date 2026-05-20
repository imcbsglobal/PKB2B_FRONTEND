import React, { useMemo, useState } from 'react';

import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import Pagination from '../components/Pagination';

import { orderAPI } from '../Services/api';
import { useFetchData } from '../hooks/useFetchData';
import { usePagination } from '../hooks/usePagination';
import { dataCache } from '../utils/cache';

const FILTERS = [
  { id: 'All', label: 'All' },
  { id: 'Pending', label: 'Pending' },
  { id: 'Accepted', label: 'Accepted' },
  { id: 'Completed', label: 'Complete' },
];

function formatDateToDDMMYYYY(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

function formatTimeTo12Hour(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';

  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const amPm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  if (hours === 0) hours = 12;

  return `${String(hours).padStart(2, '0')}:${minutes} ${amPm}`;
}

function OrderCell({ title, sub }) {
  return (
    <div className="orders-cell">
      <div className="orders-cell__title">{title}</div>
      {sub ? <div className="orders-cell__sub">{sub}</div> : null}
    </div>
  );
}

export default function Orders({ showToast }) {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [viewingOrderId, setViewingOrderId] = useState(null);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);

  const ordersResult = useFetchData('orders', () => orderAPI.getOrders(), [refreshKey]);
  const orders = Array.isArray(ordersResult.data) ? ordersResult.data : [];
  const loading = ordersResult.loading;

  const counts = useMemo(() => {
    return orders.reduce(
      (acc, order) => {
        acc.all += 1;
        const status = (order.status || '').toLowerCase();
        if (status === 'pending') acc.pending += 1;
        if (status === 'accepted') acc.accepted += 1;
        if (status === 'complete' || status === 'completed') acc.completed += 1;
        return acc;
      },
      { all: 0, pending: 0, accepted: 0, completed: 0 }
    );
  }, [orders]);

  const refreshOrders = () => {
    dataCache.clear('orders');
    setRefreshKey((value) => value + 1);
  };

  const exportToExcel = () => {
    if (filtered.length === 0) {
      showToast?.('No data to export', 'warning');
      return;
    }

    // Prepare data for export
    const exportData = filtered.map((order) => ({
      'Order ID': order.order_id || '—',
      'Customer Name': order.customer_name || '—',
      'Customer Code': order.customer_code || '—',
      'Phone': order.phone_number || '—',
      'Date': order.created_at ? formatDateToDDMMYYYY(order.created_at) : '—',
      'Time': order.created_at ? formatTimeTo12Hour(order.created_at) : '—',
      'Status': order.status || '—',
    }));

    // Create CSV content
    const headers = Object.keys(exportData[0]);
    let csvContent = headers.join(',') + '\n';

    exportData.forEach((row) => {
      const values = headers.map((header) => {
        let value = row[header];
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          value = '"' + value.replace(/"/g, '""') + '"';
        }
        return value;
      });
      csvContent += values.join(',') + '\n';
    });

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `orders_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast?.(`Exported ${filtered.length} orders to Excel`, 'success');
  };

  const acceptOrder = async (orderId) => {
    setActionLoading(orderId);
    try {
      await orderAPI.acceptOrder(orderId);
      // Update cached orders locally so UI updates without showing global loading
      const cached = dataCache.get('orders') || orders;
      const updated = Array.isArray(cached)
        ? cached.map(o => (o.order_id === orderId ? { ...o, status: 'accepted' } : o))
        : cached;
      dataCache.set('orders', updated);
      setRefreshKey(v => v + 1);
      showToast?.('Order accepted successfully!', 'success');
    } catch (error) {
      console.error('Accept Order Error:', error);
      showToast?.('Failed to accept order', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const completeOrder = async (orderId) => {
    setActionLoading(orderId);
    try {
      await orderAPI.completeOrder(orderId);
      // Update cached orders locally so UI updates without showing global loading
      const cached = dataCache.get('orders') || orders;
      const updated = Array.isArray(cached)
        ? cached.map(o => (o.order_id === orderId ? { ...o, status: 'completed' } : o))
        : cached;
      dataCache.set('orders', updated);
      setRefreshKey(v => v + 1);
      showToast?.('Order completed successfully!', 'success');
    } catch (error) {
      console.error('Complete Order Error:', error);
      showToast?.('Failed to complete order', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleStatusChange = async (orderId, currentStatus, nextStatus) => {
    const normalizedCurrent = (currentStatus || '').toLowerCase();

    if (nextStatus === 'pending' || nextStatus === normalizedCurrent) {
      return;
    }

    if (nextStatus === 'accepted') {
      await acceptOrder(orderId);
      return;
    }

    if (nextStatus === 'completed') {
      await completeOrder(orderId);
    }
  };

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();

    return orders.filter((order) => {
      const status = (order.status || '').toLowerCase();
      const matchesFilter =
        filter === 'All' ||
        (filter === 'Pending' && status === 'pending') ||
        (filter === 'Accepted' && status === 'accepted') ||
        (filter === 'Completed' && (status === 'complete' || status === 'completed'));

      // Date filtering
      let matchesDate = true;
      if (dateFrom || dateTo) {
        const orderDate = new Date(order.created_at);
        if (dateFrom) {
          const fromDate = new Date(dateFrom);
          matchesDate = matchesDate && orderDate >= fromDate;
        }
        if (dateTo) {
          const toDate = new Date(dateTo);
          toDate.setHours(23, 59, 59, 999);
          matchesDate = matchesDate && orderDate <= toDate;
        }
      }

      const matchesSearch = (() => {
        if (!term) return true;
        if (order.order_id?.toLowerCase().includes(term)) return true;
        if (order.customer_name?.toLowerCase().includes(term)) return true;
        if (order.customer_code?.toLowerCase().includes(term)) return true;
        if (order.phone_number?.toLowerCase().includes(term)) return true;

        // Search within products array if present
        if (Array.isArray(order.products)) {
          for (const p of order.products) {
            if (p?.item_code?.toLowerCase().includes(term)) return true;
            if (p?.item_name?.toLowerCase().includes(term)) return true;
            if (p?.barcode?.toLowerCase().includes(term)) return true;
          }
        }

        return false;
      })();

      return matchesFilter && matchesSearch && matchesDate;
    });
  }, [orders, search, filter, dateFrom, dateTo]);

  const {
    currentPage,
    totalPages,
    currentItems,
    onPageChange,
    totalItems,
  } = usePagination(filtered, itemsPerPage);

  const orderItems = useMemo(() => {
    if (!viewingOrderId) return [];
    const sel = orders.find((o) => o.order_id === viewingOrderId);
    if (!sel) return [];
    // Prefer `products` array from API, but handle older flat structure too
    if (Array.isArray(sel.products)) return sel.products;

    // fallback to older properties if present
    if (sel.item_code || sel.item_name) {
      return [
        {
          item_code: sel.item_code,
          item_name: sel.item_name,
          barcode: sel.barcode,
          quantity: sel.quantity,
          rate: sel.rate,
        },
      ];
    }

    return [];
  }, [orders, viewingOrderId]);

  if (loading) {
    return (
      <div className="page">
        <div className="page__header">
          <h1 className="page__title">Orders</h1>
        </div>
        <div style={{ marginBottom: '24px' }}>
          <LoadingSkeleton rows={5} columns={6} />
        </div>
      </div>
    );
  }

  return (
    <div className="page orders-page">
      <div className="orders-page-header">
        <div>
          <h1 className="page__title">Orders</h1>
          <p className="page__sub">{filtered.length} order{filtered.length !== 1 ? 's' : ''} found • Total: {totalItems} rows</p>
        </div>
      </div>

      <div className="orders-card">
        <div className="orders-toolbar">
          <div className="order-filter-dropdown">
            <button 
              type="button" 
              className="order-filter-dropdown__button"
              onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
              aria-expanded={filterDropdownOpen}
            >
              Filter: {FILTERS.find(f => f.id === filter)?.label}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '8px', transition: 'transform 0.2s' }}>
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            {filterDropdownOpen && (
              <div className="order-filter-dropdown__menu">
                {FILTERS.map((item) => {
                  let count = 0;
                  if (item.id === 'All') count = counts.all;
                  else if (item.id === 'Pending') count = counts.pending;
                  else if (item.id === 'Accepted') count = counts.accepted;
                  else if (item.id === 'Completed') count = counts.completed;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={`order-filter-dropdown__item ${filter === item.id ? 'order-filter-dropdown__item--active' : ''}`}
                      onClick={() => {
                        setFilter(item.id);
                        setFilterDropdownOpen(false);
                      }}
                    >
                      <span>{item.label}</span>
                      <span className="order-filter-dropdown__count">{count}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="orders-rowcount-mini">
            <select 
              className="orders-rowcount-mini-select" 
              value={itemsPerPage === totalItems ? 'all' : itemsPerPage}
              onChange={(e) => {
                if (e.target.value === 'all') {
                  setItemsPerPage(totalItems || 10);
                } else {
                  setItemsPerPage(parseInt(e.target.value, 10));
                }
              }}
              title="Rows per page"
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="30">30</option>
              <option value="all">All</option>
            </select>
          </div>

          <div className="orders-right-controls">
            <div className="orders-date-filters">
              <input
                type="date"
                className="orders-date-input"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                placeholder="From date"
                title="Filter from date"
              />
              <span className="orders-date-separator">—</span>
              <input
                type="date"
                className="orders-date-input"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                placeholder="To date"
                title="Filter to date"
              />
              {(dateFrom || dateTo) && (
                <button
                  className="orders-date-clear"
                  onClick={() => {
                    setDateFrom('');
                    setDateTo('');
                  }}
                  title="Clear date filters"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="orders-search-wrap">
              <span className="orders-search-icon">⌕</span>
              <input
                className="orders-search-input"
                placeholder="Search orders..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <button className="orders-export-btn orders-export-btn--small" onClick={exportToExcel} title="Export to Excel">
              <i className="fa-solid fa-download" style={{ marginRight: 4 }}></i>
              Export
            </button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon="📭"
            title="No orders found"
            description={search ? `No orders matching "${search}"` : 'No orders yet. Check back later!'}
          />
        ) : (
          <>
            <div className="orders-table-wrap">
            <div className="orders-table-scroll">
              <table className="orders-table">
                <thead className="orders-table-head-sticky">
                  <tr>
                    <th>ORDER ID</th>
                    <th>DATE</th>
                    <th>CODE</th>
                    <th>CUSTOMER</th>
                    <th>NUMBER</th>
                    <th>ITEM</th>
                    <th>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((row) => {
                    const status = (row.status || '').toLowerCase();
                    const actionValue =
                      status === 'accepted' ? 'accepted' :
                      (status === 'completed' || status === 'complete') ? 'completed' :
                      'pending';
                    const actionSelectClass =
                      actionValue === 'accepted'
                        ? 'orders-action-select--accepted'
                        : actionValue === 'completed'
                          ? 'orders-action-select--completed'
                          : 'orders-action-select--pending';

                    return (
                      <tr key={row.order_id}>
                        <td className="orders-table__id" title={row.order_id}>{row.order_id || '—'}</td>
                        <td title={row.created_at}>
                          {row.created_at ? (
                            <div className="orders-date-stack">
                              <div>{formatDateToDDMMYYYY(row.created_at)}</div>
                              <div className="orders-date-stack__time">{formatTimeTo12Hour(row.created_at)}</div>
                            </div>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td title={row.customer_code}>{row.customer_code || '—'}</td>
                        <td title={`${row.customer_name} (${row.customer_code})`}><OrderCell title={row.customer_name || '—'} sub={row.customer_code || '—'} /></td>
                        <td title={row.phone_number}>{row.phone_number || '—'}</td>
                        <td>
                          <button
                            className="orders-view-btn"
                            onClick={() => setViewingOrderId(row.order_id)}
                            title="View all items"
                          >
                            <i className="fa-solid fa-eye" aria-hidden="true" style={{ marginRight: 8 }}></i>
                            View Items
                          </button>
                        </td>
                        <td className="orders-table__action">
                          <div className="orders-actions">
                            <select
                              className={`orders-action-select ${actionSelectClass}`}
                              value={actionValue}
                              onChange={(e) => handleStatusChange(row.order_id, row.status, e.target.value)}
                              disabled={actionLoading === row.order_id}
                              title="Update order status"
                            >
                              <option value="pending">Pending</option>
                              <option value="accepted">Accept</option>
                              <option value="completed">Completed</option>
                            </select>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            </div>
            <div className="orders-footer">
              <div className="orders-rowcount-info">
                Showing {currentItems.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} - {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} rows
              </div>
              <Pagination
                currentPage={currentPage}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                onPageChange={onPageChange}
              />
            </div>
          </>
        )}
      </div>

      {viewingOrderId && (
        <div className="orders-modal-overlay" onClick={() => setViewingOrderId(null)}>
          <div className="orders-modal" onClick={(e) => e.stopPropagation()}>
            <div className="orders-modal-header">
              <h2>Order Items - {viewingOrderId}</h2>
              <button className="orders-modal-close" onClick={() => setViewingOrderId(null)}>✕</button>
            </div>
            <div className="orders-modal-body">
              <table className="orders-modal-table">
                <thead>
                  <tr>
                    <th>ITEM CODE</th>
                    <th>ITEM NAME</th>
                    <th>QTY</th>
                    <th>RATE</th>
                  </tr>
                </thead>
                <tbody>
                  {orderItems.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.item_code || '—'}</td>
                      <td><OrderCell title={item.item_name || '—'} sub={item.barcode || '—'} /></td>
                      <td>{item.quantity ?? 0}</td>
                      <td>₹ {Number(item.rate || 0).toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .orders-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--space-4);
          padding: var(--space-4) var(--space-5);
          border-bottom: 1px solid var(--color-border);
          flex-wrap: wrap;
          min-height: auto;
        }

        .orders-filters {
          display: flex;
          align-items: center;
          gap: 2px;
          background: #fff;
          border: 1px solid var(--color-border);
          border-radius: 12px;
          padding: 3px;
          flex-shrink: 0;
          white-space: nowrap;
        }

        .orders-right-controls {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          flex: 1;
          min-width: 0;
          justify-content: flex-end;
          flex-wrap: wrap;
        }

        .orders-date-filters {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          border: 1px solid var(--color-border);
          border-radius: 8px;
          background: var(--color-card);
          flex-shrink: 0;
        }

        .orders-date-input {
          padding: 6px 8px;
          border: 1px solid var(--color-border);
          border-radius: 6px;
          background: var(--color-card);
          color: var(--color-fg);
          font-size: var(--text-sm);
          font-family: 'Inter', sans-serif;
          cursor: pointer;
          transition: border-color var(--duration-base) var(--ease);
        }

        .orders-date-input:focus {
          outline: none;
          border-color: var(--color-primary);
          box-shadow: 0 0 0 3px var(--color-primary-ring);
        }

        .orders-date-separator {
          color: var(--color-muted-fg);
          font-size: var(--text-sm);
          opacity: 0.5;
        }

        .orders-date-clear {
          padding: 4px 6px;
          border: none;
          background: transparent;
          color: var(--color-muted-fg);
          cursor: pointer;
          font-size: 16px;
          transition: color var(--duration-base) var(--ease);
        }

        .orders-date-clear:hover {
          color: var(--color-fg);
        }

        .orders-filter-btn {
          padding: 8px 12px;
          border: none;
          border-radius: 8px;
          background: transparent;
          color: var(--color-muted-fg);
          font-size: var(--text-sm);
          font-weight: var(--weight-semibold);
          font-family: 'Inter', sans-serif;
          cursor: pointer;
          white-space: nowrap;
          transition: background var(--duration-base) var(--ease), color var(--duration-base) var(--ease);
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .orders-filter-btn:hover {
          color: var(--color-fg);
        }

        .orders-filter-btn--active {
          background: #111;
          color: #fff;
        }

        .orders-filter-btn__count {
          opacity: 0.65;
          font-weight: var(--weight-semibold);
        }

        .orders-search-wrap {
          position: relative;
          flex: 0 1 auto;
          min-width: 200px;
          max-width: 350px;
          flex-shrink: 0;
        }

        .orders-search-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--color-muted-fg);
          font-size: 18px;
          pointer-events: none;
        }

        .orders-search-input {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 2.4rem;
          border: 1px solid var(--color-border);
          border-radius: 12px;
          background: var(--color-card);
          color: var(--color-fg);
          font-size: var(--text-base);
          font-family: 'Inter', sans-serif;
          transition: border-color var(--duration-base) var(--ease), box-shadow var(--duration-base) var(--ease);
        }

        .orders-search-input::placeholder {
          color: var(--color-muted-fg);
        }

        .orders-search-input:focus {
          outline: none;
          border-color: var(--color-primary);
          box-shadow: 0 0 0 3px var(--color-primary-ring);
        }

        .orders-export-btn {
          padding: 0.75rem 1rem;
          border: 1px solid var(--color-border);
          border-radius: 8px;
          background: var(--color-primary);
          color: white;
          font-size: var(--text-sm);
          font-weight: var(--weight-medium);
          font-family: 'Inter', sans-serif;
          cursor: pointer;
          transition: all var(--duration-base) var(--ease);
          display: inline-flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .orders-export-btn:hover {
          background: var(--color-primary-dark, #0d47a1);
          transform: translateY(-1px);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .orders-export-btn:active {
          transform: translateY(0);
        }

        .orders-rowcount-mini {
          display: flex;
          align-items: center;
          flex-shrink: 0;
        }

        .orders-rowcount-mini-select {
          padding: 6px 8px;
          border: 1px solid var(--color-border);
          border-radius: 6px;
          background: var(--color-card);
          color: var(--color-fg);
          font-size: var(--text-sm);
          font-weight: var(--weight-medium);
          font-family: 'Inter', sans-serif;
          cursor: pointer;
          transition: border-color var(--duration-base) var(--ease), box-shadow var(--duration-base) var(--ease);
          min-width: 70px;
        }

        .orders-rowcount-mini-select:hover {
          border-color: var(--color-primary);
        }

        .orders-rowcount-mini-select:focus {
          outline: none;
          border-color: var(--color-primary);
          box-shadow: 0 0 0 3px var(--color-primary-ring);
        }

        .orders-table-wrap {
          width: 100%;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .orders-table-scroll {
          overflow-y: auto;
          overflow-x: auto;
          height: 500px;
          flex: 1;
        }

        .orders-table {
          width: 100%;
          border-collapse: collapse;
          table-layout: fixed;
        }

        .orders-table-head-sticky {
          position: sticky;
          top: 0;
          background: var(--color-card);
          z-index: 10;
        }

        .orders-table th {
          text-align: left;
          padding: 1rem 0.75rem;
          font-size: var(--text-xs);
          font-weight: var(--weight-semibold);
          color: var(--color-muted-fg);
          letter-spacing: 0.05em;
          text-transform: uppercase;
          border-bottom: 1px solid var(--color-border);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          background: var(--color-card);
        }

        .orders-table td {
          padding: 1rem 0.75rem;
          border-bottom: 1px solid var(--color-border);
          color: var(--color-fg);
          font-size: var(--text-base);
          vertical-align: middle;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .orders-table tbody tr:hover {
          background: rgba(0, 0, 0, 0.015);
        }

        .orders-table__id,
        .orders-table__rate {
          font-weight: var(--weight-semibold);
          white-space: nowrap;
        }

        /* Column width distribution */
        .orders-table th:nth-child(1),
        .orders-table td:nth-child(1) {
          width: 10%;
        }

        .orders-table th:nth-child(2),
        .orders-table td:nth-child(2) {
          width: 14%;
        }

        .orders-table th:nth-child(3),
        .orders-table td:nth-child(3),
        .orders-table th:nth-child(4),
        .orders-table td:nth-child(4),
        .orders-table th:nth-child(5),
        .orders-table td:nth-child(5),
        .orders-table th:nth-child(6),
        .orders-table td:nth-child(6) {
          width: 12%;
        }

        .orders-table th:nth-child(7),
        .orders-table td:nth-child(7) {
          width: 14%;
        }

        .orders-table__action {
          overflow: visible !important;
          white-space: nowrap;
        }

        .orders-cell {
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 140px;
        }

        .orders-cell__title {
          font-weight: var(--weight-semibold);
          color: var(--color-fg);
          white-space: nowrap;
        }

        .orders-cell__sub {
          font-size: var(--text-xs);
          color: var(--color-muted-fg);
          white-space: nowrap;
        }

        .orders-date-stack {
          display: flex;
          flex-direction: column;
          gap: 2px;
          white-space: nowrap;
        }

        .orders-date-stack__time {
          font-size: var(--text-xs);
          color: var(--color-muted-fg);
          text-transform: lowercase;
        }

        .orders-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          white-space: nowrap;
        }

        .orders-action-select {
          min-width: 130px;
          padding: 8px 10px;
          border: 1px solid var(--color-border);
          border-radius: 8px;
          background: var(--color-card);
          color: var(--color-fg);
          font-size: var(--text-sm);
          font-weight: var(--weight-medium);
          cursor: pointer;
          transition: border-color var(--duration-base) var(--ease), box-shadow var(--duration-base) var(--ease);
        }

        .orders-action-select:focus {
          outline: none;
          border-color: var(--color-primary);
          box-shadow: 0 0 0 3px var(--color-primary-ring);
        }

        .orders-action-select--pending {
          background: rgba(245, 158, 11, 0.14);
          border-color: rgba(245, 158, 11, 0.35);
          color: #92400e;
        }

        .orders-action-select--accepted {
          background: rgba(37, 99, 235, 0.12);
          border-color: rgba(37, 99, 235, 0.35);
          color: #1d4ed8;
        }

        .orders-action-select--completed {
          background: rgba(34, 197, 94, 0.14);
          border-color: rgba(34, 197, 94, 0.35);
          color: #166534;
        }

        .orders-view-btn {
          padding: 6px 12px;
          border: 1px solid var(--color-border);
          border-radius: 8px;
          background: var(--color-card);
          color: var(--color-fg);
          font-size: var(--text-sm);
          font-weight: var(--weight-medium);
          cursor: pointer;
          transition: all var(--duration-base) var(--ease);
          white-space: nowrap;
        }

        .orders-view-btn:hover {
          background: var(--color-primary);
          color: white;
          border-color: var(--color-primary);
        }

        .orders-top-section {
          display: flex;
          align-items: center;
          padding: var(--space-4) var(--space-5);
          border-bottom: 1px solid var(--color-border);
          background: var(--color-card);
        }

        .orders-rowcount-control {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
        }

        .orders-rowcount-label {
          font-size: var(--text-sm);
          color: var(--color-muted-fg);
          font-weight: var(--weight-medium);
          white-space: nowrap;
        }

        .orders-rowcount-select {
          padding: 6px 10px;
          border: 1px solid var(--color-border);
          border-radius: 6px;
          background: var(--color-card);
          color: var(--color-fg);
          font-size: var(--text-sm);
          font-weight: var(--weight-medium);
          font-family: 'Inter', sans-serif;
          cursor: pointer;
          transition: border-color var(--duration-base) var(--ease), box-shadow var(--duration-base) var(--ease);
          min-width: 80px;
        }

        .orders-rowcount-select:hover {
          border-color: var(--color-primary);
        }

        .orders-rowcount-select:focus {
          outline: none;
          border-color: var(--color-primary);
          box-shadow: 0 0 0 3px var(--color-primary-ring);
        }

        .orders-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--space-4);
          padding: var(--space-4) var(--space-5);
          border-top: 1px solid var(--color-border);
          flex-wrap: wrap;
        }

        .orders-rowcount-info {
          font-size: var(--text-sm);
          color: var(--color-muted-fg);
          font-weight: var(--weight-medium);
          white-space: nowrap;
        }

        .orders-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .orders-modal {
          background: var(--color-card);
          border-radius: var(--radius-lg);
          width: 90%;
          max-width: 800px;
          max-height: 80vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }

        .orders-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-5);
          border-bottom: 1px solid var(--color-border);
        }

        .orders-modal-header h2 {
          margin: 0;
          font-size: var(--text-xl);
          font-weight: var(--weight-semibold);
          color: var(--color-fg);
        }

        .orders-modal-close {
          background: none;
          border: none;
          font-size: 24px;
          color: var(--color-muted-fg);
          cursor: pointer;
          padding: 4px 8px;
          line-height: 1;
          transition: color var(--duration-base) var(--ease);
        }

        .orders-modal-close:hover {
          color: var(--color-fg);
        }

        .orders-modal-body {
          padding: var(--space-5);
          overflow-y: auto;
          max-height: calc(80vh - 80px);
        }

        .orders-modal-table {
          width: 100%;
          border-collapse: collapse;
        }

        .orders-modal-table th {
          text-align: left;
          padding: 0.75rem;
          font-size: var(--text-xs);
          font-weight: var(--weight-semibold);
          color: var(--color-muted-fg);
          letter-spacing: 0.05em;
          text-transform: uppercase;
          border-bottom: 1px solid var(--color-border);
        }

        .orders-modal-table td {
          padding: 0.75rem;
          border-bottom: 1px solid var(--color-border);
          color: var(--color-fg);
          font-size: var(--text-base);
        }

        .orders-modal-table tbody tr:hover {
          background: rgba(0, 0, 0, 0.015);
        }

        .orders-page {
          display: flex;
          flex-direction: column;
          gap: var(--space-5);
        }

        .orders-card {
          display: flex;
          flex-direction: column;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          background: var(--color-card);
          overflow: hidden;
        }

        @media (max-width: 1024px) {
          .orders-toolbar {
            flex-wrap: wrap;
            gap: var(--space-3);
            min-height: auto;
          }

          .orders-right-controls {
            width: 100%;
            justify-content: space-between;
          }

          .orders-search-wrap {
            margin-left: 0;
            max-width: none;
            min-width: auto;
            flex-shrink: 1;
          }

          .orders-filters {
            flex-wrap: wrap;
          }

          .orders-table-scroll {
            height: 400px;
          }

          .orders-date-filters {
            flex-wrap: wrap;
            width: 100%;
            justify-content: space-between;
          }
        }
      `}</style>
    </div>
  );
}
