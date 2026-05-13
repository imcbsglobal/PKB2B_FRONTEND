import React, {
  useState,
  useEffect,
} from 'react';

import EnhancedTable from '../components/EnhancedTable';
import Input from '../components/Input';
import Pagination from '../components/Pagination';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';

import { customerAPI } from '../Services/api';
import { usePagination } from '../hooks/usePagination';
import { useFetchData } from '../hooks/useFetchData';

const COLUMNS = [

  {
    key: 'code',
    label: 'CODE',
    editable: true,
  },

  {
    key: 'name',
    label: 'NAME',
    editable: true,
  },

  {
    key: 'address',
    label: 'ADDRESS',
    editable: true,
  },

  {
    key: 'place',
    label: 'PLACE',
  },

  {
    key: 'city',
    label: 'CITY',
  },

  {
    key: 'phone',
    label: 'PHONE',
    editable: true,
    render: (val) => (
      val || '-'
    ),
  },

  {
    key: 'phone2',
    label: 'PHONE 2',
    editable: true,
    render: (val) => (
      val || '-'
    ),
  },

  {
    key: 'gstin',
    label: 'GSTIN',

    render: (val) => (
      val || '-'
    ),
  },
];

export default function Customers({ showToast }) {

  const [search, setSearch] = useState('');
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [currentLayout, setCurrentLayout] = useState('table');

  // ================= FETCH CUSTOMERS WITH CACHE =================
  const customersResult = useFetchData(
    'customers',
    () => customerAPI.getCustomers()
  );
  const customers = Array.isArray(customersResult.data) ? customersResult.data : [];
  const loading = customersResult.loading;

  const handleEdit = (rowIdx, colKey, newValue) => {
    console.log('Edit:', { rowIdx, colKey, newValue });
    showToast?.(`Updated ${colKey} to ${newValue}`, 'success');
  };

  const handleRowSelect = (selected) => {
    setSelectedCustomers(selected);
    if (selected.length > 0) {
      showToast?.(`${selected.length} customers selected`, 'info');
    }
  };

  // ================= FILTER =================
  const filtered = customers.filter(
    (c) =>

      c.name?.toLowerCase().includes(
        search.toLowerCase()
      ) ||

      c.city?.toLowerCase().includes(
        search.toLowerCase()
      ) ||

      c.place?.toLowerCase().includes(
        search.toLowerCase()
      ) ||

      c.code?.toLowerCase().includes(
        search.toLowerCase()
      ) ||

      c.phone?.includes(search) ||

      c.phone2?.includes(search)
  );

  // ================= PAGINATION =================
  const {
    currentPage,
    totalPages,
    currentItems,
    onPageChange,
    totalItems: totalFiltered,
  } = usePagination(filtered, 10);

  // ================= LOADING =================
  if (loading) {

    return (

      <div className="page">

        <div className="page__header">

          <h1 className="page__title">
            Customers
          </h1>

        </div>

        <div style={{ marginBottom: '24px' }}>
          <LoadingSkeleton rows={5} columns={6} />
        </div>

      </div>
    );
  }

  return (

    <div className="page">

      {/* HEADER */}
      <div className="page__header">

        <h1 className="page__title">
          Customers
        </h1>

        <p className="page__sub">
          {filtered.length} customers found
        </p>

      </div>

      {/* TOOLBAR */}
      <div className="toolbar">

        <Input
          className="toolbar__search"
          placeholder="Search by name, city, phone or code..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

      </div>

            {/* TABLE OR EMPTY STATE */}
      {totalFiltered === 0 ? (
        <EmptyState
          icon="👥"
          title="No customers found"
          description={search ? `No customers matching "${search}"` : 'No customers yet'}
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