import React, { useState } from 'react';
import Button from '../components/Button';
import { orderAPI } from '../Services/api';

export default function OrderModal({
  onClose,
  onOrderCreated,
}) {

  const [customer, setCustomer] =
    useState('');

  const [items, setItems] =
    useState('');

  const [total, setTotal] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      setLoading(true);

      const orderData = {

        customer,

        items,

        total,

      };

      await orderAPI.createOrder(
        orderData
      );

      onOrderCreated?.();

      onClose?.();

    } catch (error) {

      console.error(
        'Create Order Error:',
        error
      );

    } finally {

      setLoading(false);
    }
  };

  return (

    <div className="modal">

      <form onSubmit={handleSubmit}>

        <h2>Create Order</h2>

        <input
          type="text"
          placeholder="Customer Name"
          value={customer}
          onChange={(e) =>
            setCustomer(e.target.value)
          }
        />

        <input
          type="text"
          placeholder="Items"
          value={items}
          onChange={(e) =>
            setItems(e.target.value)
          }
        />

        <input
          type="number"
          placeholder="Total"
          value={total}
          onChange={(e) =>
            setTotal(e.target.value)
          }
        />

        <div
          style={{
            display: 'flex',
            gap: '10px',
            marginTop: '20px',
          }}
        >

          <Button
            type="submit"
            loading={loading}
          >
            Create Order
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>

        </div>

      </form>

    </div>
  );
}