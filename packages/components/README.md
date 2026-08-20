# @bwp-web/components

Shared React components for Biamp Workplace applications. Provides the full application shell — layout, header, sidebar, wrapper, banner, and table — built on MUI and styled to match the Biamp Workplace design system.

## Installation

```bash
npm install @bwp-web/components
```

### Peer Dependencies

- `@bwp-web/styles` >= 1.0.13
- `@bwp-web/assets` >= 1.0.2
- `@mui/material` >= 7.0.0
- `react` >= 18.0.0
- `react-dom` >= 18.0.0

For `BiampTable` only:

- `@tanstack/react-table` >= 8.0.0

## Components

| Component                        | Description                                                                                                                                                                                               |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `BiampLayout`                    | Full-page layout shell with optional header and sidebar slots                                                                                                                                             |
| `BiampWrapper`                   | Full-page content wrapper with padding, rounded corners, scrollable overflow, an optional debounced loading bar, and an optional sticky top slot                                                          |
| `BiampSidebar`                   | Expandable vertical sidebar (48px ↔ 240px) with animated toggle and copyright caption                                                                                                                     |
| `BiampSidebarIconList`           | Scrollable vertical list with 4px gaps for sidebar items; suppresses overscroll bounce                                                                                                                    |
| `BiampSidebarIcon`               | Selectable 48px-tall icon button for sidebar navigation, with optional `name` label                                                                                                                       |
| `BiampSidebarComponent`          | 48×48px rounded box for arbitrary sidebar content                                                                                                                                                         |
| `BiampHeader`                    | Horizontal header container with padding                                                                                                                                                                  |
| `BiampHeaderTitle`               | Title section with icon, optional title, and optional subtitle                                                                                                                                            |
| `BiampHeaderSearch`              | Search input with leading search icon                                                                                                                                                                     |
| `BiampHeaderActions`             | Flex container for grouping action buttons and profile                                                                                                                                                    |
| `BiampHeaderButtonList`          | Horizontal list with 4px gaps for header buttons                                                                                                                                                          |
| `BiampHeaderButton`              | Selectable 40×40px icon button for header actions                                                                                                                                                         |
| `BiampHeaderMenuButton`          | Self-hiding hamburger toggle for the `BiampLayout` responsive drawer — renders only when the layout is in drawer mode                                                                                     |
| `BiampHeaderProfile`             | Profile button with image or custom children (e.g. `UserInitialsIcon`)                                                                                                                                    |
| `BiampAppPopover`                | Styled popover for the app-launcher content                                                                                                                                                               |
| `BiampNotificationPopover`       | Popover shell (flex column, capped `maxHeight`, `overflow: hidden`) whose children decide what stays fixed and what scrolls                                                                               |
| `BiampNotificationPopoverHeader` | Fixed (non-scrolling) region at the top of a `BiampNotificationPopover`                                                                                                                                   |
| `BiampNotificationPopoverBody`   | Scrollable region of a `BiampNotificationPopover`; fills remaining height and scrolls its overflow                                                                                                        |
| `BiampListPopover`               | Popover styled as a compact, bordered list container; wraps children in a dense, unpadded `List`                                                                                                          |
| `BiampListPopoverItem`           | Clickable, hoverable dense row for use inside `BiampListPopover`                                                                                                                                          |
| `BiampListPopoverScrollArea`     | Overflow-scrolling region for a long list of `BiampListPopoverItem`s (default `maxHeight` 340)                                                                                                            |
| `BiampCheckboxListPopover`       | Checkbox-list popover with an optional "select all" row (the column-visibility menu styling, decoupled from any data source)                                                                              |
| `BiampBuildAppContent`           | 2-column grid container for "Configure & Build" app tiles                                                                                                                                                 |
| `BiampBuildAppContentItem`       | App tile with image, name, description, and optional action button                                                                                                                                        |
| `BiampEndUserAppContent`         | Responsive container for end-user app items: stack for one child, 2-column grid for many                                                                                                                  |
| `BiampEndUserAppContentItem`     | Row-style app item with image, name, description, and external link; supports `href`                                                                                                                      |
| `BiampAppListContent`            | Bordered flat-list container with rounded corners and dividers between items; use with `BiampAppListItem`                                                                                                 |
| `BiampAppListItem`               | Horizontal row with a 40×40 icon, app name, and an optional inline `[Open \| ↗]` action group                                                                                                             |
| `BiampBanner`                    | Full-width animated notification banner                                                                                                                                                                   |
| `BiampBannerIcon`                | Leading icon slot for `BiampBanner`                                                                                                                                                                       |
| `BiampBannerContent`             | Center message slot for `BiampBanner`                                                                                                                                                                     |
| `BiampBannerActions`             | Trailing actions slot for `BiampBanner`                                                                                                                                                                   |
| `BiampGlobalSearch`              | Searchable autocomplete with icons, subtitles, chips, and keyboard hints                                                                                                                                  |
| `OrganizationSelector`           | Styled outer container for an organization-switcher list (used inline or inside `OrganizationSelectorPopover`); `loading` shows a centered spinner                                                        |
| `OrganizationItemList`           | Bordered list grouping that auto-renders dividers between children; optional `label` divider below and `maxHeight` for sticky-footer scroll                                                               |
| `OrganizationItem`               | Single clickable row (logo, primary/secondary text, optional `meta` badge, chevron) built on `ListItemButton`; `isCurrent` hides chevron + adds ring, `disabled` hides chevron + dims                     |
| `OrganizationSelectorButton`     | Minimal `ButtonBase` trigger with an `icon` (20×20 enforced), `name`, and a trailing chevron that flips on `open`                                                                                         |
| `OrganizationSelectorPopover`    | `Popover` pre-positioned bottom-right of the anchor, wrapping an `OrganizationSelector` (8px vertical offset from the trigger)                                                                            |
| `OrganizationsPanel`             | Landing-page organization picker: optional search field, org row groups, and optional join/create action rows on a content-sized card (441px default); `slotProps` reaches the field, dividers and groups |
| `OrganizationRow`                | Single landing-page row (logo, primary/secondary text, chevron) built on `ListItemButton`; `disabled` marks a provisional membership without greying the whole row                                        |
| `OrganizationRowGroup`           | Bordered grouping carrying the shared outline and auto-dividers between rows; `maxHeight` caps it and scrolls                                                                                             |
| `OrganizationsEmptyState`        | Status message `OrganizationsPanel` renders for `empty`, with overridable icon/title/description                                                                                                          |
| `LandingFormPanel`               | The landing-page form card that takes `OrganizationsPanel`'s place while a flow is open (join, create, sign-in): a `<form>` shell on the same card, so Enter submits; owns no field or flow knowledge     |
| `LandingFormField`               | Labelled input for a `LandingFormPanel` — a 12px/600 `<label>` over the shared outlined-input treatment; full `TextField` passthrough                                                                     |
| `LandingFormActions`             | The button row at the foot of a `LandingFormPanel`; layout only                                                                                                                                           |
| `LandingFormCheckbox`            | Checkbox with its label to the right, spaced to the card's rhythm                                                                                                                                         |
| `SegmentedButtonGroup`           | Horizontal container for grouping segmented toggle buttons                                                                                                                                                |
| `SegmentedButton`                | Individual toggle button for use inside `SegmentedButtonGroup`                                                                                                                                            |
| `BiampTable`                     | Composable data table with sorting, selection, pagination, and more                                                                                                                                       |
| `UserInitialsIcon`               | Avatar-style icon showing a user's initials with a deterministic color                                                                                                                                    |
| `DynamicSvgIcon`                 | Renders a remotely-fetched SVG with a skeleton loader and required fallback                                                                                                                               |

