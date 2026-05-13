import React, { useState, useEffect, useCallback } from 'react';
import Input from '../components/Input';
import { productAPI, brandAPI, productBatchAPI, categoryAPI } from '../Services/api';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&family=DM+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; }

  .fav-root {
    font-family: 'DM Sans', sans-serif;
    padding: 28px 32px;
    background: #f5f5f4;
    min-height: 100vh;
  }

  /* ── FILTER TABS (inside toolbar) ── */
  .fav-filter-tabs {
    display: flex;
    gap: 2px;
    background: #ffffff;
    border: 1px solid #e4e4e7;
    border-radius: 8px;
    padding: 3px;
  }

  .fav-tab {
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 500;
    color: #71717a;
    background: none;
    border: none;
    border-radius: 6px;
    padding: 6px 14px;
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
    line-height: 1;
  }

  .fav-tab:hover { color: #3f3f46; background: #f4f4f5; }

  .fav-tab.active {
    background: #18181b;
    color: #ffffff;
  }

  /* ── SECTION ── */
  .fav-section {
    margin-bottom: 32px;
  }

  .fav-section-meta {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    margin-bottom: 14px;
  }

  .fav-section-left h2 {
    font-size: 17px;
    font-weight: 600;
    color: #18181b;
    margin: 0 0 3px;
    letter-spacing: -0.2px;
  }

  .fav-section-left p {
    font-size: 13px;
    color: #a1a1aa;
    margin: 0;
  }

  .fav-count-badge {
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    font-weight: 500;
    color: #71717a;
    background: #ffffff;
    border: 1px solid #e4e4e7;
    padding: 4px 10px;
    border-radius: 20px;
  }

  /* ── CARD GRID ── */
  .fav-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }

  @media (max-width: 960px) { .fav-grid { grid-template-columns: repeat(2, 1fr); } }
  @media (max-width: 600px)  { .fav-grid { grid-template-columns: 1fr; } }

  .fav-card {
    background: #ffffff;
    border: 1px solid #e4e4e7;
    border-radius: 10px;
    padding: 16px 18px;
    display: flex;
    align-items: center;
    gap: 14px;
    cursor: pointer;
    transition: border-color 0.15s, box-shadow 0.15s, transform 0.1s;
    position: relative;
    overflow: hidden;
  }

  .fav-card:hover {
    border-color: #d4d4d8;
    box-shadow: 0 2px 10px rgba(0,0,0,0.06);
    transform: translateY(-1px);
  }

  .fav-card:active { transform: translateY(0); }

  /* avatar */
  .fav-avatar {
    width: 42px;
    height: 42px;
    border-radius: 8px;
    background: #f4f4f5;
    border: 1px solid #e4e4e7;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    overflow: hidden;
  }

  .fav-avatar img { width: 100%; height: 100%; object-fit: cover; }

  .fav-avatar-text {
    font-family: 'DM Mono', monospace;
    font-size: 12px;
    font-weight: 500;
    color: #71717a;
    letter-spacing: 0.5px;
  }

  /* card body */
  .fav-card-body { flex: 1; min-width: 0; }

  .fav-card-name {
    font-size: 14px;
    font-weight: 600;
    color: #18181b;
    margin: 0 0 3px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .fav-card-sub {
    font-size: 12px;
    color: #a1a1aa;
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* percentage badge */
  .fav-pct {
    font-family: 'DM Mono', monospace;
    font-size: 12px;
    font-weight: 500;
    padding: 3px 8px;
    border-radius: 20px;
    flex-shrink: 0;
    align-self: flex-start;
  }

  .fav-pct.pos { color: #16a34a; background: #f0fdf4; }
  .fav-pct.neg { color: #dc2626; background: #fef2f2; }
  .fav-pct.neu { color: #71717a; background: #f4f4f5; }

  /* heart remove btn */
  .fav-card-remove {
    position: absolute;
    top: 8px;
    right: 8px;
    background: none;
    border: none;
    cursor: pointer;
    color: #d4d4d8;
    font-size: 14px;
    line-height: 1;
    padding: 2px 4px;
    border-radius: 4px;
    opacity: 0;
    transition: opacity 0.15s, color 0.15s, background 0.15s;
  }

  .fav-card:hover .fav-card-remove { opacity: 1; }
  .fav-card-remove:hover { color: #f87171; background: #fff1f2; }

  /* ── EMPTY / LOADING ── */
  .fav-empty {
    grid-column: 1 / -1;
    padding: 32px;
    text-align: center;
    color: #a1a1aa;
    font-size: 13px;
    background: #ffffff;
    border: 1px solid #e4e4e7;
    border-radius: 10px;
  }

  /* ── MODAL ── */
  .fav-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.35);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 999;
    padding: 20px;
    backdrop-filter: blur(2px);
  }

  .fav-modal {
    width: 100%;
    max-width: 860px;
    background: #fff;
    border-radius: 12px;
    border: 1px solid #e4e4e7;
    max-height: 80vh;
    overflow: auto;
    box-shadow: 0 20px 60px rgba(0,0,0,0.15);
  }

  .fav-modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid #f0f0f0;
    position: sticky;
    top: 0;
    background: #fff;
    z-index: 1;
  }

  .fav-modal-title { font-size: 15px; font-weight: 600; color: #18181b; margin: 0; }

  .fav-modal-close {
    background: #f4f4f5;
    border: 1px solid #e4e4e7;
    width: 28px; height: 28px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 16px;
    color: #71717a;
    display: flex; align-items: center; justify-content: center;
    transition: background 0.15s;
  }

  .fav-modal-close:hover { background: #e4e4e7; color: #3f3f46; }

  .fav-modal-meta {
    padding: 10px 20px;
    font-size: 12px;
    color: #a1a1aa;
    border-bottom: 1px solid #f0f0f0;
    font-family: 'DM Mono', monospace;
  }

  /* TABLE in modal */
  .fav-table { width: 100%; border-collapse: collapse; }
  .fav-table thead tr { background: #fafaf9; }
  .fav-table th {
    font-size: 11px; font-weight: 600; color: #a1a1aa;
    text-transform: uppercase; letter-spacing: 0.5px;
    padding: 9px 18px; text-align: left;
    border-bottom: 1px solid #f0f0f0;
  }
  .fav-table th.center { text-align: center; }
  .fav-table td {
    padding: 10px 18px;
    border-bottom: 1px solid #f8f8f7;
    font-size: 13px; color: #3f3f46;
    vertical-align: middle;
  }
  .fav-table tbody tr:last-child td { border-bottom: none; }
  .fav-table tbody tr:hover td { background: #fafaf9; }
  .fav-table td.center { text-align: center; }

  .fav-thumb {
    width: 34px; height: 34px;
    background: #f4f4f5; border: 1px solid #e4e4e7;
    border-radius: 6px; overflow: hidden;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .fav-thumb img { width: 100%; height: 100%; object-fit: cover; }
  .fav-thumb-placeholder { font-size: 10px; color: #a1a1aa; font-weight: 600; font-family: 'DM Mono', monospace; }

  .stock-in  { color: #16a34a; font-weight: 600; font-size: 12px; }
  .stock-low { color: #d97706; font-weight: 600; font-size: 12px; }
  .stock-out { color: #dc2626; font-weight: 600; font-size: 12px; }
  .price-cell { font-family: 'DM Mono', monospace; font-size: 12px; }

  .error-box {
    padding: 16px 20px;
    background: #fef2f2; border: 1px solid #fecaca;
    border-radius: 8px; color: #dc2626; font-size: 13px;
    margin-top: 16px;
  }
`;

/* ── helpers ── */
const abbr = (name = '') =>
  name.split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase()).join('');

const pctDisplay = (val) => {
  if (val == null) return null;
  const n = parseFloat(val);
  if (isNaN(n)) return null;
  const cls = n > 0 ? 'pos' : n < 0 ? 'neg' : 'neu';
  return <span className={`fav-pct ${cls}`}>{n > 0 ? '+' : ''}{n}%</span>;
};

export default function Favorites() {
  const [favoriteCategories, setFavoriteCategories] = useState([]);
  const [favoriteBrands, setFavoriteBrands]         = useState([]);
  const [categoryLoading, setCategoryLoading]        = useState(true);
  const [brandLoading, setBrandLoading]              = useState(true);
  const [error, setError]                            = useState(null);
  const [activeTab, setActiveTab]                    = useState('All');
  const [globalSearch, setGlobalSearch]              = useState('');

  const [modalOpen, setModalOpen]     = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [itemType, setItemType]         = useState(null);
  const [itemsInModal, setItemsInModal] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(false);

  const fetchFavorites = async () => {
    try {
      setCategoryLoading(true);
      setBrandLoading(true);
      const [categoryResponse, brandResponse, itemsResponse] = await Promise.all([
        productAPI.getAllProducts(),
        brandAPI.getAllBrands(),
        productBatchAPI.getAllItems(),
      ]);

      const items = itemsResponse.data || [];
      const categoryCounts = {};
      const brandCounts = {};

      items.forEach((item) => {
        const cat = item.product?.toLowerCase().trim();
        const br  = item.brand?.toLowerCase().trim();
        if (cat) categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
        if (br)  brandCounts[br]     = (brandCounts[br]  || 0) + 1;
      });

      // Server-side favorites (if any)
      const serverCategories = (categoryResponse.data || []).map((p, i) => ({
        ...p,
        id: p.id ?? i,
        itemCount: categoryCounts[p.name?.toLowerCase().trim()] || 0,
      }));

      let favoritesFromServer = serverCategories.filter(p => p.is_favorite === true);

      // Local favorites persisted in localStorage
      let localFavNames = [];
      try { localFavNames = JSON.parse(localStorage.getItem('local_fav_categories') || '[]'); } catch (e) { localFavNames = []; }
      const localFavorites = [];
      localFavNames.forEach((name, idx) => {
        const found = serverCategories.find(c => (c.name || '').toLowerCase() === (name || '').toLowerCase());
        if (found && !favoritesFromServer.find(f => (f.name||'').toLowerCase() === (found.name||'').toLowerCase())) {
          localFavorites.push({ ...found, id: `local-${idx}-${found.name}`, _local: true });
        }
      });

      setFavoriteCategories([
        ...favoritesFromServer,
        ...localFavorites,
      ]);

      setFavoriteBrands(
        (brandResponse.data || [])
          .filter(b => b.is_favorite === true)
          .map((b, i) => ({
            ...b,
            id: b.id ?? i,
            itemCount: brandCounts[b.name?.toLowerCase().trim()] || 0,
          }))
      );

      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to load favorites');
      setFavoriteCategories([]);
      setFavoriteBrands([]);
    } finally {
      setCategoryLoading(false);
      setBrandLoading(false);
    }
  };

  useEffect(() => { fetchFavorites(); }, []);

  const handleCardClick = async (item, type) => {
    setSelectedItem(item);
    setItemType(type);
    setModalOpen(true);
    setItemsLoading(true);
    try {
      const response = await productBatchAPI.getAllItems();
      const all = response.data || [];
      setItemsInModal(
        type === 'category'
          ? all.filter(i => i.product?.toLowerCase() === item.name?.toLowerCase())
          : all.filter(i => i.brand?.toLowerCase()   === item.name?.toLowerCase())
      );
    } catch { setItemsInModal([]); }
    finally  { setItemsLoading(false); }
  };

  const toggleFavoriteCategory = useCallback(async (e, row) => {
    e.stopPropagation();
    // If this is a local favorite, remove from localStorage
    if (row._local) {
      try {
        const saved = JSON.parse(localStorage.getItem('local_fav_categories') || '[]');
        const normalized = (saved || []).filter(n => (n || '').toLowerCase() !== (row.name || '').toLowerCase());
        localStorage.setItem('local_fav_categories', JSON.stringify(normalized));
        setFavoriteCategories(prev => prev.filter(p => p.id !== row.id));
        return;
      } catch (err) {
        console.error('Failed to remove local favorite', err);
      }
    }

    // Otherwise attempt server-side toggle (fallback)
    setFavoriteCategories(prev => prev.filter(p => p.id !== row.id));
    try { await productAPI.toggleProductFavorite(row.name); }
    catch { fetchFavorites(); }
  }, []);

  const toggleFavoriteBrand = useCallback(async (e, row) => {
    e.stopPropagation();
    setFavoriteBrands(prev => prev.filter(b => b.id !== row.id));
    try { await brandAPI.toggleBrandFavorite(row.name); }
    catch { fetchFavorites(); }
  }, []);

  const q = globalSearch.toLowerCase();
  const filteredCategories = favoriteCategories.filter(p => p.name?.toLowerCase().includes(q));
  const filteredBrands     = favoriteBrands.filter(b => b.name?.toLowerCase().includes(q));

  const showCategories = activeTab !== 'Brands';
  const showBrands     = activeTab !== 'Categories';

  const Thumb = ({ src, alt, fallback }) => (
    <div className="fav-thumb">
      {src
        ? <img src={src} alt={alt} />
        : <span className="fav-thumb-placeholder">{fallback || '—'}</span>
      }
    </div>
  );

  const stockLabel = (qty) => {
    if (qty <= 0) return <span className="stock-out">Out of Stock</span>;
    if (qty <= 5) return <span className="stock-low">Low Stock</span>;
    return <span className="stock-in">In Stock</span>;
  };

  /* ── sub-line for category card ── */
  const categorySubline = (row) => {
    const parts = [];
    if (row.itemCount) parts.push(`${row.itemCount} products`);
    if (row.brandCount) parts.push(`${row.brandCount} brands`);
    return parts.length ? parts.join(' · ') : 'No items yet';
  };

  /* ── sub-line for brand card ── */
  const brandSubline = (row) => {
    const parts = [];
    if (row.category) parts.push(row.category);
    if (row.tier)     parts.push(row.tier);
    if (!parts.length && row.itemCount) parts.push(`${row.itemCount} items`);
    return parts.join(' · ') || 'No info';
  };

  if (error) return (
    <div className="page">
      <style>{styles}</style>
      <div className="page__header"><div><h1 className="page__title">Favorites</h1></div></div>
      <div className="error-box">{error}</div>
    </div>
  );

  return (
    <div className="page">
      <style>{styles}</style>

      {/* HEADER */}
      <div className="page__header">
        <div>
          <h1 className="page__title">Favorites</h1>
          <p className="page__sub">
            {filteredCategories.length + filteredBrands.length} favorites found
          </p>
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="toolbar">
        <Input
          className="toolbar__search"
          placeholder="Search favorites…"
          value={globalSearch}
          onChange={e => setGlobalSearch(e.target.value)}
        />
        <div className="fav-filter-tabs">
          {['All', 'Categories', 'Brands'].map(tab => (
            <button
              key={tab}
              className={`fav-tab${activeTab === tab ? ' active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* CATEGORIES */}
      {showCategories && (
        <div className="fav-section">
          <div className="fav-section-meta">
            <div className="fav-section-left">
              <h2>Favorite Categories</h2>
              <p>Topics you follow — neatly grouped.</p>
            </div>
            <span className="fav-count-badge">
              {filteredCategories.length} {filteredCategories.length === 1 ? 'category' : 'categories'}
            </span>
          </div>

          <div className="fav-grid">
            {categoryLoading ? (
              <div className="fav-empty">Loading categories…</div>
            ) : filteredCategories.length === 0 ? (
              <div className="fav-empty">No favorite categories yet.</div>
            ) : filteredCategories.map(row => (
              <div className="fav-card" key={row.id} onClick={() => handleCardClick(row, 'category')}>
                <div className="fav-avatar">
                  {row.url
                    ? <img src={row.url} alt={row.name} />
                    : <span className="fav-avatar-text">{abbr(row.name)}</span>
                  }
                </div>
                <div className="fav-card-body">
                  <p className="fav-card-name">{row.name}</p>
                  <p className="fav-card-sub">{categorySubline(row)}</p>
                </div>
                {pctDisplay(row.growth ?? row.change)}
                <button
                  className="fav-card-remove"
                  onClick={e => toggleFavoriteCategory(e, row)}
                  title="Remove from favorites"
                >♥</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* BRANDS */}
      {showBrands && (
        <div className="fav-section">
          <div className="fav-section-meta">
            <div className="fav-section-left">
              <h2>Favorite Brands</h2>
              <p>Brands you keep an eye on.</p>
            </div>
            <span className="fav-count-badge">
              {filteredBrands.length} {filteredBrands.length === 1 ? 'brand' : 'brands'}
            </span>
          </div>

          <div className="fav-grid">
            {brandLoading ? (
              <div className="fav-empty">Loading brands…</div>
            ) : filteredBrands.length === 0 ? (
              <div className="fav-empty">No favorite brands yet.</div>
            ) : filteredBrands.map(row => (
              <div className="fav-card" key={row.id} onClick={() => handleCardClick(row, 'brand')}>
                <div className="fav-avatar">
                  {row.logo
                    ? <img src={row.logo} alt={row.name} />
                    : <span className="fav-avatar-text">{abbr(row.name)}</span>
                  }
                </div>
                <div className="fav-card-body">
                  <p className="fav-card-name">{row.name}</p>
                  <p className="fav-card-sub">{brandSubline(row)}</p>
                </div>
                {pctDisplay(row.growth ?? row.change)}
                <button
                  className="fav-card-remove"
                  onClick={e => toggleFavoriteBrand(e, row)}
                  title="Remove from favorites"
                >♥</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL */}
      {modalOpen && (
        <div className="fav-overlay" onClick={e => e.target === e.currentTarget && setModalOpen(false)}>
          <div className="fav-modal">
            <div className="fav-modal-header">
              <h2 className="fav-modal-title">{selectedItem?.name}</h2>
              <button className="fav-modal-close" onClick={() => setModalOpen(false)}>×</button>
            </div>
            <div className="fav-modal-meta">
              {itemsLoading ? 'Loading…' : `${itemsInModal.length} items`}
            </div>

            {itemsLoading ? (
              <div className="fav-empty">Loading items…</div>
            ) : itemsInModal.length === 0 ? (
              <div className="fav-empty">No items found for {selectedItem?.name}</div>
            ) : (
              <table className="fav-table">
                <thead>
                  <tr>
                    <th style={{ width: 48 }}>Img</th>
                    <th style={{ width: 100 }}>Code</th>
                    <th>Name</th>
                    <th>Brand</th>
                    <th className="center" style={{ width: 80 }}>Price</th>
                    <th className="center" style={{ width: 70 }}>Stock</th>
                    <th className="center" style={{ width: 100 }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {itemsInModal.map((row, i) => (
                    <tr key={row.id ?? i}>
                      <td><Thumb src={row.url2} alt={row.name} fallback="IMG" /></td>
                      <td style={{ fontFamily: 'DM Mono, monospace', fontSize: 12, color: '#71717a' }}>{row.code}</td>
                      <td style={{ fontWeight: 500, color: '#18181b' }}>{row.name}</td>
                      <td style={{ color: '#71717a' }}>{row.brand}</td>
                      <td className="center price-cell">₹{row.price || 0}</td>
                      <td className="center" style={{
                        fontFamily: 'DM Mono, monospace', fontSize: 12, fontWeight: 600,
                        color: row.quantity <= 0 ? '#dc2626' : row.quantity <= 5 ? '#d97706' : '#16a34a'
                      }}>
                        {row.quantity}
                      </td>
                      <td className="center">{stockLabel(row.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}