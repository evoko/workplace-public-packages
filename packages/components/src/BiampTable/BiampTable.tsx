import {
  Box,
  type BoxProps,
  Checkbox,
  IconButton,
  Table as MuiTable,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  type Theme,
} from '@mui/material';
import {
  ChevronRightIcon,
  DropdownChevronDownIcon,
  DropdownChevronUpIcon,
} from '@bwp-web/assets';
import { flexRender, type Table } from '@tanstack/react-table';
import React, { type ReactNode, useRef } from 'react';
import { BiampTableEmptyState } from './BiampTableEmptyState';
import { BiampTableErrorState } from './BiampTableErrorState';
import './tanstack-meta';
import { useLoadingDelay } from './useLoadingDelay';

export type BiampTableProps<TData> = BoxProps & {
  /** TanStack Table instance to connect to. */
  table: Table<TData>;
  /** Called when a clickable body row is clicked. Receives the row's original data. */
  onRowClick?: (row: TData) => void;
  /**
   * Controls which rows are clickable. When omitted, all rows are clickable if
   * `onRowClick` is provided. Has no effect when `onRowClick` is not provided.
   */
  isRowClickable?: (row: TData) => boolean;
  /** When true, shows a LinearProgress bar below the table header. */
  loading?: boolean;
  /** When truthy, shown in place of table body rows. Pass `true` or an `Error` for the default error state (an `Error`'s message is displayed), or a custom ReactNode. */
  error?: boolean | Error | ReactNode;
  /** When truthy and the table has no rows, shown instead of an empty body. Pass `true` for the default empty state, or a custom ReactNode. */
  empty?: boolean | ReactNode;
  /** When true, renders a checkbox column for row selection. @default false */
  enableRowSelection?: boolean;
  /** When true, renders an expand/collapse toggle column for rows that have sub-rows. @default false */
  enableExpanding?: boolean;
  /** When true, hides the "select all" header checkbox while keeping individual row checkboxes. */
  hideSelectAll?: boolean;
  /** Returns a human-readable name for a row, used in ARIA labels (e.g. "Select: Conference Room A"). Falls back to row index. */
  getRowLabel?: (row: TData) => string;
};

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
  getRowLabel,
  sx,
  ...boxProps
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
    <TableContainer
      component={Box}
      {...boxProps}
      ref={containerRef}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'auto',
        overscrollBehavior: 'none',
        position: 'relative',
        ...sx,
      }}
    >
      <MuiTable
        aria-busy={showLoading || undefined}
        sx={{ minWidth: tableMinWidth, tableLayout: 'auto' }}
      >
        <TableHead>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {enableRowSelection && (
                <TableCell
                  padding="checkbox"
                  sx={{
                    position: 'sticky',
                    left: 0,
                    zIndex: 3,
                    bgcolor: 'background.paper',
                  }}
                >
                  {!hideSelectAll && (
                    <Checkbox
                      checked={table.getIsAllPageRowsSelected()}
                      indeterminate={table.getIsSomePageRowsSelected()}
                      onChange={table.getToggleAllPageRowsSelectedHandler()}
                      sx={
                        rows.length === 0 ? { visibility: 'hidden' } : undefined
                      }
                      slotProps={{ input: { 'aria-label': 'Select all rows' } }}
                    />
                  )}
                </TableCell>
              )}
              {headerGroup.headers.map((header) => {
                const sticky = header.column.columnDef.meta?.sticky;
                return (
                  <TableCell
                    key={header.id}
                    data-sticky={sticky || undefined}
                    sortDirection={header.column.getIsSorted() || false}
                    {...(header.column.getCanSort() && {
                      'aria-sort': header.column.getIsSorted()
                        ? header.column.getIsSorted() === 'asc'
                          ? 'ascending'
                          : 'descending'
                        : 'none',
                    })}
                    sx={{
                      minWidth: sticky
                        ? undefined
                        : (header.column.columnDef.meta?.minWidth ?? 40),
                      ...(sticky && {
                        position: 'sticky',
                        [sticky]: 0,
                        zIndex: 3,
                        width: 0,
                        whiteSpace: 'nowrap',
                        textAlign: 'center',
                        bgcolor: 'background.paper',
                      }),
                    }}
                  >
                    {header.isPlaceholder ? null : header.column.getCanSort() ? (
                      <TableSortLabel
                        active={!!header.column.getIsSorted()}
                        direction={header.column.getIsSorted() || 'asc'}
                        onClick={header.column.getToggleSortingHandler()}
                        {...(header.column.getIsSorted() && {
                          IconComponent:
                            header.column.getIsSorted() === 'asc'
                              ? DropdownChevronUpIcon
                              : DropdownChevronDownIcon,
                        })}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                      </TableSortLabel>
                    ) : (
                      flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )
                    )}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableHead>

        <TableBody sx={{ opacity: showLoading ? 0.3 : 1 }}>
          {!showError &&
            rows.map((row) => {
              const clickable = onRowClick
                ? isRowClickable
                  ? isRowClickable(row.original)
                  : true
                : false;

              return (
                <TableRow
                  key={row.id}
                  hover={clickable}
                  selected={
                    enableRowSelection ? row.getIsSelected() : undefined
                  }
                  role={clickable ? 'button' : undefined}
                  tabIndex={clickable ? 0 : undefined}
                  sx={{ cursor: clickable ? 'pointer' : undefined }}
                  onClick={
                    clickable && onRowClick
                      ? () => onRowClick(row.original)
                      : undefined
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
                    <TableCell
                      padding="checkbox"
                      sx={{
                        position: 'sticky',
                        left: 0,
                        zIndex: 2,
                        bgcolor: 'background.paper',
                        '.MuiTableRow-hover:hover > &, .Mui-selected > &': {
                          bgcolor: ({ palette }) =>
                            palette.mode === 'dark'
                              ? palette.grey[800]
                              : palette.grey[100],
                        },
                      }}
                    >
                      <Checkbox
                        checked={row.getIsSelected()}
                        disabled={!row.getCanSelect()}
                        onChange={row.getToggleSelectedHandler()}
                        onClick={(e) => e.stopPropagation()}
                        sx={
                          !row.getCanSelect()
                            ? { visibility: 'hidden' }
                            : undefined
                        }
                        slotProps={{
                          input: {
                            'aria-label': getRowLabel
                              ? `Select ${getRowLabel(row.original)}`
                              : `Select row ${row.index + 1}`,
                          },
                        }}
                      />
                    </TableCell>
                  )}
                  {row.getVisibleCells().map((cell, cellIndex, cells) => {
                    const sticky = cell.column.columnDef.meta?.sticky;
                    const isExpandCell =
                      enableExpanding &&
                      !sticky &&
                      cellIndex ===
                        cells.findIndex(
                          (c) => !c.column.columnDef.meta?.sticky,
                        );
                    return (
                      <TableCell
                        key={cell.id}
                        data-sticky={sticky || undefined}
                        sx={{
                          minWidth: sticky
                            ? undefined
                            : (cell.column.columnDef.meta?.minWidth ?? 40),
                          ...(sticky && {
                            position: 'sticky',
                            [sticky]: 0,
                            zIndex: 2,
                            width: 0,
                            whiteSpace: 'nowrap',
                            textAlign: 'center',
                            bgcolor: 'background.paper',
                            '.MuiTableRow-hover:hover > &, .Mui-selected > &': {
                              bgcolor: ({ palette }: Theme) =>
                                palette.mode === 'dark'
                                  ? palette.grey[800]
                                  : palette.grey[100],
                            },
                          }),
                        }}
                      >
                        {isExpandCell ? (
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              pl: `${row.depth * 12}px`,
                            }}
                          >
                            {row.getCanExpand() ? (
                              <IconButton
                                variant="none"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  row.toggleExpanded();
                                }}
                                aria-label={
                                  row.getIsExpanded()
                                    ? `Collapse ${getRowLabel ? getRowLabel(row.original) : `row ${row.index + 1}`}`
                                    : `Expand ${getRowLabel ? getRowLabel(row.original) : `row ${row.index + 1}`}`
                                }
                                aria-expanded={row.getIsExpanded()}
                              >
                                <ChevronRightIcon
                                  variant="xs"
                                  sx={{
                                    color: ({ palette }) =>
                                      palette.text.secondary,
                                    transition: 'transform 150ms ease',
                                    transform: row.getIsExpanded()
                                      ? 'rotate(90deg)'
                                      : 'rotate(0deg)',
                                  }}
                                />
                              </IconButton>
                            ) : hasExpandableRows ? (
                              <Box sx={{ width: 28 }} />
                            ) : null}
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </Box>
                        ) : (
                          flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
        </TableBody>
      </MuiTable>

      {showError && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          {error === true ? (
            <BiampTableErrorState sx={{ pointerEvents: 'auto' }} />
          ) : error instanceof Error ? (
            <BiampTableErrorState
              description={error.message}
              sx={{ pointerEvents: 'auto' }}
            />
          ) : (
            error
          )}
        </Box>
      )}

      {showEmpty && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          {empty && empty !== true ? (
            empty
          ) : (
            <BiampTableEmptyState sx={{ pointerEvents: 'auto' }} />
          )}
        </Box>
      )}
    </TableContainer>
  );
}
