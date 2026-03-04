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
import './tanstack-meta';

export type BiampTableProps<TData> = {
  /** TanStack Table instance to connect to. */
  table: Table<TData>;
  /** Called when a clickable body row is clicked. Receives the row's original data. */
  onRowClick?: (row: TData) => void;
  /**
   * Controls which rows are clickable. When omitted, all rows are clickable if
   * `onRowClick` is provided. Has no effect when `onRowClick` is not provided.
   */
  isRowClickable?: (row: TData) => boolean;
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
  isRowClickable,
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
                    sx={{ minWidth: header.column.columnDef.meta?.minWidth }}
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
            {table.getRowModel().rows.map((row) => {
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
                  sx={{ cursor: clickable ? 'pointer' : undefined }}
                  onClick={
                    clickable ? () => onRowClick!(row.original) : undefined
                  }
                >
                  {enableRowSelection && (
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={row.getIsSelected()}
                        disabled={!row.getCanSelect()}
                        onChange={row.getToggleSelectedHandler()}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </TableCell>
                  )}
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </MuiTable>
      </TableContainer>
    </Box>
  );
}
