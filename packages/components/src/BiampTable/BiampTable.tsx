import {
  Box,
  type BoxProps,
  Checkbox,
  Table as MuiTable,
  TableBody,
  type TableBodyProps as MuiTableBodyProps,
  TableCell,
  type TableCellProps as MuiTableCellProps,
  TableContainer,
  TableHead,
  type TableHeadProps as MuiTableHeadProps,
  type TableProps as MuiTableProps,
  TableRow,
  type TableRowProps as MuiTableRowProps,
  TableSortLabel,
} from '@mui/material';
import {
  DropdownChevronDownIcon,
  DropdownChevronUpIcon,
} from '@bwp-web/assets';
import {
  flexRender,
  type Cell,
  type Header,
  type Row,
  type Table,
} from '@tanstack/react-table';
import { type ReactNode, useEffect, useRef } from 'react';
import { BiampTableEmptyState } from './BiampTableEmptyState';
import { BiampTableErrorState } from './BiampTableErrorState';
import { BiampTableRow } from './BiampTableRow';
import { useLoadingDelay } from './useLoadingDelay';
import { mergeSx, resolveSlot, type SlotPropsOrFn } from './slotProps';
import { cellSx } from './cellSx';

// ── Slot props ─────────────────────────────────────────────────────

export type BiampTableSlotProps<TData> = {
  /** Props merged onto the MUI `<Table>`. `sx` composes with defaults. */
  table?: MuiTableProps;
  /** Props merged onto the `<TableHead>`. `sx` composes with defaults. */
  head?: MuiTableHeadProps;
  /** Props merged onto the `<TableBody>`. `sx` composes with defaults. */
  body?: MuiTableBodyProps;
  /** Props merged onto the header `<TableRow>`. `sx` composes with defaults. */
  headerRow?: MuiTableRowProps;
  /** Props merged onto each header `<TableCell>`. Pass a function for per-column overrides. `sx` composes with defaults. */
  headerCell?: SlotPropsOrFn<
    MuiTableCellProps,
    { header: Header<TData, unknown> }
  >;
  /** Props merged onto each body `<TableRow>`. Pass a function for per-row overrides. `sx` composes with defaults. */
  row?: SlotPropsOrFn<MuiTableRowProps, { row: Row<TData> }>;
  /** Props merged onto each body `<TableCell>`. Pass a function for per-cell overrides. `sx` composes with defaults. */
  cell?: SlotPropsOrFn<MuiTableCellProps, { cell: Cell<TData, unknown> }>;
};

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
type SelectionExpandingProps = {
  /** When true, renders a checkbox column for row selection. */
  enableRowSelection?: boolean;
  /** When true, renders an expand/collapse toggle column for rows that have sub-rows. */
  enableExpanding?: boolean;
  /** When true with `enableExpanding`, all rows stay expanded and the expand/collapse toggles are not rendered. */
  alwaysExpanded?: boolean;
  /** When true, hides the "select all" header checkbox while keeping individual row checkboxes. Only applies when `enableRowSelection` is true. */
  hideSelectAll?: boolean;
  /** When true, selecting a parent row also selects/deselects its children. Only applies when both `enableRowSelection` and `enableExpanding` are true. @default false */
  selectChildrenWithParent?: boolean;
  /** When true, draws non-interactive tree-style guidelines connecting parent rows to their child rows. Only applies when `alwaysExpanded` is also true. */
  showExpandGuidelines?: boolean;
};

export type BiampTableProps<TData> = BoxProps &
  RowClickProps<TData> &
  SelectionExpandingProps & {
    /** TanStack Table instance to connect to. */
    table: Table<TData>;
    /** When true, shows a LinearProgress bar below the table header. */
    loading?: boolean;
    /** When truthy, shown in place of table body rows. Pass `true` or an `Error` for the default error state (an `Error`'s message is displayed), or a custom ReactNode. */
    error?: boolean | Error | ReactNode;
    /** When truthy and the table has no rows, shown instead of an empty body. Pass `true` for the default empty state, or a custom ReactNode. */
    empty?: boolean | ReactNode;
    /** Returns a human-readable name for a row, used in ARIA labels (e.g. "Select: Conference Room A"). Falls back to row index. */
    getRowLabel?: (row: TData) => string;
    /**
     * Returns a background color for a row (any valid CSS color). Applied to
     * the row and to all sticky cells (selection column, sticky action columns)
     * so the row reads as a single tinted band. Hover and selected backgrounds
     * override the custom color — whatever the theme defines for those states
     * wins. Use opaque colors so sticky cells fully cover scrolled content.
     * Return `undefined` to leave a row at its default color.
     */
    setRowColor?: (row: TData) => string | undefined;
    /**
     * Per-slot props merged onto the internal MUI elements (`table`, `head`, `body`,
     * `headerRow`, `headerCell`, `row`, `cell`). `sx` composes with the defaults
     * instead of replacing them. `row`, `cell`, and `headerCell` accept a function
     * of the row/cell/header for data-aware overrides — memoize these callbacks to
     * avoid breaking row memoization.
     */
    slotProps?: BiampTableSlotProps<TData>;
  };

