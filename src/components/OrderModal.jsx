import React, { useState } from 'react';
import Input from './Input';
import Button from './Button';
import { orderAPI } from '../Services/api';

export default function OrderModal({ onClose, onOrderCreated }) {
  // ================= STATES =================
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    customer: '',
    items: '',
    total: '',
    source: '',
  });

  // ================= HANDLE CHANGE =================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ================= HANDLE SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.customer || !formData.items || !formData.total || !formData.source) {
      setError('All fields are required');
      return;
    }

    // Validate items is positive
    const itemsNum = parseInt(formData.items);
    if (itemsNum <= 0) {
      setError('Number of items must be greater than 0');
      return;
    }

    // Validate total is positive
    const totalNum = parseFloat(formData.total);
    if (totalNum <= 0) {
      setError('Total amount must be greater than 0');
      return;
    }

    try {
      setLoading(true);

      const orderPayload = {
        customer: formData.customer,
        items: itemsNum,
        total: totalNum,
        source: formData.source,
      };

      const response = await orderAPI.createOrder(orderPayload);

      console.log('Order Created:', response.data);

      // Call the callback to refresh orders
      onOrderCreated();

      // Close modal
      onClose();

    } catch (err) {
      console.error('Create Order Error:', err);
      console.error('Error Response:', err.response?.data);
      
      // Show detailed error message
      const errorMsg = 
        err.response?.data?.message || 
        err.response?.data?.error ||
        (typeof err.response?.data === 'object' ? JSON.stringify(err.response?.data) : null) ||
        'Failed to create order. Please try again.';
      
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h2>Create New Order</h2>
          <button
            className="modal-close"
            onClick={onClose}
            disabled={loading}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="modal-body">
          {error && (
            <div className="form-error">
              {error}
            </div>
          )}

          <Input
            label="Customer Name"
            name="customer"
            value={formData.customer}
            onChange={handleChange}
            placeholder="Enter customer name"
            disabled={loading}
            required
          />

          <Input
            label="Number of Items"
            name="items"
            type="number"
            min="1"
            value={formData.items}
            onChange={handleChange}
            placeholder="Enter number of items"
            disabled={loading}
            required
          />

          <Input
            label="Total Amount"
            name="total"
            type="number"
            step="0.01"
            min="0.01"
            value={formData.total}
            onChange={handleChange}
            placeholder="Enter total amount"
            disabled={loading}
            required
          />

          <Input
            label="Source"
            name="source"
            value={formData.source}
            onChange={handleChange}
            placeholder="e.g., Online, Offline, Phone"
            disabled={loading}
            required
          />
        </form>

        {/* Footer */}
        <div className="modal-footer">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>

          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Order'}
          </Button>
        </div>
      </div>
    </div>
  );
}
