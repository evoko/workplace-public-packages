export interface ExportColumn<TData> {
  header: string;
  accessor: (row: TData) => unknown;
}

/**
 * Converts an array of rows and column definitions to a CSV string
 * and triggers a browser download.
 */
export function exportToCsv<TData>(
  rows: TData[],
  columns: ExportColumn<TData>[],
  filename: string = 'export',
): void {
  const csvContent = buildCsvString(rows, columns);
  downloadCsv(csvContent, filename);
}

/**
 * Builds a CSV string from rows and columns.
 * Handles quoting for values that contain commas, quotes, or newlines.
 */
export function buildCsvString<TData>(
  rows: TData[],
  columns: ExportColumn<TData>[],
): string {
  const header = columns.map((col) => escapeCsvField(col.header)).join(',');
  const dataRows = rows.map((row) =>
    columns
      .map((col) => escapeCsvField(formatCsvValue(col.accessor(row))))
      .join(','),
  );
  return [header, ...dataRows].join('\n');
}

function escapeCsvField(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function formatCsvValue(value: unknown): string {
  if (value == null) return '';
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

function downloadCsv(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
