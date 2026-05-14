import React, { useMemo, useState } from 'react';

import Input from '../components/Input';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import { categoryAPI, productBatchAPI } from '../Services/api';
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

function CategoryCard({ category, onToggleFavorite }) {
  return (
    <article className="category-card">
      <div className="category-card__media">
        {category.url ? (
          <img className="category-card__image" src={String(category.url).replace(/\\/g, '/')} alt={category.name || 'Category'} loading="lazy" />
        ) : (
          <div className="category-card__empty">No Image</div>
        )}

        <FavoriteButton active={Boolean(category.isFavorite)} onClick={() => onToggleFavorite(category.name)} />
      </div>

      <div className="category-card__body">
        <h3 className="category-card__name">{category.name || 'N/A'}</h3>
        <p className="category-card__count">{category.itemCount || 0} items</p>
      </div>
    </article>
  );
}

function CategoryTable({ rows, onToggleFavorite }) {
  return (
    <div className="table-wrap category-table-wrap">
      <table className="data-table category-table">
        <thead>
          <tr>
            <th>IMAGE</th>
            <th>CATEGORY</th>
            <th>ITEM COUNT</th>
            <th>FAVORITE</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((category) => (
            <tr key={category.id || category.name} onClick={() => category.__onOpen?.()} style={{ cursor: category.__onOpen ? 'pointer' : 'default' }}>
              <td>
                <div className="item-thumb item-thumb--table">
                  {category.url ? <img src={String(category.url).replace(/\\/g, '/')} alt={category.name || 'Category'} loading="lazy" /> : <span>No Image</span>}
                </div>
              </td>
              <td className="category-table__name">{category.name || 'N/A'}</td>
              <td>{category.itemCount || 0}</td>
              <td>
                <FavoriteButton active={Boolean(category.isFavorite)} onClick={() => onToggleFavorite(category.name)} />
              </td>
            </tr>
          ))}
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

export default function Categories({ showToast }) {
  const [search, setSearch] = useState('');
  const [layout, setLayout] = useState('grid');
  const [favoriteOverrides, setFavoriteOverrides] = useState(() => {
    try {
      const saved = localStorage.getItem('local_fav_categories');
      if (!saved) return {};
      const arr = JSON.parse(saved);
      return Array.isArray(arr)
        ? arr.reduce((acc, name) => {
            acc[normalizeKey(name)] = true;
            return acc;
          }, {})
        : {};
    } catch {
      return {};
    }
  });

  const categoriesResult = useFetchData('categories', () => categoryAPI.getCategories());
  const itemsResult = useFetchData('items', () => productBatchAPI.getAllItems());

  const categories = Array.isArray(categoriesResult.data) ? categoriesResult.data : [];
  const allItems = Array.isArray(itemsResult.data) ? itemsResult.data : [];
  const loading = categoriesResult.loading || itemsResult.loading;

  const processedCategories = useMemo(() => {
    const countMap = allItems.reduce((acc, item) => {
      const key = normalizeKey(item.company);
      if (key) acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    return categories.map((cat) => {
      const key = normalizeKey(cat.name);
      return {
        ...cat,
        itemCount: countMap[key] || 0,
        isFavorite: favoriteOverrides[key] ?? Boolean(cat.is_favorite),
      };
    });
  }, [allItems, categories, favoriteOverrides]);

  const filteredCategories = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return processedCategories;

    return processedCategories.filter((c) => (c.name || '').toLowerCase().includes(term));
  }, [processedCategories, search]);

  const [selectedCategory, setSelectedCategory] = useState(null);

  const openCategoryItems = (categoryName) => setSelectedCategory(categoryName);
  const closeCategoryModal = () => setSelectedCategory(null);

  const itemsForSelectedCategory = useMemo(() => {
    if (!selectedCategory) return [];
    const key = normalizeKey(selectedCategory);
    return allItems.filter((it) => normalizeKey(it.company) === key);
  }, [selectedCategory, allItems]);

  // Replace the entire toggleFavorite function:
  const toggleFavorite = async (categoryName) => {
    const key = normalizeKey(categoryName);

    setFavoriteOverrides((prev) => {
      const nextValue = !prev[key];
      const updated = { ...prev, [key]: nextValue };
      try {
        const names = Object.keys(updated).filter((k) => updated[k]);
        localStorage.setItem('local_fav_categories', JSON.stringify(names));
      } catch {}
      return updated;
    });

    // Show toast based on new state
    const current = processedCategories.find((c) => normalizeKey(c.name) === key);
    const willBeFavorite = !current?.isFavorite;
    showToast?.(willBeFavorite ? 'Added to favorites' : 'Removed from favorites', 'success');
  };

  return (
    <div className="page category-page">
      <div className="item-toolbar category-toolbar">
        <div className="item-toolbar__left category-toolbar__left">
          <Input className="item-toolbar__search" placeholder="Search category..." value={search} onChange={(e) => setSearch(e.target.value)} />
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
      ) : filteredCategories.length === 0 ? (
        <EmptyState icon="📂" title="No categories found" description={search ? `No categories matching "${search}"` : 'No categories available'} />
      ) : layout === 'grid' ? (
        <div className="category-grid">
          {filteredCategories.map((category) => (
            <div key={category.id || category.name} onClick={() => openCategoryItems(category.name)} style={{ cursor: 'pointer' }}>
              <CategoryCard category={category} onToggleFavorite={toggleFavorite} />
            </div>
          ))}
        </div>
      ) : (
        <CategoryTable
          rows={filteredCategories.map((c) => ({ ...c, __onOpen: () => openCategoryItems(c.name) }))}
          onToggleFavorite={toggleFavorite}
        />
      )}

      {selectedCategory && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 999, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 20 }} onClick={closeCategoryModal}>
          <div style={{ width: '100%', maxWidth: 900, maxHeight: '90vh', overflowY: 'auto', background: '#fff', borderRadius: 12, padding: 20 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ margin: 0 }}>{selectedCategory}</h3>
              <button onClick={closeCategoryModal} style={{ border: 'none', background: 'none', fontSize: 22, cursor: 'pointer' }}>×</button>
            </div>

            {itemsForSelectedCategory.length === 0 ? (
              <div>No items for this category</div>
            ) : (
              <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
                {itemsForSelectedCategory.map((it) => (
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
