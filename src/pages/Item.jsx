// src/pages/Item.jsx

import React, {
  useState,
  useEffect,
} from 'react';

import Table from '../components/Table';
import Input from '../components/Input';

import {
  productBatchAPI,
} from '../Services/api';

// ================= COLUMNS =================
const COLUMNS = [

  // IMAGE
  {
    key: 'image',

    label: 'IMAGE',

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
  },

  // NAME
  {
    key: 'name',
    label: 'ITEM NAME',
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
              : val <= 5
              ? '#f59e0b'
              : '#16a34a',
        }}
      >
        {val}
      </span>

    ),
  },

  // STATUS
  {
    key: 'status',

    label: 'STATUS',

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

export default function Item() {

  // ================= STATES =================
  const [items, setItems] =
    useState([]);

  const [search, setSearch] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  // ================= FETCH ITEMS =================
  const fetchItems = async () => {

    try {

      setLoading(true);

      const response =
        await productBatchAPI
          .getAllItems();

      console.log(
        'Items:',
        response.data
      );

      setItems(
        response.data || []
      );

    } catch (error) {

      console.error(
        'Items API Error:',
        error
      );

    } finally {

      setLoading(false);
    }
  };

  useEffect(() => {

    fetchItems();

  }, []);

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

  // ================= UI =================
  return (

    <div className="page">

      {/* HEADER */}
      <div className="page__header">

        <h1 className="page__title">
          Items
        </h1>

        <p className="page__sub">
          {filtered.length}
          {' '}
          items found
        </p>

      </div>

      {/* TOOLBAR */}
      <div className="toolbar">

        <Input
          className="toolbar__search"
          placeholder="Search by name, code or brand..."
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
        />

      </div>

      {/* LOADING */}
      {loading ? (

        <div
          style={{
            padding: '20px',
            textAlign: 'center',
          }}
        >
          Loading items...
        </div>

      ) : (

        <Table
          columns={COLUMNS}
          rows={filtered}
        />

      )}

    </div>
  );
}