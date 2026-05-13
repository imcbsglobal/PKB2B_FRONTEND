import React, {
  useState,
  useEffect,
} from 'react';

import EnhancedTable from '../components/EnhancedTable';
import Input from '../components/Input';
import Pagination from '../components/Pagination';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';

import {
  categoryAPI,
  productBatchAPI,
} from '../Services/api';

import {
  usePagination,
} from '../hooks/usePagination';
import { useFetchData } from '../hooks/useFetchData';

export default function Categories({ showToast }) {

  // ================= STATES =================
  const [search, setSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [currentLayout, setCurrentLayout] = useState('table');
  const [favoriteOverrides, setFavoriteOverrides] = useState(() => {
    try {
      const saved = localStorage.getItem('local_fav_categories');
      if (!saved) return {};
      const arr = JSON.parse(saved);
      return arr.reduce((acc, name) => {
        if (name) acc[name.trim().toLowerCase()] = true;
        return acc;
      }, {});
    } catch (e) {
      return {};
    }
  });

  // ================= FETCH DATA WITH CACHE =================
  const categoriesResult = useFetchData(
    'categories',
    () => categoryAPI.getCategories()
  );

  const itemsResult = useFetchData(
    'items',
    () => productBatchAPI.getAllItems()
  );

  const categories = Array.isArray(categoriesResult.data) ? categoriesResult.data : [];
  const allItems = Array.isArray(itemsResult.data) ? itemsResult.data : [];
  const loading = categoriesResult.loading || itemsResult.loading;

  // ================= PROCESS CATEGORIES WITH COUNTS =================
  const processedCategories = React.useMemo(() => {
    const countMap = {};
    allItems.forEach(item => {
      const key = (item.company || '').trim().toLowerCase();
      countMap[key] = (countMap[key] || 0) + 1;
    });

    return categories.map(cat => {
      const categoryKey = (cat.name || '').trim().toLowerCase();
      return {
        ...cat,
        itemCount: countMap[categoryKey] || 0,
        isFavorite: favoriteOverrides[categoryKey] ?? cat.is_favorite ?? false,
      };
    });
  }, [categories, allItems, favoriteOverrides]);

  const handleEdit = (rowIdx, colKey, newValue) => {
    console.log('Edit:', { rowIdx, colKey, newValue });
    showToast?.(`Updated ${colKey} to ${newValue}`, 'success');
  };

  const handleRowSelect = (selected) => {
    setSelectedCategories(selected);
    if (selected.length > 0) {
      showToast?.(`${selected.length} categories selected`, 'info');
    }
  };

  // ================= TOGGLE FAVORITE (UI-only - backend not implemented) =================
  const toggleFavorite = (categoryName) => {
    const key = categoryName.trim().toLowerCase();
    const current = processedCategories.find(c => (c.name || '').trim().toLowerCase() === key);
    const newVal = !current?.isFavorite;
    setFavoriteOverrides(prev => ({ ...prev, [key]: newVal }));

    // persist to localStorage as an array of names
    try {
      const saved = localStorage.getItem('local_fav_categories');
      const arr = saved ? JSON.parse(saved) : [];
      const normalized = arr.map(n => n.trim().toLowerCase());
      if (newVal) {
        if (!normalized.includes(key)) normalized.push(categoryName);
      } else {
        const idx = normalized.indexOf(key);
        if (idx !== -1) normalized.splice(idx, 1);
      }
      localStorage.setItem('local_fav_categories', JSON.stringify(normalized));
    } catch (e) {
      console.error('Failed to persist local favorites', e);
    }

    showToast?.(newVal ? 'Added to favorites (local)' : 'Removed from favorites (local)', 'success');
  };

  const [selectedCategory,
    setSelectedCategory] =
    useState(null);

  const [modalOpen,
    setModalOpen] =
    useState(false);

  const [categoryItems,
    setCategoryItems] =
    useState([]);

  // ================= FETCH DATA WITH CACHE =================
  // Already handled by useFetchData hooks above

  // ================= OPEN CATEGORY =================
  const handleCategoryClick = (
    category
  ) => {

    setSelectedCategory(
      category
    );

    // ================= FILTER ITEMS =================
    // MATCH:
    // CATEGORY NAME = ITEM COMPANY
    const filteredItems =
      allItems.filter(
        (item) =>

          item.company
            ?.toLowerCase() ===

          category.name
            ?.toLowerCase()
      );

    setCategoryItems(
      filteredItems
    );

    setModalOpen(true);
  };

  // ================= CATEGORY TABLE =================
  const COLUMNS = [

    // IMAGE
    {
      key: 'url',
      label: 'IMAGE',
      sortable: false,
      render: (_, row) => (

        <div
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '8px',
            overflow: 'hidden',
            background: '#f3f4f6',
          }}
        >

          {row.url ? (

            <img
              src={row.url.replace(
                /\\/g,
                '/'
              )}
              alt={row.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />

          ) : (

            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                justifyContent:
                  'center',
                alignItems:
                  'center',
                fontSize: '12px',
                color: '#999',
              }}
            >
              No Image
            </div>

          )}

        </div>
      ),
    },

    // CATEGORY
    {
      key: 'name',
      label: 'CATEGORY',
      editable: true,
      render: (_, row) => (

        <button
          onClick={() =>
            handleCategoryClick(row)
          }
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#2563eb',
            textDecoration:
              'underline',
            fontSize: '14px',
            fontWeight: '600',
            padding: 0,
          }}
        >
          {row.name}
        </button>

      ),
    },

    // TYPE
    {
      key: 'type',
      label: 'TYPE',
    },

    // ITEM COUNT
    {
      key: 'itemCount',
      label: 'ITEMS',
      align: 'center',
      render: (val) => (
        <span
          style={{
            background: '#f3f4f6',
            padding: '6px 12px',
            borderRadius: '20px',
            fontWeight: '600',
          }}
        >
          {val || 0}
        </span>
      ),
    },

    // FAVORITE
    {
      key: 'favorite',
      label: 'FAVORITE',
      align: 'center',
      sortable: false,
      render: (_, row) => {
        const categoryName = row.name;
        return (
          <button
            onClick={() => toggleFavorite(categoryName)}
            style={{
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontSize: '24px',
            }}
          >
            {row.isFavorite ? '❤️' : '🤍'}
          </button>
        );
      },
    },
  ];

  // ================= ITEM TABLE =================
  const ITEM_COLUMNS = [

    // IMAGE
    {
      key: 'url2',

      label: 'IMAGE',

      render: (_, row) => (

        <div
          style={{
            width: '50px',
            height: '50px',
            borderRadius: '6px',
            overflow: 'hidden',
            background: '#f3f4f6',
          }}
        >

          {row.url2 ? (

            <img
              src={row.url2}
              alt={row.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />

          ) : (

            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                justifyContent:
                  'center',
                alignItems:
                  'center',
                fontSize: '10px',
                color: '#999',
              }}
            >
              No Img
            </div>

          )}

        </div>
      ),
    },

    // CODE
    {
      key: 'code',
      label: 'CODE',
    },

    // ITEM NAME
    {
      key: 'name',
      label: 'ITEM NAME',
    },

    // BRAND
    {
      key: 'brand',
      label: 'BRAND',
    },

    // PRODUCT TYPE
    {
      key: 'product',
      label: 'PRODUCT',
    },

    // PRICE
    {
      key: 'price',

      label: 'PRICE',

      align: 'right',

      render: (val) =>
        `₹${val || 0}`,
    },

    // STOCK
    {
      key: 'quantity',

      label: 'STOCK',

      render: (val) => (

        <span
          style={{
            fontWeight: '600',
            color:
              val <= 0
                ? '#ef4444'
                : '#16a34a',
          }}
        >
          {val}
        </span>

      ),
    },
  ];

  // ================= SEARCH =================
  const filtered =
    processedCategories.filter((c) =>

      c.name
        ?.toLowerCase()
        .includes(
          search.toLowerCase()
        )
    );

  // ================= PAGINATION =================
  const {

    currentPage,
    totalItems:
      totalFiltered,

    currentItems,
    onPageChange,

  } = usePagination(
    filtered,
    10
  );

  // ================= LOADING =================
  if (loading) {

    return (

      <div className="page">

        <h1 className="page__title">
          Categories
        </h1>

        <div style={{ marginBottom: '24px', marginTop: '24px' }}>
          <LoadingSkeleton rows={5} columns={6} />
        </div>

      </div>
    );
  }

  // ================= UI =================
  return (

    <div className="page">

      {/* HEADER */}
      <div className="page__header">

        <div>

          <h1 className="page__title">
            Categories
          </h1>

          <p className="page__sub">
            {filtered.length}
            {' '}
            categories found
          </p>

        </div>

      </div>

      {/* SEARCH */}
      <div className="toolbar">

        <Input
          className="toolbar__search"
          placeholder="Search categories..."
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
        />

      </div>

      {/* CATEGORY TABLE OR EMPTY STATE */}
      {totalFiltered === 0 ? (
        <EmptyState
          icon="📂"
          title="No categories found"
          description={search ? `No categories matching "${search}"` : 'No categories available'}
        />
      ) : (
        <>
          <EnhancedTable
            columns={COLUMNS}
            rows={currentLayout === 'tile' ? filtered : currentItems}
            enableSelection={true}
            enableEditing={true}
            enableSorting={true}
            enableColumnToggle={true}
            onRowSelect={handleRowSelect}
            onEdit={handleEdit}
            defaultLayout="table"
            onLayoutChange={setCurrentLayout}
          />

          {/* PAGINATION - Only show in table view */}
          {currentLayout === 'table' && (
            <Pagination
              currentPage={currentPage}
              totalItems={totalFiltered}
              itemsPerPage={10}
              onPageChange={onPageChange}
            />
          )}
        </>
      )}

      {/* MODAL */}
      {modalOpen && (

        <div
          style={{
            position: 'fixed',
            inset: 0,
            background:
              'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent:
              'center',
            alignItems:
              'center',
            zIndex: 999,
            padding: '20px',
          }}
        >

          <div
            style={{
              width: '100%',
              maxWidth:
                '1200px',
              background:
                '#fff',
              borderRadius:
                '12px',
              padding:
                '24px',
              maxHeight:
                '85vh',
              overflow:
                'auto',
            }}
          >

            {/* MODAL HEADER */}
            <div
              style={{
                display: 'flex',
                justifyContent:
                  'space-between',
                alignItems:
                  'center',
                marginBottom:
                  '20px',
              }}
            >

              <div>

                <h2
                  style={{
                    margin: 0,
                    fontSize: '24px',
                    fontWeight: '700',
                  }}
                >
                  {
                    selectedCategory
                      ?.name
                  }
                </h2>

                <p
                  style={{
                    marginTop: '6px',
                    color: '#666',
                  }}
                >
                  {
                    categoryItems
                      .length
                  }
                  {' '}
                  items found
                </p>

              </div>

              <button
                onClick={() =>
                  setModalOpen(false)
                }
                style={{
                  border: 'none',
                  background: 'none',
                  fontSize: '28px',
                  cursor: 'pointer',
                }}
              >
                ×
              </button>

            </div>

            {/* ITEMS TABLE */}
            <EnhancedTable
              columns={ITEM_COLUMNS}
              rows={categoryItems}
              enableSelection={false}
              enableEditing={false}
              enableSorting={true}
              enableColumnToggle={true}
              defaultLayout="table"
            />

          </div>

        </div>

      )}

    </div>
  );
}