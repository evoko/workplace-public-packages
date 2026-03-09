import React, { useEffect, useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  Box,
  Button,
  Chip,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import {
  BiampTable,
  BiampTableCellActionButton,
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
  useBiampServerSideTable,
  useDebouncedCallback,
  type ColumnVisibility,
  type ServerSideOrder,
} from '@bwp-web/components';
import { AddIcon, ColumnsIcon, DeleteIcon } from '@bwp-web/assets';
import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
  type ExpandedState,
  type VisibilityState,
  getExpandedRowModel,
} from '@tanstack/react-table';

// Row model factories must be stable references — calling getCoreRowModel() etc.
// inside the render function creates new references every render, causing TanStack
// to invalidate memoized row models and trigger autoResetPageIndex loops.
const coreRowModel = getCoreRowModel();
const sortedRowModel = getSortedRowModel();
const paginationRowModel = getPaginationRowModel();
const expandedRowModel = getExpandedRowModel();

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
    meta: { sticky: 'right', columnLabel: 'Actions' },
    cell: ({ row }) => (
      <BiampTableCellActionButton label={'delete'} icon={<DeleteIcon />} />
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
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
      {},
    );
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

    const table = useReactTable({
      data: deviceRows,
      columns: deviceColumnsWithAction,
      getCoreRowModel: coreRowModel,
      getSortedRowModel: sortedRowModel,
      state: { sorting, columnVisibility },
      onSortingChange: setSorting,
      onColumnVisibilityChange: setColumnVisibility,
    });

    return (
      <Stack spacing={2} height="100%">
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="body2">
            100 rows, 10 columns + sticky action column. Scroll to test.
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

// ---------------------------------------------------------------------------
// 6. Expandable — rows with children
// ---------------------------------------------------------------------------

type Building = {
  id: number;
  name: string;
  status: string;
  capacity: number;
  floor: string;
  children?: Building[];
};

const buildingColumnHelper = createColumnHelper<Building>();
const buildingColumns = [
  buildingColumnHelper.accessor('name', {
    header: 'Name',
    meta: { minWidth: 200 },
  }),
  buildingColumnHelper.accessor('status', { header: 'Status' }),
  buildingColumnHelper.accessor('capacity', { header: 'Capacity' }),
  buildingColumnHelper.accessor('floor', { header: 'Floor' }),
];

const buildingRows: Building[] = [
  {
    id: 1000,
    name: 'HQ Building',
    status: 'Available',
    capacity: 200,
    floor: '-',
    children: [
      {
        id: 100,
        name: '1st Floor',
        status: 'Available',
        capacity: 80,
        floor: '1st',
        children: [
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
            id: 6,
            name: 'Huddle Space 1',
            status: 'Occupied',
            capacity: 3,
            floor: '1st',
          },
          {
            id: 12,
            name: 'Collaboration Hub',
            status: 'Available',
            capacity: 15,
            floor: '1st',
          },
          {
            id: 14,
            name: 'Lounge Area',
            status: 'Available',
            capacity: 8,
            floor: '1st',
          },
        ],
      },
      {
        id: 200,
        name: '2nd Floor',
        status: 'Available',
        capacity: 50,
        floor: '2nd',
        children: [
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
            id: 7,
            name: 'Huddle Space 2',
            status: 'Available',
            capacity: 3,
            floor: '2nd',
          },
          {
            id: 15,
            name: 'Innovation Lab',
            status: 'Available',
            capacity: 12,
            floor: '2nd',
          },
        ],
      },
      {
        id: 300,
        name: '3rd Floor',
        status: 'Available',
        capacity: 70,
        floor: '3rd',
        children: [
          {
            id: 5,
            name: 'Board Room',
            status: 'Available',
            capacity: 20,
            floor: '3rd',
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
            id: 13,
            name: 'Webinar Studio',
            status: 'Occupied',
            capacity: 5,
            floor: '3rd',
          },
        ],
      },
      {
        id: 22,
        name: 'Rooftop Terrace',
        status: 'Available',
        capacity: 20,
        floor: 'R',
      },
    ],
  },
  {
    id: 2000,
    name: 'Annex Building',
    status: 'Available',
    capacity: 60,
    floor: '-',
    children: [
      {
        id: 400,
        name: 'Ground Floor',
        status: 'Available',
        capacity: 35,
        floor: 'G',
        children: [
          {
            id: 16,
            name: 'Reception Desk',
            status: 'Available',
            capacity: 2,
            floor: 'G',
          },
          {
            id: 17,
            name: 'Visitor Lounge',
            status: 'Available',
            capacity: 10,
            floor: 'G',
          },
        ],
      },
      {
        id: 500,
        name: 'Upper Floor',
        status: 'Maintenance',
        capacity: 25,
        floor: '1st',
        children: [
          {
            id: 18,
            name: 'Workshop A',
            status: 'Maintenance',
            capacity: 15,
            floor: '1st',
          },
          {
            id: 19,
            name: 'Workshop B',
            status: 'Available',
            capacity: 10,
            floor: '1st',
          },
        ],
      },
      {
        id: 23,
        name: 'Storage Room',
        status: 'Maintenance',
        capacity: 0,
        floor: 'B1',
      },
    ],
  },
  {
    id: 20,
    name: 'Outdoor Pavilion',
    status: 'Available',
    capacity: 50,
    floor: '-',
  },
  {
    id: 21,
    name: 'Parking Garage',
    status: 'Available',
    capacity: 0,
    floor: '-',
  },
];

