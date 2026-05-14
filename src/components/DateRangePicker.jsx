import React, { useState } from 'react';
import Button from './Button';

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
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          style={{
            padding: '8px 12px',
            border: '1px solid var(--color-border)',
            borderRadius: '6px',
            fontSize: '14px',
          }}
        />
        <span style={{ color: 'var(--color-muted-fg)' }}>to</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          style={{
            padding: '8px 12px',
            border: '1px solid var(--color-border)',
            borderRadius: '6px',
            fontSize: '14px',
          }}
        />
        <Button variant="primary" size="sm" onClick={handleApply} disabled={!startDate || !endDate}>
          Apply
        </Button>
        {(startDate || endDate) && (
          <Button variant="outline" size="sm" onClick={handleClear}>
            Clear
          </Button>
        )}
      </div>

      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {presets.map((preset) => (
          <button
            key={preset.label}
            onClick={() => applyPreset(preset.days)}
            style={{
              padding: '6px 12px',
              background: 'var(--color-card)',
              color: 'var(--color-muted-fg)',
              border: '1px solid var(--color-border)',
              borderRadius: '6px',
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--color-muted)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--color-card)';
            }}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
}
