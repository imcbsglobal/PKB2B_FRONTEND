// ============================================================
// PEEKAY — Date Utilities
// All date formatting must go through these functions.
// Default display format: dd/mm/yyyy
// ============================================================

/**
 * Format any date value to dd/mm/yyyy
 * @param {Date|string|number} value
 * @returns {string}  e.g. "07/05/2026"
 */
export function formatDate(value) {
  if (!value) return '—';
  const d = value instanceof Date ? value : new Date(value);
  if (isNaN(d.getTime())) return 'Invalid date';
  const dd   = String(d.getDate()).padStart(2, '0');
  const mm   = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

/**
 * Format to dd/mm/yyyy hh:mm (24-hour)
 * @param {Date|string|number} value
 * @returns {string}  e.g. "07/05/2026 14:30"
 */
export function formatDateTime(value) {
  if (!value) return '—';
  const d = value instanceof Date ? value : new Date(value);
  if (isNaN(d.getTime())) return 'Invalid date';
  const date = formatDate(d);
  const hh   = String(d.getHours()).padStart(2, '0');
  const min  = String(d.getMinutes()).padStart(2, '0');
  return `${date} ${hh}:${min}`;
}

/**
 * Format to dd/mm/yyyy hh:mm:ss
 * @param {Date|string|number} value
 * @returns {string}
 */
export function formatDateTimeSec(value) {
  if (!value) return '—';
  const d = value instanceof Date ? value : new Date(value);
  if (isNaN(d.getTime())) return 'Invalid date';
  const dt  = formatDateTime(d);
  const sec = String(d.getSeconds()).padStart(2, '0');
  return `${dt}:${sec}`;
}

/**
 * Human-readable relative time ("2 minutes ago", "3 days ago")
 * @param {Date|string|number} value
 * @returns {string}
 */
export function formatRelative(value) {
  if (!value) return '—';
  const d   = value instanceof Date ? value : new Date(value);
  const now = Date.now();
  const diffMs = now - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr  = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr  / 24);

  if (diffSec < 60)  return 'Just now';
  if (diffMin < 60)  return `${diffMin} min ago`;
  if (diffHr  < 24)  return `${diffHr} hr ago`;
  if (diffDay < 7)   return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
  return formatDate(d);
}

/**
 * Format to short month format "07 May 2026"
 * @param {Date|string|number} value
 * @returns {string}
 */
export function formatDateLong(value) {
  if (!value) return '—';
  const d = value instanceof Date ? value : new Date(value);
  if (isNaN(d.getTime())) return 'Invalid date';
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

/**
 * Parse a dd/mm/yyyy string back to a Date object
 * @param {string} str  e.g. "07/05/2026"
 * @returns {Date}
 */
export function parseDate(str) {
  if (!str || typeof str !== 'string') return null;
  const [dd, mm, yyyy] = str.split('/').map(Number);
  if (!dd || !mm || !yyyy) return null;
  return new Date(yyyy, mm - 1, dd);
}

/**
 * Convert a Date to the HTML <input type="date"> value format (yyyy-mm-dd)
 * Use this when setting defaultValue on date inputs.
 * @param {Date|string|number} value
 * @returns {string}  e.g. "2026-05-07"
 */
export function toInputDate(value) {
  if (!value) return '';
  const d = value instanceof Date ? value : new Date(value);
  if (isNaN(d.getTime())) return '';
  const dd   = String(d.getDate()).padStart(2, '0');
  const mm   = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${yyyy}-${mm}-${dd}`;
}

/** Today's date as dd/mm/yyyy */
export const TODAY = formatDate(new Date());

/** Today's date as a Date object (midnight) */
export function today() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}