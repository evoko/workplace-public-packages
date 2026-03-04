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
import { useEffect, useRef } from 'react';

/**
 * Returns the number of columns whose visibility differs from the default.
 * Pass `defaultVisibility` if some columns start hidden; otherwise all
 * columns are assumed visible by default.
 */
export function getColumnVisibilityDirtyCount<TData>(
  table: Table<TData>,
  defaultVisibility: VisibilityState = {},
): number {
  const current = table.getState().columnVisibility;
  let count = 0;
  for (const col of table.getAllLeafColumns()) {
    const isVisible = current[col.id] ?? true;
    const wasVisible = defaultVisibility[col.id] ?? true;
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
  /** Called after column visibility changes. */
  onChange?: (visibility: VisibilityState) => void;
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
  onChange,
  anchorEl,
  anchorOrigin = { vertical: 'bottom', horizontal: 'right' },
  transformOrigin = { vertical: 'top', horizontal: 'right' },
  slotProps,
  ...popoverProps
}: BiampTableColumnVisibilityProps<TData>) {
  const visibility = table.getState().columnVisibility;
  const prevVisibilityRef = useRef(visibility);

  useEffect(() => {
    if (prevVisibilityRef.current === visibility) return;
    prevVisibilityRef.current = visibility;
    onChange?.(visibility);
  }, [visibility, onChange]);

  const allVisible = table
    .getAllLeafColumns()
    .every((col) => col.getIsVisible());

  const someVisible = table
    .getAllLeafColumns()
    .some((col) => col.getIsVisible());

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
          ...(slotProps?.paper as object),
        },
      }}
      {...popoverProps}
    >
      <List dense disablePadding>
        <ListItem
          sx={columnListItemSx}
          onClick={() => table.toggleAllColumnsVisible(!allVisible)}
        >
          <Checkbox
            checked={allVisible}
            indeterminate={!allVisible && someVisible}
            size="small"
          />
          <Typography variant="caption">Show all</Typography>
        </ListItem>
        <Divider />
        <Box sx={{ maxHeight: 340, overflow: 'auto' }}>
          {table.getAllLeafColumns().map((column) => (
            <ListItem
              key={column.id}
              sx={columnListItemSx}
              onClick={column.getToggleVisibilityHandler()}
            >
              <Checkbox checked={column.getIsVisible()} size="small" />
              <Typography variant="caption">
                {typeof column.columnDef.header === 'string'
                  ? column.columnDef.header
                  : column.id}
              </Typography>
            </ListItem>
          ))}
        </Box>
      </List>
    </Popover>
  );
}
