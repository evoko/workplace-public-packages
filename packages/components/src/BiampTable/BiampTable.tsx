import {
  Box,
  Checkbox,
  Paper,
  Table as MuiTable,
  TableBody,
  TableCell,
  TableContainer,
  type TableContainerProps,
  TableHead,
  TableRow,
  TableSortLabel,
  type SxProps,
  type Theme,
} from '@mui/material';
import { flexRender, type Table } from '@tanstack/react-table';

export type BiampTableProps<TData> = {
  /** TanStack Table instance to connect to. */
  table: Table<TData>;
  /** Called when a body row is clicked. Receives the row's original data. */
  onRowClick?: (row: TData) => void;
  /** Props forwarded to the MUI TableContainer. */
  TableContainerProps?: Omit<TableContainerProps, 'children'>;
  /** sx applied to the outer wrapper Box. */
  sx?: SxProps<Theme>;
  /** Paper variant for the table container. Default: "outlined". */
  paperVariant?: 'outlined' | 'elevation';
};

export function BiampTable<TData>({
  table,
  onRowClick,
  TableContainerProps: tableContainerProps,
  sx,
  paperVariant = 'outlined',
}: BiampTableProps<TData>) {
  const enableRowSelection = !!table.options.enableRowSelection;

  return (
    <Box sx={{ ...sx }}>
      <TableContainer
        component={Paper}
        variant={paperVariant}
        {...tableContainerProps}
      >
        <MuiTable>
          <TableHead>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {enableRowSelection && (
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={table.getIsAllPageRowsSelected()}
                      indeterminate={table.getIsSomePageRowsSelected()}
                      onChange={table.getToggleAllPageRowsSelectedHandler()}
                    />
                  </TableCell>
                )}
                {headerGroup.headers.map((header) => (
                  <TableCell
                    key={header.id}
                    sortDirection={header.column.getIsSorted() || false}
                  >
                    {header.isPlaceholder ? null : header.column.getCanSort() ? (
                      <TableSortLabel
                        active={!!header.column.getIsSorted()}
                        direction={header.column.getIsSorted() || 'asc'}
                        onClick={header.column.getToggleSortingHandler()}
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
                ))}
              </TableRow>
            ))}
          </TableHead>

          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                hover={!!onRowClick}
                selected={enableRowSelection ? row.getIsSelected() : undefined}
                sx={{ cursor: onRowClick ? 'pointer' : undefined }}
                onClick={() => onRowClick?.(row.original)}
              >
                {enableRowSelection && (
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={row.getIsSelected()}
                      onChange={row.getToggleSelectedHandler()}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </TableCell>
                )}
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </MuiTable>
      </TableContainer>
    </Box>
  );
}
