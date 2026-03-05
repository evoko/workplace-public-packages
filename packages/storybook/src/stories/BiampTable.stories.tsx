import React, { useEffect, useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  Box,
  Button,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import {
  BiampTable,
  BiampTableColumnVisibility,
  BiampTableEmptyState,
  BiampTableErrorState,
  BiampTablePagination,
  BiampTableToolbar,
  BiampTableToolbarActionButton,
  BiampTableToolbarActions,
  BiampTableToolbarExport,
  BiampTableToolbarFilters,
  BiampTableToolbarSearch,
  getColumnVisibilityDirtyCount,
  useDebouncedCallback,
} from '@bwp-web/components';
import { ColumnsIcon } from '@bwp-web/assets';
import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
  type VisibilityState,
} from '@tanstack/react-table';

// Row model factories must be stable references — calling getCoreRowModel() etc.
// inside the render function creates new references every render, causing TanStack
// to invalidate memoized row models and trigger autoResetPageIndex loops.
const coreRowModel = getCoreRowModel();
const sortedRowModel = getSortedRowModel();
const paginationRowModel = getPaginationRowModel();

// ---------------------------------------------------------------------------
// Room data
// ---------------------------------------------------------------------------

type Room = {
  id: number;
  name: string;
  status: string;
  capacity: number;
  floor: string;
};

const columnHelper = createColumnHelper<Room>();

const columns = [
  columnHelper.accessor('name', {
    header: 'Room Name',
    meta: { minWidth: 200 },
  }),
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

const rows5 = rows.slice(0, 5);
const emptyRows: Room[] = [];

// ---------------------------------------------------------------------------
// Device data (large dataset for scrolling demos)
// ---------------------------------------------------------------------------

type Device = {
  id: number;
  name: string;
  type: string;
  location: string;
  floor: string;
  building: string;
  ipAddress: string;
  macAddress: string;
  status: string;
  firmwareVersion: string;
  lastSeen: string;
};

const deviceTypes = [
  'DSP',
  'Amplifier',
  'Microphone',
  'Speaker',
  'Camera',
  'Display',
];
const locations = [
  'Lobby',
  'Conference A',
  'Conference B',
  'Board Room',
  'Huddle 1',
  'Huddle 2',
  'Training',
];
const buildings = ['HQ', 'Annex', 'East Wing'];
const statuses = ['Online', 'Offline', 'Warning'];

const deviceColumnHelper = createColumnHelper<Device>();
const deviceColumns = [
  deviceColumnHelper.accessor('name', {
    header: 'Device Name',
    meta: { minWidth: 160 },
  }),
  deviceColumnHelper.accessor('type', {
    header: 'Type',
    meta: { minWidth: 100 },
  }),
  deviceColumnHelper.accessor('location', {
    header: 'Location',
    meta: { minWidth: 130 },
  }),
  deviceColumnHelper.accessor('floor', {
    header: 'Floor',
    meta: { minWidth: 80 },
  }),
  deviceColumnHelper.accessor('building', {
    header: 'Building',
    meta: { minWidth: 90 },
  }),
  deviceColumnHelper.accessor('ipAddress', {
    header: 'IP Address',
    enableSorting: false,
    meta: { minWidth: 120 },
  }),
  deviceColumnHelper.accessor('macAddress', {
    header: 'MAC Address',
    enableSorting: false,
    meta: { minWidth: 140 },
  }),
  deviceColumnHelper.accessor('status', {
    header: 'Status',
    meta: { minWidth: 90 },
  }),
  deviceColumnHelper.accessor('firmwareVersion', {
    header: 'Firmware',
    enableSorting: false,
    meta: { minWidth: 100 },
  }),
  deviceColumnHelper.accessor('lastSeen', {
    header: 'Last Seen',
    meta: { minWidth: 160 },
  }),
];

const deviceColumnsWithAction = [
  ...deviceColumns,
  deviceColumnHelper.display({
    id: 'actions',
    header: '',
    meta: { sticky: 'right', minWidth: 80 },
    cell: ({ row }) => (
      <Button onClick={() => console.log(row)}>Press me!</Button>
    ),
  }),
];

const deviceRows: Device[] = Array.from({ length: 100 }, (_, i) => {
  const n = i + 1;
  const type = deviceTypes[i % deviceTypes.length];
  return {
    id: n,
    name: `${type} ${n.toString().padStart(3, '0')}`,
    type,
    location: locations[i % locations.length],
    floor: `${(i % 5) + 1}F`,
    building: buildings[i % buildings.length],
    ipAddress: `192.168.${Math.floor(i / 255)}.${(i % 255) + 1}`,
    macAddress: `AA:BB:CC:${n.toString(16).padStart(2, '0').toUpperCase()}:${(n * 3).toString(16).padStart(2, '0').toUpperCase()}:FF`,
    status: statuses[i % statuses.length],
    firmwareVersion: `v${1 + (i % 3)}.${i % 10}.${i % 5}`,
    lastSeen: new Date(Date.now() - i * 60_000 * 17).toLocaleString(),
  };
});

// ---------------------------------------------------------------------------
// Storybook meta
// ---------------------------------------------------------------------------

const meta: Meta = {
  title: 'Components/BiampTable',
  tags: ['autodocs'],
  parameters: { canvasBackground: 'background.paper' },
};

export default meta;
type Story = StoryObj;

// ---------------------------------------------------------------------------
// 1. Default — minimal table
// ---------------------------------------------------------------------------

/** Minimal table with no extras — just data and columns. */
export const Default: Story = {
  render: () => {
    const table = useReactTable({
      data: rows5,
      columns,
      getCoreRowModel: coreRowModel,
    });

    return <BiampTable table={table} />;
  },
};

// ---------------------------------------------------------------------------
// 2. Interactive — all client-side features
// ---------------------------------------------------------------------------

/**
 * All client-side interactive features in one place: sorting, pagination,
 * row selection (per-row), column visibility, and clickable rows.
 * Only "Available" rooms are selectable and clickable.
 */
export const Interactive: Story = {
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
      getCoreRowModel: coreRowModel,
      getSortedRowModel: sortedRowModel,
      getPaginationRowModel: paginationRowModel,
      getRowId: (row) => String(row.id),
      enableRowSelection: (row) => row.original.status === 'Available',
      state: { sorting, rowSelection, columnVisibility },
      onSortingChange: setSorting,
      onRowSelectionChange: setRowSelection,
      onColumnVisibilityChange: setColumnVisibility,
      initialState: { pagination: { pageSize: 5, pageIndex: 0 } },
    });

    return (
      <Stack spacing={2} height="100%">
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="body2">
            {selectedCount} row{selectedCount !== 1 ? 's' : ''} selected &mdash;
            only Available rooms are selectable &amp; clickable
          </Typography>
          <Box>
            <BiampTableToolbarActionButton
              label="Toggle column visibility"
              icon={<ColumnsIcon variant="xs" />}
              badgeContent={getColumnVisibilityDirtyCount(table)}
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
        </Box>
        <BiampTable
          table={table}
          enableRowSelection
          onRowClick={(row) => console.log('Row clicked:', row)}
          isRowClickable={(row: Room) => row.status === 'Available'}
        />
        <BiampTablePagination table={table} rowsPerPageOptions={[5, 10, 15]} />
      </Stack>
    );
  },
};

