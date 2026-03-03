import React, { useState } from 'react';
import {
  alpha,
  Box,
  BoxProps,
  Checkbox,
  Divider,
  List,
  ListItem,
  Popover,
  Typography,
  type SxProps,
  type Theme,
} from '@mui/material';
import type { Table } from '@tanstack/react-table';

export type BiampTableColumnVisibilityProps<TData> = BoxProps & {
  /** TanStack Table instance to connect to. */
  table: Table<TData>;
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
  sx,
  ...boxProps
}: BiampTableColumnVisibilityProps<TData>) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const allVisible = table
    .getAllLeafColumns()
    .every((col) => col.getIsVisible());

  const someVisible = table
    .getAllLeafColumns()
    .some((col) => col.getIsVisible());

  return (
    <Box
      {...boxProps}
      sx={{
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        ...sx,
      }}
    >
      <Typography
        variant="caption"
        sx={{
          cursor: 'pointer',
          '&:hover': { textDecoration: 'underline' },
        }}
        onClick={(e) => setAnchorEl(e.currentTarget)}
      >
        Columns
      </Typography>
      <Popover
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: ({ palette }) => ({
              borderRadius: '6px',
              backgroundImage: 'none',
              border: `0.6px solid ${palette.dividers.secondary}`,
              boxShadow: `0px 1px 1px 0px ${alpha(palette.common.black, 0.05)}`,
              minWidth: '150px',
            }),
          },
        }}
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
    </Box>
  );
}
