import React, { useMemo, useState } from 'react';

import Badge from '../components/Badge';
import Button from '../components/Button';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import Spinner from '../components/Spinner';
import Pagination from '../components/Pagination';

import { orderAPI } from '../Services/api';
import { useFetchData } from '../hooks/useFetchData';
import { usePagination } from '../hooks/usePagination';
import { dataCache } from '../utils/cache';

const STATUS_VARIANT = {
  pending: 'warning',
  completed: 'success',
  accepted: 'info',
};

const FILTERS = [
  { id: 'All', label: 'All' },
  { id: 'Pending', label: 'Pending' },
  { id: 'Completed', label: 'Complete' },
];

function getStatusVariant(status) {
  return STATUS_VARIANT[status?.toLowerCase()] ?? 'default';
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

  const ordersResult = useFetchData('orders', () => orderAPI.getOrders(), [refreshKey]);
  const orders = Array.isArray(ordersResult.data) ? ordersResult.data : [];
  const loading = ordersResult.loading;

  const counts = useMemo(() => {
    return orders.reduce(
      (acc, order) => {
        acc.all += 1;
        const status = (order.status || '').toLowerCase();
        if (status === 'pending') acc.pending += 1;
        if (status === 'complete' || status === 'completed') acc.completed += 1;
        return acc;
      },
      { all: 0, pending: 0, completed: 0 }
    );
  }, [orders]);

  const refreshOrders = () => {
    dataCache.clear('orders');
    setRefreshKey((value) => value + 1);
  };

  const acceptOrder = async (orderId) => {
    setActionLoading(orderId);
    try {
      await orderAPI.acceptOrder(orderId);
      refreshOrders();
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
      refreshOrders();
      showToast?.('Order completed successfully!', 'success');
    } catch (error) {
      console.error('Complete Order Error:', error);
      showToast?.('Failed to complete order', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();

    return orders.filter((order) => {
      const status = (order.status || '').toLowerCase();
      const matchesFilter =
        filter === 'All' ||
        (filter === 'Pending' && status === 'pending') ||
        (filter === 'Completed' && (status === 'complete' || status === 'completed'));

      const matchesSearch =
        !term ||
        order.order_id?.toLowerCase().includes(term) ||
        order.customer_name?.toLowerCase().includes(term) ||
        order.customer_code?.toLowerCase().includes(term) ||
        order.phone_number?.toLowerCase().includes(term) ||
        order.item_code?.toLowerCase().includes(term) ||
        order.item_name?.toLowerCase().includes(term) ||
        order.barcode?.toLowerCase().includes(term);

      return matchesFilter && matchesSearch;
    });
  }, [orders, search, filter]);

  const {
    currentPage,
    totalPages,
    currentItems,
    onPageChange,
    totalItems,
  } = usePagination(filtered, 10);

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
          <p className="page__sub">{filtered.length} orders found</p>
        </div>
      </div>

      <div className="orders-card">
        <div className="orders-toolbar">
          <div className="orders-filters" role="tablist" aria-label="Order filters">
            {FILTERS.map((item) => {
              const count = item.id === 'All' ? counts.all : item.id === 'Pending' ? counts.pending : counts.completed;

              return (
                <button
                  key={item.id}
                  type="button"
                  className={`orders-filter-btn ${filter === item.id ? 'orders-filter-btn--active' : ''}`}
                  onClick={() => setFilter(item.id)}
                  aria-pressed={filter === item.id}
                >
                  <span>{item.label}</span>
                  <span className="orders-filter-btn__count">{count}</span>
                </button>
              );
            })}
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
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon="📭"
            title="No orders found"
            description={search ? `No orders matching "${search}"` : 'No orders yet. Check back later!'}
          />
        ) : (
          <div className="orders-table-wrap">
            <div className="orders-table-scroll">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>ORDER ID</th>
                    <th>CUSTOMER</th>
                    <th>CODE</th>
                    <th>PHONE</th>
                    <th>ITEM CODE</th>
                    <th>ITEM NAME</th>
                    <th>BARCODE</th>
                    <th>QTY</th>
                    <th>RATE</th>
                    <th>STATUS</th>
                    <th>DATE</th>
                    <th>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((row) => {
                    const statusVariant = getStatusVariant(row.status);

                    return (
                      <tr key={row.order_id}>
                        <td className="orders-table__id" title={row.order_id}>{row.order_id || '—'}</td>
                        <td title={`${row.customer_name} (${row.customer_code})`}><OrderCell title={row.customer_name || '—'} sub={row.customer_code || '—'} /></td>
                        <td title={row.customer_code}>{row.customer_code || '—'}</td>
                        <td title={row.phone_number}>{row.phone_number || '—'}</td>
                        <td title={row.item_code}>{row.item_code || '—'}</td>
                        <td title={`${row.item_name} (${row.barcode})`}><OrderCell title={row.item_name || '—'} sub={row.barcode || '—'} /></td>
                        <td title={row.barcode}>{row.barcode || '—'}</td>
                        <td title={row.quantity}>{row.quantity ?? 0}</td>
                        <td className="orders-table__rate" title={`₹ ${Number(row.rate || 0).toLocaleString('en-IN')}`}>₹ {Number(row.rate || 0).toLocaleString('en-IN')}</td>
                        <td><Badge variant={statusVariant}>{row.status || '—'}</Badge></td>
                        <td title={row.created_at}>{row.created_at || '—'}</td>
                        <td className="orders-table__action">
                          <div className="orders-actions">
                            {row.status?.toLowerCase() === 'pending' ? (
                              <>
                                <Button
                                  size="sm"
                                  variant="primary"
                                  onClick={() => acceptOrder(row.order_id)}
                                  disabled={actionLoading === row.order_id}
                                  title="Accept this order"
                                >
                                  {actionLoading === row.order_id ? <Spinner size="sm" color="var(--color-fg)" /> : 'Accept'}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => completeOrder(row.order_id)}
                                  disabled={actionLoading === row.order_id}
                                  title="Complete this order"
                                >
                                  {actionLoading === row.order_id ? <Spinner size="sm" color="var(--color-primary)" /> : 'Complete'}
                                </Button>
                              </>
                            ) : (
                              <span className="orders-actions__dash">—</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Pagination
              currentPage={currentPage}
              totalItems={totalItems}
              itemsPerPage={10}
              onPageChange={onPageChange}
            />
          </div>
        )}
      </div>

      <style>{`
        .orders-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--space-4);
          padding: var(--space-4) var(--space-5);
          border-bottom: 1px solid var(--color-border);
          flex-wrap: nowrap;
          min-height: 60px;
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
          margin-left: auto;
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

        .orders-table-wrap {
          width: 100%;
          overflow: hidden;
        }

        .orders-table-scroll {
          overflow-x: auto;
        }

        .orders-table {
          width: 100%;
          border-collapse: collapse;
          table-layout: fixed;
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
          width: 12%;
        }

        .orders-table th:nth-child(3),
        .orders-table td:nth-child(3),
        .orders-table th:nth-child(4),
        .orders-table td:nth-child(4),
        .orders-table th:nth-child(5),
        .orders-table td:nth-child(5) {
          width: 9%;
        }

        .orders-table th:nth-child(6),
        .orders-table td:nth-child(6) {
          width: 12%;
        }

        .orders-table th:nth-child(7),
        .orders-table td:nth-child(7) {
          width: 10%;
        }

        .orders-table th:nth-child(8),
        .orders-table td:nth-child(8),
        .orders-table th:nth-child(9),
        .orders-table td:nth-child(9) {
          width: 6%;
        }

        .orders-table th:nth-child(10),
        .orders-table td:nth-child(10) {
          width: 8%;
        }

        .orders-table th:nth-child(11),
        .orders-table td:nth-child(11) {
          width: 10%;
        }

        .orders-table th:nth-child(12),
        .orders-table td:nth-child(12) {
          width: 16%;
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

        .orders-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          white-space: nowrap;
        }

        .orders-actions__dash {
          color: var(--color-muted-fg);
          font-weight: var(--weight-semibold);
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
        @media (max-width: 1024px) {
          .orders-toolbar {
            flex-wrap: wrap;
            gap: var(--space-3);
            min-height: auto;
          }

          .orders-search-wrap {
            margin-left: 0;
            max-width: none;
            min-width: auto;
            width: 100%;
            flex-shrink: 1;
          }

          .orders-filters {
            flex-wrap: wrap;
          }
        }
      `}</style>
    </div>
  );
}
