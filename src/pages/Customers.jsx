import { useMemo, useState } from 'react';

import Input from '../components/Input';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import Pagination from '../components/Pagination';
import { customerAPI } from '../Services/api';
import { useFetchData } from '../hooks/useFetchData';

const ITEMS_PER_PAGE = 20;

function CustomerTable({ rows }) {
  return (
    <div className="table-wrap customer-table-wrap">
      <div className="customer-table-scroll">
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
    </div>
  );
}

export default function Customers() {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const customersResult = useFetchData('customers', () => customerAPI.getCustomers());
  const customers = Array.isArray(customersResult.data) ? customersResult.data : [];
  const loading = customersResult.loading;

  const filteredCustomers = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return customers;

    return customers.filter((c) => c.name?.toLowerCase().includes(term) || c.city?.toLowerCase().includes(term) || c.place?.toLowerCase().includes(term) || c.code?.toLowerCase().includes(term) || c.phone?.includes(search) || c.phone2?.includes(search));
  }, [customers, search]);

  const sortedCustomers = useMemo(() => {
    return [...filteredCustomers].sort((a, b) => {
      const nameA = a.name?.trim() || '';
      const nameB = b.name?.trim() || '';

      if (!nameA && !nameB) return 0;
      if (!nameA) return 1;
      if (!nameB) return -1;

      return nameA.localeCompare(nameB, undefined, { sensitivity: 'base' });
    });
  }, [filteredCustomers]);

  // Reset to page 1 whenever the search changes
  const handleSearch = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  // Slice the sorted list to the current page
  const paginatedCustomers = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedCustomers.slice(start, start + ITEMS_PER_PAGE);
  }, [sortedCustomers, currentPage]);

  return (
    <div className="page customer-page">
      <div className="customer-toolbar">
        <Input className="customer-toolbar__search" placeholder="Search by name, code, GSTIN..." value={search} onChange={handleSearch} />
      </div>

      {loading ? (
        <div className="item-loading-wrap">
          <LoadingSkeleton rows={5} columns={8} />
        </div>
      ) : sortedCustomers.length === 0 ? (
        <EmptyState icon="👥" title="No customers found" description={search ? `No customers matching "${search}"` : 'No customers available'} />
      ) : (
        <>
          <CustomerTable rows={paginatedCustomers} />
          <Pagination
            currentPage={currentPage}
            totalItems={sortedCustomers.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </div>
  );
}