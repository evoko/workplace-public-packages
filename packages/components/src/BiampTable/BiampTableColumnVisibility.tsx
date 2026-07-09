import { type PopoverProps } from '@mui/material';
import type { Table, VisibilityState } from '@tanstack/react-table';
import {
  BiampCheckboxListPopover,
  type BiampCheckboxListItem,
} from '../BiampCheckboxListPopover';
import './tanstack-meta';

/**
 * A looser alternative to TanStack's `VisibilityState` (`Record<string, boolean>`).
 * Accepts `Partial<Record<string, boolean>>` so callers don't need to cast
 * from URL params or partial objects. Internally, `undefined` values are
 * treated as `true` (visible).
 */
export type ColumnVisibility = Partial<Record<string, boolean>>;

/**
 * Converts a `ColumnVisibility` to TanStack's `VisibilityState`.
 * Use this when passing to `useReactTable({ state: { columnVisibility } })`.
 */
export function toVisibilityState(
  visibility: ColumnVisibility,
): VisibilityState {
  return visibility as VisibilityState;
}

/**
 * Reads `meta.defaultVisible` from all leaf columns and returns a
 * `ColumnVisibility` map. Columns without `defaultVisible` are omitted
 * (treated as visible by default).
 */
export function getDefaultColumnVisibility<TData>(
  table: Table<TData>,
): ColumnVisibility {
  const result: ColumnVisibility = {};
  for (const col of table.getAllLeafColumns()) {
    const dv = col.columnDef.meta?.defaultVisible;
    if (dv !== undefined) result[col.id] = dv;
  }
  return result;
}

/**
 * Returns the number of columns whose visibility differs from the default.
 * When `defaultVisibility` is omitted, auto-derives from `meta.defaultVisible`
 * on each column definition.
 */
export function getColumnVisibilityDirtyCount<TData>(
  table: Table<TData>,
  defaultVisibility?: ColumnVisibility,
): number {
  const current = table.getState().columnVisibility;
  const defaults = defaultVisibility ?? getDefaultColumnVisibility(table);
  let count = 0;
  for (const col of table.getAllLeafColumns()) {
    const isVisible = current[col.id] ?? true;
    const wasVisible = defaults[col.id] ?? true;
    if (isVisible !== wasVisible) count++;
  }
  return count;
}

export type BiampTableColumnVisibilityProps<TData> = Omit<
  PopoverProps,
  'open'
> & {
  /** TanStack Table instance to connect to. */
  table: Table<TData>;
  /** Label for the "show all" toggle. @default "Show all" */
  showAllLabel?: string;
};

export function BiampTableColumnVisibility<TData>({
  table,
  showAllLabel = 'Show all',
  anchorEl,
  anchorOrigin = { vertical: 'bottom', horizontal: 'right' },
  transformOrigin = { vertical: 'top', horizontal: 'right' },
  slotProps,
  ...popoverProps
}: BiampTableColumnVisibilityProps<TData>) {
  // Only columns the user is allowed to toggle. A column with
  // `enableHiding: false` (`getCanHide() === false`) is never offered here —
  // and `useBiampServerSideTable` also keeps such columns force-visible.
  const hideableColumns = table
    .getAllLeafColumns()
    .filter((col) => col.getCanHide());

  const items: BiampCheckboxListItem[] = hideableColumns.map((column) => {
    const columnName =
      column.columnDef.meta?.columnLabel ??
      (typeof column.columnDef.header === 'string'
        ? column.columnDef.header
        : column.id);
    return {
      id: column.id,
      label: columnName,
      checked: column.getIsVisible(),
      ariaLabel: `Show ${columnName}`,
    };
  });

  // "Show all" toggles only the hideable columns. TanStack's
  // `toggleAllColumnsVisible` operates on every leaf column, so we manage the
  // hideable subset directly to leave non-hideable columns untouched.
  const setAllHideable = (next: boolean) => {
    table.setColumnVisibility((prev) => {
      const updated = { ...prev };
      for (const col of hideableColumns) {
        updated[col.id] = next;
      }
      return updated;
    });
  };

  return (
    <BiampCheckboxListPopover
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      anchorOrigin={anchorOrigin}
      transformOrigin={transformOrigin}
      slotProps={slotProps}
      items={items}
      onToggleItem={(id) => table.getColumn(id)?.toggleVisibility()}
      selectAllLabel={showAllLabel}
      onToggleAll={setAllHideable}
      {...popoverProps}
    />
  );
}