## Usage

### Full Application Shell

```tsx
import { useState } from 'react';
import {
  BiampLayout,
  BiampHeader,
  BiampHeaderTitle,
  BiampHeaderSearch,
  BiampHeaderActions,
  BiampHeaderButtonList,
  BiampHeaderButton,
  BiampHeaderProfile,
  BiampSidebar,
  BiampSidebarIconList,
  BiampSidebarIcon,
  BiampWrapper,
} from '@bwp-web/components';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import HomeIcon from '@mui/icons-material/Home';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import SettingsIcon from '@mui/icons-material/Settings';
import { Typography } from '@mui/material';

function App() {
  const [selected, setSelected] = useState(0);

  return (
    <BiampLayout
      header={
        <BiampHeader>
          <BiampHeaderTitle title="Dashboard" />
          <BiampHeaderSearch />
          <BiampHeaderActions>
            <BiampHeaderButtonList>
              <BiampHeaderButton
                icon={<SettingsOutlinedIcon />}
                selectedIcon={<SettingsIcon />}
              />
            </BiampHeaderButtonList>
            <BiampHeaderProfile image="https://i.pravatar.cc/32?img=1" />
          </BiampHeaderActions>
        </BiampHeader>
      }
      sidebar={
        <BiampSidebar bottomLogoText="Biamp LLC. v.1.0.0">
          <BiampSidebarIconList>
            <BiampSidebarIcon
              selected={selected === 0}
              icon={<HomeOutlinedIcon />}
              selectedIcon={<HomeIcon />}
              name="Home"
              onClick={() => setSelected(0)}
            />
            <BiampSidebarIcon
              selected={selected === 1}
              icon={<SettingsOutlinedIcon />}
              selectedIcon={<SettingsIcon />}
              name="Settings"
              onClick={() => setSelected(1)}
            />
          </BiampSidebarIconList>
        </BiampSidebar>
      }
    >
      <BiampWrapper>
        <Typography variant="h4" gutterBottom>
          Page Content
        </Typography>
      </BiampWrapper>
    </BiampLayout>
  );
}
```

