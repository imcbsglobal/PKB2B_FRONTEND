import React, { useState, useMemo } from 'react';

export default function EnhancedTable({
  columns = [],
  rows = [],
  onRowSelect,
  onEdit,
  enableSelection = false,
  enableEditing = false,
  enableSorting = true,
  enableColumnToggle = true,
  defaultLayout = 'table',
  onLayoutChange,
}) {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [hiddenColumns, setHiddenColumns] = useState(new Set());
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [layout, setLayout] = useState(defaultLayout);
  const [showColumnMenu, setShowColumnMenu] = useState(false);

  // Sorting
  const sortedRows = useMemo(() => {
    if (!sortConfig.key || !enableSorting) return rows;

    return [...rows].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      if (aVal === bVal) return 0;
      
      const comparison = aVal < bVal ? -1 : 1;
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }, [rows, sortConfig, enableSorting]);

  const handleSort = (key) => {
    if (!enableSorting) return;
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleLayoutChange = (newLayout) => {
    setLayout(newLayout);
    onLayoutChange?.(newLayout);
  };

  // Row Selection
  const toggleRowSelection = (rowIdx) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(rowIdx)) {
      newSelected.delete(rowIdx);
    } else {
      newSelected.add(rowIdx);
    }
    setSelectedRows(newSelected);
    onRowSelect?.(Array.from(newSelected).map(idx => rows[idx]));
  };

  const toggleAllRows = () => {
    if (selectedRows.size === rows.length) {
      setSelectedRows(new Set());
      onRowSelect?.([]);
    } else {
      const allIndexes = new Set(rows.map((_, idx) => idx));
      setSelectedRows(allIndexes);
      onRowSelect?.(rows);
    }
  };

  // Column Visibility
  const toggleColumn = (key) => {
    const newHidden = new Set(hiddenColumns);
    if (newHidden.has(key)) {
      newHidden.delete(key);
    } else {
      newHidden.add(key);
    }
    setHiddenColumns(newHidden);
  };

  const visibleColumns = columns.filter(col => !hiddenColumns.has(col.key));

  // Inline Editing
  const startEdit = (rowIdx, colKey, currentValue) => {
    if (!enableEditing) return;
    setEditingCell({ rowIdx, colKey });
    setEditValue(currentValue || '');
  };

  const saveEdit = () => {
    if (editingCell) {
      onEdit?.(editingCell.rowIdx, editingCell.colKey, editValue);
      setEditingCell(null);
    }
  };

  const cancelEdit = () => {
    setEditingCell(null);
    setEditValue('');
  };

  // Table Layout
  if (layout === 'tile') {
    return (
      <div>
        {/* Layout Toggle */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => handleLayoutChange('table')}
              style={{
                padding: '8px 16px',
                background: '#f3f4f6',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              📊 Table
            </button>
            <button
              onClick={() => handleLayoutChange('tile')}
              style={{
                padding: '8px 16px',
                background: '#3b82f6',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              🔲 Tiles
            </button>
          </div>
          {enableSelection && selectedRows.size > 0 && (
            <div style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>
              {selectedRows.size} selected
            </div>
          )}
        </div>

        {/* Tile Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '20px',
        }}>
          {sortedRows.map((row, idx) => {
            // Find image column
            const imageCol = visibleColumns.find(col => col.key === 'image' || col.key === 'url' || col.key === 'url2');
            const imageValue = imageCol ? row[imageCol.key] : null;
            
            return (
              <div
                key={idx}
                onClick={() => enableSelection && toggleRowSelection(idx)}
                style={{
                  background: '#fff',
                  border: selectedRows.has(idx) ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  cursor: enableSelection ? 'pointer' : 'default',
                  transition: 'all 0.2s',
                  boxShadow: selectedRows.has(idx) ? '0 4px 12px rgba(59,130,246,0.2)' : '0 1px 3px rgba(0,0,0,0.1)',
                }}
                onMouseEnter={(e) => {
                  if (!selectedRows.has(idx)) {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.15)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!selectedRows.has(idx)) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                  }
                }}
              >
                {/* Image Section - Full Width */}
                {imageValue && (
                  <div style={{
                    width: '100%',
                    height: '200px',
                    background: '#f3f4f6',
                    position: 'relative',
                  }}>
                    {imageCol.render ? (
                      <div style={{ width: '100%', height: '100%' }}>
                        {imageCol.render(imageValue, row)}
                      </div>
                    ) : (
                      <img
                        src={imageValue}
                        alt="Item"
                        loading="lazy"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    )}
                    {enableSelection && (
                      <div style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        background: 'rgba(255,255,255,0.9)',
                        borderRadius: '6px',
                        padding: '4px',
                      }}>
                        <input
                          type="checkbox"
                          checked={selectedRows.has(idx)}
                          onChange={(e) => {
                            e.stopPropagation();
                            toggleRowSelection(idx);
                          }}
                          style={{ cursor: 'pointer', width: '18px', height: '18px' }}
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Content Section */}
                <div style={{ padding: '16px' }}>
                  {visibleColumns
                    .filter(col => col.key !== 'image' && col.key !== 'url' && col.key !== 'url2')
                    .map(col => (
                      <div key={col.key} style={{ marginBottom: '12px' }}>
                        <div style={{ 
                          fontSize: '11px', 
                          color: '#6b7280', 
                          fontWeight: '600', 
                          marginBottom: '4px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                        }}>
                          {col.label}
                        </div>
                        <div style={{ fontSize: '14px', color: '#1f2937', fontWeight: '500' }}>
                          {col.render ? col.render(row[col.key], row) : row[col.key] || '-'}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Table Layout
  return (
    <div>
      {/* Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setLayout('table')}
            style={{
              padding: '8px 16px',
              background: '#3b82f6',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            📊 Table
          </button>
          <button
            onClick={() => setLayout('tile')}
            style={{
              padding: '8px 16px',
              background: '#f3f4f6',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            🔲 Tiles
          </button>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {enableSelection && selectedRows.size > 0 && (
            <div style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>
              {selectedRows.size} selected
            </div>
          )}
          
          {enableColumnToggle && (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowColumnMenu(!showColumnMenu)}
                style={{
                  padding: '8px 16px',
                  background: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                ⚙️ Columns
              </button>
              
              {showColumnMenu && (
                <>
                  <div
                    onClick={() => setShowColumnMenu(false)}
                    style={{
                      position: 'fixed',
                      inset: 0,
                      zIndex: 998,
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    background: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    padding: '8px',
                    minWidth: '200px',
                    zIndex: 999,
                  }}>
                    {columns.map(col => (
                      <label
                        key={col.key}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px',
                          cursor: 'pointer',
                          borderRadius: '4px',
                          fontSize: '14px',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <input
                          type="checkbox"
                          checked={!hiddenColumns.has(col.key)}
                          onChange={() => toggleColumn(col.key)}
                          style={{ cursor: 'pointer' }}
                        />
                        {col.label}
                      </label>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div style={{ width: '100%', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '8px', overflow: 'hidden' }}>
          <thead>
            <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
              {enableSelection && (
                <th style={{ padding: '12px', width: '40px' }}>
                  <input
                    type="checkbox"
                    checked={selectedRows.size === rows.length && rows.length > 0}
                    onChange={toggleAllRows}
                    style={{ cursor: 'pointer' }}
                  />
                </th>
              )}
              {visibleColumns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                  style={{
                    padding: '12px 16px',
                    textAlign: col.align || 'left',
                    cursor: col.sortable !== false && enableSorting ? 'pointer' : 'default',
                    userSelect: 'none',
                    fontWeight: '600',
                    fontSize: '13px',
                    color: '#6b7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    background: sortConfig.key === col.key ? '#f3f4f6' : 'transparent',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: col.align === 'center' ? 'center' : col.align === 'right' ? 'flex-end' : 'flex-start' }}>
                    {col.label}
                    {col.sortable !== false && enableSorting && sortConfig.key === col.key && (
                      <span style={{ fontSize: '12px' }}>
                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedRows.map((row, rowIdx) => (
              <tr
                key={rowIdx}
                style={{
                  borderBottom: '1px solid #f3f4f6',
                  background: selectedRows.has(rowIdx) ? '#eff6ff' : 'transparent',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => !selectedRows.has(rowIdx) && (e.currentTarget.style.background = '#f9fafb')}
                onMouseLeave={(e) => !selectedRows.has(rowIdx) && (e.currentTarget.style.background = 'transparent')}
              >
                {enableSelection && (
                  <td style={{ padding: '12px' }}>
                    <input
                      type="checkbox"
                      checked={selectedRows.has(rowIdx)}
                      onChange={() => toggleRowSelection(rowIdx)}
                      style={{ cursor: 'pointer' }}
                    />
                  </td>
                )}
                {visibleColumns.map((col) => {
                  const isEditing = editingCell?.rowIdx === rowIdx && editingCell?.colKey === col.key;
                  const cellValue = row[col.key];

                  return (
                    <td
                      key={col.key}
                      onDoubleClick={() => col.editable && startEdit(rowIdx, col.key, cellValue)}
                      style={{
                        padding: '12px 16px',
                        textAlign: col.align || 'left',
                        cursor: col.editable && enableEditing ? 'pointer' : 'default',
                      }}
                    >
                      {isEditing ? (
                        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveEdit();
                              if (e.key === 'Escape') cancelEdit();
                            }}
                            autoFocus
                            style={{
                              padding: '4px 8px',
                              border: '1px solid #3b82f6',
                              borderRadius: '4px',
                              fontSize: '14px',
                              width: '100%',
                            }}
                          />
                          <button
                            onClick={saveEdit}
                            style={{
                              padding: '4px 8px',
                              background: '#10b981',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px',
                            }}
                          >
                            ✓
                          </button>
                          <button
                            onClick={cancelEdit}
                            style={{
                              padding: '4px 8px',
                              background: '#ef4444',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px',
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        col.render ? col.render(cellValue, row) : cellValue || '-'
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
