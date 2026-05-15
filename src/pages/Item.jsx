import React, { useMemo, useState, memo } from 'react';

import Input from '../components/Input';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import { productBatchAPI } from '../Services/api';
import { useFetchData } from '../hooks/useFetchData';
import { usePagination } from '../hooks/usePagination';

const STATUS_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'in-stock', label: 'In stock' },
  { id: 'out-of-stock', label: 'Out of stock' },
];

function getStockTone(quantity) {
  if ((quantity || 0) <= 0) return 'danger';
  if ((quantity || 0) <= 5) return 'warning';
  return 'success';
}

function getStockLabel(quantity) {
  if ((quantity || 0) <= 0) return 'Out of stock';
  if ((quantity || 0) <= 5) return 'Low stock';
  return 'In stock';
}

function ItemCardBase({ item }) {
  const tone = getStockTone(item.quantity);

  return (
    <article className="item-card">
      <div className="item-card__media">
        {item.url2 ? (
          <img className="item-card__image" src={item.url2} alt={item.name || 'Item'} loading="lazy" />
        ) : (
          <div className="item-card__empty">No Image</div>
        )}
        <span className={`item-status item-status--${tone} item-status--overlay`}>{getStockLabel(item.quantity)}</span>
      </div>

      <div className="item-card__body">
        <div className="item-card__row item-card__row--name">
          <h3 className="item-card__name">{item.name || 'N/A'}</h3>
          <div className="item-card__price">₹ {Number(item.price || 0).toLocaleString('en-IN')}</div>
        </div>

        <div className="item-card__meta">{item.brand || 'N/A'} · {item.product || 'N/A'}</div>
        <div className="item-card__code">{item.code || 'N/A'}</div>

        <div className="item-card__footer">
          <span className="item-card__stock-label">Stock:</span>
          <strong className="item-card__stock-value">{item.quantity ?? 0}</strong>
        </div>
      </div>
    </article>
  );
}

const ItemCard = memo(ItemCardBase);

function ToggleButton({ active, icon, label, onClick }) {
  return (
    <button className={`item-view-toggle ${active ? 'item-view-toggle--active' : ''}`} onClick={onClick} aria-label={label} title={label}>
      {icon}
    </button>
  );
}