### BiampBanner

A full-width notification banner that slides in and out with an animated `Collapse`. The background color and border are driven by the `severity` prop.

```tsx
import { useState } from 'react';
import { Button } from '@mui/material';
import {
  BiampBanner,
  BiampBannerIcon,
  BiampBannerContent,
  BiampBannerActions,
} from '@bwp-web/components';

function App() {
  const [show, setShow] = useState(true);

  return (
    <BiampBanner show={show} severity="info">
      <BiampBannerIcon severity="info" />
      <BiampBannerContent>
        Your session will expire in 5 minutes.
      </BiampBannerContent>
      <BiampBannerActions>
        <Button
          size="small"
          variant="outlined"
          color="inherit"
          onClick={() => setShow(false)}
        >
          Dismiss
        </Button>
      </BiampBannerActions>
    </BiampBanner>
  );
}
```

#### BiampBanner Props

| Prop       | Type                                          | Description                                                                |
| ---------- | --------------------------------------------- | -------------------------------------------------------------------------- |
| `show`     | `boolean`                                     | Controls visibility; animates in/out via `Collapse`                        |
| `severity` | `'error' \| 'warning' \| 'success' \| 'info'` | Sets the background color and border color                                 |
| `children` | `React.ReactNode`                             | Compose with `BiampBannerIcon`, `BiampBannerContent`, `BiampBannerActions` |

### BiampLayout

Full-viewport (`100vh`) layout with optional `header` and `sidebar` slots. Applies responsive gap and padding automatically (12px on `xs`, 20px on `md`+).

Pass `responsive` to collapse the sidebar into a left-anchored drawer below `breakpoint` (default `md`). Pair with `<BiampHeaderMenuButton />` inside the header to get a self-hiding toggle. The drawer auto-renders a close button at the top — pass `drawerHeader` to add content next to it (typically a `BiampHeaderTitle`). When `mobileSidebarOnly` is added, the sidebar is never rendered inline — only as the mobile drawer — useful for layouts that have only a header on desktop and move some of its content into a drawer on mobile.

#### BiampLayout Props

| Prop                | Type              | Default | Description                                                                                                                           |
| ------------------- | ----------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `header`            | `React.ReactNode` | —       | Optional header (typically a `BiampHeader`)                                                                                           |
| `sidebar`           | `React.ReactNode` | —       | Optional sidebar (typically a `BiampSidebar`)                                                                                         |
| `children`          | `React.ReactNode` | —       | Main content area — typically one or more `BiampWrapper` components                                                                   |
| `responsive`        | `boolean`         | `false` | When true, the sidebar collapses into a left-anchored drawer below `breakpoint`                                                       |
| `breakpoint`        | `Breakpoint`      | `'md'`  | Breakpoint at which the sidebar becomes a drawer                                                                                      |
| `drawerHeader`      | `React.ReactNode` | —       | Content rendered next to the auto-rendered close button at the top of the responsive drawer                                           |
| `mobileSidebarOnly` | `boolean`         | `false` | When combined with `responsive`, the sidebar is never rendered inline — only as the mobile drawer. Ignored when `responsive` is false |

