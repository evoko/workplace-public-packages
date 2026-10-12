# Migrating to @bwp-web 2.x

2.x moves the packages to MUI 9, MUI X Date Pickers 9 and TanStack Table 9. Upgrade all four
`@bwp-web/*` packages together.

The 2.x components were checked pixel by pixel against 1.x and look the same, apart from the
changes listed below.

## 1. Dependencies

| Package | 1.x | 2.x |
|---|---|---|
| `@mui/material` | ^7.0.0 | ^9.5.0 |
| `@mui/x-date-pickers` | ^8.6.0 | ^9.15.0 |
| `@tanstack/react-table` | ^8.0.0 | ^9.2.8 |
| `@bwp-web/*` (internal peers) | ^1.x | ^2.0.0-alpha.0 |

Unchanged: React `^18 || ^19`, Emotion `^11.14.0`, fabric `^7.2.0`, Node `>=24.20.0`, npm `>=11.19.0`.

Remove any `overrides` that pin `@mui/*` to 7.x in your app's `package.json`.

Prereleases are published under the `alpha` dist-tag:

```bash
npm install @bwp-web/assets@alpha @bwp-web/styles@alpha @bwp-web/components@alpha @bwp-web/canvas@alpha
```

## 2. MUI 9

Follow MUI's guide (https://mui.com/material-ui/migration/upgrade-to-v9/) and run its codemods
on your app:

```bash
npx @mui/codemod@latest v9.0.0/system-props src
npx @mui/codemod@latest deprecations/all src
npx @mui/x-codemod@latest v9.0.0/pickers/preset-safe src
```

What this means for `@bwp-web` components:

- **System props are gone.** Components whose props extend `BoxProps`, `StackProps` or
  `TypographyProps` (for example `BiampLayout`, `BiampTable`, `BiampHeader*`, `LandingFormPanel`
  and the canvas overlays) no longer accept `mt=`, `gap=`, `display=` and so on. Use `sx`.
- **DatePicker** always uses MUI X's section-based field, because MUI X 9 removed the old
  text-input field. Typing is digit by digit, the arrow keys step between sections and
  Backspace clears a section. Our theme restores the previous look. Either
  `slotProps.textField.sx` or `<DatePicker sx>` now applies on top of our styling (root `sx` was
  ignored before). If you pass both, MUI X uses `slotProps.textField.sx`. If your app targets `.MuiInputBase-*` / `.MuiOutlinedInput-*` inside a
  DatePicker, retarget `.MuiPickersInputBase-*` / `.MuiPickersOutlinedInput-*`.
- **Theme key rename:** `MuiPickersDay` → `MuiPickerDay` (class `.MuiPickerDay-today`), if you
  extend the theme.
- **`BiampTablePagination`** formats counts with `Intl.NumberFormat` ("1,234"). Pass
  `labelDisplayedRows` to change it.
- **`sx` composition follows MUI 9.** A component's defaults and your `sx` are composed as an
  sx array (`[defaults, ...yourSx]`), so array and theme-function `sx` now work everywhere.
  A plain value does not override a *responsive* default at every breakpoint. For example,
  `BiampHeader`'s default is `gap: { xs: 0.5, md: 3 }`; `<BiampHeader sx={{ gap: 2 }}>` keeps
  the `md` value of 3. Pass a responsive value (`gap: { xs: 2, md: 2 }`) to override it. This is how MUI's own
  components behave.
- **`DynamicSvgIcon`:** size it with the `width`/`height` props, not `sx`. A responsive `sx`
  width now applies at its breakpoints, while the skeleton and fallback still use the props.
- **Removed deprecated APIs:**
  - `BiampBuildAppContent`, `BiampBuildAppContentItem`, `BiampEndUserAppContent` and
    `BiampEndUserAppContentItem`: use `BiampAppListContent` + `BiampAppListItem`.
  - The positional 4th `onExit` argument of `enableVertexEdit`: pass `{ onExit }` in the options.
