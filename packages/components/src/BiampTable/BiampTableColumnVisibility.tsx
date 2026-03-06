import {
  alpha,
  Box,
  Checkbox,
  Divider,
  List,
  ListItem,
  Popover,
  type PopoverProps,
  Typography,
  type SxProps,
  type Theme,
} from '@mui/material';
import type { Table, VisibilityState } from '@tanstack/react-table';
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

const columnListItemSx: SxProps<Theme> = {
  py: 0,
  pr: 1.5,
  pl: 0,
  alignItems: 'center',
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: ({ palette }) =>
      palette.mode === 'dark' ? palette.grey[800] : palette.grey[100],
  },
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
  const allVisible = table
    .getAllLeafColumns()
    .every((col) => col.getIsVisible());

  return (
    <Popover
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      anchorOrigin={anchorOrigin}
      transformOrigin={transformOrigin}
      slotProps={{
        ...slotProps,
        paper: {
          sx: ({ palette }) => ({
            borderRadius: '6px',
            backgroundImage: 'none',
            border: `0.6px solid ${palette.dividers.secondary}`,
            boxShadow: `0px 1px 1px 0px ${alpha(palette.common.black, 0.05)}`,
            minWidth: '150px',
          }),
          ...((slotProps?.paper ?? {}) as Record<string, unknown>),
        },
      }}
      {...popoverProps}
    >
      <List dense disablePadding>
        <ListItem
          dense
          sx={columnListItemSx}
          onClick={() => table.toggleAllColumnsVisible(!allVisible)}
        >
          <Checkbox
            checked={allVisible}
            slotProps={{ input: { 'aria-label': `${showAllLabel} columns` } }}
          />
          <Typography variant="caption" fontWeight={600}>
            {showAllLabel}
          </Typography>
        </ListItem>
        <Divider />
        <Box
          sx={{ maxHeight: 340, overflow: 'auto', overscrollBehavior: 'none' }}
        >
          {table.getAllLeafColumns().map((column) => {
            const columnName =
              column.columnDef.meta?.columnLabel ??
              (typeof column.columnDef.header === 'string'
                ? column.columnDef.header
                : column.id);
            return (
              <ListItem
                key={column.id}
                dense
                sx={columnListItemSx}
                onClick={column.getToggleVisibilityHandler()}
              >
                <Checkbox
                  checked={column.getIsVisible()}
                  sx={{ py: 1 }}
                  slotProps={{
                    input: { 'aria-label': `Show ${columnName}` },
                  }}
                />
                <Typography variant="caption">{columnName}</Typography>
              </ListItem>
            );
          })}
        </Box>
      </List>
    </Popover>
  );
}
