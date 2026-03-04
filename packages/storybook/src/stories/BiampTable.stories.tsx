import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Box, Stack, Typography } from '@mui/material';
import {
  BiampTable,
  BiampTableColumnVisibility,
  BiampTablePagination,
  BiampTableToolbarActionButton,
} from '@bwp-web/components';
import { ColumnIcon } from '@bwp-web/assets';
import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type RowSelectionState,
  type SortingState,
  type VisibilityState,
} from '@tanstack/react-table';

type Room = {
  id: number;
  name: string;
  status: string;
  capacity: number;
  floor: string;
};

const columnHelper = createColumnHelper<Room>();

const columns = [
  columnHelper.accessor('name', { header: 'Room Name' }),
  columnHelper.accessor('status', { header: 'Status' }),
  columnHelper.accessor('capacity', { header: 'Capacity' }),
  columnHelper.accessor('floor', { header: 'Floor' }),
];

const rows: Room[] = [
  {
    id: 1,
    name: 'Conference Room A',
    status: 'Available',
    capacity: 12,
    floor: '1st',
  },
  {
    id: 2,
    name: 'Conference Room B',
    status: 'Occupied',
    capacity: 8,
    floor: '1st',
  },
  {
    id: 3,
    name: 'Meeting Room 1',
    status: 'Available',
    capacity: 4,
    floor: '2nd',
  },
  {
    id: 4,
    name: 'Meeting Room 2',
    status: 'Maintenance',
    capacity: 6,
    floor: '2nd',
  },
  {
    id: 5,
    name: 'Board Room',
    status: 'Available',
    capacity: 20,
    floor: '3rd',
  },
  {
    id: 6,
    name: 'Huddle Space 1',
    status: 'Occupied',
    capacity: 3,
    floor: '1st',
  },
  {
    id: 7,
    name: 'Huddle Space 2',
    status: 'Available',
    capacity: 3,
    floor: '2nd',
  },
  {
    id: 8,
    name: 'Training Room',
    status: 'Available',
    capacity: 30,
    floor: '3rd',
  },
  {
    id: 9,
    name: 'Executive Suite',
    status: 'Occupied',
    capacity: 10,
    floor: '3rd',
  },
  {
    id: 10,
    name: 'Phone Booth A',
    status: 'Available',
    capacity: 1,
    floor: '1st',
  },
  {
    id: 11,
    name: 'Phone Booth B',
    status: 'Maintenance',
    capacity: 1,
    floor: '2nd',
  },
  {
    id: 12,
    name: 'Collaboration Hub',
    status: 'Available',
    capacity: 15,
    floor: '1st',
  },
  {
    id: 13,
    name: 'Webinar Studio',
    status: 'Occupied',
    capacity: 5,
    floor: '3rd',
  },
  {
    id: 14,
    name: 'Lounge Area',
    status: 'Available',
    capacity: 8,
    floor: '1st',
  },
  {
    id: 15,
    name: 'Innovation Lab',
    status: 'Available',
    capacity: 12,
    floor: '2nd',
  },
];

const meta: Meta = {
  title: 'Components/BiampTable',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => {
    const table = useReactTable({
      data: rows.slice(0, 5),
      columns,
      getCoreRowModel: getCoreRowModel(),
    });

    return (
      <Stack spacing={3}>
        <Typography variant="h3">Table</Typography>
        <BiampTable table={table} />
      </Stack>
    );
  },
};

export const WithSorting: Story = {
  render: () => {
    const [sorting, setSorting] = useState<SortingState>([]);

    const table = useReactTable({
      data: rows,
      columns,
      getCoreRowModel: getCoreRowModel(),
      getSortedRowModel: getSortedRowModel(),
      state: { sorting },
      onSortingChange: setSorting,
    });

    return (
      <Stack spacing={3}>
        <Typography variant="h3">Table with Sorting</Typography>
        <Typography variant="body2">
          Click column headers to sort ascending/descending.
        </Typography>
        <BiampTable table={table} />
      </Stack>
    );
  },
};

