import React, {
  useState,
} from 'react';

import Table from '../components/Table';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Pagination from '../components/Pagination';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import Spinner from '../components/Spinner';

import { orderAPI } from '../Services/api';
import { usePagination } from '../hooks/usePagination';
import { useFetchData } from '../hooks/useFetchData';
import { dataCache } from '../utils/cache';

const STATUS_VARIANT = {
  pending: 'warning',
  completed: 'success',
  accepted: 'info',
};

const FILTERS = [
  'All',
  'Pending',
  'Completed',
];

export default function Orders({ showToast }) {

  // ================= STATES =================
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  // ================= FETCH ORDERS WITH CACHE =================
  const [refreshKey, setRefreshKey] = useState(0);
  const ordersResult = useFetchData(
    'orders',
    () => orderAPI.getOrders(),
    [refreshKey]
  );
  const orders = Array.isArray(ordersResult.data) ? ordersResult.data : [];
  const loading = ordersResult.loading;

  const refreshOrders = () => {
    dataCache.clear('orders');
    setRefreshKey(k => k + 1);
  };

  // ================= ACCEPT ORDER =================
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

  // ================= COMPLETE ORDER =================
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

  // ================= TABLE COLUMNS =================
  const COLUMNS = [

    {
      key: 'order_id',
      label: 'ORDER ID',
    },

    {
      key: 'customer_name',
      label: 'CUSTOMER',
    },

    {
      key: 'customer_code',
      label: 'CUSTOMER CODE',
    },

    {
      key: 'phone_number',
      label: 'PHONE',
    },

    {
      key: 'item_code',
      label: 'ITEM CODE',
    },

    {
      key: 'item_name',
      label: 'ITEM NAME',
    },

    {
      key: 'barcode',
      label: 'BARCODE',
    },

    {
      key: 'quantity',
      label: 'QTY',
    },

    {
      key: 'rate',
      label: 'RATE',
      align: 'right',
    },

    {
      key: 'status',
      label: 'STATUS',

      render: (val) => (

        <Badge
          variant={
            STATUS_VARIANT[
              val?.toLowerCase()
            ] ?? 'default'
          }
        >
          {val}
        </Badge>

      ),
    },

    {
      key: 'created_at',
      label: 'DATE',
    },

    {
      key: 'actions',
      label: 'ACTIONS',

      render: (_, row) => (

        <div
          style={{
            display: 'flex',
            gap: '8px',
          }}
        >

          <Button
            size="sm"
            variant="primary"
            onClick={() => acceptOrder(row.order_id)}
            disabled={actionLoading === row.order_id}
          >
            {actionLoading === row.order_id ? <Spinner size="sm" color="#fff" /> : 'Accept'}
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => completeOrder(row.order_id)}
            disabled={actionLoading === row.order_id}
          >
            {actionLoading === row.order_id ? <Spinner size="sm" color="#3b82f6" /> : 'Complete'}
          </Button>

        </div>
      ),
    },
  ];

  // ================= FILTER =================
  const filtered = orders.filter(
    (o) => {

      const matchesFilter =

        filter === 'All' ||

        o.status?.toLowerCase() ===
        filter.toLowerCase();

      const matchesSearch =

        o.order_id?.toLowerCase().includes(
          search.toLowerCase()
        ) ||

        o.customer_name?.toLowerCase().includes(
          search.toLowerCase()
        ) ||

        o.item_name?.toLowerCase().includes(
          search.toLowerCase()
        ) ||

        o.customer_code?.toLowerCase().includes(
          search.toLowerCase()
        );

      return (
        matchesFilter &&
        matchesSearch
      );
    }
  );

  // ================= PAGINATION =================
  const {

    currentPage,
    totalPages,
    currentItems,
    onPageChange,
    totalItems,

  } = usePagination(
    filtered,
    10
  );

  // ================= LOADING =================
  if (loading) {

    return (

      <div className="page">

        <div className="page__header">

          <h1 className="page__title">
            Orders
          </h1>

        </div>

        <div style={{ marginBottom: '24px' }}>
          <LoadingSkeleton rows={5} columns={6} />
        </div>

      </div>
    );
  }

  // ================= UI =================
  return (

    <div className="page">

      {/* HEADER */}
      <div className="orders-page-header">

        <div>

          <h1 className="page__title">
            Orders
          </h1>

          <p className="page__sub">
            {filtered.length} orders found
          </p>

        </div>

      </div>

      {/* CARD */}
      <div className="orders-card">

        {/* TOOLBAR */}
        <div className="orders-toolbar">

          {/* SEARCH */}
          <div className="orders-search-wrap">

            <input
              className="orders-search-input"
              placeholder="Search order, customer or item..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
            />

          </div>

          {/* FILTERS */}
          <div className="orders-filters">

            {FILTERS.map((f) => (

              <button
                key={f}
                className={`orders-filter-btn ${
                  filter === f
                    ? 'orders-filter-btn--active'
                    : ''
                }`}
                onClick={() =>
                  setFilter(f)
                }
              >
                {f}
              </button>

            ))}

          </div>

        </div>

        {/* TABLE OR EMPTY STATE */}
        {filtered.length === 0 ? (
          <EmptyState
            icon="📭"
            title="No orders found"
            description={search ? `No orders matching "${search}"` : 'No orders yet. Check back later!'}
          />
        ) : (
          <>
            <div
              style={{
                width: '100%',
                overflowX: 'auto',
              }}
            >

              <Table
                columns={COLUMNS}
                rows={currentItems}
              />

            </div>

            {/* PAGINATION */}
            <Pagination
              currentPage={currentPage}
              totalItems={totalItems}
              itemsPerPage={10}
              onPageChange={onPageChange}
            />
          </>
        )}

      </div>

    </div>
  );
}