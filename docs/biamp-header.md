# BiampHeader

A set of components for building a horizontal application header with a title, search bar, action buttons, profile section, and an app-launcher dialog.

## Installation

```bash
npm install @bwp-web/components
```

### Peer Dependencies

- `@mui/material` >= 7.0.0
- `react` >= 18.0.0
- `react-dom` >= 18.0.0

## Components

### `BiampHeader`

A horizontal row container that arranges its children with the following items: a Biamp/custom logo, a search bar, an apps navigation menu with additional button list, and a profile section. Extends MUI `StackProps`.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `React.ReactNode` | — | Header content — typically `BiampHeaderTitle`, `BiampHeaderSearch`, and `BiampHeaderActions` |
| `sx` | `SxProps` | — | MUI system styles passed to the root `Stack` |
| _...rest_ | `StackProps` | — | All other MUI `Stack` props are forwarded |

#### Basic Usage

```tsx
import {
  BiampHeader,
  BiampHeaderTitle,
  BiampHeaderSearch,
  BiampHeaderActions,
  BiampHeaderButtonList,
  BiampHeaderButton,
  BiampHeaderProfile,
} from '@bwp-web/components';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import SettingsIcon from '@mui/icons-material/Settings';

function App() {
  return (
    <BiampHeader>
      <BiampHeaderTitle title="Dashboard" />
      <BiampHeaderSearch sx={{ flexGrow: 1 }} />
      <BiampHeaderActions>
        <BiampHeaderButtonList>
          <BiampHeaderButton
            icon={<SettingsOutlinedIcon />}
            selectedIcon={<SettingsIcon />}
          />
        </BiampHeaderButtonList>
        <BiampHeaderProfile
          image="https://i.pravatar.cc/32?img=1"
          name="Jane Doe"
        />
      </BiampHeaderActions>
    </BiampHeader>
  );
}
```

### `BiampHeaderTitle`

A title section that renders a 24×24 icon alongside an H4 text label with a 12px gap and `pr: 3` right padding. When no `icon` prop is provided, the Biamp red logo is rendered automatically. Extends MUI `BoxProps`.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | _(required)_ | The title text displayed as H4 typography |
| `icon` | `JSX.Element` | Biamp red logo | Optional custom icon rendered to the left of the title. Defaults to the Biamp red logo |
| `sx` | `SxProps` | — | MUI system styles passed to the root `Box` |
| _...rest_ | `BoxProps` | — | All other MUI `Box` props are forwarded |

#### Custom Icon

By default the Biamp red logo is rendered next to the title. Pass the `icon` prop to replace it with any element:

```tsx
import { BiampHeader, BiampHeaderTitle } from '@bwp-web/components';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';

function App() {
  return (
    <BiampHeader>
      <BiampHeaderTitle
        icon={<HomeOutlinedIcon sx={{ width: 24, height: 24 }} />}
        title="Home"
      />
    </BiampHeader>
  );
}
```

### `BiampHeaderSearch`

A search input with a leading search icon adornment and `px: 1.5` horizontal padding. The input is styled with a fixed 40px height and no visible border. Extends MUI `TextFieldProps`.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `sx` | `SxProps` | — | MUI system styles passed to the `TextField` |
| _...rest_ | `TextFieldProps` | — | All other MUI `TextField` props (e.g. `placeholder`, `onChange`, `value`) are forwarded |

#### Usage

```tsx
import { BiampHeader, BiampHeaderTitle, BiampHeaderSearch } from '@bwp-web/components';

function App() {
  return (
    <BiampHeader>
      <BiampHeaderTitle title="Buildings" />
      <BiampHeaderSearch sx={{ flexGrow: 1 }} />
    </BiampHeader>
  );
}
```

### `BiampHeaderActions`

A flex container with `pl: 3` left padding and `gap: 2` that groups action buttons and the profile section on the right side of the header. Extends MUI `BoxProps`.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `React.ReactNode` | _(required)_ | Action content — typically `BiampHeaderButtonList` and `BiampHeaderProfile` |
| `sx` | `SxProps` | — | MUI system styles passed to the root `Box` |
| _...rest_ | `BoxProps` | — | All other MUI `Box` props are forwarded |

### `BiampHeaderButtonList`

A horizontal flex container with `gap: 0.5` (4px) for grouping `BiampHeaderButton` items with consistent spacing. Extends MUI `BoxProps`.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `React.ReactNode` | _(required)_ | Buttons to render — typically `BiampHeaderButton` elements |
| `sx` | `SxProps` | — | MUI system styles passed to the root `Box` |
| _...rest_ | `BoxProps` | — | All other MUI `Box` props are forwarded |

#### Usage

```tsx
import { BiampHeaderButtonList, BiampHeaderButton } from '@bwp-web/components';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import SettingsIcon from '@mui/icons-material/Settings';

<BiampHeaderButtonList>
  <BiampHeaderButton
    icon={<NotificationsNoneIcon />}
    selectedIcon={<NotificationsIcon />}
  />
  <BiampHeaderButton
    icon={<SettingsOutlinedIcon />}
    selectedIcon={<SettingsIcon />}
  />
</BiampHeaderButtonList>
```