export const WithPagination: Story = {
  render: () => {
    const table = useReactTable({
      data: rows,
      columns,
      getCoreRowModel: getCoreRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
      initialState: { pagination: { pageSize: 5, pageIndex: 0 } },
    });

    return (
      <Stack spacing={3}>
        <Typography variant="h3">Table with Pagination</Typography>
        <BiampTable table={table} />
        <BiampTablePagination table={table} rowsPerPageOptions={[5, 10, 15]} />
      </Stack>
    );
  },
};

export const WithRowSelection: Story = {
  render: () => {
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const selectedCount = Object.keys(rowSelection).length;

    const table = useReactTable({
      data: rows.slice(0, 5),
      columns,
      getCoreRowModel: getCoreRowModel(),
      getRowId: (row) => String(row.id),
      enableRowSelection: true,
      state: { rowSelection },
      onRowSelectionChange: setRowSelection,
    });

    return (
      <Stack spacing={3}>
        <Typography variant="h3">Table with Row Selection</Typography>
        <Typography variant="body2">
          {selectedCount} row{selectedCount !== 1 ? 's' : ''} selected
        </Typography>
        <BiampTable table={table} />
      </Stack>
    );
  },
};

export const WithColumnVisibility: Story = {
  render: () => {
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
      {},
    );
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

    const table = useReactTable({
      data: rows.slice(0, 5),
      columns,
      getCoreRowModel: getCoreRowModel(),
      state: { columnVisibility },
      onColumnVisibilityChange: setColumnVisibility,
    });

    return (
      <Stack spacing={3}>
        <Typography variant="h3">Table with Column Visibility</Typography>
        <Box display="flex" justifyContent="flex-end">
          <BiampTableToolbarActionButton
            label="Toggle column visibility"
            icon={<ColumnIcon />}
            onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
              setAnchorEl(e.currentTarget)
            }
          />
          <BiampTableColumnVisibility
            table={table}
            anchorEl={anchorEl}
            onClose={() => setAnchorEl(null)}
          />
        </Box>
        <BiampTable table={table} />
      </Stack>
    );
  },
};

export const ClickableRows: Story = {
  render: () => {
    const table = useReactTable({
      data: rows.slice(0, 5),
      columns,
      getCoreRowModel: getCoreRowModel(),
    });

    return (
      <Stack spacing={3}>
        <Typography variant="h3">Table with Clickable Rows</Typography>
        <Typography variant="body2">
          Click a row to see its data logged to the console.
        </Typography>
        <BiampTable
          table={table}
          onRowClick={(row) => console.log('Row clicked:', row)}
        />
      </Stack>
    );
  },
};

export const AllFeatures: Story = {
  render: () => {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
      {},
    );
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const selectedCount = Object.keys(rowSelection).length;

    const table = useReactTable({
      data: rows,
      columns,
      getCoreRowModel: getCoreRowModel(),
      getSortedRowModel: getSortedRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
      getRowId: (row) => String(row.id),
      enableRowSelection: true,
      state: { sorting, rowSelection, columnVisibility },
      onSortingChange: setSorting,
      onRowSelectionChange: setRowSelection,
      onColumnVisibilityChange: setColumnVisibility,
      initialState: { pagination: { pageSize: 5, pageIndex: 0 } },
    });

    return (
      <Stack spacing={3}>
        <Typography variant="h3">Table with All Features</Typography>
        <Typography variant="body2">
          {selectedCount} row{selectedCount !== 1 ? 's' : ''} selected
        </Typography>
        <Box display="flex" justifyContent="flex-end">
          <BiampTableToolbarActionButton
            label="Toggle column visibility"
            icon={<ColumnIcon />}
            onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
              setAnchorEl(e.currentTarget)
            }
          />
          <BiampTableColumnVisibility
            table={table}
            anchorEl={anchorEl}
            onClose={() => setAnchorEl(null)}
          />
        </Box>
        <BiampTable
          table={table}
          onRowClick={(row) => console.log('Row clicked:', row)}
        />
        <BiampTablePagination table={table} rowsPerPageOptions={[5, 10, 15]} />
      </Stack>
    );
  },
};
