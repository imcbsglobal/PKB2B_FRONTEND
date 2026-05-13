import React, { useState } from 'react';

export default function DateRangePicker({ onRangeChange }) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleApply = () => {
    if (startDate && endDate) {
      onRangeChange({ startDate, endDate });
    }
  };

  const handleClear = () => {
    setStartDate('');
    setEndDate('');
    onRangeChange(null);
  };

  const presets = [
    { label: 'Today', days: 0 },
    { label: 'Last 7 days', days: 7 },
    { label: 'Last 30 days', days: 30 },
    { label: 'Last 90 days', days: 90 },
  ];

  const applyPreset = (days) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    
    const endStr = end.toISOString().split('T')[0];
    const startStr = start.toISOString().split('T')[0];
    
    setStartDate(startStr);
    setEndDate(endStr);
    onRangeChange({ startDate: startStr, endDate: endStr });
  };

  return (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          style={{
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px',
          }}
        />
        <span style={{ color: '#6b7280' }}>to</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          style={{
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px',
          }}
        />
        <button
          onClick={handleApply}
          disabled={!startDate || !endDate}
          style={{
            padding: '8px 16px',
            background: '#3b82f6',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: startDate && endDate ? 'pointer' : 'not-allowed',
            opacity: startDate && endDate ? 1 : 0.5,
          }}
        >
          Apply
        </button>
        {(startDate || endDate) && (
          <button
            onClick={handleClear}
            style={{
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
        )}
      </div>
      
      <div style={{ display: 'flex', gap: '6px' }}>
        {presets.map(preset => (
          <button
            key={preset.label}
            onClick={() => applyPreset(preset.days)}
            style={{
              padding: '6px 12px',
              background: '#fff',
              color: '#6b7280',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#f9fafb';
              e.target.style.borderColor = '#d1d5db';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#fff';
              e.target.style.borderColor = '#e5e7eb';
            }}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
}
