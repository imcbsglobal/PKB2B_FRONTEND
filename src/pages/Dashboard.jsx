// src/pages/Dashboard.jsx
import React from 'react';
import Badge from '../components/Badge';

const STATS = [
  {
    label: 'Revenue (7d)',
    value: '₹1,42,350',
    delta: '+12.4% vs last week',
    positive: true,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23"/>
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
      </svg>
    ),
  },
  {
    label: 'Orders today',
    value: '24',
    delta: '+5 since morning',
    positive: true,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
  },
  {
    label: 'Pending fulfilment',
    value: '8',
    delta: 'Action needed',
    positive: false,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
  },
  {
    label: 'Customers',
    value: '1,284',
    delta: '+38 this week',
    positive: true,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
];

const WEEKLY_DATA = [
  { day: 'Mon', value: 18400 },
  { day: 'Tue', value: 24200 },
  { day: 'Wed', value: 19800 },
  { day: 'Thu', value: 31500 },
  { day: 'Fri', value: 22100 },
  { day: 'Sat', value: 15600 },
  { day: 'Sun', value: 10750 },
];

const CHANNELS = [
  { name: 'Shopify',     pct: 58 },
  { name: 'WooCommerce', pct: 27 },
  { name: 'Magento',     pct: 15 },
];

const RECENT_ORDERS = [
  { id: 'ORD-90021', customer: 'Aarav Sharma',  total: '₹4,798', source: 'Shopify',     status: 'pending',   date: '2026-05-06' },
  { id: 'ORD-90020', customer: 'Priya Patel',   total: '₹2,499', source: 'WooCommerce', status: 'shipped',   date: '2026-05-06' },
  { id: 'ORD-90019', customer: 'Rohan Verma',   total: '₹9,495', source: 'Shopify',     status: 'delivered', date: '2026-05-05' },
  { id: 'ORD-90018', customer: 'Neha Iyer',     total: '₹1,499', source: 'Magento',     status: 'cancelled', date: '2026-05-05' },
  { id: 'ORD-90017', customer: 'Vikram Singh',  total: '₹6,597', source: 'Shopify',     status: 'pending',   date: '2026-05-04' },
];

const STATUS_VARIANT = {
  pending:   'warning',
  shipped:   'info',
  delivered: 'success',
  cancelled: 'danger',
};

const maxVal = Math.max(...WEEKLY_DATA.map(d => d.value));

export default function Dashboard() {
  return (
    <div className="page">

      {/* ── Page header ── */}
      <div className="page__header">
        <h1 className="page__title">Dashboard</h1>
        <p className="page__sub">Real-time view of orders flowing in from your storefronts.</p>
      </div>

      {/* ── 4 Stat cards ── */}
      <div className="dash-stat-grid">
        {STATS.map(stat => (
          <div className="dash-stat-card" key={stat.label}>
            <div className="dash-stat-card__top">
              <span className="dash-stat-card__label">{stat.label}</span>
              <div className="dash-stat-card__icon">{stat.icon}</div>
            </div>
            <div className="dash-stat-card__value">{stat.value}</div>
            <div className={`dash-stat-card__delta${stat.positive ? ' dash-stat-card__delta--up' : ' dash-stat-card__delta--warn'}`}>
              {stat.delta}
            </div>
          </div>
        ))}
      </div>

      {/* ── Charts row ── */}
      <div className="dash-charts-row">

        {/* Revenue bar chart */}
        <div className="dash-chart-card">
          <div className="dash-chart-card__header">
            <div className="dash-chart-card__title">Revenue this week</div>
            <div className="dash-chart-card__sub">Daily totals across all channels</div>
          </div>
          <div className="dash-bar-chart">
            {WEEKLY_DATA.map(d => (
              <div className="dash-bar-col" key={d.day}>
                <div className="dash-bar-track">
                  <div
                    className="dash-bar-fill"
                    style={{ height: `${(d.value / maxVal) * 100}%` }}
                  />
                </div>
                <div className="dash-bar-label">{d.day}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Channel split */}
        <div className="dash-channel-card">
          <div className="dash-chart-card__title">Channel split</div>
          <div className="dash-channel-list">
            {CHANNELS.map(ch => (
              <div className="dash-channel-item" key={ch.name}>
                <div className="dash-channel-row">
                  <span className="dash-channel-name">{ch.name}</span>
                  <span className="dash-channel-pct">{ch.pct}%</span>
                </div>
                <div className="dash-channel-track">
                  <div className="dash-channel-bar" style={{ width: `${ch.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── Recent orders ── */}
      <div className="dash-section">
        <div className="dash-section__header">
          <h2 className="dash-section__title">Recent orders</h2>
        </div>
        <div className="orders-card">
          <table className="data-table">
            <thead>
              <tr>
                {['ORDER', 'CUSTOMER', 'SOURCE', 'TOTAL', 'STATUS', 'DATE'].map(col => (
                  <th key={col}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {RECENT_ORDERS.map(order => (
                <tr key={order.id}>
                  <td style={{ fontWeight: 600 }}>{order.id}</td>
                  <td>{order.customer}</td>
                  <td>{order.source}</td>
                  <td>{order.total}</td>
                  <td>
                    <Badge variant={STATUS_VARIANT[order.status] ?? 'default'}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                  </td>
                  <td>{order.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}