#### useBiampLayoutDrawer

Hook for reading/controlling the responsive drawer state from inside `BiampLayout`. Returns `null` when used outside a `BiampLayout` (so it is always safe to call) — also used internally by `BiampHeaderMenuButton` and `BiampSidebarIcon`'s auto-close behavior.

```tsx
import { useBiampLayoutDrawer } from '@bwp-web/components';

function MyTrigger() {
  const drawer = useBiampLayoutDrawer();
  if (!drawer?.isDrawer) return null;
  return <button onClick={() => drawer.setOpen(true)}>Open</button>;
}
```

| Field        | Type                      | Description                                                  |
| ------------ | ------------------------- | ------------------------------------------------------------ |
| `isDrawer`   | `boolean`                 | True when the layout is below `breakpoint` and has a sidebar |
| `open`       | `boolean`                 | Current open state of the drawer                             |
| `setOpen`    | `(open: boolean) => void` | Setter for the drawer's open state                           |
| `hasSidebar` | `boolean`                 | Whether the layout was given a `sidebar` prop                |

### BiampWrapper

Full-page content wrapper with 16px padding, 8px border-radius, scrollable overflow, and a white (light mode) or `grey.800` (dark mode) background.

```tsx
<BiampWrapper>{/* page content */}</BiampWrapper>
```

Pass `loading` to show a debounced `LinearProgress` bar pinned to the top of the wrapper. The bar appears 150ms after `loading` flips true and stays visible for at least 500ms once shown, so fast loads don't flicker.

```tsx
<BiampWrapper loading={isLoading}>{/* page content */}</BiampWrapper>
```

Pass `stickyTop` to pin header content to the wrapper's top edge. The slot extends edge-to-edge (ignoring the 16px padding) and stays visible while the rest of the content scrolls underneath it.

```tsx
<BiampWrapper stickyTop={<Header />}>{/* scrollable content */}</BiampWrapper>
```

#### BiampWrapper Props

| Prop        | Type              | Default | Description                                                                                                        |
| ----------- | ----------------- | ------- | ------------------------------------------------------------------------------------------------------------------ |
| `loading`   | `boolean`         | `false` | Shows a debounced `LinearProgress` bar at the top of the wrapper while truthy                                      |
| `stickyTop` | `React.ReactNode` | —       | Optional header content pinned to the wrapper's top edge (extends edge-to-edge, stays visible as the rest scrolls) |

### BiampSidebar

Vertical sidebar that animates between a collapsed (48px) and expanded (240px) width. A toggle button is rendered between the children and the bottom logo by default; pass `expandable={false}` to hide it. When expanded, each `BiampSidebarIcon`'s `name` fades in next to its icon and the optional `bottomLogoText` (auto-prefixed with `© [current year]`) appears next to the logo.

#### BiampSidebar Props

| Prop               | Type                          | Default | Description                                                                             |
| ------------------ | ----------------------------- | ------- | --------------------------------------------------------------------------------------- |
| `expandable`       | `boolean`                     | `true`  | Whether the toggle button is rendered                                                   |
| `expanded`         | `boolean`                     | —       | Controlled expansion state                                                              |
| `defaultExpanded`  | `boolean`                     | `false` | Initial uncontrolled expansion state                                                    |
| `onExpandedChange` | `(expanded: boolean) => void` | —       | Callback fired when the toggle is clicked                                               |
| `bottomLogoIcon`   | `JSX.Element`                 | logo    | Custom element rendered at the bottom; defaults to the Biamp logo                       |
| `bottomLogoText`   | `string`                      | —       | Copyright suffix shown next to the bottom logo when expanded; auto-prepends `© [year] ` |

#### BiampSidebarIcon Props

