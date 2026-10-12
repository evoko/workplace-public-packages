# Migrating to @bwp-web 2.x

2.x moves the packages to MUI 9 and MUI X Date Pickers 9; TanStack Table stays on v8. Upgrade
all four `@bwp-web/*` packages together.

The 2.x components were checked pixel by pixel against 1.x and look the same, apart from the
changes listed below.

## 1. Dependencies

| Package | 1.x | 2.x |
|---|---|---|
| `@mui/material` | ^7.0.0 | ^9.5.0 |
| `@mui/x-date-pickers` | ^8.6.0 | ^9.15.0 |
| `@bwp-web/*` (internal peers) | ^1.x | ^2.0.0-alpha.0 |

Unchanged: React `^18 || ^19`, TanStack Table (`@tanstack/react-table`) `^8.0.0`, Emotion `^11.14.0`, fabric `^7.2.0`, Node `>=24.20.0`, npm `>=11.19.0`.

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
