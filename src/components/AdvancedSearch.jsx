import React, { useState } from 'react';
import Button from './Button';

export default function AdvancedSearch({ onSearch, filters = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [values, setValues] = useState({});

  const handleChange = (key, value) => {
    setValues(prev => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    onSearch(values);
    setIsOpen(false);
  };

  const handleClear = () => {
    setValues({});
    onSearch({});
  };

  const activeFilters = Object.keys(values).filter(k => values[k]).length;

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: '8px 16px',
          background: activeFilters > 0 ? '#3b82f6' : '#fff',
          color: activeFilters > 0 ? '#fff' : '#374151',
          border: '1px solid #d1d5db',
          borderRadius: '6px',
          fontSize: '14px',
          fontWeight: '500',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'all 0.2s',
        }}
      >
        <span>🔍</span>
        <span>Advanced Search</span>
        {activeFilters > 0 && (
          <span style={{
            background: '#fff',
            color: '#3b82f6',
            borderRadius: '12px',
            padding: '2px 8px',
            fontSize: '12px',
            fontWeight: '600',
          }}>
            {activeFilters}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            onClick={() => setIsOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 998,
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              right: 0,
              background: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              padding: '20px',
              minWidth: '320px',
              zIndex: 999,
            }}
          >
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600' }}>
              Filter Options
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {filters.map(filter => (
                <div key={filter.key}>
                  <label style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: '500',
                    color: '#6b7280',
                    marginBottom: '6px',
                  }}>
                    {filter.label}
                  </label>
                  
                  {filter.type === 'select' ? (
                    <select
                      value={values[filter.key] || ''}
                      onChange={(e) => handleChange(filter.key, e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px',
                      }}
                    >
                      <option value="">All</option>
                      {filter.options?.map(opt => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  ) : filter.type === 'date' ? (
                    <input
                      type="date"
                      value={values[filter.key] || ''}
                      onChange={(e) => handleChange(filter.key, e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px',
                      }}
                    />
                  ) : (
                    <input
                      type="text"
                      value={values[filter.key] || ''}
                      onChange={(e) => handleChange(filter.key, e.target.value)}
                      placeholder={filter.placeholder}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px',
                      }}
                    />
                  )}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
              <button
                onClick={handleApply}
                style={{
                  flex: 1,
                  padding: '8px 16px',
                  background: '#3b82f6',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                }}
              >
                Apply
              </button>
              <button
                onClick={handleClear}
                style={{
                  flex: 1,
                  padding: '8px 16px',
                  background: '#f3f4f6',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                }}
              >
                Clear
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
