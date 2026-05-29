// src/pages/Dashboard.jsx
import React from 'react';
import Badge from '../components/Badge';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { useFetchData } from '../hooks/useFetchData';
import { orderAPI, customerAPI, productBatchAPI } from '../Services/api';

const STATUS_VARIANT = {
  pending:   'warning',
  shipped:   'info',
  delivered: 'success',
  cancelled: 'danger',
};

export default function Dashboard() {
  // ================= FETCH DATA WITH CACHE =================
  const ordersResult = useFetchData(
    'orders',
    () => orderAPI.getOrders()
  );

  const customersResult = useFetchData(
    'customers',
    () => customerAPI.getCustomers()
  );

  const itemsResult = useFetchData(
    'items',
    () => productBatchAPI.getAllItems()
  );

  // Ensure arrays, not null
  const orders = Array.isArray(ordersResult.data) ? ordersResult.data : [];
  const customers = Array.isArray(customersResult.data) ? customersResult.data : [];
  const items = Array.isArray(itemsResult.data) ? itemsResult.data : [];

  const loading = ordersResult.loading || customersResult.loading || itemsResult.loading;

  // ================= CALCULATE STATS =================
  const calculateStats = () => {
    const today = new Date().toISOString().split('T')[0];
    
    // Orders today
    const ordersToday = orders.filter(o => 
      o.date && o.date.startsWith(today)
    ).length;

    // Pending orders
    const pendingOrders = orders.filter(o => 
      o.status?.toLowerCase() === 'pending'
    ).length;

    // Total revenue (sum of all orders)
    const totalRevenue = orders.reduce((sum, order) => {
      const amount = typeof order.total === 'string' 
        ? parseFloat(order.total.replace(/[₹,]/g, ''))
        : order.total || 0;
      return sum + amount;
    }, 0);

    // Low stock items
    const lowStockItems = items.filter(item => 
      item.quantity > 0 && item.quantity <= 5
    ).length;

    return {
      ordersToday,
      pendingOrders,
      totalRevenue,
      totalCustomers: customers.length,
      lowStockItems,
    };
  };

  const stats = calculateStats();

  // ================= STATS CONFIG =================
  const STATS = [
    {
      label: 'Total Revenue',
      value: `₹${(stats.totalRevenue / 1000).toFixed(1)}k`,
      delta: `${orders.length} orders`,
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
      value: stats.ordersToday,
      delta: `${orders.length} total orders`,
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
      label: 'Pending orders',
      value: stats.pendingOrders,
      delta: 'Action needed',
      positive: stats.pendingOrders === 0,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
      ),
    },
    {
      label: 'Total Customers',
      value: stats.totalCustomers,
      delta: `${stats.lowStockItems} items low stock`,
      positive: stats.lowStockItems === 0,
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

  // ================= GET TOP SOURCES =================
  const getTopSources = () => {
    const sourceCounts = {};
    orders.forEach(order => {
      const source = order.source || 'Unknown';
      sourceCounts[source] = (sourceCounts[source] || 0) + 1;
    });

    const total = Object.values(sourceCounts).reduce((a, b) => a + b, 0) || 1;
    
    return Object.entries(sourceCounts)
      .map(([source, count]) => ({
        name: source,
        pct: Math.round((count / total) * 100),
      }))
      .sort((a, b) => b.pct - a.pct)
      .slice(0, 3);
  };

  // ================= GET ORDER STATUS DISTRIBUTION =================
  const getOrdersByStatus = () => {
    const statusCounts = {};
    orders.forEach(order => {
      const status = order.status || 'unknown';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    return statusCounts;
  };

  const topSources = getTopSources();
  const ordersByStatus = getOrdersByStatus();
  const maxVal = Math.max(...Object.values(ordersByStatus), 1);

  // ================= LOADING STATE =================
  if (loading) {
    return (
      <div className="page">
        <div className="page__header">
          <h1 className="page__title">Dashboard</h1>
          <p className="page__sub">Loading real-time data...</p>
        </div>

        {/* Skeleton Stats */}
        <div className="dash-stat-grid">
          {Array(4).fill(0).map((_, i) => (
            <div className="dash-stat-card" key={i}>
              <div style={{ height: '16px', background: 'var(--color-muted)', borderRadius: '4px', marginBottom: '8px' }} />
              <div style={{ height: '24px', background: 'var(--color-muted)', borderRadius: '4px', marginBottom: '8px' }} />
              <div style={{ height: '12px', background: 'var(--color-muted)', borderRadius: '4px' }} />
            </div>
          ))}
        </div>

        {/* Skeleton Charts */}
        <div className="dash-charts-row">
          <div className="dash-chart-card">
            <LoadingSkeleton rows={3} columns={4} />
          </div>
          <div className="dash-channel-card">
            <LoadingSkeleton rows={3} columns={2} />
          </div>
        </div>
      </div>
    );
  }

  // ================= UI =================
  return (
    <div className="page">
      <div className="page__header">
        <h1 className="page__title">Dashboard</h1>
        <p className="page__sub">Real-time view of orders flowing in from your storefronts.</p>
      </div>

      {/* STATS GRID */}
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

        {/* Order Status Distribution */}
        <div className="dash-chart-card">
          <div className="dash-chart-card__header">
            <div className="dash-chart-card__title">Order Status Distribution</div>
            <div className="dash-chart-card__sub">Current order statuses</div>
          </div>
          <div className="dash-bar-chart">
            {Object.entries(ordersByStatus).map(([status, count]) => (
              <div className="dash-bar-col" key={status}>
                <div className="dash-bar-track">
                  <div
                    className="dash-bar-fill"
                    style={{ height: `${(count / maxVal) * 100}%` }}
                  />
                </div>
                <div className="dash-bar-label" title={status}>{status}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Channel split */}
        <div className="dash-channel-card">
          <div className="dash-chart-card__title">Channel split</div>
          <div className="dash-channel-list">
            {topSources.map(ch => (
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

      {/* ── Stock details ── */}
      <div className="dash-section">
        <div className="dash-section__header">
          <h2 className="dash-section__title">Stock Details (Top 10 Low Stock)</h2>
        </div>
        <div className="orders-card">
          <table className="data-table">
            <thead>
              <tr>
                {['CODE', 'NAME', 'BRAND', 'CATEGORY', 'PRICE', 'STOCK', 'STATUS'].map(col => (
                  <th key={col}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.length > 0 ? (
                items
                  .sort((a, b) => (a.quantity || 0) - (b.quantity || 0))
                  .slice(0, 10)
                  .map((item, idx) => {
                    let statusColor = 'var(--color-success)';
                    let statusText = 'In Stock';
                    
                    if ((item.quantity || 0) <= 0) {
                      statusColor = 'var(--color-destructive)';
                      statusText = 'Out of Stock';
                    } else if ((item.quantity || 0) <= 5) {
                      statusColor = 'var(--color-warning)';
                      statusText = 'Low Stock';
                    }
                    
                    return (
                      <tr key={item.id || idx}>
                        <td style={{ fontWeight: 600, fontSize: '12px' }}>{item.code || 'N/A'}</td>
                        <td>{item.name || 'N/A'}</td>
                        <td>{item.brand || 'N/A'}</td>
                        <td>{item.product || 'N/A'}</td>
                        <td style={{ textAlign: 'right' }}>₹{item.price || '0'}</td>
                        <td style={{ fontWeight: '600', color: statusColor }}>
                          {item.quantity || 0}
                        </td>
                        <td>
                          <span style={{  color: statusColor, fontWeight: '600', fontSize: '12px' }}>
                            {statusText}
                          </span>
                        </td>
                      </tr>
                    );
                  })
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '20px', color: 'var(--color-muted-fg)' }}>
                    No items found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}