// ---------------------------------------------------------------------------
// 3. States — loading, error, and empty
// ---------------------------------------------------------------------------

type TableState =
  | 'loading'
  | 'error'
  | 'error-custom'
  | 'empty'
  | 'empty-custom';

const stateLabels: [TableState, string][] = [
  ['loading', 'Loading'],
  ['error', 'Error'],
  ['error-custom', 'Error (custom)'],
  ['empty', 'Empty'],
  ['empty-custom', 'Empty (custom)'],
];

/** Toggle between loading, error, and empty states (default and custom variants). */
export const States: Story = {
  render: () => {
    const [state, setState] = useState<TableState>('loading');

    const data = state === 'loading' ? rows5 : emptyRows;

    const table = useReactTable({
      data,
      columns,
      getCoreRowModel: coreRowModel,
    });

    const stateProps: Record<
      TableState,
      {
        loading?: boolean;
        error?: boolean | React.ReactNode;
        empty?: boolean | React.ReactNode;
      }
    > = {
      loading: { loading: true },
      error: { error: true },
      'error-custom': {
        error: (
          <BiampTableErrorState description="Failed to load rooms. Please try again." />
        ),
      },
      empty: {},
      'empty-custom': {
        empty: (
          <BiampTableEmptyState description="No rooms match your filters." />
        ),
      },
    };

    return (
      <Stack spacing={2} height="100%">
        <Stack direction="row" spacing={1} flexWrap="wrap">
          {stateLabels.map(([value, label]) => (
            <Chip
              key={value}
              label={label}
              variant={state === value ? 'filled' : 'outlined'}
              color={state === value ? 'primary' : 'default'}
              onClick={() => setState(value)}
            />
          ))}
        </Stack>
        <BiampTable table={table} {...stateProps[state]} />
      </Stack>
    );
  },
};

// ---------------------------------------------------------------------------
// 4. StickyColumns — large dataset with sticky action column
// ---------------------------------------------------------------------------

/**
 * 100 rows × 10 columns with a sticky action column pinned to the right.
 * Scroll horizontally and vertically to test scrolling behaviour.
 */
