import {
  ChevronDownIcon,
  ChevronRightIcon,
  DropdownChevronDownIcon,
  DropdownChevronUpIcon,
} from '@bwp-web/assets';
import { flexRender, type Row, type Table } from '@tanstack/react-table';
import React, { type HTMLAttributes, type ReactNode, useRef } from 'react';
import { BiampTableEmptyState } from './BiampTableEmptyState';
import { BiampTableErrorState } from './BiampTableErrorState';
import { BiampTableTruncatedCell } from './BiampTableTruncatedCell';
import { useLoadingDelay } from './useLoadingDelay';

// ── Row-click props ────────────────────────────────────────────────
type RowClickProps<TData> =
  | {
      /** Called when a clickable body row is clicked. Receives the row's original data. */
      onRowClick: (row: TData) => void;
      /**
       * Controls which rows are clickable. When omitted, all rows are clickable if
       * `onRowClick` is provided.
       */
      isRowClickable?: (row: TData) => boolean;
    }
  | {
      onRowClick?: undefined;
      isRowClickable?: never;
    };

// ── Selection + expanding props ────────────────────────────────────
type SelectionExpandingProps =
  | {
      /** When true, renders a checkbox column for row selection. */
      enableRowSelection: true;
      /** When true, renders an expand/collapse toggle column for rows that have sub-rows. */
      enableExpanding: true;
      /** When true, hides the "select all" header checkbox while keeping individual row checkboxes. */
      hideSelectAll?: boolean;
      /** When true, selecting a parent row also selects/deselects its children. @default false */
      selectChildrenWithParent?: boolean;
    }
  | {
      /** When true, renders a checkbox column for row selection. */
      enableRowSelection: true;
      enableExpanding?: false;
      /** When true, hides the "select all" header checkbox while keeping individual row checkboxes. */
      hideSelectAll?: boolean;
      selectChildrenWithParent?: never;
    }
  | {
      enableRowSelection?: false;
      enableExpanding?: boolean;
      hideSelectAll?: never;
      selectChildrenWithParent?: never;
    };

export type BiampTableProps<TData> = HTMLAttributes<HTMLDivElement> &
  RowClickProps<TData> &
  SelectionExpandingProps & {
    /** TanStack Table instance to connect to. */
    table: Table<TData>;
    /** When true, shows a loading indicator. */
    loading?: boolean;
    /** When truthy, shown in place of table body rows. Pass `true` or an `Error` for the default error state (an `Error`'s message is displayed), or a custom ReactNode. */
    error?: boolean | Error | ReactNode;
    /** When truthy and the table has no rows, shown instead of an empty body. Pass `true` for the default empty state, or a custom ReactNode. */
    empty?: boolean | ReactNode;
    /** Returns a human-readable name for a row, used in ARIA labels (e.g. "Select: Conference Room A"). Falls back to row index. */
    getRowLabel?: (row: TData) => string;
  };

// ── Style helpers ────────────────────────────────────────────────

const overlayStyle: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  pointerEvents: 'none',
};

function cellStyle(
  sticky: 'left' | 'right' | undefined,
  minWidth: number | string | undefined,
  zIndex: number,
): React.CSSProperties {
  if (sticky) {
    return {
      position: 'sticky',
      [sticky]: 0,
      zIndex,
      width: 0,
      whiteSpace: 'nowrap',
      textAlign: 'center',
      backgroundColor: 'var(--solar-surface-default, #fff)',
    };
  }
  const mw = minWidth ?? 40;
  return {
    minWidth: typeof mw === 'number' ? mw : undefined,
    whiteSpace: 'nowrap',
  };
}

const selectionCellStyle: React.CSSProperties = {
  position: 'sticky',
  left: 0,
  zIndex: 2,
  backgroundColor: 'var(--solar-surface-default, #fff)',
};

const headerSelectionCellStyle: React.CSSProperties = {
  position: 'sticky',
  left: 0,
  zIndex: 3,
  backgroundColor: 'var(--solar-surface-default, #fff)',
};

const expandCellBaseStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '2px',
};

// ── Memoized row ─────────────────────────────────────────────────

type BiampTableRowProps<TData> = {
  row: Row<TData>;
  isExpanded: boolean;
  isSelected: boolean;
  onRowClick?: (row: TData) => void;
  isRowClickable?: (row: TData) => boolean;
  enableRowSelection: boolean;
  enableExpanding: boolean;
  selectChildrenWithParent: boolean;
  getRowLabel?: (row: TData) => string;
  hasExpandableRows: boolean;
};

