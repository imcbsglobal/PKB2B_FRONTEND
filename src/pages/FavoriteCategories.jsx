import React, { useState, useMemo } from 'react';
import Input from '../components/Input';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import { categoryAPI, brandAPI, productBatchAPI } from '../Services/api';
import { useFetchData } from '../hooks/useFetchData';

function normalizeKey(value) {
  return (value || '').trim().toLowerCase();
}

function FavoriteButton({ active, onClick }) {
  return (
    <button
      type="button"
      className={`category-fav-btn ${active ? 'is-active' : ''}`}
      onClick={onClick}
      aria-pressed={active}
      title={active ? 'Remove favorite' : 'Add favorite'}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill={active ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  );
}

function FavoriteCard({ item, onToggleFavorite }) {
  const imageUrl = item.url || item.image;
  const displayName = item.name || item.brand || 'N/A';

  return (
    <article className="category-card">
      <div className="category-card__media">
        {imageUrl ? (
          <img
            className="category-card__image"
            src={String(imageUrl).replace(/\\/g, '/')}
            alt={displayName}
            loading="lazy"
          />
        ) : (
          <div className="category-card__empty">No Image</div>
        )}
        <FavoriteButton active={true} onClick={() => onToggleFavorite(item)} />
        {/* Type badge */}
        <span className="fav-type-badge">{item._type === 'category' ? 'Category' : 'Brand'}</span>
      </div>
      <div className="category-card__body">
        <h3 className="category-card__name">{displayName}</h3>
        <p className="category-card__count">{item.itemCount || 0} items</p>
      </div>
    </article>
  );
}

export default function FavoriteCategories({ showToast }) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');

  // ── local favorite overrides (mirrors Categories page) ──
  const [catFavOverrides, setCatFavOverrides] = useState(() => {
    try {
      const saved = localStorage.getItem('local_fav_categories');
      if (!saved) return {};
      const arr = JSON.parse(saved);
      return Array.isArray(arr)
        ? arr.reduce((acc, name) => { acc[normalizeKey(name)] = true; return acc; }, {})
        : {};
    } catch { return {}; }
  });

  const [brandFavOverrides, setBrandFavOverrides] = useState({});

  // ── data fetching ──
  const categoriesResult = useFetchData('categories', () => categoryAPI.getCategories());
  const brandsResult = useFetchData('brands', () => brandAPI.getAllBrands());
  const itemsResult = useFetchData('items', () => productBatchAPI.getAllItems());

  const rawCategories = Array.isArray(categoriesResult.data) ? categoriesResult.data : [];
  const rawBrands = Array.isArray(brandsResult.data) ? brandsResult.data : [];
  const allItems = Array.isArray(itemsResult.data) ? itemsResult.data : [];

  const loading = categoriesResult.loading || brandsResult.loading || itemsResult.loading;

  // ── item counts ──
  const categoryCountMap = useMemo(() =>
    allItems.reduce((acc, item) => {
      const key = normalizeKey(item.company);
      if (key) acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {}),
    [allItems]
  );

  const brandCountMap = useMemo(() =>
    allItems.reduce((acc, item) => {
      const key = normalizeKey(item.brand);
      if (key) acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {}),
    [allItems]
  );

  // ── build favorited lists ──
  const favoritedCategories = useMemo(() =>
    rawCategories
      .map((cat) => {
        const key = normalizeKey(cat.name);
        const isFav = catFavOverrides[key] ?? Boolean(cat.is_favorite);
        return {
          ...cat,
          _type: 'category',
          itemCount: categoryCountMap[key] || 0,
          isFavorite: isFav,
        };
      })
      .filter((cat) => cat.isFavorite),
    [rawCategories, catFavOverrides, categoryCountMap]
  );

  const favoritedBrands = useMemo(() =>
    rawBrands
      .map((brand) => {
        const key = normalizeKey(brand.brand || brand.name);
        const isFav = brandFavOverrides[key] ?? Boolean(brand.is_favorite);
        return {
          ...brand,
          _type: 'brand',
          itemCount: brandCountMap[key] || 0,
          isFavorite: isFav,
        };
      })
      .filter((brand) => brand.isFavorite),
    [rawBrands, brandFavOverrides, brandCountMap]
  );

  // ── counts for filter tabs ──
  const allCount = favoritedCategories.length + favoritedBrands.length;
  const categoryCount = favoritedCategories.length;
  const brandCount = favoritedBrands.length;

  // ── filtered items based on tab + search ──
  const filteredItems = useMemo(() => {
    const term = search.trim().toLowerCase();
    let items = [];

    if (typeFilter === 'All' || typeFilter === 'Category') {
      items = items.concat(favoritedCategories);
    }
    if (typeFilter === 'All' || typeFilter === 'Brand') {
      items = items.concat(favoritedBrands);
    }

    if (term) {
      items = items.filter((item) => {
        const name = item.name || item.brand || '';
        return name.toLowerCase().includes(term);
      });
    }

    return items;
  }, [favoritedCategories, favoritedBrands, typeFilter, search]);

  // ── toggle handlers (mirrors Categories / Brands pages) ──
  const handleToggleFavorite = async (item) => {
    if (item._type === 'category') {
      const key = normalizeKey(item.name);
      setCatFavOverrides((prev) => {
        const updated = { ...prev, [key]: false };
        try {
          const names = Object.keys(updated).filter((k) => updated[k]);
          localStorage.setItem('local_fav_categories', JSON.stringify(names));
        } catch {}
        return updated;
      });
      showToast?.('Removed from favorites', 'success');
    } else {
      const key = normalizeKey(item.brand || item.name);
      setBrandFavOverrides((prev) => ({ ...prev, [key]: false }));
      try {
        const response = await brandAPI.toggleBrandFavorite(item.brand || item.name);
        const isFav = response.data?.is_favorite;
        setBrandFavOverrides((prev) => ({ ...prev, [key]: isFav }));
        showToast?.('Removed from favorites', 'success');
      } catch (err) {
        setBrandFavOverrides((prev) => ({ ...prev, [key]: true }));
        showToast?.('Failed to update favorite', 'error');
      }
    }
  };

  const filters = [
    { label: 'All', count: allCount },
    { label: 'Category', count: categoryCount },
    { label: 'Brand', count: brandCount },
  ];

  return (
    <div className="page">
      <div className="page__header">
        <h1 className="page__title">Favorites</h1>
        <p className="page__sub">Collections of your favorite categories and brands</p>
      </div>

      {/* ── Toolbar ── */}
      <div className="fav-toolbar">
        <div className="fav-toolbar__search">
          <Input
            placeholder="Search favorites..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Filter tabs — same item-filter style as Categories/Brands pages */}
        <div className="item-filters fav-filters" role="tablist" aria-label="Favorite type filters">
          {filters.map((f) => (
            <button
              key={f.label}
              role="tab"
              aria-selected={typeFilter === f.label}
              className={`item-filter${typeFilter === f.label ? ' active' : ''}`}
              onClick={() => setTypeFilter(f.label)}
            >
              {f.label}
              <span className="filter-count">{f.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div style={{ marginTop: 'var(--space-6)' }}>
          <LoadingSkeleton rows={2} columns={5} />
        </div>
      ) : filteredItems.length === 0 ? (
        <EmptyState
          icon="❤️"
          title={search ? 'No results found' : 'No favorites yet'}
          description={
            search
              ? `No ${typeFilter === 'All' ? 'items' : typeFilter.toLowerCase() + 's'} matching "${search}"`
              : `Mark categories or brands as favorite to see them here`
          }
        />
      ) : (
        <div className="category-grid">
          {filteredItems.map((item) => (
            <FavoriteCard
              key={`${item._type}-${item.id || item.name || item.brand}`}
              item={item}
              onToggleFavorite={handleToggleFavorite}
            />
          ))}
        </div>
      )}

      <style>{`
        /* ── Toolbar ── */
        .fav-toolbar {
          display: flex;
          align-items: center;
          gap: var(--space-4);
          margin-bottom: var(--space-6);
          flex-wrap: wrap;
        }

        .fav-toolbar__search {
          flex: 1;
          min-width: 220px;
        }

        .fav-filters {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          gap: 2px;
          background: #f0f0f0;
          border-radius: 14px;
          padding: 4px;
        }

        /* Override item-filter styles scoped to fav-filters */
        .fav-filters .item-filter {
          padding: 7px 16px;
          border-radius: 10px;
          border: none;
          background: transparent;
          color: #888;
          font-size: var(--text-sm);
          font-weight: var(--weight-semibold);
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.15s ease;
          white-space: nowrap;
          box-shadow: none;
        }

        .fav-filters .item-filter:hover:not(.active) {
          color: #333;
          background: rgba(0, 0, 0, 0.05);
        }

        .fav-filters .item-filter.active {
          background: #1a1a1a;
          color: #fff;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.18);
        }

        .fav-filters .item-filter .filter-count {
          opacity: 0.75;
          font-size: var(--text-sm);
          font-weight: var(--weight-semibold);
        }

        .fav-filters .item-filter.active .filter-count {
          opacity: 0.85;
        }

        /* ── Type badge on card ── */
        .fav-type-badge {
          position: absolute;
          bottom: var(--space-2);
          left: var(--space-2);
          padding: 2px 8px;
          background: rgba(0, 0, 0, 0.55);
          color: #fff;
          font-size: 11px;
          font-weight: var(--weight-semibold);
          border-radius: var(--radius-sm);
          letter-spacing: 0.03em;
          pointer-events: none;
          backdrop-filter: blur(4px);
        }

        @media (max-width: 700px) {
          .fav-toolbar {
            flex-direction: column;
            align-items: stretch;
          }

          .fav-filters {
            width: 100%;
            justify-content: stretch;
          }

          .fav-filters .item-filter {
            flex: 1;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}