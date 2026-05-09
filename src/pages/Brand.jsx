// src/pages/Brand.jsx
import React, { useState } from 'react';

const BRANDS = [
  {
    id: 1,
    name: 'Nike',
    category: 'Footwear & Apparel',
    products: 142,
    active: true,
    logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg',
  },
  {
    id: 2,
    name: 'Adidas',
    category: 'Footwear & Apparel',
    products: 98,
    active: true,
    logo: 'https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg',
  },
  {
    id: 3,
    name: 'Puma',
    category: 'Footwear & Apparel',
    products: 64,
    active: false,
    logo: 'https://upload.wikimedia.org/wikipedia/commons/8/81/Puma_logo.png',
  },
  {
    id: 4,
    name: 'Reebok',
    category: 'Footwear & Apparel',
    products: 45,
    active: true,
    logo: 'https://upload.wikimedia.org/wikipedia/commons/4/44/Reebok_2019_logo.svg',
  },
  {
    id: 5,
    name: "Levi's",
    category: 'Apparel',
    products: 77,
    active: true,
    logo: "https://upload.wikimedia.org/wikipedia/commons/8/87/Levi%27s_Logo.svg",
  },
  {
    id: 6,
    name: 'Woodland',
    category: 'Footwear',
    products: 33,
    active: false,
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Woodland_logo.svg/1200px-Woodland_logo.svg.png',
  },
  {
    id: 7,
    name: 'Bata',
    category: 'Footwear',
    products: 58,
    active: true,
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Bata_logo.svg/1200px-Bata_logo.svg.png',
  },
  {
    id: 8,
    name: 'UCB',
    category: 'Apparel',
    products: 29,
    active: false,
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/United_Colors_of_Benetton.svg/2560px-United_Colors_of_Benetton.svg.png',
  },
];

export default function Brand() {
  const [brands, setBrands] = useState(BRANDS);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all | active | inactive

  const toggleStatus = (id) =>
    setBrands(prev => prev.map(b => b.id === id ? { ...b, active: !b.active } : b));

  const filtered = brands.filter(b => {
    const matchSearch =
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.category.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === 'all' || (filter === 'active' ? b.active : !b.active);
    return matchSearch && matchFilter;
  });

  const activeCount   = brands.filter(b => b.active).length;
  const inactiveCount = brands.filter(b => !b.active).length;

  return (
    <div className="page">

      {/* ── Page header ── */}
      <div className="orders-page-header">
        <div className="page__header">
          <h1 className="page__title">Brands</h1>
          <p className="page__sub">Manage your connected brands and their storefront status.</p>
        </div>
        
      </div>

      {/* ── Summary chips ── */}
      <div className="filter-row">
        <span className="filter-chip">{brands.length} Total</span>
        <span className="filter-chip badge-success" style={{ borderRadius: 'var(--radius-full)' }}>
          {activeCount} Active
        </span>
        <span className="filter-chip">{inactiveCount} Inactive</span>
      </div>

      {/* ── Toolbar card: search + filter pills ── */}
      <div className="orders-card" style={{ marginBottom: 'var(--space-5)' }}>
        <div className="orders-toolbar">
          <div className="orders-search-wrap">
            <svg className="orders-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              className="orders-search-input"
              placeholder="Search brands..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="filter-row" style={{ margin: 0 }}>
            {['all', 'active', 'inactive'].map(f => (
              <button
                key={f}
                className={`filter-chip${filter === f ? ' active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '35%' }}>Brand</th>
              <th>Category</th>
              <th>Products</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="table-empty">No brands found.</td>
              </tr>
            ) : (
              filtered.map(brand => (
                <tr key={brand.id}>

                  {/* Brand logo + name */}
                  <td>
                    <div className="brand-card" style={{ border: 'none', background: 'none', padding: 0 }}>
                      <div className="brand-card__img-wrap" style={{ background: 'var(--color-secondary)', border: '1px solid var(--color-border)' }}>
                        <img
                          className="brand-card__img"
                          src={brand.logo}
                          alt={brand.name}
                          onError={e => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                        <span style={{ display: 'none', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, fontWeight: 700, color: 'var(--color-primary)', background: 'var(--color-accent)', borderRadius: 'var(--radius-sm)' }}>
                          {brand.name[0]}
                        </span>
                      </div>
                      <div className="brand-card__info">
                        <span className="brand-card__name" style={{ color: 'var(--color-fg)' }}>
                          {brand.name}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="page__sub">{brand.category}</td>

                  {/* Products */}
                  <td style={{ fontWeight: 'var(--weight-semibold)' }}>{brand.products}</td>

                  {/* Status badge */}
                  <td>
                    <span className={`badge ${brand.active ? 'badge-success' : 'badge-default'}`}>
                      <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: brand.active ? 'oklch(0.65 0.18 145)' : 'var(--color-muted-fg)', marginRight: 5 }} />
                      {brand.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>

                  {/* Action */}
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className={`btn btn-sm ${brand.active ? 'btn-destructive' : 'btn-outline'}`}
                      onClick={() => toggleStatus(brand.id)}
                    >
                      {brand.active ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>

                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}