| Prop                 | Type              | Default | Description                                                                                                                                                        |
| -------------------- | ----------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `icon`               | `React.ReactNode` | —       | Icon shown when not selected                                                                                                                                       |
| `selectedIcon`       | `React.ReactNode` | —       | Icon shown when selected                                                                                                                                           |
| `selected`           | `boolean`         | —       | Whether this item is currently active                                                                                                                              |
| `name`               | `string`          | —       | Optional label rendered to the right of the icon when the parent sidebar is expanded                                                                               |
| `closeDrawerOnClick` | `boolean`         | `true`  | When inside a `BiampLayout` responsive drawer, whether clicking auto-closes the drawer. Set to `false` for items that open menus/popovers anchored to this element |
| `onClick`            | `() => void`      | —       | Click handler                                                                                                                                                      |

### BiampHeader

Horizontal header container. Compose with `BiampHeaderTitle`, `BiampHeaderSearch`, `BiampHeaderActions`, `BiampHeaderButtonList`, `BiampHeaderButton`, and `BiampHeaderProfile`.

#### BiampHeaderTitle Props

| Prop       | Type              | Description            |
| ---------- | ----------------- | ---------------------- |
| `icon`     | `React.ReactNode` | Optional leading icon  |
| `title`    | `string`          | Optional title text    |
| `subtitle` | `string`          | Optional subtitle text |

#### BiampHeaderProfile Props

| Prop       | Type              | Description                                                            |
| ---------- | ----------------- | ---------------------------------------------------------------------- |
| `image`    | `string`          | Optional profile image URL; when omitted, `children` are rendered      |
| `children` | `React.ReactNode` | Fallback content when no `image` is provided (e.g. `UserInitialsIcon`) |
| `selected` | `boolean`         | Whether the profile button is currently selected                       |

### UserInitialsIcon

An avatar-style icon that displays a user's initials over a deterministic background color. The color is seeded by the user's `id`, so the same user always gets the same color. The icon scales proportionally — font size adjusts automatically with `width`/`height`.

```tsx
import { UserInitialsIcon } from '@bwp-web/components';

<UserInitialsIcon name="Jane Doe" id="user-123" />
<UserInitialsIcon name="Jane Doe" id="user-123" width={64} height={64} />
```

#### UserInitialsIcon Props

| Prop     | Type       | Default | Description                                                 |
| -------- | ---------- | ------- | ----------------------------------------------------------- |
| `name`   | `string`   | —       | Full name; initials are derived from the first two words    |
| `id`     | `string`   | —       | Seed for deterministic background and text color            |
| `width`  | `number`   | `40`    | Icon width in pixels                                        |
| `height` | `number`   | `40`    | Icon height in pixels                                       |
| `sx`     | `SxProps`  | —       | MUI `sx` style overrides                                    |
| `...`    | `BoxProps` | —       | All other MUI `Box` props are forwarded to the root element |

### DynamicSvgIcon

Fetches an SVG from a URL and renders it as a MUI `SvgIcon`. Shows a `Skeleton` placeholder while loading and a required fallback on error. The `width` and `height` props are enforced across all three states so the layout never shifts.

```tsx
import { DynamicSvgIcon } from '@bwp-web/components';
import BrokenImageIcon from '@mui/icons-material/BrokenImage';

<DynamicSvgIcon
  url="https://example.com/icon.svg"
  width={32}
  height={32}
  fallback={<BrokenImageIcon />}
/>;
```

#### DynamicSvgIcon Props

| Prop                | Type                                       | Default      | Description                                                    |
| ------------------- | ------------------------------------------ | ------------ | -------------------------------------------------------------- |
| `url`               | `string`                                   | —            | URL of the SVG to fetch                                        |
| `fallback`          | `React.ReactNode`                          | **required** | Element shown when loading fails                               |
| `width`             | `number`                                   | `24`         | Width in pixels for icon, skeleton, and fallback               |
| `height`            | `number`                                   | `24`         | Height in pixels for icon, skeleton, and fallback              |
| `replaceColors`     | `boolean`                                  | `false`      | Replace all fill/stroke colors with `currentColor` for theming |
| `skeletonVariant`   | `'circular' \| 'rectangular' \| 'rounded'` | `'circular'` | Skeleton shape during loading                                  |
| `skeletonAnimation` | `'pulse' \| 'wave' \| false`               | `'pulse'`    | Skeleton animation type                                        |
| `onLoad`            | `() => void`                               | —            | Called when the SVG loads successfully                         |
| `onError`           | `(error: string) => void`                  | —            | Called when loading fails                                      |

