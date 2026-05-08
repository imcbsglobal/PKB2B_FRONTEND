// src/pages/Orders.jsx
import React, { useState } from 'react';
import Table from '../components/Table';
import Badge from '../components/Badge';
import Button from '../components/Button';

const ORDERS = [
  { id: 'ORD-90021', customer: 'Aarav Sharma',  items: 2, total: '₹4,798',  source: 'Shopify',     status: 'pending',   date: '2026-05-06' },
  { id: 'ORD-90020', customer: 'Priya Patel',   items: 1, total: '₹2,499',  source: 'WooCommerce', status: 'shipped',   date: '2026-05-06' },
  { id: 'ORD-90019', customer: 'Rohan Verma',   items: 4, total: '₹9,495',  source: 'Shopify',     status: 'delivered', date: '2026-05-05' },
  { id: 'ORD-90018', customer: 'Neha Iyer',     items: 1, total: '₹1,499',  source: 'Magento',     status: 'cancelled', date: '2026-05-05' },
  { id: 'ORD-90017', customer: 'Vikram Singh',  items: 3, total: '₹6,597',  source: 'Shopify',     status: 'pending',   date: '2026-05-04' },
  { id: 'ORD-90016', customer: 'Aarav Sharma',  items: 2, total: '₹3,598',  source: 'WooCommerce', status: 'delivered', date: '2026-05-03' },
];

const STATUS_VARIANT = {
  pending:   'warning',
  shipped:   'info',
  delivered: 'success',
  cancelled: 'danger',
};

const FILTERS = ['All', 'Pending', 'Shipped', 'Delivered', 'Cancelled'];

const COLUMNS = [
  { key: 'id',       label: 'ORDER'    },
  { key: 'customer', label: 'CUSTOMER' },
  { key: 'items',    label: 'ITEMS',   align: 'center' },
  { key: 'total',    label: 'TOTAL'    },
  { key: 'source',   label: 'SOURCE'   },
  {
    key: 'status',
    label: 'STATUS',
    render: (val) => (
      <Badge variant={STATUS_VARIANT[val] ?? 'default'}>
        {val.charAt(0).toUpperCase() + val.slice(1)}
      </Badge>
    ),
  },
  { key: 'date', label: 'DATE' },
];

export default function Orders() {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = ORDERS.filter(o => {
    const matchesFilter = filter === 'All' || o.status === filter.toLowerCase();
    const matchesSearch =
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="page">

      {/* ── Page header ── */}
      <div className="orders-page-header">
        <div>
          <h1 className="page__title">Orders</h1>
          <p className="page__sub">All orders synced from your connected storefronts.</p>
        </div>
        <Button variant="outline" size="md">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="21" y1="15" x2="12" y2="15"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          Export CSV
        </Button>
      </div>

      {/* ── Search + Filters + Table all inside one card ── */}
      <div className="orders-card">

        {/* Search row + filter pills on same line */}
        <div className="orders-toolbar">
          <div className="orders-search-wrap">
            <svg className="orders-search-icon" width="15" height="15" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              className="orders-search-input"
              placeholder="Search by order ID or customer"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="orders-filters">
            {FILTERS.map(f => (
              <button
                key={f}
                className={`orders-filter-btn${filter === f ? ' orders-filter-btn--active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <Table columns={COLUMNS} rows={filtered} />
      </div>

    </div>
  );
}