/** Expandable rows with children. Click the chevron to expand/collapse floor groups. */
export const Expandable: Story = {
  render: () => {
    const [expanded, setExpanded] = useState<ExpandedState>({});

    const table = useReactTable({
      data: buildingRows,
      columns: buildingColumns,
      getCoreRowModel: coreRowModel,
      getExpandedRowModel: expandedRowModel,
      getSubRows: (row) => row.children,
      getRowId: (row) => String(row.id),
      state: { expanded },
      onExpandedChange: setExpanded,
    });

    return (
      <Stack spacing={2} height="100%">
        <Typography variant="body2">
          Click the chevron to expand/collapse floor groups.
        </Typography>
        <BiampTable table={table} enableExpanding />
      </Stack>
    );
  },
};

// ---------------------------------------------------------------------------
// 7. ExpandableWithSelection — expanding + selection + row click
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// TextTruncation — demo for truncated cells with hover tooltips
// ---------------------------------------------------------------------------

type LongTextRoom = {
  id: number;
  name: string;
  description: string;
  status: string;
  action: string;
  notes: string;
};

const longTextColumnHelper = createColumnHelper<LongTextRoom>();
const longTextColumns = [
  longTextColumnHelper.accessor('name', {
    header: 'Room Name',
    meta: { minWidth: 150 },
  }),
  longTextColumnHelper.accessor('description', {
    header: 'Description',
    meta: { minWidth: 200 },
  }),
  longTextColumnHelper.accessor('status', {
    header: 'Status',
    meta: { minWidth: 80 },
  }),
  longTextColumnHelper.accessor('action', {
    header: 'Action',
    meta: { minWidth: 150, truncate: false },
    cell: ({ getValue }) => (
      <Button variant="contained" size="small">
        {getValue()}
      </Button>
    ),
  }),
  longTextColumnHelper.accessor('notes', {
    header: 'Notes',
    meta: { minWidth: 200 },
  }),
];

const longTextRows: LongTextRoom[] = [
  {
    id: 1,
    name: 'Conference Room Alpha with Extended Name That Keeps Going',
    description:
      'Large conference room with panoramic windows overlooking the city skyline, equipped with a 4K projector and surround sound system',
    status: 'Available',
    action: 'Reserve Conference Room Alpha for Q3 Planning',
    notes:
      'Recently renovated with new AV equipment. Booking requires manager approval for meetings longer than 2 hours.',
  },
  {
    id: 2,
    name: 'B',
    description: 'Small huddle space',
    status: 'Occupied',
    action: 'Check Availability',
    notes: 'OK',
  },
  {
    id: 3,
    name: 'Executive Board Room — Reserved for C-Suite and VIP Guests Only',
    description:
      'Premium meeting space with Italian marble table seating 24 guests, integrated Crestron control system, and dedicated catering pantry',
    status: 'Maintenance',
    action: 'Submit Maintenance Request for Board Room Renovation',
    notes:
      'Scheduled for carpet replacement and lighting upgrade. Expected completion date is end of Q2. Contact facilities for temporary alternatives.',
  },
  {
    id: 4,
    name: 'Innovation Lab & Maker Space (Building 3, Floor 2, Wing East)',
    description:
      'Open-plan collaborative workspace with standing desks, whiteboard walls, 3D printers, and a dedicated prototyping area for hardware projects',
    status: 'Available',
    action: 'Book Innovation Lab & Request 3D Printer Access',
    notes:
      'Access requires badge level 3 or above. All prototype materials must be logged in the inventory system before removal.',
  },
  {
    id: 5,
    name: 'Zen',
    description: 'Quiet room',
    status: 'Available',
    action: 'Reserve',
    notes: 'No meetings — meditation and focus work only.',
  },
];