### OrganizationSelector

A composable organization-switcher built from four exports:

- **`OrganizationSelector`** — the outer styled container (used inline or via the popover wrapper). Pass `loading` to swap children for a spinner.
- **`OrganizationItemList`** — bordered list grouping with auto-dividers between children. Optional `label` (renders a labeled divider below the list) and `maxHeight` (caps height + enables list-level scrolling for sticky-footer layouts).
- **`OrganizationItem`** — a single row (logo, primary/secondary text, optional right-side `meta`). Built on `ListItemButton`, so make it clickable by passing `onClick`, `component={Link} to={...}`, or `component="a" href={...}`. `isCurrent` hides the chevron, rings the logo, and disables interaction without dimming. `disabled` also hides the chevron, but dims the row like a standard disabled button.
- **`OrganizationSelectorButton`** — a minimal trigger button (`icon` + `name`) intended to open `OrganizationSelectorPopover`. The `open` prop flips the trailing chevron between down and up. Most styling is left to the consumer.
- **`OrganizationSelectorPopover`** — a `Popover` pre-positioned bottom-right of its anchor with an 8px vertical offset; renders the inner `OrganizationSelector` for you.

```tsx
import { useRef, useState } from 'react';
import { Button, Divider } from '@mui/material';
import { Link as RouterLink } from 'react-router';
import {
  OrganizationItem,
  OrganizationItemList,
  OrganizationSelectorButton,
  OrganizationSelectorPopover,
} from '@bwp-web/components';

function OrgSwitcher({ orgs, currentOrgId }) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);
  const current = orgs.find((o) => o.id === currentOrgId);

  return (
    <>
      <OrganizationSelectorButton
        icon={<img src={current.logo} width={20} height={20} />}
        name={current.name}
        open={open}
        onClick={(e) => setAnchorEl(e.currentTarget)}
      />
      <OrganizationSelectorPopover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
      >
        <OrganizationItemList maxHeight={400}>
          {orgs.map((org) => (
            <OrganizationItem
              key={org.id}
              primaryText={org.name}
              secondaryText={`ID: ${org.id}`}
              logo={org.logo}
              isCurrent={org.id === currentOrgId}
              component={RouterLink}
              to={`/org/${org.id}`}
            />
          ))}
        </OrganizationItemList>
        <Divider sx={{ pt: 1, userSelect: 'none' }}>or</Divider>
        <Button variant="outlined" sx={{ mt: 1 }}>
          Manage organizations
        </Button>
      </OrganizationSelectorPopover>
    </>
  );
}
```

#### OrganizationSelector Props

| Prop      | Type             | Default | Description                                     |
| --------- | ---------------- | ------- | ----------------------------------------------- |
| `loading` | `boolean`        | `false` | Replaces children with a centered spinner       |
| `sx`      | `SxProps<Theme>` | —       | MUI `sx` overrides; all other `StackProps` flow |

#### OrganizationItemList Props

| Prop        | Type               | Description                                                                          |
| ----------- | ------------------ | ------------------------------------------------------------------------------------ |
| `children`  | `React.ReactNode`  | `OrganizationItem` children — dividers are auto-rendered between them                |
| `label`     | `React.ReactNode`  | Optional divider with a label rendered below the list (e.g. "Private organizations") |
| `maxHeight` | `number \| string` | Caps list height and enables vertical scrolling within the list                      |
| `sx`        | `SxProps<Theme>`   | MUI `sx` overrides                                                                   |

#### OrganizationItem Props

Extends `ListItemButtonProps` — `onClick`, `component`, `to`, `href`, `disabled`, `selected` all work natively. Passing `disabled` also hides the chevron (like `isCurrent`), but still dims the row.

| Prop            | Type                        | Default | Description                                                                                  |
| --------------- | --------------------------- | ------- | -------------------------------------------------------------------------------------------- |
| `primaryText`   | `React.ReactNode`           | —       | Top-left text. Strings get default styling; pass a node to override                          |
| `secondaryText` | `React.ReactNode`           | —       | Optional second line below `primaryText`. No auto-prefix — pass the full text you want       |
| `meta`          | `React.ReactNode`           | —       | Optional right-side text on the same row as `primaryText`                                    |
| `logo`          | `React.ReactNode \| string` | —       | Logo element (e.g. `<Avatar />`) or an image URL                                             |
| `isCurrent`     | `boolean`                   | `false` | Highlights the logo with a ring, hides the chevron, and disables interaction without dimming |

