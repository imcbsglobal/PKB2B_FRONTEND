// src/pages/Item.jsx
import React, { useState } from 'react';
import Table from '../components/Table';

const ITEMS = [
  { orderId: 'ORD-90021', date: '2026-05-06', customer: 'Aarav Sharma', itemname: 'Wireless Headphones', quantity: 2, amount: '₹4,798' },
  { orderId: 'ORD-90020', date: '2026-05-06', customer: 'Priya Patel',   quantity: 1, amount: '₹2,499' },
  { orderId: 'ORD-90019', date: '2026-05-05', customer: 'Rohan Verma',   quantity: 4, amount: '₹9,495' },
  { orderId: 'ORD-90018', date: '2026-05-05', customer: 'Neha Iyer',     quantity: 1, amount: '₹1,499' },
  { orderId: 'ORD-90017', date: '2026-05-04', customer: 'Vikram Singh',  quantity: 3, amount: '₹6,597' },
  { orderId: 'ORD-90016', date: '2026-05-03', customer: 'Aarav Sharma',  quantity: 2, amount: '₹3,598' },
];

const COLUMNS = [
  { key: 'orderId',  label: 'ORDER ID'          },
  { key: 'date',     label: 'DATE'              },
  { key: 'customer', label: 'CUSTOMER'          },
  { key: 'item name', label: 'ITEM NAME'          },
  { key: 'quantity', label: 'QUANTITY', align: 'center' },
  { key: 'amount',   label: 'AMOUNT'            },
];

const FILTERS = ['All', 'Today', 'This Week'];

export default function Item() {
  const [search,   setSearch]   = useState('');
  const [filter,   setFilter]   = useState('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo,   setDateTo]   = useState('');

  const today     = new Date().toISOString().slice(0, 10);
  const weekStart = new Date(Date.now() - 6 * 86400000).toISOString().slice(0, 10);

  const filtered = ITEMS.filter(item => {
    const matchesSearch =
      item.orderId.toLowerCase().includes(search.toLowerCase()) ||
      item.customer.toLowerCase().includes(search.toLowerCase());

    let matchesFilter = true;
    if (filter === 'Today')     matchesFilter = item.date === today;
    if (filter === 'This Week') matchesFilter = item.date >= weekStart;

    const matchesFrom = !dateFrom || item.date >= dateFrom;
    const matchesTo   = !dateTo   || item.date <= dateTo;

    return matchesSearch && matchesFilter && matchesFrom && matchesTo;
  });

  return (
    <div className="page">

      {/* Page header */}
      <div className="orders-page-header">
        <div>
          <h1 className="page__title">Items</h1>
          <p className="page__sub">All order items synced from your connected storefronts.</p>
        </div>
      </div>

      {/* Card: search + filters + date + table */}
      <div className="orders-card">

        {/* Row 1: search + filter pills */}
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

        {/* Row 2: date range — right aligned */}
        <div className="orders-date-toolbar" style={{ justifyContent: 'flex-end' }}>
          <div className="orders-date-group">
            <label className="orders-date-label" htmlFor="item-date-from">From</label>
            <div className="orders-date-input-wrap">
              <svg className="orders-date-icon" width="14" height="14" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8"  y1="2" x2="8"  y2="6"/>
                <line x1="3"  y1="10" x2="21" y2="10"/>
              </svg>
              <input
                id="item-date-from"
                type="date"
                className="orders-date-input"
                value={dateFrom}
                max={dateTo || undefined}
                onChange={e => setDateFrom(e.target.value)}
              />
            </div>
          </div>

          <span className="orders-date-sep">—</span>

          <div className="orders-date-group">
            <label className="orders-date-label" htmlFor="item-date-to">To</label>
            <div className="orders-date-input-wrap">
              <svg className="orders-date-icon" width="14" height="14" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8"  y1="2" x2="8"  y2="6"/>
                <line x1="3"  y1="10" x2="21" y2="10"/>
              </svg>
              <input
                id="item-date-to"
                type="date"
                className="orders-date-input"
                value={dateTo}
                min={dateFrom || undefined}
                onChange={e => setDateTo(e.target.value)}
              />
            </div>
          </div>

          {(dateFrom || dateTo) && (
            <button className="orders-date-clear"
              onClick={() => { setDateFrom(''); setDateTo(''); }}>
              Clear dates
            </button>
          )}
        </div>

        {/* Table */}
        <Table columns={COLUMNS} rows={filtered} />

      </div>
    </div>
  );
}