/**
 * Demonstrates automatic text truncation with hover tooltips.
 * Cells with long text show ellipsis and reveal the full content in a tooltip on hover.
 * The table is constrained to 700px width to force truncation.
 */
export const TextTruncation: Story = {
  render: () => {
    const table = useReactTable({
      data: longTextRows,
      columns: longTextColumns,
      getCoreRowModel: coreRowModel,
    });

    return (
      <Stack spacing={2} height="100%">
        <Typography variant="body2">
          Hover over truncated cells (with &hellip;) to see the full text in a
          tooltip. The table is constrained to 700px to force truncation.
        </Typography>
        <BiampTable table={table} />
      </Stack>
    );
  },
};

/** Expandable rows combined with row selection and row click. Only "Available" rows are selectable and clickable. */
export const ExpandableWithSelection: Story = {
  render: () => {
    const [expanded, setExpanded] = useState<ExpandedState>({});
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const [selectChildrenWithParent, setSelectChildrenWithParent] =
      useState(true);
    const selectedCount = Object.keys(rowSelection).length;

    const table = useReactTable({
      data: buildingRows,
      columns: buildingColumns,
      getCoreRowModel: coreRowModel,
      getExpandedRowModel: expandedRowModel,
      getSubRows: (row) => row.children,
      getRowId: (row) => String(row.id),
      enableRowSelection: (row) => row.original.status === 'Available',
      state: { expanded, rowSelection },
      onExpandedChange: setExpanded,
      onRowSelectionChange: setRowSelection,
    });

    return (
      <Stack spacing={2} height="100%">
        <Stack direction="row" spacing={2} alignItems="center">
          <Typography variant="body2">
            {selectedCount} row{selectedCount !== 1 ? 's' : ''} selected &mdash;
            only Available rows are selectable &amp; clickable
          </Typography>
          <Chip
            label={selectChildrenWithParent ? 'Cascade: ON' : 'Cascade: OFF'}
            color={selectChildrenWithParent ? 'primary' : 'default'}
            variant={selectChildrenWithParent ? 'filled' : 'outlined'}
            onClick={() => {
              setSelectChildrenWithParent((prev) => !prev);
              setRowSelection({});
            }}
          />
        </Stack>
        <BiampTable
          table={table}
          enableExpanding
          enableRowSelection
          selectChildrenWithParent={selectChildrenWithParent}
          onRowClick={(row) => console.log('Row clicked:', row)}
          isRowClickable={(row: Building) => row.status === 'Available'}
          getRowLabel={(row: Building) => row.name}
        />
      </Stack>
    );
  },
};

// ---------------------------------------------------------------------------
// 9. ServerSideHook — useBiampServerSideTable demo
// ---------------------------------------------------------------------------

/** Simulated server-side order field enum, like a GraphQL OrderField. */
const RoomOrderField = {
  Name: 'NAME',
  Status: 'STATUS',
  Capacity: 'CAPACITY',
  Floor: 'FLOOR',
} as const;
type RoomOrderField = (typeof RoomOrderField)[keyof typeof RoomOrderField];

const serverSideColumnHelper = createColumnHelper<Room>();
const serverSideColumns = [
  serverSideColumnHelper.accessor('name', {
    header: 'Room Name',
    meta: { minWidth: 200, orderField: RoomOrderField.Name },
  }),
  serverSideColumnHelper.accessor('status', {
    header: 'Status',
    meta: { orderField: RoomOrderField.Status },
  }),
  serverSideColumnHelper.accessor('capacity', {
    header: 'Capacity',
    meta: { orderField: RoomOrderField.Capacity },
  }),
  serverSideColumnHelper.accessor('floor', {
    header: 'Floor',
    meta: { orderField: RoomOrderField.Floor, defaultVisible: false },
  }),
];