// ── Local sx helpers ─────────────────────────────────────────────

const overlaySx = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  pointerEvents: 'none',
} as const;

const headerSelectionCellSx = {
  position: 'sticky',
  left: 0,
  zIndex: 3,
  bgcolor: 'background.paper',
} as const;

const checkboxHiddenHeaderSx = { visibility: 'hidden' } as const;

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
  alwaysExpanded = false,
  hideSelectAll,
  selectChildrenWithParent = false,
  showExpandGuidelines = false,
  getRowLabel,
  setRowColor,
  slotProps,
  sx,
  ...boxProps
}: BiampTableProps<TData>) {
  const { sx: userTableSx, ...restTableSlotProps } = slotProps?.table ?? {};
  const { sx: userHeadSx, ...restHeadSlotProps } = slotProps?.head ?? {};
  const { sx: userBodySx, ...restBodySlotProps } = slotProps?.body ?? {};
  const { sx: userHeaderRowSx, ...restHeaderRowSlotProps } =
    slotProps?.headerRow ?? {};
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

  useEffect(() => {
    if (enableExpanding && alwaysExpanded) {
      table.toggleAllRowsExpanded(true);
    }
  }, [enableExpanding, alwaysExpanded, table]);

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
        position: 'relative',
        ...sx,
      }}
    >
      <MuiTable
        aria-busy={showLoading || undefined}
        {...restTableSlotProps}
        sx={mergeSx(
          { minWidth: tableMinWidth, tableLayout: 'auto' },
          userTableSx,
        )}
      >
        <TableHead {...restHeadSlotProps} sx={mergeSx(userHeadSx)}>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow
              key={headerGroup.id}
              {...restHeaderRowSlotProps}
              sx={mergeSx(userHeaderRowSx)}
            >
              {enableRowSelection && (
                <TableCell padding="checkbox" sx={headerSelectionCellSx}>
                  {!hideSelectAll && (
                    <Checkbox
                      checked={table.getIsAllPageRowsSelected()}
                      indeterminate={table.getIsSomePageRowsSelected()}
                      onChange={table.getToggleAllPageRowsSelectedHandler()}
                      sx={
                        rows.length === 0 ? checkboxHiddenHeaderSx : undefined
                      }
                      slotProps={{ input: { 'aria-label': 'Select all rows' } }}
                    />
                  )}
                </TableCell>
              )}
              {headerGroup.headers.map((header) => {
                const sticky = header.column.columnDef.meta?.sticky;
                const resolvedHeaderCell = resolveSlot(slotProps?.headerCell, {
                  header,
                });
                const { sx: userHeaderCellSx, ...restHeaderCellProps } =
                  resolvedHeaderCell ?? {};
                return (
                  <TableCell
                    key={header.id}
                    {...restHeaderCellProps}
                    data-sticky={sticky || undefined}
                    sortDirection={header.column.getIsSorted() || false}
                    {...(header.column.getCanSort() && {
                      'aria-sort': header.column.getIsSorted()
                        ? header.column.getIsSorted() === 'asc'
                          ? 'ascending'
                          : 'descending'
                        : 'none',
                    })}
                    sx={mergeSx(
                      cellSx(sticky, header.column.columnDef.meta?.minWidth, 3),
                      userHeaderCellSx,
                    )}
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

        <TableBody
          {...restBodySlotProps}
          sx={mergeSx({ opacity: showLoading ? 0.3 : 1 }, userBodySx)}
        >
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
                alwaysExpanded={alwaysExpanded}
                selectChildrenWithParent={selectChildrenWithParent}
                showExpandGuidelines={showExpandGuidelines}
                getRowLabel={getRowLabel}
                hasExpandableRows={hasExpandableRows}
                customColor={setRowColor?.(row.original)}
                rowSlotProps={slotProps?.row}
                cellSlotProps={slotProps?.cell}
              />
            ))}
        </TableBody>
      </MuiTable>

      {showError && (
        <Box sx={overlaySx}>
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
        <Box sx={overlaySx}>
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