### `BiampHeaderButton`

A 40×40px icon button designed for use inside `BiampHeaderButtonList`. Supports an optional `selectedIcon` that is shown when the button is selected, which is useful for swapping between outlined and filled icon variants. Uses `BiampListIcon` under the hood and extends MUI `ListItemButtonProps`.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `icon` | `JSX.Element` | _(required)_ | Icon shown in the default (unselected) state |
| `selectedIcon` | `JSX.Element` | Same as `icon` | Icon shown when `selected` is `true`. Falls back to `icon` if not provided |
| `selected` | `boolean` | `false` | Whether the button is in the selected state |
| `sx` | `SxProps` | — | MUI system styles passed to the underlying `BiampListIcon` |
| _...rest_ | `ListItemButtonProps` | — | All other MUI `ListItemButton` props (e.g. `disabled`, `onClick`) are forwarded |

#### Using `selectedIcon`

When `selectedIcon` is provided, the component automatically swaps between the two icons based on the `selected` state:

```tsx
{/* Icon changes from outlined → filled when selected */}
<BiampHeaderButton
  selected={isActive}
  icon={<SettingsOutlinedIcon />}
  selectedIcon={<SettingsIcon />}
  onClick={handleClick}
/>

{/* Without selectedIcon — same icon is used for both states */}
<BiampHeaderButton
  selected={isActive}
  icon={<SettingsIcon />}
  onClick={handleClick}
/>
```

### `BiampHeaderProfile`

A 36×36px profile button that renders a 32×32 image with a 4px border radius. Extends MUI `ListItemButtonProps`.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `image` | `string` | _(required)_ | URL for the profile image |
| `selected` | `boolean` | `false` | Whether the profile button is in the selected state |
| `sx` | `SxProps` | — | MUI system styles passed to the underlying `ListItemButton` |
| _...rest_ | `ListItemButtonProps` | — | All other MUI `ListItemButton` props (e.g. `onClick`) are forwarded |

#### Usage

```tsx
import { BiampHeaderProfile } from '@bwp-web/components';

<BiampHeaderProfile
  image="https://i.pravatar.cc/32?img=1"
  name="Jane Doe"
/>
```

### `BiampAppDialog`

A rounded, shadowed container that lays out its children in a 3-column wrapping grid with `gap: 1.5` (12px) and a maximum width of 284px. Designed to be used inside a `Popover` as an app-launcher dialog. Extends MUI `BoxProps`.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `React.ReactNode` | _(required)_ | Dialog content — typically `BiampAppDialogItem` elements |
| `sx` | `SxProps` | — | MUI system styles passed to the root `Box` |
| _...rest_ | `BoxProps` | — | All other MUI `Box` props are forwarded |

### `BiampAppDialogItem`

A 76×89px clickable tile with a 54×54 icon and a caption label below, separated by an 8px gap. Includes a hover effect with a coloured border and background. Extends MUI `BoxProps`.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `icon` | `JSX.Element` | _(required)_ | Icon rendered inside the tile |
| `name` | `string` | _(required)_ | Label displayed below the icon |
| `sx` | `SxProps` | — | MUI system styles passed to the root `Box` |
| _...rest_ | `BoxProps` | — | All other MUI `Box` props are forwarded |

#### App Dialog Usage

```tsx
import { useState } from 'react';
import { Popover } from '@mui/material';
import {
  BiampHeaderButton,
  BiampAppDialog,
  BiampAppDialogItem,
  AppsIcon,
  AppsIconFilled,
} from '@bwp-web/components';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';

function AppLauncher() {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  return (
    <>
      <BiampHeaderButton
        icon={<AppsIcon />}
        selectedIcon={<AppsIconFilled />}
        selected={open}
        onClick={(e) => setAnchorEl(open ? null : e.currentTarget as HTMLElement)}
      />
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        slotProps={{ paper: { sx: { mt: 1, borderRadius: '16px' } } }}
      >
        <BiampAppDialog sx={{ p: 2 }}>
          <BiampAppDialogItem icon={<DashboardIcon />} name="Dashboard" />
          <BiampAppDialogItem icon={<SettingsOutlinedIcon />} name="Settings" />
        </BiampAppDialog>
      </Popover>
    </>
  );
}
```

## Exports

- `BiampHeader` — Horizontal header container with padding.
- `BiampHeaderTitle` — Title section with icon and H4 text.
- `BiampHeaderSearch` — Search input with leading search icon.
- `BiampHeaderActions` — Flex container for grouping action buttons and profile.
- `BiampHeaderButtonList` — Horizontal list with 4px gaps for header buttons.
- `BiampHeaderButton` — Selectable 40×40px icon button for header actions.
- `BiampHeaderProfile` — Profile image button.
- `BiampAppDialog` — Rounded dialog container for app-launcher grid.
- `BiampAppDialogItem` — Clickable app tile with icon and label.