- **Slot props merge with our defaults.** In `BiampGlobalSearch` (`popper`, `listbox`),
  `BiampTableToolbarFilters` (`DrawerProps.slotProps.paper`), `LandingFormPanel` (`select`,
  `typography`) and `OrganizationsPanel` (`input`, `htmlInput`), your slot props are merged with
  ours via MUI's `mergeSlotProps` instead of replacing them: `className` and `style` are
  combined, `sx` is composed, and other keys are merged with yours winning.
- **`BiampTableToolbarFilters`**: `DrawerProps.PaperProps` → `DrawerProps.slotProps.paper`.

> **Tip: icons.** `@mui/icons-material` 9 removed `HelpOutline` and `ErrorOutline`. If your app
> imports them, the visually identical replacements are `HelpOutlineOutlined` and
> `ErrorOutlineOutlined`. Do not use `HelpOutlined` / `ErrorOutlined`: those are the filled
> variants.

## 3. TanStack Table 9 and BiampTable

Build tables with `useBiampTable` instead of `useReactTable`. It already includes the features
BiampTable needs (sorting, pagination, selection, expanding, column visibility):

```tsx
// 1.x
import { useReactTable, getCoreRowModel, getSortedRowModel, getPaginationRowModel, createColumnHelper } from '@tanstack/react-table';
const columnHelper = createColumnHelper<Device>();
const table = useReactTable({
  data, columns,
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
});

// 2.x
import { useBiampTable, createBiampColumnHelper } from '@bwp-web/components';
const columnHelper = createBiampColumnHelper<Device>();
const columns = [
  columnHelper.accessor('name', { header: 'Name' }),
  columnHelper.accessor('location', { header: 'Location' }),
];
const table = useBiampTable({ data, columns, paginate: true });
```

- Remove every `get*RowModel` option. Sorting and expanding work automatically.
- **Header clicks now sort rows.** In 1.x, a table without `getSortedRowModel` only toggled
  the sort arrow on a header click. In 2.x, clicking a sortable column header reorders the
  rows client-side. Set `manualSorting: true` (server-side sorting) or `enableSorting: false`
  (on the table or on a column) to opt out.
- **Pagination is opt-in:** pass `paginate: true` where you used `getPaginationRowModel`.
  Without it, all rows render.
- **Types:**
  - `createColumnHelper<T>()` → `createBiampColumnHelper<T>()`
  - `ColumnDef<T, V>` → `BiampColumnDef<T, V>`
  - `Table<T>` → `BiampTableInstance<T>`
  - `Row<T>` → `BiampRow<T>`
  - `VisibilityState` → `ColumnVisibilityState` (from `@tanstack/react-table`; or use our looser `ColumnVisibility`)
  - `Cell` and `Header` types: `BiampCell` and `BiampTableHeader`
- **Row data must be an object or array.** v9's `RowData` excludes primitives.
- **State reads:** `table.getState()` is gone. On the table returned by `useBiampTable` /
  `useBiampServerSideTable`, read `table.state`. Where you only have a `BiampTableInstance<T>`
  (for example a helper's parameter), read `table.store.state` or a slice such as
  `table.atoms.sorting.get()`.
- **Sorting function names:** `sortingFn` → `sortFn`.
- **Column pinning is not available.** `biampTableFeatures` does not include TanStack's
  `columnPinningFeature`, so `column.pin()`, `state.columnPinning` and `enableColumnPinning`
  don't exist on BiampTable tables. For sticky columns use `meta.sticky: 'left' | 'right'`
  (unchanged).
- **`useBiampServerSideTable`:** call sites are unchanged apart from the column typing above.
- If your code augments `ColumnMeta` / `TableMeta`, the declaration must match TanStack's type
  parameters: `interface ColumnMeta<TFeatures extends TableFeatures, TData extends RowData,
  TValue extends CellData = CellData>` and `interface TableMeta<TFeatures extends TableFeatures,
  TData extends RowData>` (import `TableFeatures`, `RowData` and `CellData` from
  `@tanstack/react-table`).
- **Options are merged, not replaced.** TanStack 9 merges each render's options into the
  previous ones. If you conditionally spread an option (`...(cond && { getSubRows })`), pass it
  explicitly as `undefined` when off, or the previous value stays active.

TanStack's guide: https://tanstack.com/table/latest/docs/framework/react/guide/migrating
