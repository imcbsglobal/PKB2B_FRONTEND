import React, {
  useState,
  useEffect,
} from 'react';

import EnhancedTable from '../components/EnhancedTable';
import Input from '../components/Input';
import Pagination from '../components/Pagination';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';

import { usePagination } from '../hooks/usePagination';
import { useFetchData } from '../hooks/useFetchData';

import {
  productBatchAPI,
} from '../Services/api';

export default function Inventory({ showToast }) {

  // ================= STATES =================
  const [search, setSearch] =
    useState('');

  const [selectedItems, setSelectedItems] = useState([]);
  const [currentLayout, setCurrentLayout] = useState('table');

  // ================= FETCH ITEMS =================
  const itemsResult = useFetchData(
    'items',
    () => productBatchAPI.getAllItems()
  );
  const items = Array.isArray(itemsResult.data) ? itemsResult.data : [];
  const loading = itemsResult.loading;

  // ================= TABLE COLUMNS =================
  const COLUMNS = [

    // IMAGE
    {
      key: 'image',

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

          {row.url2 ? (

            <img
              src={row.url2}
              alt={row.name}
              loading="lazy"
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
                alignItems: 'center',
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

    // CODE
    {
      key: 'code',
      label: 'CODE',
      editable: true,
    },

    // NAME
    {
      key: 'name',
      label: 'ITEM NAME',
      editable: true,
    },

    // BRAND
    {
      key: 'brand',
      label: 'BRAND',
    },

    // CATEGORY
    {
      key: 'product',
      label: 'CATEGORY',
    },

    // PRICE
    {
      key: 'price',

      label: 'PRICE',

      align: 'right',

      editable: true,

      render: (val) =>
        `₹${val || 0}`,
    },

    // STOCK
    {
      key: 'quantity',

      label: 'STOCK',

      editable: true,

      render: (val) => (

        <span
          style={{
            fontWeight: '600',
            color:
              val <= 0
                ? '#ef4444'
                : val <= 5
                ? '#f59e0b'
                : '#16a34a',
          }}
        >
          {val || 0}
        </span>

      ),
    },

    // STATUS
    {
      key: 'status',

      label: 'STATUS',

      sortable: false,

      render: (_, row) => {

        if (row.quantity <= 0) {

          return (

            <span
              style={{
                color: '#ef4444',
                fontWeight: '600',
              }}
            >
              Out of Stock
            </span>

          );
        }

        if (row.quantity <= 5) {

          return (

            <span
              style={{
                color: '#f59e0b',
                fontWeight: '600',
              }}
            >
              Low Stock
            </span>

          );
        }

        return (

          <span
            style={{
              color: '#16a34a',
              fontWeight: '600',
            }}
          >
            In Stock
          </span>

        );
      },
    },
  ];

  const handleEdit = (rowIdx, colKey, newValue) => {
    console.log('Edit:', { rowIdx, colKey, newValue });
    showToast?.(`Updated ${colKey} to ${newValue}`, 'success');
  };

  const handleRowSelect = (selected) => {
    setSelectedItems(selected);
    if (selected.length > 0) {
      showToast?.(`${selected.length} items selected`, 'info');
    }
  };

  // ================= SEARCH =================
  const filtered =
    items.filter((item) =>

      item.name
        ?.toLowerCase()
        .includes(
          search.toLowerCase()
        ) ||

      item.code
        ?.toLowerCase()
        .includes(
          search.toLowerCase()
        ) ||

      item.brand
        ?.toLowerCase()
        .includes(
          search.toLowerCase()
        )
    );

  // ================= PAGINATION =================
  const {
    currentPage,
    totalPages,
    currentItems,
    onPageChange,
    totalItems: totalFiltered,
  } = usePagination(filtered, 10);

  // ================= STATS =================
  const totalItems =
    items.length;

  const lowStockItems =
    items.filter(
      (i) =>
        i.quantity > 0 &&
        i.quantity <= 5
    ).length;

  const outOfStockItems =
    items.filter(
      (i) => i.quantity <= 0
    ).length;

  // ================= LOADING =================
  if (loading) {

    return (

      <div className="page">

        <div className="page__header">

          <h1 className="page__title">
            Inventory
          </h1>

        </div>

        <div style={{ marginBottom: '24px' }}>
          <LoadingSkeleton rows={5} columns={6} />
        </div>

      </div>
    );
  }

  // ================= ERROR =================
  if (!items || items.length === 0) {

    return (

      <div className="page">

        <div className="page__header">

          <h1 className="page__title">
            Inventory
          </h1>

        </div>

        <div
          style={{
            padding: '20px',
            textAlign: 'center',
            color: '#999',
          }}
        >
          No items found
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
            Inventory
          </h1>

          <p className="page__sub">
            {currentItems.length}
            {' '}
            items shown
          </p>

        </div>

      </div>

      {/* TOOLBAR */}
      <div className="toolbar">

        <Input
          className="toolbar__search"
          placeholder="Search by code or name..."
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
        />

      </div>

      {/* STATS */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >

        {/* TOTAL */}
        <div className="card">

          <div className="card__label">
            Total Items
          </div>

          <div className="card__value">
            {totalItems}
          </div>

        </div>

        {/* LOW STOCK */}
        <div className="card">

          <div className="card__label">
            Low Stock
          </div>

          <div
            className="card__value"
            style={{
              color: '#f59e0b',
            }}
          >
            {lowStockItems}
          </div>

        </div>

        {/* OUT OF STOCK */}
        <div className="card">

          <div className="card__label">
            Out of Stock
          </div>

          <div
            className="card__value"
            style={{
              color: '#ef4444',
            }}
          >
            {outOfStockItems}
          </div>

        </div>

      </div>

      {/* TABLE OR EMPTY STATE */}
      {totalFiltered === 0 ? (
        <EmptyState
          icon="📦"
          title="No items found"
          description={search ? `No items matching "${search}"` : 'Add items to your inventory to get started'}
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

    </div>
  );
}