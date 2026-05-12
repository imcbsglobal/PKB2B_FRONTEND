import React, {
  useState,
  useEffect,
} from 'react';

import Table from '../components/Table';
import Input from '../components/Input';
import Button from '../components/Button';

import {
  productBatchAPI,
} from '../Services/api';

export default function Inventory() {

  // ================= STATES =================
  const [items, setItems] =
    useState([]);

  const [search, setSearch] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState(null);

  // ================= FETCH ITEMS =================
  const fetchItems = async () => {

    try {

      setLoading(true);

      const response =
        await productBatchAPI
          .getAllItems();

      setItems(
        response.data || []
      );

      setError(null);

    } catch (err) {

      console.error(err);

      setError(
        'Failed to load items'
      );

    } finally {

      setLoading(false);
    }
  };

  useEffect(() => {

    fetchItems();

  }, []);

  // ================= TABLE COLUMNS =================
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
          {val || 0}
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

        <div
          style={{
            padding: '20px',
            textAlign: 'center',
          }}
        >
          Loading inventory...
        </div>

      </div>
    );
  }

  // ================= ERROR =================
  if (error) {

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
            color: '#ef4444',
          }}
        >
          {error}
        </div>

      </div>
    );
  }

  // ================= UI =================
  return (

    <div className="page">

      {/* HEADER */}
      <div className="page__header">

        <div
          style={{
            display: 'flex',
            justifyContent:
              'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >

          <div>

            <h1 className="page__title">
              Inventory
            </h1>

            <p className="page__sub">
              Manage item inventory
            </p>

          </div>

          <Button variant="primary">
            Export Items
          </Button>

        </div>

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

      {/* SEARCH */}
      <div
        style={{
          marginBottom: '20px',
        }}
      >

        <Input
          placeholder="Search by name, code or brand..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

      </div>

      {/* TABLE */}
      <Table
        columns={COLUMNS}
        rows={filtered}
      />

    </div>
  );
}