# BiampSidebar

A set of components for building a vertical application sidebar with selectable navigation icons, optional labels, smooth expand/collapse, scrollable item lists, and a copyright caption.

## Installation

```bash
npm install @bwp-web/components
```

### Peer Dependencies

- `@bwp-web/styles` >= 1.0.4
- `@bwp-web/assets` >= 1.0.2
- `@mui/material` >= 7.0.0
- `react` >= 18.0.0
- `react-dom` >= 18.0.0

## Components

### `BiampSidebar`

A vertical sidebar that animates between a collapsed (48px) and expanded (240px) width. The sidebar is expandable by default — a toggle button styled like a `BiampSidebarIcon` is rendered between the children and the bottom logo. When expanded, each `BiampSidebarIcon`'s `name` is revealed next to its icon, and an optional copyright caption (`bottomLogoText`) appears next to the bottom logo.

Width and label visibility animate via `theme.transitions.create` using the `enteringScreen` / `leavingScreen` durations. The outer container clips horizontal overflow during the animation so labels never push the sidebar wider than its declared width.

Does not apply its own horizontal margin — spacing is managed by the parent layout (e.g. `BiampLayout`). Extends MUI `StackProps`.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `React.ReactNode` | _(required)_ | Sidebar content — typically a `BiampSidebarIconList` of `BiampSidebarIcon` components |
| `bottomLogoIcon` | `JSX.Element` | `<BiampLogoIcon />` | Optional custom element rendered at the bottom of the sidebar. Defaults to the Biamp logo |
| `bottomLogoText` | `string` | — | Optional copyright suffix shown next to the bottom logo when expanded. The component automatically prepends `© [current year] ` (e.g. `bottomLogoText="Biamp LLC. v.1.2-b-fd"` renders `© 2026 Biamp LLC. v.1.2-b-fd`). Hidden via opacity when collapsed |
| `expandable` | `boolean` | `true` | Whether the toggle button is rendered. Set to `false` to lock the sidebar to its current width |
| `expanded` | `boolean` | — | Controlled expansion state. When set, the sidebar ignores its internal state and `defaultExpanded` |
| `defaultExpanded` | `boolean` | `false` | Initial uncontrolled expansion state |
| `onExpandedChange` | `(expanded: boolean) => void` | — | Called whenever the toggle button is clicked, with the next expansion value. Required only if `expanded` is also set |
| `sx` | `SxProps` | — | MUI system styles passed to the root `Stack` |
| _...rest_ | `StackProps` | — | All other MUI `Stack` props are forwarded |

#### Basic Usage

```tsx
import { BiampSidebar, BiampSidebarIcon } from '@bwp-web/components';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import HomeIcon from '@mui/icons-material/Home';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import SettingsIcon from '@mui/icons-material/Settings';

function AppShell() {
  const [selected, setSelected] = useState(0);

  return (
    <BiampSidebar bottomLogoText="Biamp LLC. v.1.2-b-fd">
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
    </BiampSidebar>
  );
}
```

#### Controlled Expansion

Pass `expanded` and `onExpandedChange` to drive the expansion state from a parent component. Useful when the sidebar's width needs to coordinate with other UI:

```tsx
function AppShell() {
  const [expanded, setExpanded] = useState(false);

  return (
    <BiampSidebar expanded={expanded} onExpandedChange={setExpanded}>
      <BiampSidebarIconList>{/* ... */}</BiampSidebarIconList>
    </BiampSidebar>
  );
}
```

To start in the expanded state without controlling it, use `defaultExpanded`. To remove the toggle button entirely, set `expandable={false}`.

#### Custom Logo

By default the Biamp logo is rendered at the bottom of the sidebar. Pass the `bottomLogoIcon` prop to replace it with any element:

```tsx
import { BiampSidebar, BiampSidebarIcon } from '@bwp-web/components';
import ApartmentIcon from '@mui/icons-material/Apartment';
import HomeIcon from '@mui/icons-material/Home';

function AppShell() {
  return (
    <BiampSidebar bottomLogoIcon={<ApartmentIcon sx={{ width: 48, height: 24 }} />}>
      <BiampSidebarIcon selected icon={<HomeIcon />} name="Home" />
    </BiampSidebar>
  );
}
```

### `BiampSidebarIconList`

A vertical list container for `BiampSidebarIcon` (and `BiampSidebarComponent`) children with standardised 4px gaps. The list flex-grows to fill the remaining vertical space inside `BiampSidebar` and scrolls (`overflowY: 'auto'`) when its content exceeds the available height. Sibling content in the sidebar — such as the expand/collapse toggle and the bottom logo — stays anchored and does not scroll. Extends MUI `StackProps`.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `React.ReactNode` | _(required)_ | List items — typically `BiampSidebarIcon` or `BiampSidebarComponent` elements |
| `sx` | `SxProps` | — | MUI system styles passed to the root `Stack` |
| _...rest_ | `StackProps` | — | All other MUI `Stack` props are forwarded |