function ItemTable({ rows }) {
  return (
    <div className="table-wrap item-table-wrap">
      <table className="data-table item-table">
        <thead>
          <tr>
            <th>IMAGE</th>
            <th>CODE</th>
            <th>ITEM NAME</th>
            <th>BRAND</th>
            <th>CATEGORY</th>
            <th style={{ textAlign: 'right' }}>PRICE</th>
            <th>STOCK</th>
            <th>STATUS</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((item) => {
            const tone = getStockTone(item.quantity);

            return (
              <tr key={item.id || item.code || item.name}>
                <td>
                  <div className="item-thumb item-thumb--table">
                    {item.url2 ? <img src={item.url2} alt={item.name || 'Item'} loading="lazy" /> : <span>No Image</span>}
                  </div>
                </td>
                <td className="item-table__code">{item.code || 'N/A'}</td>
                <td className="item-table__name">{item.name || 'N/A'}</td>
                <td>{item.brand || 'N/A'}</td>
                <td>{item.product || 'N/A'}</td>
                <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>₹ {Number(item.price || 0).toLocaleString('en-IN')}</td>
                <td>{item.quantity ?? 0}</td>
                <td>
                  <span className={`item-status item-status--${tone}`}>{getStockLabel(item.quantity)}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function Item() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [layout, setLayout] = useState('grid');
  const [brandQuery, setBrandQuery] = useState('');
  const [categoryQuery, setCategoryQuery] = useState('');
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [brandOpen, setBrandOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [itemsPerPage] = useState(30);

  const itemsResult = useFetchData('items', () => productBatchAPI.getAllItems());
  const items = Array.isArray(itemsResult.data) ? itemsResult.data : [];
  const loading = itemsResult.loading;

  const counts = useMemo(() => {
    return items.reduce(
      (acc, item) => {
        acc.all += 1;
        if ((item.quantity || 0) <= 0) acc.outOfStock += 1;
        else acc.inStock += 1;
        return acc;
      },
      { all: 0, inStock: 0, outOfStock: 0 }
    );
  }, [items]);

  const filteredItems = useMemo(() => {
    const term = search.trim().toLowerCase();

    return items.filter((item) => {
      const matchesSearch =
        !term ||
        item.name?.toLowerCase().includes(term) ||
        item.code?.toLowerCase().includes(term) ||
        item.brand?.toLowerCase().includes(term) ||
        item.product?.toLowerCase().includes(term);

      const stockTone = getStockTone(item.quantity);
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'in-stock' && stockTone === 'success') ||
        (statusFilter === 'out-of-stock' && stockTone === 'danger');

      return matchesSearch && matchesStatus;
    });
  }, [items, search, statusFilter]);

  const uniqueBrands = useMemo(() => {
    const set = new Set();
    items.forEach((it) => it.brand && set.add(it.brand));
    return Array.from(set).sort();
  }, [items]);

  const uniqueCategories = useMemo(() => {
    const set = new Set();
    items.forEach((it) => it.product && set.add(it.product));
    return Array.from(set).sort();
  }, [items]);

  // extend filteredItems with brand/category selections
  const finalItems = useMemo(() => {
    return filteredItems.filter((item) => {
      if (selectedBrands.length > 0 && !selectedBrands.includes(item.brand)) return false;
      if (selectedCategories.length > 0 && !selectedCategories.includes(item.product)) return false;
      return true;
    });
  }, [filteredItems, selectedBrands, selectedCategories]);

  // Paginate final items for better performance
  const pagination = usePagination(finalItems, itemsPerPage);
  const paginatedItems = pagination.currentItems;

  return (
    <div className="page item-page">
      <div className="item-toolbar">
        <div className="item-toolbar__left">
          <div className="item-filters" role="tablist" aria-label="Item filters">
            {STATUS_FILTERS.map((filter) => {
              const count = filter.id === 'all' ? counts.all : filter.id === 'in-stock' ? counts.inStock : counts.outOfStock;
              const active = statusFilter === filter.id;

              return (
                <button
                  key={filter.id}
                  type="button"
                  className={`item-filter ${active ? 'item-filter--active' : ''}`}
                  onClick={() => setStatusFilter(filter.id)}
                  aria-pressed={active}
                >
                  <span>{filter.label}</span>
                  <span className="item-filter__count">{count}</span>
                </button>
              );
            })}
          </div>

          <Input
            className="item-toolbar__search"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="item-toolbar__right">
          <div className="item-toolbar__filters-inline">
            <div className="multi-filter">
              <button type="button" className="multi-filter__button" onClick={() => setBrandOpen((s) => !s)} aria-expanded={brandOpen}>
                Brand{selectedBrands.length > 0 ? ` (${selectedBrands.length})` : ''}
              </button>
              {brandOpen && (
                <div className="multi-filter__panel">
                  <Input className="multi-filter__search" placeholder="Search brands..." value={brandQuery} onChange={(e) => setBrandQuery(e.target.value)} />
                  <div className="multi-filter__list">
                    {uniqueBrands.filter(b => b.toLowerCase().includes(brandQuery.trim().toLowerCase())).map((b) => (
                      <label key={b} className="multi-filter__option">
                        <input type="checkbox" checked={selectedBrands.includes(b)} onChange={(e) => {
                          if (e.target.checked) setSelectedBrands((s) => [...s, b]);
                          else setSelectedBrands((s) => s.filter(x => x !== b));
                        }} />
                        <span>{b}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="multi-filter">
              <button type="button" className="multi-filter__button" onClick={() => setCategoryOpen((s) => !s)} aria-expanded={categoryOpen}>
                Category{selectedCategories.length > 0 ? ` (${selectedCategories.length})` : ''}
              </button>
              {categoryOpen && (
                <div className="multi-filter__panel">
                  <Input className="multi-filter__search" placeholder="Search categories..." value={categoryQuery} onChange={(e) => setCategoryQuery(e.target.value)} />
                  <div className="multi-filter__list">
                    {uniqueCategories.filter(c => c.toLowerCase().includes(categoryQuery.trim().toLowerCase())).map((c) => (
                      <label key={c} className="multi-filter__option">
                        <input type="checkbox" checked={selectedCategories.includes(c)} onChange={(e) => {
                          if (e.target.checked) setSelectedCategories((s) => [...s, c]);
                          else setSelectedCategories((s) => s.filter(x => x !== c));
                        }} />
                        <span>{c}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

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
          <LoadingSkeleton rows={5} columns={6} />
        </div>
      ) : finalItems.length === 0 ? (
        <EmptyState
          icon="🛍️"
          title="No items found"
          description={search ? `No items matching "${search}"` : 'No items available'}
        />
      ) : layout === 'grid' ? (
          <>
            <div className="item-grid">
              {paginatedItems.map((item) => (
                <ItemCard key={item.id || item.code || item.name} item={item} />
              ))}
            </div>
            {pagination.totalPages > 1 && (
              <div className="item-pagination">
                <button disabled={pagination.currentPage === 1} onClick={() => pagination.onPageChange(pagination.currentPage - 1)} className="item-pagination__btn">← Prev</button>
                <span className="item-pagination__info">Page {pagination.currentPage} of {pagination.totalPages}</span>
                <button disabled={pagination.currentPage === pagination.totalPages} onClick={() => pagination.onPageChange(pagination.currentPage + 1)} className="item-pagination__btn">Next →</button>
              </div>
            )}
          </>
      ) : (
        <>
          <ItemTable rows={paginatedItems} />
          {pagination.totalPages > 1 && (
            <div className="item-pagination">
              <button disabled={pagination.currentPage === 1} onClick={() => pagination.onPageChange(pagination.currentPage - 1)} className="item-pagination__btn">← Prev</button>
              <span className="item-pagination__info">Page {pagination.currentPage} of {pagination.totalPages}</span>
              <button disabled={pagination.currentPage === pagination.totalPages} onClick={() => pagination.onPageChange(pagination.currentPage + 1)} className="item-pagination__btn">Next →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
