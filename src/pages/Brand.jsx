import React, {
  useState,
  useMemo,
} from 'react';

import EnhancedTable from '../components/EnhancedTable';
import Input from '../components/Input';
import Pagination from '../components/Pagination';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';

import {
  brandAPI,
  productBatchAPI,
} from '../Services/api';

import {
  usePagination,
} from '../hooks/usePagination';

import {
  useFetchData,
} from '../hooks/useFetchData';

export default function Brands({ showToast }) {

  // ================= STATES =================
  const [search, setSearch] =
    useState('');

  const [selectedBrand,
    setSelectedBrand] =
    useState(null);

  const [modalOpen,
    setModalOpen] =
    useState(false);

  const [brandItems,
    setBrandItems] =
    useState([]);

  const [selectedBrands, setSelectedBrands] = useState([]);
  const [currentLayout, setCurrentLayout] = useState('table');

  // ================= FETCH DATA =================
  const brandsResult =
    useFetchData(
      'brands',
      () => brandAPI.getAllBrands()
    );

  const itemsResult =
    useFetchData(
      'items',
      () => productBatchAPI.getAllItems()
    );

  const loading =
    brandsResult.loading ||
    itemsResult.loading;

  const items = useMemo(
    () => Array.isArray(itemsResult.data) ? itemsResult.data : [],
    [itemsResult.data]
  );

  // ================= PROCESS BRANDS =================
  // Build a brand→count map once (O(n)) instead of nested filter per brand (O(n×m))
  const [favoriteOverrides, setFavoriteOverrides] = useState({});

  const brands = useMemo(() => {
    const brandsData = Array.isArray(brandsResult.data) ? brandsResult.data : [];

    const countMap = {};
    items.forEach(item => {
      const key = (item.brand || '').trim().toLowerCase();
      countMap[key] = (countMap[key] || 0) + 1;
    });

    return brandsData.map(brand => {
      const brandKey = (brand.brand || brand.name || '').trim().toLowerCase();
      return {
        ...brand,
        itemCount: countMap[brandKey] || 0,
        isFavorite: favoriteOverrides[brandKey] ?? brand.is_favorite ?? false,
      };
    });
  }, [brandsResult.data, items, favoriteOverrides]);

  const handleEdit = (rowIdx, colKey, newValue) => {
    console.log('Edit:', { rowIdx, colKey, newValue });
    showToast?.(`Updated ${colKey} to ${newValue}`, 'success');
  };

  const handleRowSelect = (selected) => {
    setSelectedBrands(selected);
    if (selected.length > 0) {
      showToast?.(`${selected.length} brands selected`, 'info');
    }
  };

  // ================= OPEN BRAND =================
  const handleBrandClick = (
    brand
  ) => {

    setSelectedBrand(
      brand
    );

    const brandName =
      (
        brand.brand ||
        brand.name ||
        ''
      )
        .trim()
        .toLowerCase();

    // FILTER ITEMS
    const filteredItems =
      items.filter((item) => {

        const itemBrand =
          (
            item.brand || ''
          )
            .trim()
            .toLowerCase();

        return (
          itemBrand ===
          brandName
        );
      });

    setBrandItems(
      filteredItems
    );

    setModalOpen(true);
  };

  // ================= TOGGLE FAVORITE =================
  const toggleFavorite = async (brandName) => {
    const key = brandName.trim().toLowerCase();
    const current = brands.find(b => (b.brand || b.name || '').trim().toLowerCase() === key);
    setFavoriteOverrides(prev => ({ ...prev, [key]: !current?.isFavorite }));
    try {
      const response = await brandAPI.toggleBrandFavorite(brandName);
      const isFavorite = response.data?.is_favorite;
      setFavoriteOverrides(prev => ({ ...prev, [key]: isFavorite }));
      showToast?.(isFavorite ? 'Added to favorites' : 'Removed from favorites', 'success');
    } catch (err) {
      setFavoriteOverrides(prev => ({ ...prev, [key]: current?.isFavorite }));
      console.error('Favorite Error:', err);
      showToast?.('Failed to update favorite', 'error');
    }
  };

  // ================= COLUMNS =================
  const COLUMNS = [

    // IMAGE
    {
      key: 'image',
      label: 'IMAGE',
      sortable: false,
      render: (_, row) => (

        <div
          style={{
            width: '70px',
            height: '70px',
            borderRadius: '10px',
            overflow: 'hidden',
            background:
              '#f3f4f6',
          }}
        >

          {row.url ||
          row.image ? (

            <img
              src={
                row.url ||
                row.image
              }
              alt={
                row.brand ||
                row.name
              }
              loading="lazy"
              style={{
                width: '100%',
                height: '100%',
                objectFit:
                  'cover',
              }}
            />

          ) : (

            <div
              style={{
                width: '100%',
                height: '100%',
                display:
                  'flex',
                justifyContent:
                  'center',
                alignItems:
                  'center',
                fontSize:
                  '12px',
                color:
                  '#999',
              }}
            >
              No Image
            </div>

          )}

        </div>
      ),
    },

    // BRAND
    {
      key: 'brand',
      label: 'BRAND',
      editable: true,
      render: (_, row) => (

        <button
          onClick={() =>
            handleBrandClick(
              row
            )
          }
          style={{
            background:
              'none',
            border: 'none',
            cursor:
              'pointer',
            color:
              '#2563eb',
            textDecoration:
              'underline',
            fontWeight:
              '600',
            fontSize:
              '14px',
          }}
        >
          {
            row.brand ||
            row.name
          }
        </button>

      ),
    },

    // ITEM COUNT
    {
      key: 'itemCount',

      label: 'ITEMS',

      align: 'center',

      render: (val) => (

        <span
          style={{
            background:
              '#f3f4f6',
            padding:
              '6px 12px',
            borderRadius:
              '20px',
            fontWeight:
              '600',
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

        const brandName =
          row.brand ||
          row.name;

        return (

          <button
            onClick={() =>
              toggleFavorite(
                brandName
              )
            }
            style={{
              border: 'none',
              background:
                'none',
              cursor:
                'pointer',
              fontSize:
                '24px',
            }}
          >
            {row.isFavorite
              ? '❤️'
              : '🤍'}
          </button>

        );
      },
    },
  ];

  // ================= SEARCH =================
  const filtered =
    brands.filter((b) =>

      (
        b.brand ||
        b.name
      )
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
          Brands
        </h1>

        <div
          style={{
            marginTop:
              '24px',
          }}
        >
          <LoadingSkeleton
            rows={5}
            columns={6}
          />
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
            Brands
          </h1>

          <p className="page__sub">
            {filtered.length}
            {' '}
            brands found
          </p>

        </div>

      </div>

      {/* SEARCH */}
      <div className="toolbar">

        <Input
          className="toolbar__search"
          placeholder="Search brands..."
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
        />

      </div>

      {/* TABLE OR EMPTY STATE */}
      {totalFiltered === 0 ? (
        <EmptyState
          icon="🏷️"
          title="No brands found"
          description={search ? `No brands matching "${search}"` : 'No brands available'}
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
              currentPage={
                currentPage
              }
              totalItems={
                totalFiltered
              }
              itemsPerPage={10}
              onPageChange={
                onPageChange
              }
            />
          )}
        </>
      )}

      {/* MODAL */}
      {modalOpen && (

        <div
          style={{
            position:
              'fixed',
            inset: 0,
            background:
              'rgba(0,0,0,0.5)',
            display:
              'flex',
            justifyContent:
              'center',
            alignItems:
              'center',
            zIndex: 999,
            padding:
              '20px',
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

            {/* HEADER */}
            <div
              style={{
                display:
                  'flex',
                justifyContent:
                  'space-between',
                alignItems:
                  'center',
                marginBottom:
                  '20px',
              }}
            >

              <div>

                <h2>
                  {
                    selectedBrand
                      ?.brand ||
                    selectedBrand
                      ?.name
                  }
                </h2>

                <p>
                  {
                    brandItems.length
                  }
                  {' '}
                  items found
                </p>

              </div>

              <button
                onClick={() =>
                  setModalOpen(
                    false
                  )
                }
                style={{
                  border:
                    'none',
                  background:
                    'none',
                  fontSize:
                    '28px',
                  cursor:
                    'pointer',
                }}
              >
                ×
              </button>

            </div>

            {/* ITEMS TABLE */}
            <EnhancedTable
              columns={[
                {
                  key: 'code',
                  label: 'CODE',
                },

                {
                  key: 'name',
                  label:
                    'ITEM NAME',
                },

                {
                  key: 'product',
                  label:
                    'CATEGORY',
                },

                {
                  key: 'price',

                  label:
                    'PRICE',

                  align: 'right',

                  render:
                    (val) =>
                      `₹${val || 0}`,
                },

                {
                  key:
                    'quantity',

                  label:
                    'STOCK',
                },
              ]}
              rows={brandItems}
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