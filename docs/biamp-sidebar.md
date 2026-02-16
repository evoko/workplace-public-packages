# BiampSidebar

A set of components for building a fixed-width vertical sidebar with navigation icons and custom content slots.

## Installation

```bash
npm install @bwp-web/components
```

### Peer Dependencies

- `@mui/material` >= 7.0.0
- `react` >= 18.0.0
- `react-dom` >= 18.0.0

## Components

### `BiampSidebar`

A fixed-width (48px) vertical sidebar that renders its children as navigation items with the Biamp logo automatically placed at the bottom. Extends MUI `StackProps`.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `React.ReactNode` | _(required)_ | Sidebar content — typically a list of `BiampSidebarIcon` components |
| `bottomLogoIcon` | `JSX.Element` | `<BiampLogoIcon />` | Optional custom element rendered at the bottom of the sidebar. Defaults to the Biamp logo |
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
    <BiampSidebar>
      <BiampSidebarIcon
        selected={selected === 0}
        icon={<HomeOutlinedIcon />}
        selectedIcon={<HomeIcon />}
        onClick={() => setSelected(0)}
      />
      <BiampSidebarIcon
        selected={selected === 1}
        icon={<SettingsOutlinedIcon />}
        selectedIcon={<SettingsIcon />}
        onClick={() => setSelected(1)}
      />
    </BiampSidebar>
  );
}
```

#### Custom Logo

By default the Biamp logo is rendered at the bottom of the sidebar. Pass the `bottomLogoIcon` prop to replace it with any element:

```tsx
import { BiampSidebar, BiampSidebarIcon } from '@bwp-web/components';
import ApartmentIcon from '@mui/icons-material/Apartment';
import HomeIcon from '@mui/icons-material/Home';

function AppShell() {
  return (
    <BiampSidebar bottomLogoIcon={<ApartmentIcon sx={{ width: 48, height: 24 }} />}>
      <BiampSidebarIcon selected icon={<HomeIcon />} />
    </BiampSidebar>
  );
}
```

### `BiampSidebarIconList`

A vertical list container that arranges `BiampSidebarIcon` (and `BiampSidebarComponent`) children with standardised 4px gaps. Use it inside `BiampSidebar` to keep consistent spacing between sidebar items. Extends MUI `StackProps`.

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
          onClick={() => setSelected(0)}
        />
        <BiampSidebarIcon
          selected={selected === 1}
          icon={<SettingsOutlinedIcon />}
          selectedIcon={<SettingsIcon />}
          onClick={() => setSelected(1)}
        />
      </BiampSidebarIconList>
    </BiampSidebar>
  );
}
```

### `BiampSidebarIcon`

A 48×48px icon button designed for use inside `BiampSidebar`. Supports an optional `selectedIcon` that is shown when the icon is selected, which is useful for swapping between outlined and filled icon variants. Extends MUI `ListItemButtonProps`.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `icon` | `JSX.Element` | _(required)_ | Icon shown in the default (unselected) state |
| `selectedIcon` | `JSX.Element` | Same as `icon` | Icon shown when `selected` is `true`. Falls back to `icon` if not provided |
| `selected` | `boolean` | `false` | Whether the icon is in the selected state |
| `sx` | `SxProps` | — | MUI system styles passed to the underlying `ListItemButton` |
| _...rest_ | `ListItemButtonProps` | — | All other MUI `ListItemButton` props (e.g. `disabled`, `onClick`) are forwarded |

#### Using `selectedIcon`

When `selectedIcon` is provided, the component automatically swaps between the two icons based on the `selected` state:

```tsx
{/* Icon changes from outlined → filled when selected */}
<BiampSidebarIcon
  selected={isActive}
  icon={<HomeOutlinedIcon />}
  selectedIcon={<HomeIcon />}
  onClick={handleClick}
/>

{/* Without selectedIcon — same icon is used for both states */}
<BiampSidebarIcon
  selected={isActive}
  icon={<HomeIcon />}
  onClick={handleClick}
/>
```

### `BiampSidebarComponent`

A 48×48px rounded box that matches the dimensions and shape of `BiampSidebarIcon`, but renders a plain `Box` instead of a button. Use it to place arbitrary content (avatars, status indicators, custom widgets, etc.) in the sidebar alongside icon buttons while maintaining a consistent visual rhythm. Extends MUI `ListItemButtonProps`.

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
        <BiampSidebarIcon selected icon={<HomeIcon />} />
      </BiampSidebarIconList>
    </BiampSidebar>
  );
}
```

## Exports

- `BiampSidebar` — Vertical sidebar container with Biamp logo.
- `BiampSidebarIconList` — Vertical list with 4px gaps for sidebar items.
- `BiampSidebarIcon` — Selectable icon button for sidebar navigation.
- `BiampSidebarComponent` — 48×48px rounded box for arbitrary sidebar content.
