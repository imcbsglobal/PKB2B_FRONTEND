import React, { useMemo, useState } from 'react';
import Input from '../components/Input';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import { areaAPI } from '../Services/api';
import { useFetchData } from '../hooks/useFetchData';

export default function Area() {
  const [search, setSearch] = useState('');

  const { data, loading, error } = useFetchData('area', () => areaAPI.getAreas());
  const areas = Array.isArray(data) ? data : [];

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return areas;
    return areas.filter((a) =>
      Object.values(a).some((v) =>
        String(v ?? '').toLowerCase().includes(term)
      )
    );
  }, [areas, search]);

  // Derive column headers from the first record
  const columns = areas.length > 0 ? Object.keys(areas[0]) : [];

  return (
    <div className="page">
      {/* Toolbar */}
      <div className="item-toolbar">
        <div className="item-toolbar__left">
          <Input
            className="item-toolbar__search"
            placeholder="Search area..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="item-toolbar__right">
          <span style={{ fontSize: 13, color: '#888' }}>
            {filtered.length} area{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="item-loading-wrap">
          <LoadingSkeleton rows={8} columns={3} />
        </div>
      ) : error ? (
        <EmptyState
          icon="⚠️"
          title="Failed to load areas"
          description={error?.message || 'Something went wrong. Please try again.'}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="🗺️"
          title="No areas found"
          description={search ? `No areas matching "${search}"` : 'No areas available'}
        />
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                {columns.map((col) => (
                  <th key={col}>{col.replace(/_/g, ' ').toUpperCase()}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((area, idx) => (
                <tr key={area.id ?? idx}>
                  <td style={{ color: '#999', width: 48 }}>{idx + 1}</td>
                  {columns.map((col) => (
                    <td key={col}>
                      {area[col] !== null && area[col] !== undefined
                        ? String(area[col])
                        : '—'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