export const StickyColumns: Story = {
  render: () => {
    const [sorting, setSorting] = useState<SortingState>([]);

    const table = useReactTable({
      data: deviceRows,
      columns: deviceColumnsWithAction,
      getCoreRowModel: coreRowModel,
      getSortedRowModel: sortedRowModel,
      state: { sorting },
      onSortingChange: setSorting,
    });

    return (
      <Stack spacing={2} height="100%">
        <Typography variant="body2">
          100 rows, 10 columns + sticky action column. Scroll to test.
        </Typography>
        <BiampTable table={table} enableRowSelection />
      </Stack>
    );
  },
};

// ---------------------------------------------------------------------------
// 5. WithToolbar — full server-side demo
// ---------------------------------------------------------------------------

/**
 * Simulates a server-side fetch with filtering, sorting, and pagination.
 * Returns a page of data plus a total count after a 600ms delay.
 */
function simulateFetch(params: {
  search: string;
  status: string;
  sorting: SortingState;
  pagination: PaginationState;
}): Promise<{ data: Room[]; total: number }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      let data = [...rows];

      if (params.search) {
        const lower = params.search.toLowerCase();
        data = data.filter((r) => r.name.toLowerCase().includes(lower));
      }
      if (params.status) {
        data = data.filter((r) => r.status === params.status);
      }

      if (params.sorting.length) {
        const { id, desc } = params.sorting[0];
        data.sort((a, b) => {
          const av = a[id as keyof Room];
          const bv = b[id as keyof Room];
          return (av < bv ? -1 : av > bv ? 1 : 0) * (desc ? -1 : 1);
        });
      }

      const total = data.length;
      const start = params.pagination.pageIndex * params.pagination.pageSize;
      data = data.slice(start, start + params.pagination.pageSize);

      resolve({ data, total });
    }, 600);
  });
}

/**
 * Full server-side demo with toolbar: search (debounced), filter drawer,
 * column visibility, export button, pagination, and loading states.
 */
export const WithToolbar: Story = {
  render: () => {
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [exporting, setExporting] = useState(false);
    const [sorting, setSorting] = useState<SortingState>([]);
    const [pagination, setPagination] = useState<PaginationState>({
      pageIndex: 0,
      pageSize: 5,
    });
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
      {},
    );
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

    const [data, setData] = useState<Room[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const fetchIdRef = useRef(0);

    const debouncedFetch = useDebouncedCallback(() => {
      const id = ++fetchIdRef.current;
      setLoading(true);
      simulateFetch({ search, status: filterStatus, sorting, pagination }).then(
        (result) => {
          if (id !== fetchIdRef.current) return;
          setData(result.data);
          setTotal(result.total);
          setLoading(false);
        },
      );
    });

    useEffect(() => {
      debouncedFetch();
    }, [search, filterStatus, sorting, pagination, debouncedFetch]);

    const table = useReactTable({
      data,
      columns,
      getCoreRowModel: coreRowModel,
      manualSorting: true,
      manualPagination: true,
      rowCount: total,
      state: { sorting, pagination, columnVisibility },
      onSortingChange: setSorting,
      onPaginationChange: setPagination,
      onColumnVisibilityChange: setColumnVisibility,
    });

    const activeFilterCount = filterStatus ? 1 : 0;

    const handleExport = () => {
      setExporting(true);
      setTimeout(() => setExporting(false), 2000);
    };

    return (
      <Stack spacing={2} height="100%">
        <BiampTableToolbar>
          <BiampTableToolbarActions>
            <BiampTableToolbarFilters
              activeFilterCount={activeFilterCount}
              onReset={() => setFilterStatus('')}
            >
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={filterStatus}
                  label="Status"
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="Available">Available</MenuItem>
                  <MenuItem value="Occupied">Occupied</MenuItem>
                  <MenuItem value="Maintenance">Maintenance</MenuItem>
                </Select>
              </FormControl>
            </BiampTableToolbarFilters>
            <BiampTableToolbarActionButton
              label="Toggle column visibility"
              icon={<ColumnsIcon variant="xs" />}
              badgeContent={getColumnVisibilityDirtyCount(table)}
              onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
                setAnchorEl(e.currentTarget)
              }
            />
            <BiampTableColumnVisibility
              table={table}
              anchorEl={anchorEl}
              onClose={() => setAnchorEl(null)}
            />
            <BiampTableToolbarExport
              onExport={handleExport}
              loading={exporting}
            />
            <BiampTableToolbarSearch
              onChange={setSearch}
              placeholder="Search rooms..."
              expandable
            />
          </BiampTableToolbarActions>
        </BiampTableToolbar>
        <BiampTable table={table} loading={loading} />
        <BiampTablePagination
          table={table}
          rowsPerPageOptions={[5, 10, 15]}
          loading={loading}
        />
      </Stack>
    );
  },
};
