/**
 * Export data to CSV file
 * @param {Array} data - Array of objects to export
 * @param {string} filename - Name of the CSV file
 * @param {Array} columns - Optional array of column keys to include
 */
export function exportToCSV(data, filename = 'export.csv', columns = null) {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Get columns from first object if not provided
  const keys = columns || Object.keys(data[0]);

  // Create CSV header
  const header = keys.join(',');

  // Create CSV rows
  const rows = data.map(row => {
    return keys.map(key => {
      const value = row[key];
      // Handle values with commas, quotes, or newlines
      if (value === null || value === undefined) return '';
      const str = String(value);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    }).join(',');
  });

  // Combine header and rows
  const csv = [header, ...rows].join('\n');

  // Create blob and download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * Export data to PDF (simple text-based PDF)
 * For production, consider using jsPDF library
 */
export function exportToPDF(data, filename = 'export.pdf', title = 'Data Export') {
  console.warn('PDF export requires jsPDF library. Falling back to CSV.');
  exportToCSV(data, filename.replace('.pdf', '.csv'));
}