function BiampTableRowInner<TData>({
  row,
  isExpanded,
  isSelected,
  onRowClick,
  isRowClickable,
  enableRowSelection,
  enableExpanding,
  selectChildrenWithParent,
  getRowLabel,
  hasExpandableRows,
}: BiampTableRowProps<TData>) {
  const clickable = onRowClick
    ? isRowClickable
      ? isRowClickable(row.original)
      : true
    : false;

  return (
    <tr
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      style={{
        cursor: clickable ? 'pointer' : undefined,
        backgroundColor:
          enableRowSelection && isSelected
            ? 'var(--solar-surface-selected, rgba(25, 118, 210, 0.08))'
            : undefined,
      }}
      onClick={
        clickable && onRowClick ? () => onRowClick(row.original) : undefined
      }
      onKeyDown={
        clickable && onRowClick
          ? (e: React.KeyboardEvent) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onRowClick(row.original);
              }
            }
          : undefined
      }
    >
      {enableRowSelection && (
        <td style={{ ...selectionCellStyle, padding: '0 4px' }}>
          <input
            type="checkbox"
            checked={isSelected}
            disabled={!row.getCanSelect()}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              row.toggleSelected(e.target.checked, {
                selectChildren: selectChildrenWithParent,
              })
            }
            onClick={(e) => e.stopPropagation()}
            style={{
              visibility: !row.getCanSelect() ? 'hidden' : undefined,
              cursor: 'pointer',
            }}
            aria-label={
              getRowLabel
                ? `Select ${getRowLabel(row.original)}`
                : `Select row ${row.index + 1}`
            }
          />
        </td>
      )}
      {row.getVisibleCells().map((cell, cellIndex, cells) => {
        const sticky = cell.column.columnDef.meta?.sticky;
        const isExpandCell =
          enableExpanding &&
          !sticky &&
          cellIndex ===
            cells.findIndex((c) => !c.column.columnDef.meta?.sticky);

        const content = flexRender(
          cell.column.columnDef.cell,
          cell.getContext(),
        );

        return (
          <td
            key={cell.id}
            data-sticky={sticky || undefined}
            style={{
              ...cellStyle(sticky, cell.column.columnDef.meta?.minWidth, 2),
              paddingLeft: isExpandCell ? '6px' : '12px',
              paddingRight: '12px',
              paddingTop: '8px',
              paddingBottom: '8px',
              borderBottom: '1px solid var(--solar-border-default)',
            }}
          >
            {(() => {
              if (sticky) return content;

              const truncate = cell.column.columnDef.meta?.truncate ?? true;
              const truncated = truncate ? (
                <BiampTableTruncatedCell>{content}</BiampTableTruncatedCell>
              ) : (
                content
              );

              if (!isExpandCell) return truncated;

              const rowLabel = getRowLabel
                ? getRowLabel(row.original)
                : `row ${row.index + 1}`;

              return (
                <div
                  style={
                    row.depth > 0
                      ? {
                          ...expandCellBaseStyle,
                          paddingLeft: `${row.depth * 12}px`,
                        }
                      : expandCellBaseStyle
                  }
                >
                  {row.getCanExpand() ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        row.toggleExpanded();
                      }}
                      aria-label={
                        isExpanded
                          ? `Collapse ${rowLabel}`
                          : `Expand ${rowLabel}`
                      }
                      aria-expanded={isExpanded}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'none',
                        border: 'none',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        padding: '4px',
                        color: 'var(--solar-text-secondary)',
                      }}
                    >
                      {isExpanded ? (
                        <ChevronDownIcon
                          variant="xs"
                          style={{ color: 'var(--solar-text-secondary)' }}
                        />
                      ) : (
                        <ChevronRightIcon
                          variant="xs"
                          style={{ color: 'var(--solar-text-secondary)' }}
                        />
                      )}
                    </button>
                  ) : hasExpandableRows ? (
                    <div style={{ width: 28 }} />
                  ) : null}
                  {truncated}
                </div>
              );
            })()}
          </td>
        );
      })}
    </tr>
  );
}

function biampTableRowPropsAreEqual<TData>(
  prev: BiampTableRowProps<TData>,
  next: BiampTableRowProps<TData>,
) {
  return (
    prev.row.id === next.row.id &&
    prev.row.original === next.row.original &&
    prev.isSelected === next.isSelected &&
    prev.isExpanded === next.isExpanded &&
    prev.row.getVisibleCells().length === next.row.getVisibleCells().length &&
    prev.enableRowSelection === next.enableRowSelection &&
    prev.enableExpanding === next.enableExpanding &&
    prev.hasExpandableRows === next.hasExpandableRows &&
    prev.selectChildrenWithParent === next.selectChildrenWithParent &&
    prev.onRowClick === next.onRowClick &&
    prev.isRowClickable === next.isRowClickable &&
    prev.getRowLabel === next.getRowLabel
  );
}

const BiampTableRow = React.memo(
  BiampTableRowInner,
  biampTableRowPropsAreEqual,
) as typeof BiampTableRowInner;

// ── Component ────────────────────────────────────────────────────

