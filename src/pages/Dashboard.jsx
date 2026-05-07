import React, { useState } from 'react';
import {
  Button,
  Badge,
  StatCard,
  Table,
  Pagination,
} from '../components/ui';

const SAMPLE_ORDERS = [
  {
    id: '#PK-1041',
    customer: 'Rahul Menon',
    item: 'Chicken Biriyani x2',
    time: '2 min ago',
    status: 'new',
    amount: 480,
  },
  {
    id: '#PK-1040',
    customer: 'Fathima Beevi',
    item: 'Veg Thali x1',
    time: '8 min ago',
    status: 'preparing',
    amount: 220,
  },
  {
    id: '#PK-1039',
    customer: 'Arun Kumar',
    item: 'Beef Fry x3, Parotta x6',
    time: '15 min ago',
    status: 'ready',
    amount: 610,
  },
  {
    id: '#PK-1038',
    customer: 'Sneha Pillai',
    item: 'Fish Curry + Rice x2',
    time: '22 min ago',
    status: 'delivered',
    amount: 390,
  },
  {
    id: '#PK-1037',
    customer: 'Vivek Nair',
    item: 'Shawarma x4',
    time: '30 min ago',
    status: 'delivered',
    amount: 520,
  },
  {
    id: '#PK-1036',
    customer: 'Divya Krishnan',
    item: 'Paneer Butter Masala x1',
    time: '45 min ago',
    status: 'delivered',
    amount: 280,
  },
];

const STATUS_FLOW = [
  'new',
  'preparing',
  'ready',
  'delivered',
];

const STATUS_BADGE = {
  new: 'warning',
  preparing: 'info',
  ready: 'success',
  delivered: 'muted',
};

const STATUS_LABEL = {
  new: 'New',
  preparing: 'Preparing',
  ready: 'Ready',
  delivered: 'Delivered',
};

const NAV_ITEMS = [
  { icon: '⊞', label: 'Dashboard', active: true },
  { icon: '📋', label: 'Orders' },
  { icon: '🍽️', label: 'Menu' },
  { icon: '👤', label: 'Customers' },
  { icon: '📊', label: 'Reports' },
  { icon: '⚙️', label: 'Settings' },
];

