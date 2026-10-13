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
  TableFooter,
  type TableFooterProps as MuiTableFooterProps,
  TableHead,
  type TableHeadProps as MuiTableHeadProps,
  type TableProps as MuiTableProps,
  TableRow,
  type TableRowProps as MuiTableRowProps,
  TableSortLabel,
  type Theme,
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
import { useLoadingDelay } from '../hooks';
import { mergeSx, resolveSlot, type SlotPropsOrFn } from '../slotProps';
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
  /** Props merged onto the `<TableFooter>`. `sx` composes with defaults. */
  footer?: MuiTableFooterProps;
  /** Props merged onto the footer `<TableRow>`. `sx` composes with defaults. */
  footerRow?: MuiTableRowProps;
  /** Props merged onto each footer `<TableCell>`. Pass a function for per-column overrides. `sx` composes with defaults. */
  footerCell?: SlotPropsOrFn<
    MuiTableCellProps,
    { header: Header<TData, unknown> }
  >;
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
    /**
     * Keeps the footer row pinned to the bottom of the table's scroll area,
     * the way the header is pinned to the top. Only applies when a column
     * defines a `footer`. @default false
     */
    stickyFooter?: boolean;
    /**
     * Stretches the table to its container's full height, so the footer row
     * sits at the bottom even when there are too few rows to fill it. Rows
     * keep their height; an invisible filler row takes up the space left
     * over. @default false
     */
    fitHeight?: boolean;
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
  bgcolor: ({ palette }: Theme) =>
    palette.mode === 'dark' ? palette.grey[900] : palette.background.paper,
} as const;

const checkboxHiddenHeaderSx = { visibility: 'hidden' } as const;

// A totals band in the header's grey (light: grey[100]), set off from the
// rows by a hairline and a soft upward shadow, with no column dividers — the
// header's live on `.MuiTableCell-head` only. Opaque, so a sticky footer
// covers the rows scrolling under it.
const footerBg = ({ palette }: Theme) =>
  palette.mode === 'dark' ? palette.grey[900] : palette.grey[100];

// The grey is painted on the row, not the cells: cells start at fractional
// pixels, and a cell's own background anti-aliases at its edges, letting
// whatever is behind show through as a hairline between columns. Over the
// row's grey, that edge is invisible.
const footerRowSx = { bgcolor: footerBg } as const;

const footerCellSx = {
  height: 44,
  color: 'text.primary',
  fontSize: 14,
  fontWeight: 600,
  lineHeight: 1.5,
  borderTop: ({ palette }: Theme) => `0.6px solid ${palette.divider}`,
  borderBottom: 'none',
} as const;

// Cells pinned to the left or right edge still need their own background, to
// cover the footer cells scrolling under them horizontally.
const footerPinnedCellSx = { bgcolor: footerBg } as const;

// Sticky as a whole (rather than per cell, like the header) so the row's
// background travels with it. The shadow is one drop-shadow over the whole
// footer: a box-shadow per cell overlaps its neighbours at their shared
// edge and reads as a divider between columns.
const stickyFooterSx = {
  position: 'sticky',
  bottom: 0,
  zIndex: 2,
  filter: 'drop-shadow(0px -1px 3.5px rgba(0, 0, 0, 0.05))',
} as const;

const fillerRowSx = { height: '100%' } as const;

// The filler row is the body's last child, which takes the theme's "no border
// under the last row" rule away from the real last row. Hand it back, or that
// row's divider doubles up with the footer's hairline.
const fitHeightBodySx = {
  '& > tr:nth-last-of-type(2) > td': { borderBottom: 'none' },
} as const;

const fillerCellSx = {
  height: 'auto',
  p: 0,
  border: 'none',
} as const;

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
  stickyFooter = false,
  fitHeight = false,
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

  // Snapshot of which columns are visible (and their order), captured at render
  // time. Passed to each memoized row so visibility/order changes force a
  // re-render — the row object reference is stable across visibility changes, so
  // the memo can't detect them by querying the row itself.
  const visibleColumnsKey = table
    .getVisibleLeafColumns()
    .map((col) => col.id)
    .join(',');

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

  // Leaf-level only (TanStack lists footer groups innermost first): one
  // footer row, so a sticky one has a single row to pin.
  const footerGroup = table.getFooterGroups()[0];
  const hasFooter = table
    .getVisibleLeafColumns()
    .some((col) => col.columnDef.footer !== undefined);
  const { sx: userFooterSx, ...restFooterSlotProps } = slotProps?.footer ?? {};
  const { sx: userFooterRowSx, ...restFooterRowSlotProps } =
    slotProps?.footerRow ?? {};

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
          {
            minWidth: tableMinWidth,
            tableLayout: 'auto',
            ...(fitHeight && { height: '100%' }),
          },
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
          sx={mergeSx(
            { opacity: showLoading ? 0.3 : 1 },
            fitHeight && !showError ? fitHeightBodySx : undefined,
            userBodySx,
          )}
        >
          {!showError &&
            rows.map((row) => (
              <BiampTableRow
                key={row.id}
                row={row}
                visibleColumnsKey={visibleColumnsKey}
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
          {/* Takes whatever height the rows leave, so a table stretched to
              its container keeps its rows at their own height and its footer
              at the bottom. Zero tall once the rows overflow. */}
          {fitHeight && !showError && (
            <TableRow aria-hidden sx={fillerRowSx}>
              <TableCell
                colSpan={
                  table.getVisibleLeafColumns().length +
                  (enableRowSelection ? 1 : 0)
                }
                sx={fillerCellSx}
              />
            </TableRow>
          )}
        </TableBody>

        {hasFooter && footerGroup && !showError && (
          <TableFooter
            {...restFooterSlotProps}
            sx={mergeSx(
              stickyFooter ? stickyFooterSx : undefined,
              userFooterSx,
            )}
          >
            <TableRow
              {...restFooterRowSlotProps}
              sx={mergeSx(footerRowSx, userFooterRowSx)}
            >
              {enableRowSelection && (
                <TableCell
                  padding="checkbox"
                  sx={mergeSx(footerCellSx, footerPinnedCellSx, {
                    position: 'sticky',
                    left: 0,
                    zIndex: 1,
                  })}
                />
              )}
              {footerGroup.headers.map((header) => {
                const sticky = header.column.columnDef.meta?.sticky;
                const resolvedFooterCell = resolveSlot(slotProps?.footerCell, {
                  header,
                });
                const { sx: userFooterCellSx, ...restFooterCellProps } =
                  resolvedFooterCell ?? {};
                return (
                  <TableCell
                    key={header.id}
                    {...restFooterCellProps}
                    data-sticky={sticky || undefined}
                    sx={mergeSx(
                      cellSx(sticky, header.column.columnDef.meta?.minWidth, 3),
                      footerCellSx,
                      sticky ? footerPinnedCellSx : undefined,
                      sticky ? { zIndex: 1 } : undefined,
                      userFooterCellSx,
                    )}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.footer,
                          header.getContext(),
                        )}
                  </TableCell>
                );
              })}
            </TableRow>
          </TableFooter>
        )}
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