#### Usage

```tsx
import { BiampSidebar, BiampSidebarIconList, BiampSidebarIcon } from '@bwp-web/components';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import HomeIcon from '@mui/icons-material/Home';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import SettingsIcon from '@mui/icons-material/Settings';

function AppShell() {
  const [selected, setSelected] = useState(0);

  return (
    <BiampSidebar>
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
  );
}
```

> **Nesting note:** When you wrap `BiampSidebarIconList` in your own intermediate flex container (e.g. a custom `<Stack>` to combine it with other sidebar widgets), apply `flex: 1, minHeight: 0` to that container so the scroll context can propagate from `BiampSidebar` down to the list.

### `BiampSidebarIcon`

A 48px-tall icon button designed for use inside `BiampSidebar`. Supports an optional `selectedIcon` that is shown when the icon is selected (useful for swapping between outlined and filled icon variants), and an optional `name` label that fades in next to the icon when the parent sidebar is expanded.

The icon stays in a fixed 48×48px column on the left so it never shifts horizontally between collapsed and expanded states. The button defaults to `text.secondary` color, which propagates through `currentColor` to the SVG icon and via inheritance to the label — pass `sx={{ color: '...' }}` to override both.

Extends MUI `ListItemButtonProps`.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `icon` | `JSX.Element` | _(required)_ | Icon shown in the default (unselected) state |
| `selectedIcon` | `JSX.Element` | Same as `icon` | Icon shown when `selected` is `true`. Falls back to `icon` if not provided |
| `selected` | `boolean` | `false` | Whether the icon is in the selected state |
| `name` | `string` | — | Optional label rendered to the right of the icon when the parent `BiampSidebar` is expanded. Hidden via opacity when collapsed so the layout never reflows |
| `sx` | `SxProps` | — | MUI system styles passed to the underlying `ListItemButton`. Setting `color` here cascades to both the icon and the label |
| _...rest_ | `ListItemButtonProps` | — | All other MUI `ListItemButton` props (e.g. `disabled`, `onClick`) are forwarded |

#### Using `selectedIcon`

When `selectedIcon` is provided, the component automatically swaps between the two icons based on the `selected` state:

```tsx
{/* Icon changes from outlined → filled when selected */}
<BiampSidebarIcon
  selected={isActive}
  icon={<HomeOutlinedIcon />}
  selectedIcon={<HomeIcon />}
  name="Home"
  onClick={handleClick}
/>

{/* Without selectedIcon — same icon is used for both states */}
<BiampSidebarIcon
  selected={isActive}
  icon={<HomeIcon />}
  name="Home"
  onClick={handleClick}
/>
```

### `BiampSidebarComponent`

A 48×48px rounded box that matches the dimensions and shape of `BiampSidebarIcon`, but renders a plain `Box` instead of a button. Includes a subtle `0.6px solid` border using the theme's `divider` colour. Use it to place arbitrary content (avatars, status indicators, custom widgets, etc.) in the sidebar alongside icon buttons while maintaining a consistent visual rhythm. Extends MUI `ListItemButtonProps`.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `React.ReactNode` | _(required)_ | Content to render inside the box |
| `sx` | `SxProps` | — | MUI system styles passed to the underlying `Box` |
| _...rest_ | `ListItemButtonProps` | — | Additional props forwarded to the `Box` |

#### Usage

```tsx
import {
  BiampSidebar,
  BiampSidebarIconList,
  BiampSidebarIcon,
  BiampSidebarComponent,
} from '@bwp-web/components';
import HomeIcon from '@mui/icons-material/Home';
import { Typography } from '@mui/material';

function AppShell() {
  return (
    <BiampSidebar>
      <BiampSidebarIconList>
        <BiampSidebarComponent
          sx={{
            bgcolor: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography variant="caption" sx={{ color: 'primary.contrastText' }}>
            AV
          </Typography>
        </BiampSidebarComponent>
        <BiampSidebarIcon selected icon={<HomeIcon />} name="Home" />
      </BiampSidebarIconList>
    </BiampSidebar>
  );
}
```

## Exports

- `BiampSidebar` — Expandable vertical sidebar with toggle button, animated width, and optional copyright caption.
- `BiampSidebarIconList` — Scrollable vertical list with 4px gaps for sidebar items.
- `BiampSidebarIcon` — Selectable icon button for sidebar navigation, with an optional fade-in `name` label.
- `BiampSidebarComponent` — 48×48px rounded box with a subtle divider border for arbitrary sidebar content.
