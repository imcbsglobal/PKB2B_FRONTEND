import React, {
  useState,
  useEffect,
  useCallback,
} from 'react';

import Table from '../components/Table';
import Input from '../components/Input';

import {
  productAPI,
  productBatchAPI,
} from '../Services/api';

export default function Categories() {

  // ================= STATES =================
  const [products, setProducts] =
    useState([]);

  const [search, setSearch] =
    useState('');

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(null);

  const [selectedCategory, setSelectedCategory] =
    useState(null);

  const [modalOpen, setModalOpen] =
    useState(false);

  const [categoryItems, setCategoryItems] =
    useState([]);

  const [itemsLoading, setItemsLoading] =
    useState(false);

  // ================= FETCH PRODUCTS =================
  const fetchProducts = async () => {

    try {

      setLoading(true);

      // Fetch categories
      const categoryResponse =
        await productAPI.getAllProducts();

      // Fetch items to count
      const itemsResponse =
        await productBatchAPI
          .getAllItems();

      console.log(
        'Categories:',
        categoryResponse.data.map(
          (c) => c.name
        )
      );

      console.log(
        'Items sample:',
        itemsResponse.data?.slice(0, 5)
      );

      // Count items by checking multiple fields
      const itemCounts = {};
      (itemsResponse.data || [])
        .forEach((item) => {
          // Try matching by product, category, name, or any relevant field
          const productField =
            item.product
              ?.toLowerCase()
              .trim();
          const categoryField =
            item.category
              ?.toLowerCase()
              .trim();
          const nameField =
            item.name
              ?.toLowerCase()
              .trim();

          if (productField) {
            itemCounts[productField] =
              (itemCounts[productField] || 0) + 1;
          }
          if (categoryField) {
            itemCounts[categoryField] =
              (itemCounts[categoryField] || 0) + 1;
          }
        });

      console.log(
        'Item counts by field:',
        itemCounts
      );

      // Add count to categories
      const productsWithId =
        categoryResponse.data.map(
          (product, index) => {
            const categoryKey =
              product.name
                ?.toLowerCase()
                .trim();
            const count =
              itemCounts[categoryKey] || 0;

            console.log(
              `Category "${product.name}" -> key "${categoryKey}" -> count ${count}`
            );

            return {
              ...product,
              id: product.id || index,
              itemCount: count,
            };
          }
        );

      setProducts(productsWithId);

      setError(null);

    } catch (err) {

      console.error(err);

      setError(
        'Failed to load categories'
      );

      setProducts([]);

    } finally {

      setLoading(false);
    }
  };

  useEffect(() => {

    fetchProducts();

  }, []);

  // ================= OPEN CATEGORY MODAL =================
  const handleCategoryClick = async (category) => {

    setSelectedCategory(category);

    setModalOpen(true);

    try {

      setItemsLoading(true);

      const response =
        await productBatchAPI
          .getAllItems();

      // Filter items by product (category)
      const filtered =
        (response.data || []).filter(
          (item) =>
            item.product?.toLowerCase() ===
            category.name?.toLowerCase()
        );

      setCategoryItems(filtered);

    } catch (err) {

      console.error(err);

      setCategoryItems([]);

    } finally {

      setItemsLoading(false);
    }
  };

  // ================= FAVORITE =================
  const toggleFavorite =
    useCallback(async (row) => {

      try {

        // UPDATE UI INSTANTLY
        setProducts((prev) =>
          prev.map((product) =>

            product.id === row.id
              ? {
                  ...product,
                  is_favorite:
                    !product.is_favorite,
                }
              : product
          )
        );

        // CALL API
        await productAPI
          .toggleProductFavorite(
            row.name
          );

      } catch (error) {

        console.error(error);

        // REFRESH IF FAILED
        fetchProducts();
      }

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
            background: '#f0f0f0',
            borderRadius: '8px',
            overflow: 'hidden',
          }}
        >

          {row.url ? (

            <img
              src={row.url}
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
                display: 'flex',
                justifyContent:
                  'center',
                alignItems: 'center',
                height: '100%',
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

    // NAME
    {
      key: 'name',
      label: 'NAME',
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
            textDecoration: 'underline',
            fontSize: '14px',
            fontWeight: '500',
            padding: 0,
          }}
        >
          {row.name}
        </button>
      ),
    },

    // ITEMS COUNT
    {
      key: 'itemCount',
      label: 'ITEMS',
      align: 'center',
      render: (val) => (
        <span
          style={{
            fontWeight: '600',
            color: '#666',
            background: '#f0f0f0',
            padding: '4px 12px',
            borderRadius: '16px',
            display: 'inline-block',
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

      render: (_, row) => (

        <button
          onClick={() =>
            toggleFavorite(row)
          }
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '20px',
            color:
              row.is_favorite
                ? '#FF6B6B'
                : '#ccc',
            transition:
              '0.2s ease',
          }}
        >
          {row.is_favorite
            ? '♥'
            : '♡'}
        </button>
      ),
    },
  ];

  // ================= SEARCH =================
  const filtered =
    products.filter((p) =>

      p.name
        ?.toLowerCase()
        .includes(
          search.toLowerCase()
        )
    );

  // ================= LOADING =================
  if (loading) {

    return (

      <div className="page">

        <div className="page__header">

          <h1 className="page__title">
            Categories
          </h1>

        </div>

        <p
          style={{
            padding: '20px',
            textAlign: 'center',
          }}
        >
          Loading categories...
        </p>

      </div>
    );
  }

  // ================= ERROR =================
  if (error) {

    return (

      <div className="page">

        <div className="page__header">

          <h1 className="page__title">
            Categories
          </h1>

        </div>

        <p
          style={{
            padding: '20px',
            textAlign: 'center',
            color: '#ff6b6b',
          }}
        >
          {error}
        </p>

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

      {/* TOOLBAR */}
      <div className="toolbar">

        <Input
          className="toolbar__search"
          placeholder="Search categories..."
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
            alignItems: 'center',
            zIndex: 999,
            padding: '20px',
          }}
        >

          <div
            style={{
              width: '100%',
              maxWidth: '900px',
              background: '#fff',
              borderRadius: '12px',
              padding: '24px',
              maxHeight: '80vh',
              overflow: 'auto',
            }}
          >

            {/* HEADER */}
            <div
              style={{
                display: 'flex',
                justifyContent:
                  'space-between',
                alignItems: 'center',
                marginBottom: '20px',
              }}
            >

              <h2
                style={{
                  fontSize: '24px',
                  fontWeight: '700',
                }}
              >
                {selectedCategory?.name}
                {' '}
                Items
              </h2>

              <button
                onClick={() =>
                  setModalOpen(false)
                }
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '28px',
                  cursor: 'pointer',
                  color: '#666',
                }}
              >
                ×
              </button>

            </div>

            {/* ITEMS COUNT */}
            <p
              style={{
                marginBottom: '16px',
                color: '#666',
              }}
            >
              {categoryItems.length}
              {' '}
              items found
            </p>

            {/* LOADING */}
            {itemsLoading ? (

              <div
                style={{
                  padding: '20px',
                  textAlign: 'center',
                }}
              >
                Loading items...
              </div>

            ) : categoryItems.length === 0 ? (

              <div
                style={{
                  padding: '20px',
                  textAlign: 'center',
                  color: '#999',
                }}
              >
                No items found for
                {' '}
                {selectedCategory?.name}
              </div>

            ) : (

              <Table
                columns={[

                  {
                    key: 'image',
                    label: 'IMAGE',
                    render: (_, row) => (

                      <div
                        style={{
                          width: '50px',
                          height: '50px',
                          background:
                            '#f0f0f0',
                          borderRadius:
                            '6px',
                          overflow:
                            'hidden',
                        }}
                      >

                        {row.url2 ? (

                          <img
                            src={
                              row.url2
                            }
                            alt={
                              row.name
                            }
                            style={{
                              width:
                                '100%',
                              height:
                                '100%',
                              objectFit:
                                'cover',
                            }}
                          />

                        ) : (

                          <div
                            style={{
                              width:
                                '100%',
                              height:
                                '100%',
                              display:
                                'flex',
                              justifyContent:
                                'center',
                              alignItems:
                                'center',
                              fontSize:
                                '10px',
                              color:
                                '#999',
                            }}
                          >
                            No Img
                          </div>

                        )}

                      </div>
                    ),
                  },

                  {
                    key: 'code',
                    label: 'CODE',
                  },

                  {
                    key: 'name',
                    label: 'NAME',
                  },

                  {
                    key: 'brand',
                    label: 'BRAND',
                  },

                  {
                    key: 'price',
                    label: 'PRICE',
                    render: (val) =>
                      `₹${val || 0}`,
                  },

                  {
                    key: 'quantity',
                    label: 'STOCK',
                    render: (val) => (

                      <span
                        style={{
                          fontWeight:
                            '600',
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

                  {
                    key: 'status',
                    label: 'STATUS',
                    render: (_, row) => {

                      if (
                        row.quantity <=
                        0
                      ) {

                        return (

                          <span
                            style={{
                              color:
                                '#ef4444',
                              fontWeight:
                                '600',
                            }}
                          >
                            Out of
                            {' '}
                            Stock
                          </span>

                        );
                      }

                      if (
                        row.quantity <=
                        5
                      ) {

                        return (

                          <span
                            style={{
                              color:
                                '#f59e0b',
                              fontWeight:
                                '600',
                            }}
                          >
                            Low Stock
                          </span>

                        );
                      }

                      return (

                        <span
                          style={{
                            color:
                              '#16a34a',
                            fontWeight:
                              '600',
                          }}
                        >
                          In Stock
                        </span>

                      );
                    },
                  },
                ]}
                rows={categoryItems}
              />

            )}

          </div>

        </div>

      )}

    </div>
  );
}