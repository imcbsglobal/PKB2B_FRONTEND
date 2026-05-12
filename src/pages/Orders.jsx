// src/pages/Orders.jsx

import React, { useState, useEffect } from 'react';
import Table from '../components/Table';
import Badge from '../components/Badge';
import Button from '../components/Button';
import OrderModal from '../components/OrderModal';
import { orderAPI } from '../Services/api';

const STATUS_VARIANT = {
  pending: 'warning',
  shipped: 'info',
  delivered: 'success',
  cancelled: 'danger',
};

const FILTERS = ['All', 'Pending', 'Shipped', 'Delivered', 'Cancelled'];

export default function Orders() {

  // ================= STATES =================
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showOrderModal, setShowOrderModal] = useState(false);

  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // ================= FETCH ORDERS =================
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {

    try {

      setLoading(true);

      const response = await orderAPI.getOrders();

      console.log('Orders:', response.data);

      setOrders(response.data || []);

    } catch (error) {

      console.error('Orders API Error:', error);

    } finally {

      setLoading(false);

    }
  };

  // ================= ACCEPT ORDER =================
  const acceptOrder = async (id) => {

    try {

      await orderAPI.acceptOrder(id);

      fetchOrders();

    } catch (error) {

      console.error('Accept Order Error:', error);

    }
  };

  // ================= COMPLETE ORDER =================
  const completeOrder = async (id) => {

    try {

      await orderAPI.completeOrder(id);

      fetchOrders();

    } catch (error) {

      console.error('Complete Order Error:', error);

    }
  };

  // ================= TABLE COLUMNS =================
  const COLUMNS = [
    {
      key: 'id',
      label: 'ORDER',
    },

    {
      key: 'customer',
      label: 'CUSTOMER',
    },

    {
      key: 'items',
      label: 'ITEMS',
      align: 'center',
    },

    {
      key: 'total',
      label: 'TOTAL',
    },

    {
      key: 'source',
      label: 'SOURCE',
    },

    {
      key: 'status',
      label: 'STATUS',

      render: (val) => (

        <Badge variant={STATUS_VARIANT[val] ?? 'default'}>
          {val?.charAt(0).toUpperCase() + val?.slice(1)}
        </Badge>

      ),
    },

    {
      key: 'date',
      label: 'DATE',
    },

    {
      key: 'actions',
      label: 'ACTIONS',

      render: (_, row) => (

        <div style={{ display: 'flex', gap: '8px' }}>

          <Button
            size="sm"
            variant="primary"
            onClick={() => acceptOrder(row.id)}
          >
            Accept
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => completeOrder(row.id)}
          >
            Complete
          </Button>

        </div>
      ),
    },
  ];

  // ================= FILTER =================
  const filtered = orders.filter((o) => {

    const matchesFilter =
      filter === 'All' ||
      o.status?.toLowerCase() === filter.toLowerCase();

    const matchesSearch =
      o.id?.toLowerCase().includes(search.toLowerCase()) ||
      o.customer?.toLowerCase().includes(search.toLowerCase());

    const matchesFrom =
      !dateFrom || o.date >= dateFrom;

    const matchesTo =
      !dateTo || o.date <= dateTo;

    return (
      matchesFilter &&
      matchesSearch &&
      matchesFrom &&
      matchesTo
    );
  });

  // ================= CLEAR DATES =================
  const handleClearDates = () => {

    setDateFrom('');
    setDateTo('');
  };

  // ================= LOADING =================
  if (loading) {

    return (

      <div className="page">

        <div className="page__header">
          <h1 className="page__title">Orders</h1>
        </div>

        <div style={{
          padding: '20px',
          textAlign: 'center',
        }}>
          Loading orders...
        </div>

      </div>
    );
  }

  // ================= UI =================
  return (

    <div className="page">

      {/* Header */}
      <div className="orders-page-header">

        <div>

          <h1 className="page__title">
            Orders
          </h1>

          <p className="page__sub">
            {filtered.length} orders found
          </p>

        </div>

        <Button
          variant="primary"
          onClick={() => setShowOrderModal(true)}
        >
          + Create Order
        </Button>

      </div>

      {/* Card */}
      <div className="orders-card">

        {/* Toolbar */}
        <div className="orders-toolbar">

          {/* Search */}
          <div className="orders-search-wrap">

            <svg
              className="orders-search-icon"
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>

            <input
              className="orders-search-input"
              placeholder="Search by order ID or customer"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

          </div>

          {/* Filters */}
          <div className="orders-filters">

            {FILTERS.map((f) => (

              <button
                key={f}
                className={`orders-filter-btn ${
                  filter === f
                    ? 'orders-filter-btn--active'
                    : ''
                }`}
                onClick={() => setFilter(f)}
              >
                {f}
              </button>

            ))}

          </div>

        </div>

        {/* Date Toolbar */}
        <div
          className="orders-date-toolbar"
          style={{ justifyContent: 'flex-end' }}
        >

          {/* From */}
          <div className="orders-date-group">

            <label
              className="orders-date-label"
              htmlFor="date-from"
            >
              From
            </label>

            <div className="orders-date-input-wrap">

              <input
                id="date-from"
                type="date"
                className="orders-date-input"
                value={dateFrom}
                max={dateTo || undefined}
                onChange={(e) =>
                  setDateFrom(e.target.value)
                }
              />

            </div>

          </div>

          <span className="orders-date-sep">
            —
          </span>

          {/* To */}
          <div className="orders-date-group">

            <label
              className="orders-date-label"
              htmlFor="date-to"
            >
              To
            </label>

            <div className="orders-date-input-wrap">

              <input
                id="date-to"
                type="date"
                className="orders-date-input"
                value={dateTo}
                min={dateFrom || undefined}
                onChange={(e) =>
                  setDateTo(e.target.value)
                }
              />

            </div>

          </div>

          {/* Clear */}
          {(dateFrom || dateTo) && (

            <button
              className="orders-date-clear"
              onClick={handleClearDates}
            >
              Clear dates
            </button>

          )}

        </div>

        {/* Table */}
        <Table
          columns={COLUMNS}
          rows={filtered}
        />

      </div>

      {/* Order Modal */}
      {showOrderModal && (
        <OrderModal
          onClose={() => setShowOrderModal(false)}
          onOrderCreated={fetchOrders}
        />
      )}

    </div>
  );
}