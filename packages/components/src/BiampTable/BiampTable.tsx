import {
  Box,
  type BoxProps,
  Checkbox,
  IconButton,
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
  type Theme,
} from '@mui/material';
import {
  ChevronDownIcon,
  ChevronRightIcon,
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
import React, { type ReactNode, useEffect, useRef } from 'react';
import { BiampTableEmptyState } from './BiampTableEmptyState';
import { BiampTableErrorState } from './BiampTableErrorState';
import { BiampTableTruncatedCell } from './BiampTableTruncatedCell';
import { useLoadingDelay } from './useLoadingDelay';
import { mergeSx, resolveSlot, type SlotPropsOrFn } from './slotProps';

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

// ── Shared sx helpers ────────────────────────────────────────────

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

const stickyHoverBg = {
  '.MuiTableRow-hover:hover > &, .Mui-selected > &': {
    bgcolor: ({ palette }: Theme) =>
      palette.mode === 'dark' ? palette.grey[800] : palette.grey[100],
  },
} as const;

function cellSx(
  sticky: 'left' | 'right' | undefined,
  minWidth: number | string | undefined,
  zIndex: number,
) {
  if (sticky) {
    return {
      position: 'sticky',
      [sticky]: 0,
      zIndex,
      width: 0,
      whiteSpace: 'nowrap',
      textAlign: 'center',
      bgcolor: 'background.paper',
      ...(zIndex < 3 && stickyHoverBg),
    } as const;
  }
  const mw = minWidth ?? 40;
  return {
    minWidth: mw,
    whiteSpace: 'nowrap',
    '&:has([data-truncate])': { maxWidth: mw, whiteSpace: 'normal' },
  };
}

// ── Hoisted sx objects (avoid re-creation per row per render) ────

const rowCursorPointerSx = { cursor: 'pointer' } as const;

const selectionCellSx = {
  position: 'sticky',
  left: 0,
  zIndex: 2,
  bgcolor: 'background.paper',
  ...stickyHoverBg,
} as const;

const checkboxHiddenSx = { visibility: 'hidden' } as const;

const expandCellBaseSx = {
  display: 'flex',
  alignItems: 'center',
  gap: '2px',
} as const;

const expandPlaceholderSx = { width: 28 } as const;

// ── Expand guideline geometry ────────────────────────────────────
// Only used when `alwaysExpanded` is on. Per-depth indent matches the inner
// Box's `pl: row.depth * 28`; cell-pl matches the expand cell's `pl: 12px`.
// The vertical line at level k sits 4px to the right of where the parent
// (depth k-1) text content begins — close enough to read as anchored to the
// parent, far enough to not collide with the first character. The horizontal
// elbow stops 12px short of the child's text so the line reads as pointing at
// the child without touching it. For the first child of a parent, the elbow's
// top vertical is extended 12px upward so it visually reaches into the parent
// row instead of starting at the cell boundary.
const guidelineIndent = 28;
const guidelineCellPaddingLeft = 12;
const guidelineLineOffsetFromParentText = 4;
const guidelineElbowGapToChildText = 12;
const guidelineFirstChildTopExtension = 12;
const guidelineColor = ({ palette }: Theme) => palette.dividers.secondary;
const guidelineStroke = '0.6px';

function isLastChildOfParent<TData>(row: Row<TData>): boolean {
  const parent = row.getParentRow();
  if (!parent) return false;
  const siblings = parent.subRows;
  return siblings[siblings.length - 1]?.id === row.id;
}

function isFirstChildOfParent<TData>(row: Row<TData>): boolean {
  const parent = row.getParentRow();
  if (!parent) return false;
  return parent.subRows[0]?.id === row.id;
}

function getAncestorAtDepth<TData>(
  row: Row<TData>,
  targetDepth: number,
): Row<TData> | undefined {
  let current: Row<TData> | undefined = row;
  while (current && current.depth > targetDepth) {
    current = current.getParentRow();
  }
  return current && current.depth === targetDepth ? current : undefined;
}

function ExpandGuidelines<TData>({ row }: { row: Row<TData> }) {
  const verticalX = (k: number) =>
    guidelineCellPaddingLeft +
    (k - 1) * guidelineIndent +
    guidelineLineOffsetFromParentText;
  const elbowEnd =
    guidelineCellPaddingLeft +
    row.depth * guidelineIndent -
    guidelineElbowGapToChildText;

  const lines: ReactNode[] = [];

  for (let k = 1; k < row.depth; k++) {
    const ancestor = getAncestorAtDepth(row, k);
    if (!ancestor || isLastChildOfParent(ancestor)) continue;
    lines.push(
      <Box
        key={`v-${k}`}
        aria-hidden
        sx={{
          position: 'absolute',
          left: `${verticalX(k)}px`,
          top: 0,
          bottom: 0,
          width: guidelineStroke,
          bgcolor: guidelineColor,
          pointerEvents: 'none',
        }}
      />,
    );
  }

  const elbowX = verticalX(row.depth);
  const rowIsLast = isLastChildOfParent(row);
  const rowIsFirst = isFirstChildOfParent(row);
  const elbowTopOffset = rowIsFirst ? -guidelineFirstChildTopExtension : 0;

  lines.push(
    <Box
      key="v-elbow-top"
      aria-hidden
      sx={{
        position: 'absolute',
        left: `${elbowX}px`,
        top: `${elbowTopOffset}px`,
        height: `calc(50% - ${elbowTopOffset}px)`,
        width: guidelineStroke,
        bgcolor: guidelineColor,
        pointerEvents: 'none',
      }}
    />,
  );

  if (!rowIsLast) {
    lines.push(
      <Box
        key="v-elbow-bottom"
        aria-hidden
        sx={{
          position: 'absolute',
          left: `${elbowX}px`,
          top: '50%',
          bottom: 0,
          width: guidelineStroke,
          bgcolor: guidelineColor,
          pointerEvents: 'none',
        }}
      />,
    );
  }

  lines.push(
    <Box
      key="h-elbow"
      aria-hidden
      sx={{
        position: 'absolute',
        left: `${elbowX}px`,
        top: '50%',
        width: `${elbowEnd - elbowX}px`,
        height: guidelineStroke,
        bgcolor: guidelineColor,
        pointerEvents: 'none',
      }}
    />,
  );

  return <>{lines}</>;
}

const headerSelectionCellSx = {
  position: 'sticky',
  left: 0,
  zIndex: 3,
  bgcolor: 'background.paper',
} as const;

const checkboxHiddenHeaderSx = { visibility: 'hidden' } as const;

// ── Memoized row ─────────────────────────────────────────────────

type BiampTableRowProps<TData> = {
  row: Row<TData>;
  isExpanded: boolean;
  isSelected: boolean;
  onRowClick?: (row: TData) => void;
  isRowClickable?: (row: TData) => boolean;
  enableRowSelection: boolean;
  enableExpanding: boolean;
  alwaysExpanded: boolean;
  selectChildrenWithParent: boolean;
  showExpandGuidelines: boolean;
  getRowLabel?: (row: TData) => string;
  hasExpandableRows: boolean;
  customColor?: string;
  rowSlotProps?: SlotPropsOrFn<MuiTableRowProps, { row: Row<TData> }>;
  cellSlotProps?: SlotPropsOrFn<
    MuiTableCellProps,
    { cell: Cell<TData, unknown> }
  >;
};

function BiampTableRowInner<TData>({
  row,
  isExpanded,
  isSelected,
  onRowClick,
  isRowClickable,
  enableRowSelection,
  enableExpanding,
  alwaysExpanded,
  selectChildrenWithParent,
  showExpandGuidelines,
  getRowLabel,
  hasExpandableRows,
  customColor,
  rowSlotProps,
  cellSlotProps,
}: BiampTableRowProps<TData>) {
  const clickable = onRowClick
    ? isRowClickable
      ? isRowClickable(row.original)
      : true
    : false;

  const resolvedRow = resolveSlot(rowSlotProps, { row });
  const {
    sx: userRowSx,
    onClick: userRowOnClick,
    onKeyDown: userRowOnKeyDown,
    ...restRowProps
  } = resolvedRow ?? {};

  return (
    <TableRow
      key={row.id}
      {...restRowProps}
      hover={clickable}
      selected={enableRowSelection ? isSelected : undefined}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      sx={mergeSx(
        clickable && rowCursorPointerSx,
        customColor ? { backgroundColor: customColor } : undefined,
        userRowSx,
      )}
      onClick={
        clickable && onRowClick
          ? (e) => {
              onRowClick(row.original);
              userRowOnClick?.(e);
            }
          : userRowOnClick
      }
      onKeyDown={
        clickable && onRowClick
          ? (e: React.KeyboardEvent<HTMLTableRowElement>) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onRowClick(row.original);
              }
              userRowOnKeyDown?.(e);
            }
          : userRowOnKeyDown
      }
    >
      {enableRowSelection && (
        <TableCell
          padding="checkbox"
          sx={mergeSx(
            selectionCellSx,
            customColor ? { backgroundColor: customColor } : undefined,
          )}
        >
          <Checkbox
            checked={isSelected}
            disabled={!row.getCanSelect()}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              row.toggleSelected(e.target.checked, {
                selectChildren: selectChildrenWithParent,
              })
            }
            onClick={(e) => e.stopPropagation()}
            sx={!row.getCanSelect() ? checkboxHiddenSx : undefined}
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
            cells.findIndex((c) => !c.column.columnDef.meta?.sticky);

        const content = flexRender(
          cell.column.columnDef.cell,
          cell.getContext(),
        );

        const resolvedCell = resolveSlot(cellSlotProps, { cell });
        const { sx: userCellSx, ...restCellProps } = resolvedCell ?? {};

        const showGuidelinesOnCell =
          isExpandCell &&
          showExpandGuidelines &&
          alwaysExpanded &&
          row.depth > 0;

        return (
          <TableCell
            key={cell.id}
            {...restCellProps}
            data-sticky={sticky || undefined}
            sx={mergeSx(
              cellSx(sticky, cell.column.columnDef.meta?.minWidth, 2),
              { pl: isExpandCell && !alwaysExpanded ? '6px' : '12px' },
              showGuidelinesOnCell ? { position: 'relative' } : undefined,
              sticky && customColor
                ? { backgroundColor: customColor }
                : undefined,
              userCellSx,
            )}
          >
            {showGuidelinesOnCell && <ExpandGuidelines row={row} />}
            {(() => {
              if (sticky) return content;

              const truncate = cell.column.columnDef.meta?.truncate ?? true;
              const truncated = truncate ? (
                <BiampTableTruncatedCell>{content}</BiampTableTruncatedCell>
              ) : (
                content
              );

              if (!isExpandCell) return truncated;

              if (alwaysExpanded) {
                return row.depth > 0 ? (
                  <Box sx={{ pl: `${row.depth * 28}px` }}>{truncated}</Box>
                ) : (
                  truncated
                );
              }

              const rowLabel = getRowLabel
                ? getRowLabel(row.original)
                : `row ${row.index + 1}`;

              return (
                <Box
                  sx={
                    row.depth > 0
                      ? { ...expandCellBaseSx, pl: `${row.depth * 12}px` }
                      : expandCellBaseSx
                  }
                >
                  {row.getCanExpand() ? (
                    <IconButton
                      variant="none"
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
                    >
                      {isExpanded ? (
                        <ChevronDownIcon
                          variant="xs"
                          sx={{
                            color: ({ palette }) => palette.text.secondary,
                          }}
                        />
                      ) : (
                        <ChevronRightIcon
                          variant="xs"
                          sx={{
                            color: ({ palette }) => palette.text.secondary,
                          }}
                        />
                      )}
                    </IconButton>
                  ) : hasExpandableRows ? (
                    <Box sx={expandPlaceholderSx} />
                  ) : null}
                  {truncated}
                </Box>
              );
            })()}
          </TableCell>
        );
      })}
    </TableRow>
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
    prev.alwaysExpanded === next.alwaysExpanded &&
    prev.hasExpandableRows === next.hasExpandableRows &&
    prev.selectChildrenWithParent === next.selectChildrenWithParent &&
    prev.showExpandGuidelines === next.showExpandGuidelines &&
    prev.onRowClick === next.onRowClick &&
    prev.isRowClickable === next.isRowClickable &&
    prev.getRowLabel === next.getRowLabel &&
    prev.customColor === next.customColor &&
    prev.rowSlotProps === next.rowSlotProps &&
    prev.cellSlotProps === next.cellSlotProps
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
