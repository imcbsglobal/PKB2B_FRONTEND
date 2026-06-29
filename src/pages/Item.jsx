import React, { useMemo, useState, memo, useCallback } from 'react';

import Input from '../components/Input';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import { productBatchAPI } from '../Services/api';
import { useFetchData } from '../hooks/useFetchData';
import { usePagination } from '../hooks/usePagination';

const STATUS_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'inactive', label: 'Inactive' },
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

        {item.barcode && <div className="item-card__barcode" style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '8px' }}>📦 {item.barcode}</div>}
        
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



function ItemTable({ rows, onStatusChange }) {
  return (
    <div className="table-wrap item-table-wrap">
      <div className="item-table-scroll">
        <table className="data-table item-table">
          <thead>
            <tr>
              <th style={{ textAlign: 'center' }}>IMAGE</th>
              <th style={{ textAlign: 'center' }}>STATUS</th>
              <th>CODE</th>
              <th>ITEM NAME</th>
              <th>CATEGORY</th>
              <th>PRODUCT</th>
              <th>BRAND</th>
              <th style={{ textAlign: 'right' }}>STOCK</th>
              <th style={{ textAlign: 'right' }}>MRP</th>
              <th style={{ textAlign: 'right' }}>PRICE</th>
              <th style={{ textAlign: 'right' }}>Retail</th>
              <th style={{ textAlign: 'right' }}>Dealer PRICE</th>
              <th style={{ textAlign: 'right' }}>CB price</th>
              <th style={{ textAlign: 'right' }}>Net rate</th>
              <th style={{ textAlign: 'right' }}>PK price</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((item) => {
              const tone = getStockTone(item.quantity);

              return (
                <tr key={item.id || item.code || item.name}>
                  <td style={{ textAlign: 'center' }}>
                    <div className="item-thumb item-thumb--table">
                      {item.url2 ? <img src={item.url2} alt={item.name || 'Item'} loading="lazy" /> : <span>No Image</span>}
                    </div>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <select 
                      value={item.product_status || 'Active'} 
                      onChange={(e) => onStatusChange(item, e.target.value)}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '4px',
                        border: '1px solid #ddd',
                        fontSize: '13px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        backgroundColor: item.product_status === 'Active' ? '#dcfce7' : '#fee2e2',
                        color: item.product_status === 'Active' ? '#166534' : '#991b1b',
                      }}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </td>
                  <td className="item-table__code">{item.code || 'N/A'}</td>
                  <td className="item-table__name">
                    <div className="item-name-wrapper">
                      <div>{item.name || 'N/A'}</div>
                      {item.barcode && <div className="item-barcode-sub" style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>Barcode: {item.barcode}</div>}
                    </div>
                  </td>
                  <td>{item.product || 'N/A'}</td>
                  <td>{item.product || 'N/A'}</td>
                  <td>{item.brand || 'N/A'}</td>
                  <td style={{ textAlign: 'right' }}>{item.quantity ?? 0}</td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>₹ {Number(item.bmrp || 0).toLocaleString('en-IN')}</td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>₹ {Number(item.price || 0).toLocaleString('en-IN')}</td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>₹ {Number(item.salesprice || 0).toLocaleString('en-IN')}</td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>₹ {Number(item.secondprice || 0).toLocaleString('en-IN')}</td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>₹ {Number(item.thirdprice || 0).toLocaleString('en-IN')}</td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>₹ {Number(item.fourthprice || 0).toLocaleString('en-IN')}</td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>₹ {Number(item.nlc1 || 0).toLocaleString('en-IN')}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * Generate page size options dynamically based on total row count
 * @param {number} total - Total number of rows
 * @returns {number[]} Array of page size options (e.g., [10, 20, 30, ..., totalCount])
 * 
 * Examples:
 * - Total 57 returns: [10, 20, 30, 40, 50, 57]
 * - Total 120 returns: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120]
 */
function generatePageSizeOptions(total) {
  if (total <= 0) return [10];
  
  const options = [];
  for (let i = 10; i < total; i += 10) {
    options.push(i);
  }
  
  // Always add the total count as the final option
  options.push(total);
  
  return options;
}

export default function Item() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [layout, setLayout] = useState('table');
  const [brandQuery, setBrandQuery] = useState('');
  const [categoryQuery, setCategoryQuery] = useState('');
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [brandOpen, setBrandOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [localItems, setLocalItems] = useState([]);
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [zeroPriceFilter, setZeroPriceFilter] = useState('none'); // 'none' | 'any' | 'price' | 'bmrp' | 'salesprice' | 'secondprice' | 'thirdprice' | 'fourthprice' | 'nlc1'
  const [zeroPriceOpen, setZeroPriceOpen] = useState(false);

  const itemsResult = useFetchData('items', () => productBatchAPI.getAllItems());
  const items = Array.isArray(itemsResult.data) ? itemsResult.data : [];
  const loading = itemsResult.loading;

  // Sync localItems when items change
  React.useEffect(() => {
    setLocalItems(items);
  }, [items]);

  // Handle product status change
  const handleStatusChange = useCallback(async (item, newStatus) => {
    try {
      // Update local state immediately for UI feedback
      setLocalItems(prevItems =>
        prevItems.map(i =>
          i.barcode === item.barcode ? { ...i, product_status: newStatus } : i
        )
      );

      // Make API call to update backend
      await productBatchAPI.updateProductStatus(item.barcode, newStatus);
    } catch (error) {
      console.error('Failed to update product status:', error);
      // Revert on error
      setLocalItems(prevItems =>
        prevItems.map(i =>
          i.barcode === item.barcode ? { ...i, product_status: item.product_status } : i
        )
      );
      alert('Failed to update product status. Please try again.');
    }
  }, []);



  const counts = useMemo(() => {
    return localItems.reduce(
      (acc, item) => {
        acc.all += 1;
        if ((item.quantity || 0) <= 0) acc.outOfStock += 1;
        else acc.inStock += 1;
        if (item.product_status === 'Active') acc.active += 1;
        else if (item.product_status === 'Inactive') acc.inactive += 1;
        // zero price counts per field
        if (!item.price || Number(item.price) === 0) acc.zeroPrice += 1;
        if (!item.bmrp || Number(item.bmrp) === 0) acc.zeroMrp += 1;
        if (!item.salesprice || Number(item.salesprice) === 0) acc.zeroRetail += 1;
        if (!item.secondprice || Number(item.secondprice) === 0) acc.zeroDealer += 1;
        if (!item.thirdprice || Number(item.thirdprice) === 0) acc.zeroCb += 1;
        if (!item.fourthprice || Number(item.fourthprice) === 0) acc.zeroNetRate += 1;
        if (!item.nlc1 || Number(item.nlc1) === 0) acc.zeroPk += 1;
        const hasAnyZero =
          !item.price || Number(item.price) === 0 ||
          !item.bmrp || Number(item.bmrp) === 0 ||
          !item.salesprice || Number(item.salesprice) === 0 ||
          !item.secondprice || Number(item.secondprice) === 0 ||
          !item.thirdprice || Number(item.thirdprice) === 0 ||
          !item.fourthprice || Number(item.fourthprice) === 0 ||
          !item.nlc1 || Number(item.nlc1) === 0;
        if (hasAnyZero) acc.zeroAny += 1;
        return acc;
      },
      { all: 0, inStock: 0, outOfStock: 0, active: 0, inactive: 0, zeroAny: 0, zeroPrice: 0, zeroMrp: 0, zeroRetail: 0, zeroDealer: 0, zeroCb: 0, zeroNetRate: 0, zeroPk: 0 }
    );
  }, [localItems]);

  const filteredItems = useMemo(() => {
    const term = search.trim().toLowerCase();

    return localItems.filter((item) => {
      const matchesSearch =
        !term ||
        item.name?.toLowerCase().includes(term) ||
        item.code?.toLowerCase().includes(term) ||
        item.brand?.toLowerCase().includes(term) ||
        item.product?.toLowerCase().includes(term) ||
        item.category?.toLowerCase().includes(term) ||
        item.barcode?.toLowerCase().includes(term) ||
        String(item.bmrp || '').includes(term) ||
        String(item.price || '').includes(term);

      const stockTone = getStockTone(item.quantity);
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && item.product_status === 'Active') ||
        (statusFilter === 'inactive' && item.product_status === 'Inactive') ||
        (statusFilter === 'in-stock' && stockTone === 'success') ||
        (statusFilter === 'out-of-stock' && stockTone === 'danger');

      return matchesSearch && matchesStatus;
    });
  }, [localItems, search, statusFilter]);

  const uniqueBrands = useMemo(() => {
    const set = new Set();
    localItems.forEach((it) => it.brand && set.add(it.brand));
    return Array.from(set).sort();
  }, [localItems]);

  const uniqueCategories = useMemo(() => {
    const set = new Set();
    localItems.forEach((it) => it.product && set.add(it.product));
    return Array.from(set).sort();
  }, [localItems]);

  // extend filteredItems with brand/category/zero-price selections
  const finalItems = useMemo(() => {
    return filteredItems.filter((item) => {
      if (selectedBrands.length > 0 && !selectedBrands.includes(item.brand)) return false;
      if (selectedCategories.length > 0 && !selectedCategories.includes(item.product)) return false;

      // Zero price filter
      if (zeroPriceFilter !== 'none') {
        const isZero = (val) => !val || Number(val) === 0;
        if (zeroPriceFilter === 'any') {
          const anyZero =
            isZero(item.price) || isZero(item.bmrp) || isZero(item.salesprice) ||
            isZero(item.secondprice) || isZero(item.thirdprice) || isZero(item.fourthprice) || isZero(item.nlc1);
          if (!anyZero) return false;
        } else if (zeroPriceFilter === 'price' && !isZero(item.price)) return false;
        else if (zeroPriceFilter === 'bmrp' && !isZero(item.bmrp)) return false;
        else if (zeroPriceFilter === 'salesprice' && !isZero(item.salesprice)) return false;
        else if (zeroPriceFilter === 'secondprice' && !isZero(item.secondprice)) return false;
        else if (zeroPriceFilter === 'thirdprice' && !isZero(item.thirdprice)) return false;
        else if (zeroPriceFilter === 'fourthprice' && !isZero(item.fourthprice)) return false;
        else if (zeroPriceFilter === 'nlc1' && !isZero(item.nlc1)) return false;
      }

      return true;
    });
  }, [filteredItems, selectedBrands, selectedCategories, zeroPriceFilter]);

  // Paginate final items — pagination resets to page 1 whenever finalItems reference changes
  const pagination = usePagination(finalItems, itemsPerPage);
  const paginatedItems = pagination.currentItems;

  return (
    <div className="page item-page">
      <div className="item-toolbar">
        <div className="item-toolbar__left">
          <div className="status-filter-dropdown">
            <button 
              type="button" 
              className="status-filter-dropdown__button"
              onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
              aria-expanded={filterDropdownOpen}
            >
              Filter: {STATUS_FILTERS.find(f => f.id === statusFilter)?.label}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '8px', transition: 'transform 0.2s' }}>
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            {filterDropdownOpen && (
              <div className="status-filter-dropdown__menu">
                {STATUS_FILTERS.map((filter) => {
                  const count = filter.id === 'all' ? counts.all : filter.id === 'active' ? counts.active : filter.id === 'inactive' ? counts.inactive : filter.id === 'in-stock' ? counts.inStock : counts.outOfStock;
                  const active = statusFilter === filter.id;

                  return (
                    <button
                      key={filter.id}
                      type="button"
                      className={`status-filter-dropdown__item ${active ? 'status-filter-dropdown__item--active' : ''}`}
                      onClick={() => {
                        setStatusFilter(filter.id);
                        setFilterDropdownOpen(false);
                      }}
                    >
                      <span>{filter.label}</span>
                      <span className="status-filter-dropdown__count">{count}</span>
                    </button>
                  );
                })}
              </div>
            )}
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
                Product{selectedCategories.length > 0 ? ` (${selectedCategories.length})` : ''}
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

            {/* Zero Price Filter */}
            <div className="multi-filter">
              <button
                type="button"
                className={`multi-filter__button${zeroPriceFilter !== 'none' ? ' multi-filter__button--active' : ''}`}
                onClick={() => setZeroPriceOpen((s) => !s)}
                aria-expanded={zeroPriceOpen}
                title="Filter items with zero prices"
              >
                ₹ Zero Price{zeroPriceFilter !== 'none' ? ' ✓' : ''}
              </button>
              {zeroPriceOpen && (
                <div className="multi-filter__panel" style={{ minWidth: '200px' }}>
                  <div style={{ padding: '6px 8px 4px', fontSize: '11px', fontWeight: '600', color: 'var(--color-text-secondary, #6b7280)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Show items where price is ₹0
                  </div>
                  <div className="multi-filter__list">
                    {[
                      { id: 'none',        label: 'Off (show all)',       count: counts.all },
                      { id: 'any',         label: 'Any price is zero',    count: counts.zeroAny },
                      { id: 'price',       label: 'Price = 0',            count: counts.zeroPrice },
                      { id: 'bmrp',        label: 'MRP = 0',              count: counts.zeroMrp },
                      { id: 'salesprice',  label: 'Retail = 0',           count: counts.zeroRetail },
                      { id: 'secondprice', label: 'Dealer Price = 0',     count: counts.zeroDealer },
                      { id: 'thirdprice',  label: 'CB Price = 0',         count: counts.zeroCb },
                      { id: 'fourthprice', label: 'Net Rate = 0',         count: counts.zeroNetRate },
                      { id: 'nlc1',        label: 'PK Price = 0',         count: counts.zeroPk },
                    ].map(({ id, label, count }) => (
                      <label
                        key={id}
                        className={`multi-filter__option${zeroPriceFilter === id ? ' multi-filter__option--selected' : ''}`}
                        style={{ cursor: 'pointer' }}
                      >
                        <input
                          type="radio"
                          name="zero-price-filter"
                          checked={zeroPriceFilter === id}
                          onChange={() => {
                            setZeroPriceFilter(id);
                            setZeroPriceOpen(false);
                          }}
                        />
                        <span style={{ flex: 1 }}>{label}</span>
                        <span className="status-filter-dropdown__count">{count}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <select 
            className="item-rowcount-select" 
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(parseInt(e.target.value, 10));
            }}
            title="Rows per page"
          >
            {generatePageSizeOptions(finalItems.length).map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                {pageSize}
              </option>
            ))}
          </select>

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
                <div key={item.id || item.code || item.name}>
                  <ItemCard item={item} />
                </div>
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
          <ItemTable rows={paginatedItems} onStatusChange={handleStatusChange} />
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
