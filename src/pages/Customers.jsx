import React, { useMemo, useState } from 'react';

import Input from '../components/Input';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import { customerAPI } from '../Services/api';
import { useFetchData } from '../hooks/useFetchData';

function CustomerTable({ rows }) {
  return (
    <div className="table-wrap customer-table-wrap">
      <table className="data-table customer-table">
        <thead>
          <tr>
            <th>CODE</th>
            <th>NAME</th>
            <th>ADDRESS</th>
            <th>PLACE</th>
            <th>CITY</th>
            <th>PHONE</th>
            <th>PHONE 2</th>
            <th>GSTIN</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((customer) => (
            <tr key={customer.id || customer.code || customer.name}>
              <td className="customer-table__code">{customer.code || 'N/A'}</td>
              <td className="customer-table__name">{customer.name || 'N/A'}</td>
              <td>{customer.address || 'N/A'}</td>
              <td>{customer.place || 'N/A'}</td>
              <td>{customer.city || 'N/A'}</td>
              <td>{customer.phone || '—'}</td>
              <td>{customer.phone2 || '—'}</td>
              <td>{customer.gstin || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Customers() {
  const [search, setSearch] = useState('');

  const customersResult = useFetchData('customers', () => customerAPI.getCustomers());
  const customers = Array.isArray(customersResult.data) ? customersResult.data : [];
  const loading = customersResult.loading;

  const filteredCustomers = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return customers;

    return customers.filter((c) => c.name?.toLowerCase().includes(term) || c.city?.toLowerCase().includes(term) || c.place?.toLowerCase().includes(term) || c.code?.toLowerCase().includes(term) || c.phone?.includes(search) || c.phone2?.includes(search));
  }, [customers, search]);

  return (
    <div className="page customer-page">
      <div className="customer-toolbar">
        <Input className="customer-toolbar__search" placeholder="Search by name, code, GSTIN..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="item-loading-wrap">
          <LoadingSkeleton rows={5} columns={8} />
        </div>
      ) : filteredCustomers.length === 0 ? (
        <EmptyState icon="👥" title="No customers found" description={search ? `No customers matching "${search}"` : 'No customers available'} />
      ) : (
        <CustomerTable rows={filteredCustomers} />
      )}
    </div>
  );
}