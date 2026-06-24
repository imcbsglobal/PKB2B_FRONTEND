import React, { useMemo, useState } from 'react';

import Input from '../components/Input';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import { brandAPI, productBatchAPI } from '../Services/api';
import { useFetchData } from '../hooks/useFetchData';

function normalizeKey(value) {
  return (value || '').trim().toLowerCase();
}

function FavoriteButton({ active, onClick }) {
  return (
    <button type="button" className={`category-fav-btn ${active ? 'is-active' : ''}`} onClick={(e) => { e.stopPropagation(); onClick?.(e); }} aria-pressed={active} title={active ? 'Remove favorite' : 'Add favorite'}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  );
}

function BrandCard({ brand, onToggleFavorite }) {
  const name = brand.brand || brand.name;
  const imageUrl = brand.url || brand.image;
  return (
    <article className="category-card">
      <div className="category-card__media">
        {imageUrl ? (
          <img className="category-card__image" src={String(imageUrl).replace(/\\/g, '/')} alt={name || 'Brand'} loading="lazy" />
        ) : (
          <div className="category-card__empty">No Image</div>
        )}
        <FavoriteButton active={Boolean(brand.isFavorite)} onClick={() => onToggleFavorite(name)} />
      </div>
      <div className="category-card__body">
        <h3 className="category-card__name">{name || 'N/A'}</h3>
        <p className="category-card__count">{brand.itemCount || 0} items</p>
      </div>
    </article>
  );
}

