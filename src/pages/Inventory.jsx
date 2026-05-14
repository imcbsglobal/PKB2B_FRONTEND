import React, { useMemo, useState } from 'react';

import Input from '../components/Input';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import { productBatchAPI } from '../Services/api';
import { useFetchData } from '../hooks/useFetchData';

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

function InventoryCard({ item }) {
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

function ToggleButton({ active, icon, label, onClick }) {
  return (
    <button className={`item-view-toggle ${active ? 'item-view-toggle--active' : ''}`} onClick={onClick} aria-label={label} title={label}>
      {icon}
    </button>
  );
}

function InventoryTable({ rows }) {
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

export default function Inventory() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [layout, setLayout] = useState('grid');

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

  return (
    <div className="page item-page">
      <div className="item-toolbar">
        <div className="item-toolbar__left">
          <div className="item-filters" role="tablist" aria-label="Inventory filters">
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
      ) : filteredItems.length === 0 ? (
        <EmptyState
          icon="📦"
          title="No items found"
          description={search ? `No items matching "${search}"` : 'No items available'}
        />
      ) : layout === 'grid' ? (
        <div className="item-grid">
          {filteredItems.map((item) => (
            <InventoryCard key={item.id || item.code || item.name} item={item} />
          ))}
        </div>
      ) : (
        <InventoryTable rows={filteredItems} />
      )}
    </div>
  );
}