export default function Dashboard({ user, onLogout }) {

  const [orders, setOrders] = useState(SAMPLE_ORDERS);

  const [filter, setFilter] = useState('all');

  const [page, setPage] = useState(1);

  const pageSize = 6;

  const advance = (orderId) => {

    setOrders(prev =>
      prev.map(o => {

        if (o.id !== orderId) {
          return o;
        }

        const idx = STATUS_FLOW.indexOf(o.status);

        return {
          ...o,
          status: STATUS_FLOW[
            Math.min(idx + 1, STATUS_FLOW.length - 1)
          ],
        };
      })
    );
  };

  const filtered =
    filter === 'all'
      ? orders
      : orders.filter(o => o.status === filter);

  const totalPages = Math.max(
    1,
    Math.ceil(filtered.length / pageSize)
  );

  const paginated = filtered.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const counts = {
    new: orders.filter(o => o.status === 'new').length,
    preparing: orders.filter(o => o.status === 'preparing').length,
    ready: orders.filter(o => o.status === 'ready').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
  };

  const todayRevenue = orders
    .filter(o => o.status === 'delivered')
    .reduce((s, o) => s + o.amount, 0);

  const columns = [
    {
      key: 'id',
      label: 'Order ID',
      render: v => (
        <span className="order-id">
          {v}
        </span>
      ),
    },

    {
      key: 'customer',
      label: 'Customer',
    },

    {
      key: 'item',
      label: 'Items',
      render: v => (
        <span className="order-item">
          {v}
        </span>
      ),
    },

    {
      key: 'time',
      label: 'Time',
      render: v => (
        <span className="order-time">
          {v}
        </span>
      ),
    },

    {
      key: 'amount',
      label: 'Amount',
      align: 'right',
      render: v => (
        <strong>₹{v}</strong>
      ),
    },

    {
      key: 'status',
      label: 'Status',
      render: (_, row) => (
        <Badge variant={STATUS_BADGE[row.status]}>
          {STATUS_LABEL[row.status]}
        </Badge>
      ),
    },

    {
      key: 'action',
      label: '',
      align: 'right',

      render: (_, row) =>
        row.status !== 'delivered' ? (
          <Button
            variant="outline"
            size="xs"
            onClick={() => advance(row.id)}
          >
            {
              row.status === 'new'
                ? 'Accept'
                : row.status === 'preparing'
                ? 'Mark Ready'
                : 'Deliver'
            }
          </Button>
        ) : null,
    },
  ];

  const filterTabs = [
    {
      key: 'all',
      label: 'All',
      count: orders.length,
    },

    {
      key: 'new',
      label: 'New',
      count: counts.new,
    },

    {
      key: 'preparing',
      label: 'Preparing',
      count: counts.preparing,
    },

    {
      key: 'ready',
      label: 'Ready',
      count: counts.ready,
    },

    {
      key: 'delivered',
      label: 'Delivered',
      count: counts.delivered,
    },
  ];

  return (
    <div className="dash-root">

      {/* Sidebar */}
      <aside className="sidebar">

        <div className="sidebar-brand">
          <span className="brand-icon">⬡</span>

          <span className="brand-name">
            PEEKAY
          </span>
        </div>

        <nav className="sidebar-nav">

          {NAV_ITEMS.map(item => (
            <div
              key={item.label}
              className={`nav-item ${
                item.active ? 'active' : ''
              }`}
            >

              <span className="nav-icon">
                {item.icon}
              </span>

              <span className="nav-label">
                {item.label}
              </span>

            </div>
          ))}

        </nav>

        <div
          className="sidebar-user"
          onClick={onLogout}
        >

          <div className="avatar">
            {user.name[0]}
          </div>

          <div className="user-info">

            <span className="user-name">
              {user.name}
            </span>

            <span className="user-role">
              {user.role}
            </span>

          </div>

        </div>
      </aside>

      {/* Main */}
      <div className="dash-main">

        <header className="dash-header">

          <div>
            <h2 className="page-title">
              Order Dashboard
            </h2>

            <p className="page-sub">
              Live orders from your app
            </p>
          </div>

          <div className="header-right">

            <span className="live-pill">
              <span className="live-dot" />
              LIVE
            </span>

            <Button
              variant="ghost"
              size="sm"
              onClick={onLogout}
            >
              Logout
            </Button>

          </div>

        </header>

        <div className="dash-content">

          <div className="kpi-grid">

            <StatCard
              label="New Orders"
              value={counts.new}
              icon="🔔"
              variant="warning"
            />

            <StatCard
              label="Preparing"
              value={counts.preparing}
              icon="🍳"
              variant="info"
            />

            <StatCard
              label="Ready"
              value={counts.ready}
              icon="✅"
              variant="success"
            />

            <StatCard
              label="Revenue Today"
              value={`₹${todayRevenue.toLocaleString('en-IN')}`}
              icon="💰"
              variant="primary"
            />

          </div>

          <div className="orders-card">

            <div className="orders-header">

              <h3 className="orders-title">
                Recent Orders
              </h3>

              <div className="filter-tabs">

                {filterTabs.map(t => (
                  <button
                    key={t.key}
                    className={`filter-tab ${
                      filter === t.key ? 'active' : ''
                    }`}
                    onClick={() => {
                      setFilter(t.key);
                      setPage(1);
                    }}
                  >

                    {t.label}

                    <span className="tab-count">
                      {t.count}
                    </span>

                  </button>
                ))}

              </div>

            </div>

            <Table
              columns={columns}
              rows={paginated}
              emptyMessage="No orders in this category."
            />

            {filtered.length > pageSize && (
              <div className="pagination-wrap">

                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  totalItems={filtered.length}
                  pageSize={pageSize}
                  onPageChange={setPage}
                />

              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
} 