function BrandTable({ rows, onToggleFavorite, onOpenItems }) {
  return (
    <div className="table-wrap category-table-wrap">
      <table className="data-table category-table">
        <thead>
          <tr>
            <th>IMAGE</th>
            <th>BRAND</th>
            <th>ITEM COUNT</th>
            <th>FAVORITE</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((brand) => {
            const name = brand.brand || brand.name;
            const imageUrl = brand.url || brand.image;
            return (
              <tr key={brand.id || name} onClick={() => onOpenItems?.(name)} style={{ cursor: onOpenItems ? 'pointer' : 'default' }}>
                <td>
                  <div className="item-thumb item-thumb--table">
                    {imageUrl ? <img src={String(imageUrl).replace(/\\/g, '/')} alt={name || 'Brand'} loading="lazy" /> : <span>No Image</span>}
                  </div>
                </td>
                <td className="category-table__name">{name || 'N/A'}</td>
                <td>{brand.itemCount || 0}</td>
                <td>
                  <FavoriteButton active={Boolean(brand.isFavorite)} onClick={() => onToggleFavorite(name)} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ToggleButton({ active, icon, label, onClick }) {
  return (
    <button className={`item-view-toggle ${active ? 'item-view-toggle--active' : ''}`} onClick={onClick} aria-label={label} title={label}>
      {icon}
    </button>
  );
}

export default function Brands({ showToast }) {
  const [search, setSearch] = useState('');
  const [layout, setLayout] = useState('grid');
  const [favoriteOverrides, setFavoriteOverrides] = useState({});
  const [selectedBrand, setSelectedBrand] = useState(null);

  const brandsResult = useFetchData('brands', () => brandAPI.getAllBrands());
  const itemsResult = useFetchData('items', () => productBatchAPI.getAllItems());

  const loading = brandsResult.loading || itemsResult.loading;
  const allItems = useMemo(() => Array.isArray(itemsResult.data) ? itemsResult.data : [], [itemsResult.data]);

  const brands = useMemo(() => {
    const brandsData = Array.isArray(brandsResult.data) ? brandsResult.data : [];
    const countMap = allItems.reduce((acc, item) => {
      const key = normalizeKey(item.brand);
      if (key) acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    return brandsData.map((brand) => {
      const key = normalizeKey(brand.brand || brand.name);
      return {
        ...brand,
        itemCount: countMap[key] || 0,
        isFavorite: favoriteOverrides[key] ?? brand.is_favorite ?? false,
      };
    });
  }, [brandsResult.data, allItems, favoriteOverrides]);

  const filteredBrands = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return brands;
    return brands.filter((b) => (b.brand || b.name || '').toLowerCase().includes(term));
  }, [brands, search]);

  const openBrandItems = (brandName) => {
    setSelectedBrand(brandName);
  };

  const closeBrandModal = () => setSelectedBrand(null);

  const itemsForSelectedBrand = useMemo(() => {
    if (!selectedBrand) return [];
    const key = normalizeKey(selectedBrand);
    return allItems.filter((it) => normalizeKey(it.brand) === key);
  }, [selectedBrand, allItems]);

  const toggleFavorite = async (brandName) => {
    const key = normalizeKey(brandName);
    const current = brands.find((b) => normalizeKey(b.brand || b.name) === key);
    setFavoriteOverrides((prev) => ({ ...prev, [key]: !current?.isFavorite }));
    try {
      const response = await brandAPI.toggleBrandFavorite(brandName);
      const isFavorite = response.data?.is_favorite;
      setFavoriteOverrides((prev) => ({ ...prev, [key]: isFavorite }));
      showToast?.(isFavorite ? 'Added to favorites' : 'Removed from favorites', 'success');
    } catch (err) {
      setFavoriteOverrides((prev) => ({ ...prev, [key]: current?.isFavorite }));
      console.error('Favorite Error:', err);
      showToast?.('Failed to update favorite', 'error');
    }
  };

  return (
    <div className="page category-page">
      <div className="item-toolbar category-toolbar">
        <div className="item-toolbar__left category-toolbar__left">
          <Input className="item-toolbar__search" placeholder="Search brand..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <div className="item-toolbar__right">
          <div className="item-view-switch" aria-label="View mode">
            <ToggleButton
              active={layout === 'grid'}
              label="Grid view"
              onClick={() => setLayout('grid')}
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                </svg>
              }
            />
            <ToggleButton
              active={layout === 'table'}
              label="Table view"
              onClick={() => setLayout('table')}
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="8" y1="6" x2="21" y2="6" />
                  <line x1="8" y1="12" x2="21" y2="12" />
                  <line x1="8" y1="18" x2="21" y2="18" />
                  <line x1="3" y1="6" x2="3" y2="6" />
                  <line x1="3" y1="12" x2="3" y2="12" />
                  <line x1="3" y1="18" x2="3" y2="18" />
                </svg>
              }
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="item-loading-wrap">
          <LoadingSkeleton rows={5} columns={4} />
        </div>
      ) : filteredBrands.length === 0 ? (
        <EmptyState icon="🏷️" title="No brands found" description={search ? `No brands matching "${search}"` : 'No brands available'} />
      ) : layout === 'grid' ? (
        <div className="category-grid">
          {filteredBrands.map((brand) => {
            const name = brand.brand || brand.name;
            return (
              <div key={brand.id || name} onClick={() => openBrandItems(name)} style={{ cursor: 'pointer' }}>
                <BrandCard brand={brand} onToggleFavorite={toggleFavorite} />
              </div>
            );
          })}
        </div>
      ) : (
        <BrandTable rows={filteredBrands} onToggleFavorite={toggleFavorite} onOpenItems={openBrandItems} />
      )}

      {selectedBrand && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 999, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 20 }} onClick={closeBrandModal}>
          <div style={{ width: '100%', maxWidth: 900, maxHeight: '90vh', overflowY: 'auto', background: '#fff', borderRadius: 12, padding: 20 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ margin: 0 }}>{selectedBrand}</h3>
              <button onClick={closeBrandModal} style={{ border: 'none', background: 'none', fontSize: 22, cursor: 'pointer' }}>×</button>
            </div>

            {itemsForSelectedBrand.length === 0 ? (
              <div>No items for this brand</div>
            ) : (
              <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
                {itemsForSelectedBrand.map((it) => (
                  <div key={it.id || it.code} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: 12, border: '1px solid #eee', borderRadius: 8 }}>
                    <div style={{ width: 56, height: 56, flex: '0 0 56px' }}>
                      {it.url || it.url2 ? (
                        <img src={(it.url || it.url2).replace(/\\/g, '/')} alt={it.name || it.item_name || ''} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 6 }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', background: '#f5f5f5', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: 12 }}>No Image</div>
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700 }}>{it.name || it.item_name || 'N/A'}</div>
                      <div style={{ fontSize: 12, color: '#666' }}>{it.code || it.item_code || it.barcode || ''}</div>
                    </div>
                    <div style={{ textAlign: 'right', minWidth: 96 }}>
                      <div style={{ fontWeight: 700 }}>₹ {Number(it.price || it.rate || 0).toLocaleString('en-IN')}</div>
                      <div style={{ fontSize: 12, color: '#666' }}>Stock: {it.quantity ?? 0}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
 

