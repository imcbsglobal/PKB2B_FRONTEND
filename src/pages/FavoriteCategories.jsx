import React, { useState, useEffect, useCallback } from 'react';
import Table from '../components/Table';
import Input from '../components/Input';
import { productAPI, brandAPI, productBatchAPI } from '../Services/api';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap');

  .fav-root {
    font-family: 'DM Sans', sans-serif;
    padding: 24px 28px;
    background: #f5f5f4;
    min-height: 100vh;
  }

  .fav-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
  }

  .fav-title {
    font-size: 18px;
    font-weight: 600;
    color: #18181b;
    letter-spacing: -0.3px;
    margin: 0;
  }

  .fav-section {
    background: #ffffff;
    border: 1px solid #e4e4e7;
    border-radius: 10px;
    overflow: hidden;
    margin-bottom: 16px;
  }

  .fav-section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 18px;
    border-bottom: 1px solid #f0f0f0;
    background: #fafaf9;
  }

  .fav-section-title {
    font-size: 13px;
    font-weight: 600;
    color: #3f3f46;
    letter-spacing: 0.4px;
    text-transform: uppercase;
    margin: 0;
  }

  .fav-badge {
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    font-weight: 500;
    color: #71717a;
    background: #f4f4f5;
    border: 1px solid #e4e4e7;
    padding: 2px 8px;
    border-radius: 20px;
  }

  .fav-search-wrap {
    padding: 10px 18px;
    border-bottom: 1px solid #f0f0f0;
  }

  .fav-search {
    width: 100%;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    color: #18181b;
    background: #f4f4f5;
    border: 1px solid transparent;
    border-radius: 6px;
    padding: 7px 12px;
    outline: none;
    box-sizing: border-box;
    transition: border-color 0.15s, background 0.15s;
  }

  .fav-search:focus {
    border-color: #d4d4d8;
    background: #fff;
  }

  .fav-search::placeholder { color: #a1a1aa; }

  /* TABLE */
  .fav-table {
    width: 100%;
    border-collapse: collapse;
  }

  .fav-table thead tr {
    background: #fafaf9;
  }

  .fav-table th {
    font-size: 11px;
    font-weight: 600;
    color: #a1a1aa;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    padding: 9px 18px;
    text-align: left;
    border-bottom: 1px solid #f0f0f0;
  }

  .fav-table th.center { text-align: center; }

  .fav-table td {
    padding: 10px 18px;
    border-bottom: 1px solid #f8f8f7;
    font-size: 13px;
    color: #3f3f46;
    vertical-align: middle;
  }

  .fav-table tbody tr:last-child td { border-bottom: none; }

  .fav-table tbody tr:hover td { background: #fafaf9; }

  .fav-table td.center { text-align: center; }

  .fav-thumb {
    width: 36px;
    height: 36px;
    background: #f4f4f5;
    border: 1px solid #e4e4e7;
    border-radius: 6px;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .fav-thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .fav-thumb-placeholder {
    font-size: 10px;
    color: #a1a1aa;
    font-weight: 600;
    font-family: 'DM Mono', monospace;
  }

  .fav-link {
    background: none;
    border: none;
    cursor: pointer;
    color: #2563eb;
    font-size: 13px;
    font-weight: 500;
    font-family: 'DM Sans', sans-serif;
    padding: 0;
    text-decoration: none;
    transition: color 0.15s;
  }

  .fav-link:hover { color: #1d4ed8; text-decoration: underline; }

  .fav-count {
    display: inline-block;
    font-family: 'DM Mono', monospace;
    font-size: 12px;
    font-weight: 500;
    color: #71717a;
    background: #f4f4f5;
    border: 1px solid #e4e4e7;
    padding: 2px 10px;
    border-radius: 20px;
    min-width: 32px;
    text-align: center;
  }

  .fav-heart {
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 6px;
    line-height: 1;
    transition: background 0.15s;
    font-size: 15px;
    color: #f87171;
  }

  .fav-heart:hover { background: #fff1f2; color: #ef4444; }

  /* EMPTY / LOADING */
  .fav-empty {
    padding: 32px 18px;
    text-align: center;
    color: #a1a1aa;
    font-size: 13px;
  }

  /* MODAL */
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

  .fav-modal-title {
    font-size: 15px;
    font-weight: 600;
    color: #18181b;
    margin: 0;
  }

  .fav-modal-close {
    background: #f4f4f5;
    border: 1px solid #e4e4e7;
    width: 28px;
    height: 28px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 16px;
    color: #71717a;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
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

  .stock-in  { color: #16a34a; font-weight: 600; }
  .stock-low { color: #d97706; font-weight: 600; }
  .stock-out { color: #dc2626; font-weight: 600; }

  .price-cell { font-family: 'DM Mono', monospace; font-size: 12px; }

  .error-box {
    padding: 16px 20px;
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 8px;
    color: #dc2626;
    font-size: 13px;
    margin: 24px;
  }
`;

export default function Favorites() {
  const [favoriteCategories, setFavoriteCategories] = useState([]);
  const [categorySearch, setCategorySearch] = useState('');
  const [categoryLoading, setCategoryLoading] = useState(true);
  const [favoriteBrands, setFavoriteBrands] = useState([]);
  const [brandSearch, setBrandSearch] = useState('');
  const [brandLoading, setBrandLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [itemType, setItemType] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
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
        const br = item.brand?.toLowerCase().trim();
        if (cat) categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
        if (br) brandCounts[br] = (brandCounts[br] || 0) + 1;
      });

      setFavoriteCategories(
        (categoryResponse.data || [])
          .filter((p) => p.is_favorite === true)
          .map((p, i) => ({ ...p, id: p.id ?? i, itemCount: categoryCounts[p.name?.toLowerCase().trim()] || 0 }))
      );

      setFavoriteBrands(
        (brandResponse.data || [])
          .filter((b) => b.is_favorite === true)
          .map((b, i) => ({ ...b, id: b.id ?? i, itemCount: brandCounts[b.name?.toLowerCase().trim()] || 0 }))
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

  const handleItemClick = async (item, type) => {
    setSelectedItem(item);
    setItemType(type);
    setModalOpen(true);
    setItemsLoading(true);
    try {
      const response = await productBatchAPI.getAllItems();
      const all = response.data || [];
      setItemsInModal(
        type === 'category'
          ? all.filter((i) => i.product?.toLowerCase() === item.name?.toLowerCase())
          : all.filter((i) => i.brand?.toLowerCase() === item.name?.toLowerCase())
      );
    } catch (err) {
      console.error(err);
      setItemsInModal([]);
    } finally {
      setItemsLoading(false);
    }
  };

  const toggleFavoriteCategory = useCallback(async (row) => {
    setFavoriteCategories((prev) => prev.filter((p) => p.id !== row.id));
    try { await productAPI.toggleProductFavorite(row.name); }
    catch { fetchFavorites(); }
  }, []);

  const toggleFavoriteBrand = useCallback(async (row) => {
    setFavoriteBrands((prev) => prev.filter((b) => b.id !== row.id));
    try { await brandAPI.toggleBrandFavorite(row.name); }
    catch { fetchFavorites(); }
  }, []);

  const filteredCategories = favoriteCategories.filter((p) =>
    p.name?.toLowerCase().includes(categorySearch.toLowerCase())
  );
  const filteredBrands = favoriteBrands.filter((b) =>
    b.name?.toLowerCase().includes(brandSearch.toLowerCase())
  );

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

  if (error) return (
    <div className="fav-root">
      <style>{styles}</style>
      <div className="fav-header"><h1 className="fav-title">Favorites</h1></div>
      <div className="error-box">{error}</div>
    </div>
  );

  return (
    <div className="fav-root">
      <style>{styles}</style>

      <div className="fav-header">
        <h1 className="fav-title">Favorites</h1>
      </div>

      {/* CATEGORIES */}
      <div className="fav-section">
        <div className="fav-section-header">
          <h2 className="fav-section-title">Favorite Categories</h2>
          <span className="fav-badge">{filteredCategories.length} categories</span>
        </div>

        {categoryLoading ? (
          <div className="fav-empty">Loading categories…</div>
        ) : favoriteCategories.length === 0 ? (
          <div className="fav-empty">No favorite categories yet.</div>
        ) : (
          <>
            <div className="fav-search-wrap">
              <input
                className="fav-search"
                placeholder="Search categories…"
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
              />
            </div>
            <table className="fav-table">
              <thead>
                <tr>
                  <th style={{ width: 56 }}>Image</th>
                  <th>Category</th>
                  <th className="center" style={{ width: 90 }}>Items</th>
                  <th className="center" style={{ width: 90 }}>Favorite</th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories.map((row) => (
                  <tr key={row.id}>
                    <td><Thumb src={row.url} alt={row.name} fallback="IMG" /></td>
                    <td>
                      <button className="fav-link" onClick={() => handleItemClick(row, 'category')}>
                        {row.name}
                      </button>
                    </td>
                    <td className="center"><span className="fav-count">{row.itemCount || 0}</span></td>
                    <td className="center">
                      <button className="fav-heart" onClick={() => toggleFavoriteCategory(row)} title="Remove from favorites">♥</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>

      {/* BRANDS */}
      <div className="fav-section">
        <div className="fav-section-header">
          <h2 className="fav-section-title">Favorite Brands</h2>
          <span className="fav-badge">{filteredBrands.length} brands</span>
        </div>

        {brandLoading ? (
          <div className="fav-empty">Loading brands…</div>
        ) : favoriteBrands.length === 0 ? (
          <div className="fav-empty">No favorite brands yet.</div>
        ) : (
          <>
            <div className="fav-search-wrap">
              <input
                className="fav-search"
                placeholder="Search brands…"
                value={brandSearch}
                onChange={(e) => setBrandSearch(e.target.value)}
              />
            </div>
            <table className="fav-table">
              <thead>
                <tr>
                  <th style={{ width: 56 }}>Logo</th>
                  <th>Brand</th>
                  <th className="center" style={{ width: 90 }}>Items</th>
                  <th className="center" style={{ width: 90 }}>Favorite</th>
                </tr>
              </thead>
              <tbody>
                {filteredBrands.map((row) => (
                  <tr key={row.id}>
                    <td><Thumb src={row.logo} alt={row.name} fallback={row.name?.charAt(0)} /></td>
                    <td>
                      <button className="fav-link" onClick={() => handleItemClick(row, 'brand')}>
                        {row.name}
                      </button>
                    </td>
                    <td className="center"><span className="fav-count">{row.itemCount || 0}</span></td>
                    <td className="center">
                      <button className="fav-heart" onClick={() => toggleFavoriteBrand(row)} title="Remove from favorites">♥</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>

      {/* MODAL */}
      {modalOpen && (
        <div className="fav-overlay" onClick={(e) => e.target === e.currentTarget && setModalOpen(false)}>
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
                      <td className="center" style={{ fontFamily: 'DM Mono, monospace', fontSize: 12, color: row.quantity <= 0 ? '#dc2626' : row.quantity <= 5 ? '#d97706' : '#16a34a', fontWeight: 600 }}>
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