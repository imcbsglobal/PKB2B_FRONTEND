import React, { useState } from 'react';
import Table from '../components/Table';
import Input from '../components/Input';
import Badge from '../components/Badge';

const CUSTOMERS = [
  { id: 1, code: '00918', name: 'ARUN KUMAR',          city: 'KALPETTA',    status: 'active' },
  { id: 2, code: '00930', name: 'IN AND OUT',           city: 'FRAZER TOWN', status: 'active' },
  { id: 3, code: '00931', name: 'CRAFT SUPER MARKET',   city: 'BANGALORE',   status: 'active' },
  { id: 4, code: '00932', name: 'TOP IN TOWN RETAIL',   city: 'BANGALORE',   status: 'active' },
  { id: 5, code: '00933', name: 'ATHULYA DEPARTMENT',   city: 'BANGALORE',   status: 'active' },
  { id: 6, code: '00934', name: 'ATHULYA STORE',        city: 'BANGALORE',   status: 'active' },
];

const COLUMNS = [
  { key: 'code', label: 'CODE' },
  { key: 'name', label: 'NAME' },
  { key: 'city', label: 'CITY' },
  {
    key: 'status',
    label: 'STATUS',
    render: (val) => <Badge variant="success">{val.toUpperCase()}</Badge>,
  },
];

export default function Customers() {
  const [search, setSearch] = useState('');

  const filtered = CUSTOMERS.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page">
      <div className="page__header">
        <h1 className="page__title">Customers</h1>
        <p className="page__sub">{filtered.length} customers found</p>
      </div>

      <div className="toolbar">
        <Input
          className="toolbar__search"
          placeholder="Search by name or city…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Table columns={COLUMNS} rows={filtered} />
    </div>
  );
}