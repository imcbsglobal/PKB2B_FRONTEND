import React, { useState, useEffect } from 'react';

import Button from './Button';
import Input from './Input';

import {
  productCRUDAPI,
} from '../Services/api';

export default function ProductModal({
  product,
  onClose,
  onSuccess,
}) {

  // ================= STATES =================
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock: '',
    brand: '',
    category: '',
    description: '',
    image: null,
  });

  const [imagePreview, setImagePreview] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState('');

  // ================= EDIT MODE =================
  useEffect(() => {

    if (product) {

      setFormData({
        name: product.name || '',
        price: product.price || '',
        stock: product.stock || '',
        brand: product.brand || '',
        category: product.category || '',
        description:
          product.description || '',
        image: null,
      });

      setImagePreview(
        product.url || null
      );
    }

  }, [product]);

  // ================= INPUT CHANGE =================
  const handleChange = (e) => {

    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ================= IMAGE CHANGE =================
  const handleImageChange = (e) => {

    const file = e.target.files?.[0];

    if (!file) return;

    setFormData((prev) => ({
      ...prev,
      image: file,
    }));

    const reader = new FileReader();

    reader.onloadend = () => {

      setImagePreview(reader.result);
    };

    reader.readAsDataURL(file);
  };

  // ================= SUBMIT =================
  const handleSubmit = async (e) => {

    e.preventDefault();

    setError('');

    // VALIDATION
    if (!formData.name.trim()) {

      setError('Product name required');

      return;
    }

    try {

      setLoading(true);

      const data = new FormData();

      data.append(
        'name',
        formData.name
      );

      data.append(
        'price',
        formData.price
      );

      data.append(
        'stock',
        formData.stock
      );

      data.append(
        'brand',
        formData.brand
      );

      data.append(
        'category',
        formData.category
      );

      data.append(
        'description',
        formData.description
      );

      if (formData.image) {

        data.append(
          'image',
          formData.image
        );
      }

      // ================= UPDATE =================
      if (product?.id) {

        await productCRUDAPI.updateProduct(
          product.id,
          data
        );

      } else {

        // ================= CREATE =================
        await productCRUDAPI.createProduct(
          data
        );
      }

      onSuccess?.();

    } catch (error) {

      console.error(error);

      setError(
        'Failed to save product'
      );

    } finally {

      setLoading(false);
    }
  };

  // ================= UI =================
  return (

    <div
      style={{
        position: 'fixed',
        inset: 0,
        background:
          'rgba(0,0,0,0.45)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 999,
        padding: '20px',
      }}
    >

      {/* MODAL */}
      <div
        style={{
          width: '100%',
          maxWidth: '650px',
          background: '#fff',
          borderRadius: '16px',
          padding: '24px',
          maxHeight: '90vh',
          overflowY: 'auto',
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
            {product
              ? 'Edit Product'
              : 'Add Product'}
          </h2>

          <button
            onClick={onClose}
            style={{
              border: 'none',
              background: 'none',
              fontSize: '24px',
              cursor: 'pointer',
            }}
          >
            ×
          </button>

        </div>

        {/* ERROR */}
        {error && (

          <div
            style={{
              background: '#fee2e2',
              color: '#b91c1c',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '16px',
            }}
          >
            {error}
          </div>

        )}

        {/* FORM */}
        <form onSubmit={handleSubmit}>

          {/* PRODUCT NAME */}
          <Input
            label="Product Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter product name"
          />

          {/* PRICE */}
          <Input
            label="Price"
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            placeholder="Enter price"
          />

          {/* STOCK */}
          <Input
            label="Stock"
            type="number"
            name="stock"
            value={formData.stock}
            onChange={handleChange}
            placeholder="Enter stock"
          />

          {/* BRAND */}
          <Input
            label="Brand"
            name="brand"
            value={formData.brand}
            onChange={handleChange}
            placeholder="Enter brand"
          />

          {/* CATEGORY */}
          <Input
            label="Category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            placeholder="Enter category"
          />

          {/* DESCRIPTION */}
          <div
            className="field"
            style={{
              marginBottom: '16px',
            }}
          >

            <label className="field__label">
              Description
            </label>

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter description"
              className="field__input"
              rows={4}
            />

          </div>

          {/* IMAGE */}
          <div
            style={{
              marginBottom: '20px',
            }}
          >

            <label
              className="field__label"
            >
              Product Image
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={
                handleImageChange
              }
            />

          </div>

          {/* PREVIEW */}
          {imagePreview && (

            <img
              src={imagePreview}
              alt="Preview"
              style={{
                width: '100%',
                height: '220px',
                objectFit: 'cover',
                borderRadius: '12px',
                marginBottom: '20px',
              }}
            />

          )}

          {/* ACTIONS */}
          <div
            style={{
              display: 'flex',
              justifyContent:
                'flex-end',
              gap: '12px',
            }}
          >

            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="primary"
              loading={loading}
            >
              {product
                ? 'Update Product'
                : 'Add Product'}
            </Button>

          </div>

        </form>

      </div>

    </div>
  );
}