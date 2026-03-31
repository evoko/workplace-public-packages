import { useEffect, useRef } from 'react';
import type { Table } from '@tanstack/react-table';

export type BiampTablePaginationProps<TData> = {
  /** TanStack Table instance to connect to. */
  table: Table<TData>;
  /** Rows-per-page options. When omitted, the selector is hidden and defaults to 25. */
  rowsPerPageOptions?: number[];
  /** When true, keeps the previous row count visible instead of dropping to 0. */
  loading?: boolean;
  /** Hide pagination when all rows fit on one page. @default true */
  autoHide?: boolean;
  /** Horizontal alignment of the pagination controls. @default 'center' */
  position?: 'left' | 'center' | 'right';
  className?: string;
  style?: React.CSSProperties;
};

const positionMap = {
  left: 'flex-start',
  center: 'center',
  right: 'flex-end',
};

export function BiampTablePagination<TData>({
  table,
  rowsPerPageOptions,
  loading,
  autoHide = true,
  position = 'center',
  className,
  style,
}: BiampTablePaginationProps<TData>) {
  const rowCount = table.getRowCount();
  const lastRowCountRef = useRef(rowCount);

  // Update the stable count only when not loading and the count is meaningful.
  if (!loading && rowCount >= 0) {
    lastRowCountRef.current = rowCount;
  }

  const stableCount = loading ? lastRowCountRef.current : rowCount;
  const { pageSize, pageIndex } = table.getState().pagination;

  // Auto-correct page when row count drops (e.g. after filtering)
  const maxPage = Math.max(0, Math.ceil(stableCount / pageSize) - 1);
  useEffect(() => {
    if (!loading && pageIndex > maxPage) {
      table.setPageIndex(maxPage);
    }
  }, [loading, pageIndex, maxPage, table]);

  // Hide when there's no data or everything fits on one page
  if (autoHide && (!stableCount || stableCount <= pageSize)) return null;

  const totalPages = Math.ceil(stableCount / pageSize);
  const from = pageIndex * pageSize + 1;
  const to = Math.min((pageIndex + 1) * pageSize, stableCount);

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        justifyContent: positionMap[position],
        alignItems: 'center',
        height: 40,
        minHeight: 40,
        gap: '8px',
        fontSize: '0.875rem',
        color: 'var(--solar-text-default)',
        ...style,
      }}
    >
      {/* Rows per page selector */}
      {rowsPerPageOptions && rowsPerPageOptions.length > 0 && (
        <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span>Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              table.setPageSize(Number(e.target.value));
              table.setPageIndex(0);
            }}
            style={{
              padding: '2px 4px',
              border: '1px solid var(--solar-border-default)',
              borderRadius: 4,
              background: 'var(--solar-surface-default, transparent)',
              color: 'inherit',
              fontSize: 'inherit',
            }}
          >
            {rowsPerPageOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </label>
      )}

      {/* Row count display */}
      <span>
        {from}-{to} of {stableCount}
      </span>

      {/* Navigation buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
        <button
          type="button"
          aria-label="Go to first page"
          disabled={pageIndex === 0}
          onClick={() => table.setPageIndex(0)}
          style={navButtonStyle}
        >
          {'\u00AB'}
        </button>
        <button
          type="button"
          aria-label="Go to previous page"
          disabled={pageIndex === 0}
          onClick={() => table.setPageIndex(pageIndex - 1)}
          style={navButtonStyle}
        >
          {'\u2039'}
        </button>
        <button
          type="button"
          aria-label="Go to next page"
          disabled={pageIndex >= totalPages - 1}
          onClick={() => table.setPageIndex(pageIndex + 1)}
          style={navButtonStyle}
        >
          {'\u203A'}
        </button>
        <button
          type="button"
          aria-label="Go to last page"
          disabled={pageIndex >= totalPages - 1}
          onClick={() => table.setPageIndex(totalPages - 1)}
          style={navButtonStyle}
        >
          {'\u00BB'}
        </button>
      </div>
    </div>
  );
}

const navButtonStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 32,
  height: 32,
  padding: 0,
  border: 'none',
  borderRadius: '50%',
  background: 'none',
  color: 'inherit',
  cursor: 'pointer',
  fontSize: '1.25rem',
};
