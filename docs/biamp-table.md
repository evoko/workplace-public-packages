# BiampTable

A composable, accessible data table built on [TanStack React Table](https://tanstack.com/table) and MUI. Provides sorting, row selection, pagination, column visibility, toolbar actions, search, filters, and export — all wired to a single TanStack `Table` instance.

## Installation

```bash
npm install @bwp-web/components
```

### Peer Dependencies

- `@bwp-web/assets` >= 0.13.5
- `@bwp-web/styles` >= 0.13.5
- `@mui/material` >= 7.0.0
- `@tanstack/react-table` >= 8.0.0
- `react` >= 18.0.0
- `react-dom` >= 18.0.0

## Quick Start

```tsx
import {
  BiampTable,
  BiampTableContainer,
  BiampTablePagination,
  BiampTableToolbar,
  BiampTableToolbarSearch,
  BiampTableToolbarActions,
} from '@bwp-web/components';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  createColumnHelper,
} from '@tanstack/react-table';

type Device = { name: string; location: string; status: string };

const columnHelper = createColumnHelper<Device>();

const columns = [
  columnHelper.accessor('name', {
    header: 'Name',
    meta: { minWidth: 200 },
  }),
  columnHelper.accessor('location', {
    header: 'Location',
    meta: { minWidth: 160 },
  }),
  columnHelper.accessor('status', {
    header: 'Status',
    meta: { minWidth: 120 },
  }),
];

function DeviceTable({ data }: { data: Device[] }) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <BiampTableContainer>
      <BiampTableToolbar>
        <BiampTableToolbarSearch onChange={(value) => console.log(value)} />
        <BiampTableToolbarActions />
      </BiampTableToolbar>
      <BiampTable table={table} />
      <BiampTablePagination table={table} />
    </BiampTableContainer>
  );
}
```

## Column Metadata

TanStack column definitions accept a `meta` object with these additional properties (via type augmentation):

| Property | Type | Description |
|----------|------|-------------|
| `minWidth` | `number \| string` | CSS min-width applied to the column's header and body cells. Defaults to `40`. |
| `sticky` | `'left' \| 'right'` | Makes the column sticky to the specified edge of the table. |
| `defaultVisible` | `boolean` | Whether the column is visible by default. Defaults to `true`. Used by `getDefaultColumnVisibility` and `getColumnVisibilityDirtyCount`. |
| `columnLabel` | `string` | Human-readable label used in the column-visibility menu when `header` is not a string. |
| `orderField` | `string` | Server-side order field name associated with this column. Used by `useBiampServerSideTable` to map between TanStack column IDs and GraphQL order field enums. |
| `truncate` | `boolean` | When `true` (default), wraps cell content in `BiampTableTruncatedCell` (single-line ellipsis with hover tooltip) and constrains the cell to `maxWidth`. Set to `false` on columns with custom cell renderers (buttons, badges, etc.) to skip truncation and allow the content to render at full width without shrinking. |

```tsx
columnHelper.accessor('name', {
  header: 'Name',
  meta: { minWidth: 200, sticky: 'left', orderField: 'NAME' },
});

// Custom cell renderer — opt out of truncation
columnHelper.accessor('action', {
  header: 'Action',
  meta: { minWidth: 150, truncate: false },
  cell: ({ getValue }) => <Button size="small">{getValue()}</Button>,
});
```

## Components

### `BiampTableContainer`

Layout wrapper that stacks toolbar, table, and pagination into a full-height column with responsive spacing and optional borders. Extends MUI `StackProps`.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `withBorderTop` | `boolean` | `true` | Show a top border (`0.6px solid` divider color) |
| `withBorderBottom` | `boolean` | `false` | Show a bottom border |
| `children` | `ReactNode` | _(required)_ | Typically `BiampTableToolbar`, `BiampTable`, and `BiampTablePagination` |
| _...rest_ | `StackProps` | — | All other MUI `Stack` props are forwarded |

---

### `BiampTable`

The core table renderer. Connects to a TanStack `Table` instance and renders a scrollable MUI table with sorting, selection, sticky columns, and accessible keyboard navigation. Extends MUI `BoxProps`.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `table` | `Table<TData>` | _(required)_ | TanStack Table instance |
| `onRowClick` | `(row: TData) => void` | — | Called when a clickable body row is clicked with the row's original data |
| `isRowClickable` | `(row: TData) => boolean` | — | Controls which rows are clickable. When omitted, all rows are clickable if `onRowClick` is provided |
| `loading` | `boolean` | — | Reduces body opacity (debounced to avoid flicker on fast responses) |
| `error` | `boolean \| Error \| ReactNode` | — | Pass `true` or an `Error` for the default error state (an `Error`'s message is displayed), or a custom `ReactNode` |
| `empty` | `boolean \| ReactNode` | — | Pass `true` for the default empty state, or a custom `ReactNode`. Only shown when the table has zero rows |
| `enableRowSelection` | `boolean` | `false` | When `true`, renders a checkbox column for row selection |
| `enableExpanding` | `boolean` | `false` | When `true`, renders an expand/collapse toggle for rows that have sub-rows |
| `hideSelectAll` | `boolean` | — | Hides the "select all" header checkbox while keeping individual row checkboxes |
| `selectChildrenWithParent` | `boolean` | `true` | When `true`, selecting a parent row also selects its children. When `false`, parent and child selections are independent. Only relevant when both `enableRowSelection` and `enableExpanding` are used |
| `getRowLabel` | `(row: TData) => string` | — | Returns a human-readable name for a row, used in ARIA labels (e.g. `"Select Conference Room A"`, `"Expand Floor 1"`). Falls back to row index |
| _...rest_ | `BoxProps` | — | All other MUI `Box` props are forwarded |

#### Row Selection

A checkbox column is rendered only when `enableRowSelection` is passed to `BiampTable`. You must also enable selection on the TanStack table instance:

```tsx
const table = useReactTable({
  data,
  columns,
  enableRowSelection: true, // or (row) => row.original.canSelect
  getCoreRowModel: getCoreRowModel(),
});

<BiampTable table={table} enableRowSelection getRowLabel={(row) => row.name} />
```

By default, selecting a parent row cascades to all its children. To make parent and child selections independent, pass `selectChildrenWithParent={false}`:

```tsx
<BiampTable
  table={table}
  enableRowSelection
  enableExpanding
  selectChildrenWithParent={false}
/>
```

#### Expandable Rows

When `enableExpanding` is passed, rows with sub-rows display a chevron toggle in the first non-sticky column. The chevron rotates 90° on expand/collapse. You must also configure TanStack for sub-rows.

With `useBiampServerSideTable`:

```tsx
const [expanded, setExpanded] = useState<ExpandedState>({});

const table = useBiampServerSideTable({
  data,
  columns,
  getSubRows: (row) => row.children,
  expanded,
  onExpandedChange: setExpanded,
});

<BiampTable table={table} enableExpanding getRowLabel={(row) => row.name} />
```

Or with `useReactTable` directly:

```tsx
const table = useReactTable({
  data,
  columns,
  getSubRows: (row) => row.children,
  getCoreRowModel: getCoreRowModel(),
  getExpandedRowModel: getExpandedRowModel(),
});

<BiampTable table={table} enableExpanding getRowLabel={(row) => row.name} />
```

#### Clickable Rows

When `onRowClick` is provided, rows receive `role="button"`, `tabIndex={0}`, a pointer cursor, and Enter/Space keyboard handlers:

```tsx
<BiampTable
  table={table}
  onRowClick={(row) => navigate(`/devices/${row.id}`)}
  isRowClickable={(row) => row.status !== 'offline'}
/>
```

#### Sorting

Sorting is handled by TanStack. The table renders custom Biamp sort icons via the theme (`DropdownChevronUpIcon`, `DropdownChevronDownIcon`, `DropdownChevronDuoIcon`). Header cells include `aria-sort` attributes.

```tsx
const table = useReactTable({
  data,
  columns,
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
});
```

---

### `BiampTablePagination`

Pagination controls connected to a TanStack Table instance. Extends MUI `TablePaginationProps`.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `table` | `Table<TData>` | _(required)_ | TanStack Table instance |
| `rowsPerPageOptions` | `number[]` | — | Rows-per-page selector options. When omitted, the selector is hidden |
| `loading` | `boolean` | — | When `true`, keeps the previous row count visible instead of dropping to 0 |
| `autoHide` | `boolean` | `true` | Hide pagination when all rows fit on one page |
| `position` | `'left' \| 'center' \| 'right'` | `'center'` | Horizontal alignment of the pagination controls |
| _...rest_ | `TablePaginationProps` | — | All other MUI `TablePagination` props are forwarded |

```tsx
<BiampTablePagination
  table={table}
  rowsPerPageOptions={[10, 25, 50, 100]}
  loading={isLoading}
  position="right"
/>
```

---

### `BiampTableToolbar`

Horizontal flex container for toolbar content. Extends MUI `BoxProps`. Renders with `role="toolbar"`.

```tsx
<BiampTableToolbar>
  <BiampTableToolbarSearch onChange={handleSearch} />
  <BiampTableToolbarActions>
    <BiampTableToolbarFilters {...filterProps} />
    <BiampTableToolbarExport onExport={handleExport} />
  </BiampTableToolbarActions>
</BiampTableToolbar>
```

---

### `BiampTableToolbarSearch`

Debounced search input with a clear button. Extends MUI `TextFieldProps` (except `onChange`, `value`, `defaultValue`).

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onChange` | `(value: string) => void` | _(required)_ | Called with the debounced search string |
| `defaultValue` | `string` | `''` | Initial value. When this prop changes externally, the input resets |
| `debounceDelay` | `number` | `300` | Debounce delay in milliseconds |
| `maxLength` | `number` | `120` | Maximum character length |
| `maxWidth` | `number` | `280` | Maximum width of the text field |
| `placeholder` | `string` | `'Search'` | Placeholder text (also used as `aria-label`) |
| `clearLabel` | `string` | `'Clear search'` | Accessible label for the clear button |
| `expandable` | `boolean` | `false` | When `true`, collapses to an icon button when empty and unfocused |
| `expandLabel` | `string` | placeholder | Accessible label for the collapsed icon button |
| `enableMobileView` | `boolean` | `true` | When `true`, renders a simplified full-width `InputBase` on screens below the `md` breakpoint |
| _...rest_ | `TextFieldProps` | — | All other MUI `TextField` props are forwarded |

---

### `BiampTableToolbarActions`

Right-aligned flex container for toolbar action buttons. Extends MUI `BoxProps`.

```tsx
<BiampTableToolbarActions>
  <BiampTableToolbarFilters {...filterProps} />
  <BiampTableToolbarExport onExport={handleExport} />
</BiampTableToolbarActions>
```

---

### `BiampTableToolbarFilters`

Filter panel rendered in a right-anchored MUI Drawer with reset and apply buttons.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `activeFilterCount` | `number` | _(required)_ | Number of active filters (shown as badge on trigger button) |
| `children` | `ReactNode` | _(required)_ | Filter form content rendered inside the drawer body |
| `onReset` | `() => void` | _(required)_ | Called when the user clicks the reset button |
| `onApply` | `() => void` | — | Called when the drawer closes (via close button, apply, or backdrop) |
| `icon` | `ReactNode` | `<FilterIcon />` | Icon for the toolbar trigger button |
| `title` | `string` | `'Filters'` | Drawer heading |
| `resetLabel` | `string` | `'Clear filters'` | Reset button label |
| `applyLabel` | `string` | `'Apply'` | Apply button label |
| `closeLabel` | `string` | `'Close'` | Accessible label for the drawer close button |
| `buttonLabel` | `string` | `'Filters'` | Accessible label for the toolbar trigger button |
| `DrawerProps` | `Partial<DrawerProps>` | — | Additional props forwarded to the MUI Drawer |

---

### `BiampTableToolbarExport`

Export button with a loading spinner. Extends `BiampTableToolbarActionButtonProps` (except `icon`, `label`, `onClick`, `badgeContent`).

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onExport` | `() => void` | _(required)_ | Called when the export button is clicked |
| `loading` | `boolean` | — | Shows a spinner and disables the button |
| `icon` | `ReactNode` | `<DownloadIcon />` | Icon element |
| `label` | `string` | `'Export'` | Accessible label |
| _...rest_ | `BiampTableToolbarActionButtonProps` | — | All other action button props are forwarded |

---

### `BiampTableToolbarActionButton`

Icon button with an optional badge indicator. Extends MUI `IconButtonProps` (except `children`, `aria-label`).

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | _(required)_ | Accessible label for the icon button |
| `icon` | `ReactNode` | _(required)_ | Icon to display |
| `badgeContent` | `BadgeProps['badgeContent']` | — | Badge content. Shown as a dot indicator when provided and non-zero |
| _...rest_ | `IconButtonProps` | — | All other MUI `IconButton` props are forwarded |

---

### `BiampTableCellActionButton`

Icon button with a tooltip, designed for use inside table cell action columns. Extends MUI `IconButtonProps` with generic component support.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | _(required)_ | Tooltip text and `aria-label` |
| `icon` | `ReactNode` | _(required)_ | Icon to display inside the button |
| _...rest_ | `IconButtonProps<C>` | — | All other MUI `IconButton` props are forwarded |

```tsx
import { BiampTableCellActionButton } from '@bwp-web/components';
import { EditIcon, DeleteIcon } from '@bwp-web/assets';

columnHelper.display({
  id: 'actions',
  header: '',
  cell: ({ row }) => (
    <>
      <BiampTableCellActionButton
        label="Edit"
        icon={<EditIcon variant="xs" />}
        onClick={() => handleEdit(row.original)}
      />
      <BiampTableCellActionButton
        label="Delete"
        icon={<DeleteIcon variant="xs" />}
        onClick={() => handleDelete(row.original)}
      />
    </>
  ),
});
```

---

### `BiampTableColumnVisibility`

Popover with a checklist for toggling column visibility. Extends MUI `PopoverProps` (except `open`).

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `table` | `Table<TData>` | _(required)_ | TanStack Table instance |
| `showAllLabel` | `string` | `'Show all'` | Label for the "show all" toggle |
| _...rest_ | `PopoverProps` | — | All other MUI `Popover` props are forwarded |

```tsx
const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

<BiampTableToolbarActionButton
  label="Columns"
  icon={<ColumnsIcon variant="xs" />}
  onClick={(e) => setAnchorEl(e.currentTarget)}
  badgeContent={getColumnVisibilityDirtyCount(table)}
/>
<BiampTableColumnVisibility
  table={table}
  anchorEl={anchorEl}
  onClose={() => setAnchorEl(null)}
/>
```

---

### `BiampTableToolbarColumnVisibility`

Self-managing column visibility button that renders both the trigger button and the popover internally. Eliminates the boilerplate of managing `anchorEl` state, wiring up the badge count, and rendering the popover separately. Extends `BiampTableToolbarActionButtonProps` (except `icon`, `label`, `onClick`, `badgeContent`).

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `table` | `Table<TData>` | _(required)_ | TanStack Table instance |
| `icon` | `ReactNode` | `<ColumnsIcon />` | Icon for the trigger button |
| `label` | `string` | `'Columns'` | Accessible label for the trigger button |
| `defaultColumnVisibility` | `ColumnVisibility` | — | Default visibility map for badge count. When omitted, auto-derived from `meta.defaultVisible` |
| `showAllLabel` | `string` | `'Show all'` | Label for the "show all" toggle |
| _...rest_ | `BiampTableToolbarActionButtonProps` | — | All other action button props are forwarded |

```tsx
<BiampTableToolbarActions>
  <BiampTableToolbarColumnVisibility table={table} />
</BiampTableToolbarActions>
```

---

### `BiampTableEmptyState`

Default empty-state message shown when the table has no rows. Extends `BiampTableStatusMessageProps` (all props optional).

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `icon` | `JSX.Element` | `<NoResultsIcon />` | Icon rendered at 56×56 |
| `title` | `string` | `'Nothing to show'` | Heading text |
| `description` | `string` | — | Optional body text |
| `children` | `ReactNode` | — | Optional extra content (e.g. a retry button) |
| _...rest_ | `StackProps` | — | All other MUI `Stack` props are forwarded |

---

### `BiampTableErrorState`

Default error-state message shown when the table encounters an error. Extends `BiampTableStatusMessageProps` (all props optional). Renders with `role="alert"` for screen reader announcement.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `icon` | `JSX.Element` | `<ServiceNotReachableIcon />` | Icon rendered at 56×56 |
| `title` | `string` | `'Failed to load'` | Heading text |
| `description` | `string` | — | Optional body text |
| `children` | `ReactNode` | — | Optional extra content (e.g. a retry button) |
| _...rest_ | `StackProps` | — | All other MUI `Stack` props are forwarded |

---

### `BiampTableStatusMessage`

Base component for table status messages (empty state, error state, or custom). Extends MUI `StackProps`.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `icon` | `JSX.Element` | _(required)_ | Icon element rendered at 56×56 with `aria-hidden` |
| `title` | `string` | _(required)_ | Heading text (rendered as `variant="h2"`) |
| `description` | `string` | — | Optional body text |
| `children` | `ReactNode` | — | Optional extra content below the description |
| _...rest_ | `StackProps` | — | All other MUI `Stack` props are forwarded |

---

### `BiampTableTruncatedCell`

Renders cell content with single-line truncation (ellipsis). A tooltip showing the full text appears on hover only when the content is actually truncated (`scrollWidth > clientWidth`). The tooltip popup is only mounted when open, so there is zero DOM overhead for non-truncated cells.

This component is automatically applied to all non-sticky body cells by `BiampTable` — you do not need to use it manually in most cases. It can also be used standalone when custom cell rendering needs truncation.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | _(required)_ | Cell content to render with truncation |

```tsx
import { BiampTableTruncatedCell } from '@bwp-web/components';

// Standalone usage (rare — BiampTable applies this automatically)
<BiampTableTruncatedCell>
  This is a very long string that will be truncated with an ellipsis
</BiampTableTruncatedCell>
```

## Utilities

### `useBiampServerSideTable`

Wraps `useReactTable` with the standard server-side configuration: manual sorting, manual pagination, column visibility with dirty-tracking, optional row selection with ID-based state, and optional expandable rows. Eliminates ~40 lines of boilerplate per table implementation.

All feature groups (sorting, pagination, column visibility, row selection, expanding) are independently optional — only pass the props you need.

#### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `data` | `TData[]` | _(required)_ | Row data array |
| `columns` | `ColumnDef<TData, any>[]` | _(required)_ | TanStack column definitions. Use `meta.orderField` to map columns to server-side order fields |
| `getRowId` | `(row: TData) => string` | `(row) => row.id` | Extracts a unique ID from each row |
| `order` | `ServerSideOrder<F>` | — | Current server-side order. `undefined` means no sorting |
| `onOrderChange` | `(order?: ServerSideOrder<F>) => void` | — | Called when the user changes sorting. `undefined` means sorting was cleared |
| `page` | `number` | — | Zero-based page index |
| `rowsPerPage` | `number` | — | Number of rows per page |
| `onPageChange` | `(page: number) => void` | — | Called when the user changes page |
| `rowCount` | `number` | — | Total row count from the server (for pagination display) |
| `columnVisibility` | `ColumnVisibility` | — | Current column visibility overrides. Merged with defaults from `meta.defaultVisible` |
| `onColumnVisibilityChange` | `(visibility: ColumnVisibility) => void` | — | Called with only the entries that differ from defaults (for URL persistence) |
| `selectedRowIds` | `string[]` | — | Currently selected row IDs |
| `onSelectedRowIdsChange` | `(ids: string[]) => void` | — | Called when selection changes |
| `enableRowSelection` | `boolean \| ((row: Row<TData>) => boolean)` | `true` | Enable row selection. Only used when `selectedRowIds` is provided |
| `expanded` | `ExpandedState` | — | Current expanded state. `{}` means nothing expanded; `true` expands all |
| `onExpandedChange` | `(expanded: ExpandedState) => void` | — | Called when the user expands/collapses rows |
| `getSubRows` | `(row: TData) => TData[] \| undefined` | — | Returns child rows for a given row (enables sub-row expanding) |

#### Returns

`Table<TData>` — a TanStack Table instance ready to pass to `<BiampTable table={table} />`.

#### Example

```tsx
import {
  BiampTable,
  BiampTableContainer,
  BiampTablePagination,
  BiampTableToolbar,
  BiampTableToolbarSearch,
  BiampTableToolbarActions,
  BiampTableToolbarColumnVisibility,
  useBiampServerSideTable,
  type ColumnVisibility,
  type ServerSideOrder,
} from '@bwp-web/components';
import { createColumnHelper } from '@tanstack/react-table';

type Device = { id: string; name: string; location: string; status: string };
type DeviceOrderField = 'NAME' | 'LOCATION' | 'STATUS';

const columnHelper = createColumnHelper<Device>();

const columns = [
  columnHelper.accessor('name', {
    header: 'Name',
    meta: { minWidth: 200, orderField: 'NAME' },
  }),
  columnHelper.accessor('location', {
    header: 'Location',
    meta: { minWidth: 160, orderField: 'LOCATION' },
  }),
  columnHelper.accessor('status', {
    header: 'Status',
    meta: { minWidth: 120, orderField: 'STATUS', defaultVisible: false },
  }),
];

function DeviceTable() {
  // These would typically come from URL params + a server-side query hook
  const [order, setOrder] = useState<ServerSideOrder<DeviceOrderField>>();
  const [page, setPage] = useState(0);
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>({});
  const { data, totalCount } = useDevicesQuery({ order, page, limit: 25 });

  const table = useBiampServerSideTable<Device, DeviceOrderField>({
    data,
    columns,
    order,
    onOrderChange: setOrder,
    page,
    rowsPerPage: 25,
    onPageChange: setPage,
    rowCount: totalCount,
    columnVisibility,
    onColumnVisibilityChange: setColumnVisibility,
  });

  return (
    <BiampTableContainer>
      <BiampTableToolbar>
        <BiampTableToolbarSearch onChange={handleSearch} />
        <BiampTableToolbarActions>
          <BiampTableToolbarColumnVisibility table={table} />
        </BiampTableToolbarActions>
      </BiampTableToolbar>
      <BiampTable table={table} />
      <BiampTablePagination table={table} />
    </BiampTableContainer>
  );
}
```

---

### `useDebouncedCallback`

```tsx
import { useDebouncedCallback, BIAMP_TABLE_DEBOUNCE_DELAY } from '@bwp-web/components';

const debouncedSearch = useDebouncedCallback((value: string) => {
  fetchResults(value);
}, 500); // default: BIAMP_TABLE_DEBOUNCE_DELAY (300ms)
```

### `getColumnVisibilityDirtyCount`

Returns the number of columns whose visibility differs from the default state. When `defaultVisibility` is omitted, auto-derives from `meta.defaultVisible` on each column.

```tsx
import { getColumnVisibilityDirtyCount } from '@bwp-web/components';

const dirtyCount = getColumnVisibilityDirtyCount(table);
// or with a custom default:
const dirtyCount = getColumnVisibilityDirtyCount(table, { name: true, status: false });
```

### `getDefaultColumnVisibility`

Reads `meta.defaultVisible` from all leaf columns and returns a `ColumnVisibility` map. Columns without `defaultVisible` are omitted (treated as visible).

```tsx
import { getDefaultColumnVisibility } from '@bwp-web/components';

const defaults = getDefaultColumnVisibility(table);
// e.g. { notes: false } if the "notes" column has meta: { defaultVisible: false }
```

### `toVisibilityState`

Converts a `ColumnVisibility` to TanStack's `VisibilityState`. Use when passing to `useReactTable({ state: { columnVisibility } })`.

```tsx
import { toVisibilityState } from '@bwp-web/components';

const table = useReactTable({
  state: { columnVisibility: toVisibilityState(visibility) },
  onColumnVisibilityChange: setVisibility, // updates URL params, etc.
});
```

### `ColumnVisibility`

Type alias for `Partial<Record<string, boolean>>` — a looser alternative to TanStack's `VisibilityState` (`Record<string, boolean>`). Eliminates the need for `as VisibilityState` casts when working with URL params or partial objects.

```tsx
import { type ColumnVisibility } from '@bwp-web/components';

const visibility: ColumnVisibility = { name: true, notes: false };
```

### `exportToCsv` / `buildCsvString`

Pure utilities for CSV generation and download. No React dependencies.

```tsx
import { exportToCsv, buildCsvString, type ExportColumn } from '@bwp-web/components';

const columns: ExportColumn<Device>[] = [
  { header: 'Name', accessor: (row) => row.name },
  { header: 'Status', accessor: (row) => row.status },
];

// Download as CSV file
exportToCsv(data, columns, 'devices');

// Or just build the CSV string
const csvString = buildCsvString(data, columns);
```

### Server-Side Table Utilities

Pure functions for converting between TanStack table state and server-side representations (e.g. GraphQL order types). These are used internally by `useBiampServerSideTable` but can also be used standalone.

#### `ServerSideOrder<F>`

Type representing a single-field server-side order, matching typical GraphQL order input types.

```tsx
import { type ServerSideOrder } from '@bwp-web/components';

type DeviceOrderField = 'NAME' | 'LOCATION' | 'STATUS';
const order: ServerSideOrder<DeviceOrderField> = { field: 'NAME', desc: false };
```

#### `orderToSorting` / `sortingToOrder`

Convert between `ServerSideOrder` and TanStack `SortingState`. An optional mapping handles cases where column IDs differ from server-side field names.

```tsx
import { orderToSorting, sortingToOrder } from '@bwp-web/components';

const sorting = orderToSorting({ field: 'NAME', desc: true }, fieldToColumnId);
// [{ id: 'name', desc: true }]

const order = sortingToOrder(sorting, columnIdToField);
// { field: 'NAME', desc: true }
```

#### `selectedIdsToRowSelection` / `rowSelectionToSelectedIds`

Convert between a `string[]` of row IDs and TanStack `RowSelectionState`.

```tsx
import { selectedIdsToRowSelection, rowSelectionToSelectedIds } from '@bwp-web/components';

const rowSelection = selectedIdsToRowSelection(['id-1', 'id-3']);
// { 'id-1': true, 'id-3': true }

const ids = rowSelectionToSelectedIds(rowSelection);
// ['id-1', 'id-3']
```

#### `getOrderFieldMappings`

Builds bidirectional mappings between TanStack column IDs and server-side order field enum values from column definitions that carry `meta.orderField`.

```tsx
import { getOrderFieldMappings } from '@bwp-web/components';

const { columnIdToField, fieldToColumnId } = getOrderFieldMappings(columns);
// columnIdToField: { name: 'NAME', location: 'LOCATION' }
// fieldToColumnId: { NAME: 'name', LOCATION: 'location' }
```

#### `getDefaultColumnVisibilityFromDefs`

Derives default column visibility from column definitions' `meta.defaultVisible`. Columns without `defaultVisible` are omitted (treated as visible by TanStack).

```tsx
import { getDefaultColumnVisibilityFromDefs } from '@bwp-web/components';

const defaults = getDefaultColumnVisibilityFromDefs(columns);
// { status: false } if status column has meta: { defaultVisible: false }
```

#### `getDirtyColumnVisibility`

Returns only the entries in a visibility state that differ from defaults. Columns not present in `defaults` are treated as visible (`true`). Use this to strip default-matching entries before persisting to URL params.

```tsx
import { getDirtyColumnVisibility } from '@bwp-web/components';

const dirty = getDirtyColumnVisibility(
  { name: true, status: true, notes: false },
  { status: false },
);
// { status: true, notes: false } — only entries that differ from defaults
```

## Accessibility

The BiampTable components follow WCAG 2.1 AA guidelines:

- **Keyboard navigation**: Clickable rows receive `tabIndex={0}` and respond to Enter/Space
- **ARIA sort**: Sortable column headers include `aria-sort` (`ascending`, `descending`, or `none`)
- **ARIA busy**: The table announces loading state via `aria-busy`
- **Row selection labels**: Checkboxes use `getRowLabel` for descriptive labels (e.g. `"Select Conference Room A"`)
- **Select all label**: Header checkbox is labeled `"Select all rows"`
- **Expand/collapse labels**: Expand toggle buttons include `aria-expanded` and descriptive `aria-label` (e.g. `"Expand Floor 1"`)
- **Error announcement**: Error state renders with `role="alert"` for assertive announcement
- **Empty state**: Empty state renders with `role="status"` for polite announcement
- **Toolbar role**: `BiampTableToolbar` renders with `role="toolbar"`
- **Filter panel**: Drawer is labeled via `aria-labelledby`, filter content has `role="group"`
- **Decorative icons**: Status message icons include `aria-hidden`

## Exports

| Export | Type | Description |
|--------|------|-------------|
| `BiampTable` | component | Core table renderer |
| `BiampTableContainer` | component | Layout wrapper for table + toolbar + pagination |
| `BiampTableCellActionButton` | component | Icon button with tooltip for cell actions |
| `BiampTableColumnVisibility` | component | Column visibility popover |
| `BiampTableToolbarColumnVisibility` | component | Self-managing column visibility button + popover |
| `BiampTableEmptyState` | component | Default empty-state message |
| `BiampTableErrorState` | component | Default error-state message |
| `BiampTablePagination` | component | Pagination controls |
| `BiampTableStatusMessage` | component | Base status message component |
| `BiampTableToolbar` | component | Toolbar container |
| `BiampTableToolbarActionButton` | component | Icon button with badge for toolbar |
| `BiampTableToolbarActions` | component | Right-aligned toolbar actions container |
| `BiampTableToolbarExport` | component | Export button with loading state |
| `BiampTableToolbarFilters` | component | Filter drawer with reset/apply |
| `BiampTableToolbarSearch` | component | Debounced search input |
| `BiampTableTruncatedCell` | component | Single-line truncation with overflow tooltip |
| `useBiampServerSideTable` | hook | Server-side table hook wrapping `useReactTable` |
| `useDebouncedCallback` | hook | Generic debounced callback |
| `getColumnVisibilityDirtyCount` | function | Count columns with non-default visibility |
| `getDefaultColumnVisibility` | function | Derive default visibility from column meta (table instance) |
| `toVisibilityState` | function | Convert `ColumnVisibility` to TanStack `VisibilityState` |
| `orderToSorting` | function | Convert `ServerSideOrder` to TanStack `SortingState` |
| `sortingToOrder` | function | Convert TanStack `SortingState` to `ServerSideOrder` |
| `selectedIdsToRowSelection` | function | Convert `string[]` to TanStack `RowSelectionState` |
| `rowSelectionToSelectedIds` | function | Convert TanStack `RowSelectionState` to `string[]` |
| `getOrderFieldMappings` | function | Build column ID ↔ order field bidirectional maps |
| `getDefaultColumnVisibilityFromDefs` | function | Derive default visibility from column defs |
| `getDirtyColumnVisibility` | function | Strip default-matching entries from visibility state |
| `exportToCsv` | function | Convert rows + columns to CSV and download |
| `buildCsvString` | function | Build CSV string (no download) |
| `UseBiampServerSideTableOptions` | type | Options for `useBiampServerSideTable` |
| `ServerSideOrder` | type | Single-field server-side order type |
| `ColumnVisibility` | type | Loose visibility state type alias |
| `ExportColumn` | type | Column definition for CSV export |
| `BIAMP_TABLE_DEBOUNCE_DELAY` | constant | Default debounce delay (`300ms`) |
