import React, { useState } from 'react';
import Table from '../components/Table';
import Input from '../components/Input';

const PRODUCTS = [
  { id: 1, code: '00005', name: 'THUMS UP 24*600ML',     brand: 'COCA COLA', status: 'OK' },
  { id: 2, code: '00006', name: 'FANTA 24*600ML',        brand: 'COCA COLA', status: 'OK' },
  { id: 3, code: '00007', name: 'SPRITE 24*600ML',       brand: 'COCA COLA', status: 'OK' },
  { id: 4, code: '00008', name: 'LIMCA 24*600ML',        brand: 'PEPSI',     status: 'OK' },
  { id: 5, code: '00009', name: 'COCA COLA 9*2.25LTR',   brand: 'COCA COLA', status: 'OK' },
  { id: 6, code: '00010', name: 'FANTA 9*2.25 LTR',      brand: 'COCA COLA', status: 'OK' },
];

const COLUMNS = [
  { key: 'code',   label: 'CODE'   },
  { key: 'name',   label: 'NAME'   },
  { key: 'brand',  label: 'BRAND'  },
  { key: 'status', label: 'STATUS' },
];

export default function Products() {
  const [search, setSearch] = useState('');

  const filtered = PRODUCTS.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page">
      <div className="page__header">
        <h1 className="page__title">Products</h1>
        <p className="page__sub">{filtered.length} products found</p>
      </div>

      <div className="toolbar">
        <Input
          className="toolbar__search"
          placeholder="Search by name or code…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Table columns={COLUMNS} rows={filtered} />
    </div>
  );
}