export function BiampTable<TData>({
  table,
  onRowClick,
  isRowClickable,
  loading,
  error,
  empty,
  enableRowSelection = false,
  enableExpanding = false,
  hideSelectAll,
  selectChildrenWithParent = false,
  getRowLabel,
  style,
  ...divProps
}: BiampTableProps<TData>) {
  // Sum visible column min-widths so the <table> element itself gets a concrete
  // minWidth. Without this, `width: 100%` on the table always fills the container
  // and columns just share available space instead of overflowing horizontally.
  const tableMinWidth = table.getVisibleLeafColumns().reduce(
    (sum, col) => {
      const mw = col.columnDef.meta?.minWidth;
      return sum + (typeof mw === 'number' ? mw : 40);
    },
    enableRowSelection ? 48 : 0,
  );

  const containerRef = useRef<HTMLDivElement>(null);

  const showLoading = useLoadingDelay(!!loading);

  const rows = table.getRowModel().rows;
  const hasExpandableRows =
    enableExpanding && rows.some((r) => r.getCanExpand());
  const showError = !!error && !loading;
  const showEmpty = !showError && !loading && rows.length === 0;

  return (
    <div
      ref={containerRef}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        position: 'relative',
        overflow: 'auto',
        ...style,
      }}
      {...divProps}
    >
      <table
        aria-busy={showLoading || undefined}
        style={{
          minWidth: tableMinWidth,
          tableLayout: 'auto',
          width: '100%',
          borderCollapse: 'collapse',
          borderSpacing: 0,
          fontSize: '0.875rem',
          color: 'var(--solar-text-default)',
        }}
      >
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {enableRowSelection && (
                <th
                  style={{
                    ...headerSelectionCellStyle,
                    padding: '0 4px',
                    borderBottom: '2px solid var(--solar-border-default)',
                    textAlign: 'left',
                    fontWeight: 600,
                  }}
                >
                  {!hideSelectAll && (
                    <input
                      type="checkbox"
                      checked={table.getIsAllPageRowsSelected()}
                      ref={(el) => {
                        if (el) {
                          el.indeterminate = table.getIsSomePageRowsSelected();
                        }
                      }}
                      onChange={table.getToggleAllPageRowsSelectedHandler()}
                      style={{
                        visibility: rows.length === 0 ? 'hidden' : undefined,
                        cursor: 'pointer',
                      }}
                      aria-label="Select all rows"
                    />
                  )}
                </th>
              )}
              {headerGroup.headers.map((header) => {
                const sticky = header.column.columnDef.meta?.sticky;
                const sorted = header.column.getIsSorted();
                return (
                  <th
                    key={header.id}
                    data-sticky={sticky || undefined}
                    aria-sort={
                      header.column.getCanSort()
                        ? sorted
                          ? sorted === 'asc'
                            ? 'ascending'
                            : 'descending'
                          : 'none'
                        : undefined
                    }
                    style={{
                      ...cellStyle(
                        sticky,
                        header.column.columnDef.meta?.minWidth,
                        3,
                      ),
                      padding: '8px 12px',
                      borderBottom: '2px solid var(--solar-border-default)',
                      textAlign: 'left',
                      fontWeight: 600,
                      fontSize: '0.75rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: 'var(--solar-text-secondary)',
                    }}
                  >
                    {header.isPlaceholder ? null : header.column.getCanSort() ? (
                      <button
                        type="button"
                        onClick={header.column.getToggleSortingHandler()}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: 0,
                          font: 'inherit',
                          color: 'inherit',
                          fontWeight: 'inherit',
                          textTransform: 'inherit',
                          letterSpacing: 'inherit',
                        }}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        {sorted &&
                          (sorted === 'asc' ? (
                            <DropdownChevronUpIcon />
                          ) : (
                            <DropdownChevronDownIcon />
                          ))}
                        {!sorted && (
                          <span
                            style={{
                              display: 'inline-flex',
                              opacity: 0,
                              width: 0,
                              overflow: 'hidden',
                            }}
                            aria-hidden
                          />
                        )}
                      </button>
                    ) : (
                      flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )
                    )}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>

        <tbody style={{ opacity: showLoading ? 0.3 : 1 }}>
          {!showError &&
            rows.map((row) => (
              <BiampTableRow
                key={row.id}
                row={row}
                isExpanded={row.getIsExpanded()}
                isSelected={row.getIsSelected()}
                onRowClick={onRowClick}
                isRowClickable={isRowClickable}
                enableRowSelection={enableRowSelection}
                enableExpanding={enableExpanding}
                selectChildrenWithParent={selectChildrenWithParent}
                getRowLabel={getRowLabel}
                hasExpandableRows={hasExpandableRows}
              />
            ))}
        </tbody>
      </table>

      {showError && (
        <div style={overlayStyle}>
          {error === true ? (
            <BiampTableErrorState style={{ pointerEvents: 'auto' }} />
          ) : error instanceof Error ? (
            <BiampTableErrorState
              description={error.message}
              style={{ pointerEvents: 'auto' }}
            />
          ) : (
            error
          )}
        </div>
      )}

      {showEmpty && (
        <div style={overlayStyle}>
          {empty && empty !== true ? (
            empty
          ) : (
            <BiampTableEmptyState style={{ pointerEvents: 'auto' }} />
          )}
        </div>
      )}
    </div>
  );
}
