// src/components/Sidebar.jsx
import React from 'react';
import pkLogo from '../assets/pk.png';

const NAV_ITEMS = [
  {
    id: 'dashboard', label: 'Dashboard',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
      </svg>
    ),
  },
  {
    id: 'orders', label: 'Orders',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
      </svg>
    ),
  },
  {
    id: 'item', label: 'Item',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
        <line x1="12" y1="22" x2="12" y2="12"/>
        <line x1="9"  y1="10.5" x2="12" y2="12"/>
        <line x1="15" y1="10.5" x2="12" y2="12"/>
      </svg>
    ),
  },
  {
    id: 'categories', label: 'Categories',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      </svg>
    ),
  },

  {
    id: 'favoriteCategories', label: 'Favorites',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    ),
  },
 
  {
    id: 'brands', label: 'Brand',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
        <line x1="7" y1="7" x2="7.01" y2="7"/>
      </svg>
    ),
  },
 
 
  {
    id: 'banner', label: 'Banner',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="5" width="18" height="14" rx="2" ry="2"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
        <line x1="8" y1="5" x2="8" y2="10"/>
      </svg>
    ),
  },
  {
    id: 'customers', label: 'Customers',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    id: 'notifications', label: 'Notifications',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
    ),
  },
  {
    id: 'inventory',
    label: 'Inventory',

    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 22V8l9-5 9 5v14"/>
        <path d="M9 22V12h6v10"/>
        <path d="M9 17h6"/>
      </svg>
    ),
  },
];

export default function Sidebar({ currentPage, onNavigate, onLogout }) {
  return (
    <aside style={styles.sidebar}>
      {/* Header / Brand */}
      <div style={styles.header}>
        <div style={styles.brand}>
          <img src={pkLogo} alt="Peekay logo" style={styles.logoImg} />
          <div>
            <div style={styles.wordmark}>PEEKAY</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={styles.nav}>
        {NAV_ITEMS.map(item => {
          const active = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              aria-current={active ? 'page' : undefined}
              style={{
                ...styles.navItem,
                ...(active ? styles.navItemActive : {}),
              }}
              onMouseEnter={e => { if (!active) Object.assign(e.currentTarget.style, styles.navItemHover); }}
              onMouseLeave={e => { if (!active) Object.assign(e.currentTarget.style, styles.navItem); }}
            >
              <span style={styles.icon}>{item.icon}</span>
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={styles.footer}>
        <button
          style={styles.logoutBtn}
          onClick={onLogout}
          onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
          onMouseLeave={e => (e.currentTarget.style.color = '#9ca3af')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Sign out
        </button>
      </div>
    </aside>
  );
}

const styles = {
  sidebar: {
    width: '240px',
    minHeight: '100vh',
    background: '#1e2025',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: "'Space Grotesk', sans-serif",
  },
  header: {
    padding: '24px 20px 20px',
    borderBottom: '1px solid #2a2d35',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  logoImg: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    objectFit: 'contain',
  },
  wordmark: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#fff',
    letterSpacing: '2px',
    lineHeight: 1,
  },
  nav: {
    flex: 1,
    padding: '16px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '12px 14px',
    borderRadius: '10px',
    border: 'none',
    background: 'transparent',
    color: '#9ca3af',
    fontSize: '15px',
    fontWeight: '600',
    fontFamily: "'Space Grotesk', sans-serif",
    cursor: 'pointer',
    textAlign: 'left',
    width: '100%',
    letterSpacing: '0.2px',
    transition: 'background 0.15s, color 0.15s',
  },
  navItemActive: {
    background: '#f5a623',
    color: '#1e2025',
  },
  navItemHover: {
    background: '#2a2d35',
    color: '#e5e7eb',
  },
  icon: {
    width: '20px',
    height: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  footer: {
    padding: '16px 12px',
    borderTop: '1px solid #2a2d35',
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 14px',
    borderRadius: '8px',
    border: 'none',
    background: 'transparent',
    color: '#9ca3af',
    fontSize: '14px',
    fontWeight: '600',
    fontFamily: "'Space Grotesk', sans-serif",
    cursor: 'pointer',
    width: '100%',
    transition: 'color 0.15s',
  },
};