function simulateServerFetch(params: {
  search: string;
  order?: ServerSideOrder<RoomOrderField>;
  page: number;
  pageSize: number;
}): Promise<{ data: Room[]; total: number }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      let data = [...rows];

      if (params.search) {
        const lower = params.search.toLowerCase();
        data = data.filter((r) => r.name.toLowerCase().includes(lower));
      }

      if (params.order) {
        const field = params.order.field.toLowerCase() as keyof Room;
        const desc = params.order.desc ?? false;
        data.sort((a, b) => {
          const av = a[field];
          const bv = b[field];
          return (av < bv ? -1 : av > bv ? 1 : 0) * (desc ? -1 : 1);
        });
      }

      const total = data.length;
      data = data.slice(
        params.page * params.pageSize,
        (params.page + 1) * params.pageSize,
      );
      resolve({ data, total });
    }, 400);
  });
}

/**
 * Demonstrates `useBiampServerSideTable` — the hook that replaces ~40 lines
 * of boilerplate per table. Compare with the `WithToolbar` story which uses
 * raw `useReactTable`.
 */
export const ServerSideHook: Story = {
  render: () => {
    const [search, setSearch] = useState('');
    const [order, setOrder] = useState<
      ServerSideOrder<RoomOrderField> | undefined
    >();
    const [page, setPage] = useState(0);
    const [columnVisibility, setColumnVisibility] = useState<
      ColumnVisibility | undefined
    >();
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

    const [data, setData] = useState<Room[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const fetchIdRef = useRef(0);

    const debouncedFetch = useDebouncedCallback(() => {
      const id = ++fetchIdRef.current;
      setLoading(true);
      simulateServerFetch({ search, order, page, pageSize: 5 }).then(
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
    }, [search, order, page, debouncedFetch]);

    // This is the entire table setup — no useMemo blocks, no onChange handlers.
    const table = useBiampServerSideTable<Room, RoomOrderField>({
      data,
      columns: serverSideColumns,
      getRowId: (row) => String(row.id),
      order,
      onOrderChange: (next) => {
        setOrder(next);
        setPage(0);
      },
      page,
      rowsPerPage: 5,
      onPageChange: setPage,
      rowCount: total,
      columnVisibility,
      onColumnVisibilityChange: setColumnVisibility,
    });

    return (
      <Stack spacing={2} height="100%">
        <Typography variant="body2">
          Uses <code>useBiampServerSideTable</code> — compare with the
          WithToolbar story that uses raw <code>useReactTable</code>.
        </Typography>
        <BiampTableToolbar>
          <BiampTableToolbarActions>
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
            <BiampTableToolbarSearch
              onChange={(v) => {
                setSearch(v);
                setPage(0);
              }}
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

// ---------------------------------------------------------------------------
// 10. ServerSideExpandableWithSelection — useBiampServerSideTable + expand + select
// ---------------------------------------------------------------------------

/**
 * Demonstrates `useBiampServerSideTable` with both row expansion and row
 * selection enabled. Useful for profiling selection-click performance when
 * the expanded row model is attached.
 */
export const ServerSideExpandableWithSelection: Story = {
  render: () => {
    const [expanded, setExpanded] = useState<ExpandedState>({});
    const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);

    const table = useBiampServerSideTable<Building>({
      data: buildingRows,
      columns: buildingColumns,
      getRowId: (row) => String(row.id),
      expanded,
      onExpandedChange: setExpanded,
      getSubRows: (row) => row.children,
      selectedRowIds,
      onSelectedRowIdsChange: setSelectedRowIds,
      enableRowSelection: (row) => row.original.status === 'Available',
    });

    return (
      <Stack spacing={2} height="100%">
        <Typography variant="body2">
          Uses <code>useBiampServerSideTable</code> with expanding + selection.{' '}
          {selectedRowIds.length} row
          {selectedRowIds.length !== 1 ? 's' : ''} selected. Open DevTools
          Performance tab and click checkboxes to profile.
        </Typography>
        <BiampTable
          table={table}
          enableExpanding
          enableRowSelection
          onRowClick={(row) => console.log('Row clicked:', row)}
          isRowClickable={(row: Building) => row.status === 'Available'}
          getRowLabel={(row: Building) => row.name}
        />
      </Stack>
    );
  },
};