#### OrganizationSelectorButton Props

Extends `ButtonBaseProps` — pass `onClick`, `component`, or any standard button prop.

| Prop   | Type              | Default | Description                                                                                                                |
| ------ | ----------------- | ------- | -------------------------------------------------------------------------------------------------------------------------- |
| `icon` | `React.ReactNode` | —       | Leading visual rendered inside a 20×20 fixed-size slot (typically an image of the current org's logo)                      |
| `name` | `string`          | —       | Text label rendered in `caption` variant with `fontWeight: 600`; uses `noWrap` + `flexShrink: 0` so it never shrinks/wraps |
| `open` | `boolean`         | `false` | When true, the trailing chevron switches from `ChevronDownIcon` to `ChevronUpIcon`                                         |

#### OrganizationSelectorPopover Props

Extends `PopoverProps`. Defaults: `anchorOrigin: { vertical: 'bottom', horizontal: 'right' }`, `transformOrigin: { vertical: -8, horizontal: 'right' }` — both overridable.

| Prop       | Type              | Default | Description                                               |
| ---------- | ----------------- | ------- | --------------------------------------------------------- |
| `children` | `React.ReactNode` | —       | Items rendered inside the wrapped `OrganizationSelector`  |
| `loading`  | `boolean`         | `false` | Forwarded to the inner `OrganizationSelector`'s `loading` |

### BiampCheckboxListPopover

A batteries-included checkbox-list popover with an optional "select all" row — the same styling used by the table column-visibility menu, but driven by a plain data model instead of a table. It is **controlled**: it renders from `items` and reports toggles via callbacks, so it works with `useState`, URL params, a form library, or a table.

```tsx
import { useRef, useState } from 'react';
import { Button } from '@mui/material';
import { BiampCheckboxListPopover } from '@bwp-web/components';

function ColumnPicker() {
  const anchorRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [checked, setChecked] = useState<Record<string, boolean>>({
    Name: true,
    Status: true,
    Location: false,
  });

  return (
    <>
      <Button ref={anchorRef} onClick={() => setOpen(true)}>
        Columns
      </Button>
      <BiampCheckboxListPopover
        anchorEl={anchorRef.current}
        open={open}
        onClose={() => setOpen(false)}
        items={Object.keys(checked).map((id) => ({
          id,
          label: id,
          checked: checked[id],
        }))}
        onToggleItem={(id) => setChecked((p) => ({ ...p, [id]: !p[id] }))}
        onToggleAll={(next) =>
          setChecked(
            Object.fromEntries(Object.keys(checked).map((k) => [k, next])),
          )
        }
      />
    </>
  );
}
```

#### BiampCheckboxListPopover Props

Extends `PopoverProps` (`open`, `anchorEl`, `onClose`, `anchorOrigin`, …), minus `children`.

| Prop             | Type                         | Default      | Description                                                     |
| ---------------- | ---------------------------- | ------------ | --------------------------------------------------------------- |
| `items`          | `BiampCheckboxListItem[]`    | **required** | Checkbox rows: `{ id, label, checked, ariaLabel? }`             |
| `onToggleItem`   | `(id: string) => void`       | **required** | Called with the item's `id` when its row is toggled             |
| `showSelectAll`  | `boolean`                    | `true`       | Whether to render the fixed "select all" row above the list     |
| `selectAllLabel` | `string`                     | `'Show all'` | Label for the "select all" row                                  |
| `onToggleAll`    | `(checked: boolean) => void` | —            | Called with the desired next state when "select all" is toggled |
| `maxHeight`      | `number \| string`           | `340`        | Height cap before the item list scrolls                         |

### BiampListPopover

The lower-level primitives `BiampCheckboxListPopover` is built on, for custom (non-checkbox) list popovers. `BiampListPopover` is the bordered container (6px radius, subtle shadow, 150px min-width) that wraps its children in a dense `List`; compose it with `BiampListPopoverItem` (clickable hover rows) and `BiampListPopoverScrollArea` (a capped, overflow-scrolling section).

```tsx
import { Typography } from '@mui/material';
import {
  BiampListPopover,
  BiampListPopoverItem,
  BiampListPopoverScrollArea,
} from '@bwp-web/components';

<BiampListPopover anchorEl={anchorEl} open={open} onClose={onClose}>
  <BiampListPopoverScrollArea>
    {actions.map((action) => (
      <BiampListPopoverItem
        key={action}
        sx={{ px: 1.5 }}
        onClick={() => run(action)}
      >
        <Typography variant="caption">{action}</Typography>
      </BiampListPopoverItem>
    ))}
  </BiampListPopoverScrollArea>
</BiampListPopover>;
```

`BiampListPopoverScrollArea` accepts a `maxHeight` prop (default `340`); all three components forward standard MUI props (`PopoverProps`, `ListItemProps`, `BoxProps`) including `sx`.

### BiampNotificationPopover

A popover shell for a fixed header over a scrolling body. The Paper is a flex column capped at `maxHeight: 650px` with `overflow: hidden`, so its children decide what stays put and what scrolls: pair `BiampNotificationPopoverHeader` (fixed) with `BiampNotificationPopoverBody` (scrollable). The body suppresses overscroll bounce and hides its scrollbar while remaining scrollable.

```tsx
import { Typography } from '@mui/material';
import {
  BiampNotificationPopover,
  BiampNotificationPopoverHeader,
  BiampNotificationPopoverBody,
} from '@bwp-web/components';

<BiampNotificationPopover anchorEl={anchorEl} open={open} onClose={onClose}>
  <BiampNotificationPopoverHeader>
    <Typography variant="h4">Notifications</Typography>
  </BiampNotificationPopoverHeader>
  <BiampNotificationPopoverBody>
    {/* scrollable list */}
  </BiampNotificationPopoverBody>
</BiampNotificationPopover>;
```

All three components extend their MUI base props (`PopoverProps`, `StackProps`, `BoxProps`).

### BiampTable

A composable data table built on TanStack React Table v8 with support for sorting, row selection, pagination, column visibility, global search, column filters, CSV export, and per-slot prop overrides for restyling internal MUI elements.

Requires `@tanstack/react-table` >= 8.0.0 as a peer dependency.

## Full Documentation

Detailed per-component docs are available in the repository's [`/docs`](../../docs) folder (GitHub links):

| Document                                                        | Contents                                                                            |
| --------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| [biamp-layout.md](../../docs/biamp-layout.md)                   | `BiampLayout` — props, examples, design details                                     |
| [biamp-wrapper.md](../../docs/biamp-wrapper.md)                 | `BiampWrapper` — props, examples, design details                                    |
| [biamp-sidebar.md](../../docs/biamp-sidebar.md)                 | `BiampSidebar`, `BiampSidebarIconList`, `BiampSidebarIcon`, `BiampSidebarComponent` |
| [biamp-header.md](../../docs/biamp-header.md)                   | `BiampHeader` family + app-launcher components                                      |
| [biamp-banner.md](../../docs/biamp-banner.md)                   | `BiampBanner` family — props, examples, design details                              |
| [biamp-global-search.md](../../docs/biamp-global-search.md)     | `BiampGlobalSearch` — options, filtering, async loading, navigation                 |
| [organization-selector.md](../../docs/organization-selector.md) | `OrganizationSelector` family — items, popover, trigger button, list grouping       |
| [organizations-panel.md](../../docs/organizations-panel.md)     | `OrganizationsPanel` — rows, groups, search, empty state, action rows               |
| [landing-form-panel.md](../../docs/landing-form-panel.md)       | `LandingFormPanel` family — the form primitives, per-flow compositions, migration   |
| [biamp-table.md](../../docs/biamp-table.md)                     | `BiampTable` — columns, sorting, selection, pagination, filters, export             |
| [user-initials-icon.md](../../docs/user-initials-icon.md)       | `UserInitialsIcon` — props, color seeding, sizing, edge cases                       |
| [dynamic-svg-icon.md](../../docs/dynamic-svg-icon.md)           | `DynamicSvgIcon` — props, hook API, caching, skeleton, fallback                     |
