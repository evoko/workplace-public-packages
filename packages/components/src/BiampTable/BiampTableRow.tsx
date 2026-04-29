import {
  Box,
  Checkbox,
  IconButton,
  TableCell,
  type TableCellProps as MuiTableCellProps,
  TableRow,
  type TableRowProps as MuiTableRowProps,
} from '@mui/material';
import { ChevronDownIcon, ChevronRightIcon } from '@bwp-web/assets';
import { flexRender, type Cell, type Row } from '@tanstack/react-table';
import React, { type ReactNode } from 'react';
import { BiampTableTruncatedCell } from './BiampTableTruncatedCell';
import { mergeSx, resolveSlot, type SlotPropsOrFn } from './slotProps';
import { cellSx, stickyHoverBg } from './cellSx';
import { ExpandGuidelines } from './BiampTableExpandGuidelines';

// ── Hoisted sx (avoid re-creating per row per render) ───────────

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

// ── Expand chevron / placeholder ─────────────────────────────────

function ExpandToggle<TData>({
  row,
  isExpanded,
  hasExpandableRows,
  rowLabel,
}: {
  row: Row<TData>;
  isExpanded: boolean;
  hasExpandableRows: boolean;
  rowLabel: string;
}) {
  if (row.getCanExpand()) {
    return (
      <IconButton
        variant="none"
        onClick={(e) => {
          e.stopPropagation();
          row.toggleExpanded();
        }}
        aria-label={isExpanded ? `Collapse ${rowLabel}` : `Expand ${rowLabel}`}
        aria-expanded={isExpanded}
      >
        {isExpanded ? (
          <ChevronDownIcon
            variant="xs"
            sx={{ color: ({ palette }) => palette.text.secondary }}
          />
        ) : (
          <ChevronRightIcon
            variant="xs"
            sx={{ color: ({ palette }) => palette.text.secondary }}
          />
        )}
      </IconButton>
    );
  }
  if (hasExpandableRows) return <Box sx={expandPlaceholderSx} />;
  return null;
}

// ── Cell content rendering ───────────────────────────────────────
// Walks the four cases — sticky / non-expand / always-expanded expand /
// toggleable expand — top to bottom with early returns instead of nested
// ternaries. Called once per cell from the row body.

function renderCellContent<TData>({
  cell,
  row,
  isExpandCell,
  alwaysExpanded,
  isExpanded,
  hasExpandableRows,
  getRowLabel,
}: {
  cell: Cell<TData, unknown>;
  row: Row<TData>;
  isExpandCell: boolean;
  alwaysExpanded: boolean;
  isExpanded: boolean;
  hasExpandableRows: boolean;
  getRowLabel?: (row: TData) => string;
}): ReactNode {
  const sticky = cell.column.columnDef.meta?.sticky;
  const content = flexRender(cell.column.columnDef.cell, cell.getContext());

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
      <ExpandToggle
        row={row}
        isExpanded={isExpanded}
        hasExpandableRows={hasExpandableRows}
        rowLabel={rowLabel}
      />
      {truncated}
    </Box>
  );
}

// ── Memoized row ─────────────────────────────────────────────────

export type BiampTableRowProps<TData> = {
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

        const showGuidelinesOnCell =
          isExpandCell &&
          showExpandGuidelines &&
          alwaysExpanded &&
          row.depth > 0;

        const resolvedCell = resolveSlot(cellSlotProps, { cell });
        const { sx: userCellSx, ...restCellProps } = resolvedCell ?? {};

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
            {renderCellContent({
              cell,
              row,
              isExpandCell,
              alwaysExpanded,
              isExpanded,
              hasExpandableRows,
              getRowLabel,
            })}
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

export const BiampTableRow = React.memo(
  BiampTableRowInner,
  biampTableRowPropsAreEqual,
) as typeof BiampTableRowInner;
