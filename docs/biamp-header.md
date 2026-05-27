# BiampHeader

A set of components for building a horizontal application header with a title, search bar, action buttons, profile section, and an app-launcher dialog.

## Installation

```bash
npm install @bwp-web/components
```

### Peer Dependencies

- `@bwp-web/styles` >= 1.0.12
- `@bwp-web/assets` >= 1.0.2
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
      <BiampHeaderTitle title="Workplace" subtitle="Booking" />
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
        />
      </BiampHeaderActions>
    </BiampHeader>
  );
}
```

### `BiampHeaderTitle`

A title section that renders a 24×24 icon alongside an H4 text label with a 12px gap and `pr: 3` right padding. When no `icon` prop is provided, the Biamp red logo is rendered automatically. Both `title` and `subtitle` are optional — you can use either or both. The subtitle is rendered in `text.secondary` color next to the title. Extends MUI `BoxProps`.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | — | Optional title text displayed as H4 typography |
| `subtitle` | `string` | — | Optional subtitle text displayed as H4 typography in `text.secondary` color, rendered next to the title |
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

#### Subtitle

Use the `subtitle` prop to display secondary text next to the title in a muted color. Both `title` and `subtitle` are optional and can be used independently or together:

```tsx
import { BiampHeader, BiampHeaderTitle } from '@bwp-web/components';

function App() {
  return (
    <BiampHeader>
      {/* Title with subtitle */}
      <BiampHeaderTitle title="Workplace" subtitle="Booking" />
    </BiampHeader>
  );
}
```

### `BiampHeaderSearch`

A thin convenience wrapper around [`BiampGlobalSearch`](./biamp-global-search.md) that preserves the original header-search call site (`<BiampHeaderSearch />`). It forwards every prop straight through and defaults `options` to `[]` so prop-less usages keep compiling. The 40px height, `px: 1.5` outer padding, leading search icon, and borderless input now live inside `BiampGlobalSearch` itself.

For new code, prefer using `BiampGlobalSearch` directly — `BiampHeaderSearch` exists primarily for backward compatibility.

#### Props

`BiampHeaderSearchProps` is `Omit<BiampGlobalSearchProps, 'options'> & { options?: BiampGlobalSearchOption[] }`. See the [BiampGlobalSearch docs](./biamp-global-search.md) for the full prop list (`placeholder`, `inputValue`, `onInputChange`, `loading`, `clearOnSelect`, `sx`, etc.).

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `options` | `BiampGlobalSearchOption[]` | `[]` | Pre-filtered option list to render in the dropdown |
| _...rest_ | `BiampGlobalSearchProps` | — | All other props are forwarded to the underlying `BiampGlobalSearch` |

#### Usage

```tsx
import {
  BiampHeader,
  BiampHeaderTitle,
  BiampHeaderSearch,
  type BiampGlobalSearchOption,
} from '@bwp-web/components';

const options: BiampGlobalSearchOption[] = [
  { title: 'Conference Room A' },
  { title: 'Conference Room B' },
];

function App() {
  return (
    <BiampHeader>
      <BiampHeaderTitle title="Buildings" />
      <BiampHeaderSearch options={options} sx={{ flexGrow: 1 }} />
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

A 40×40px icon button designed for use inside `BiampHeaderButtonList`. Supports an optional `selectedIcon` that is shown when the button is selected, which is useful for swapping between outlined and filled icon variants. Extends MUI `ListItemButtonProps`.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `icon` | `JSX.Element` | _(required)_ | Icon shown in the default (unselected) state |
| `selectedIcon` | `JSX.Element` | Same as `icon` | Icon shown when `selected` is `true`. Falls back to `icon` if not provided |
| `selected` | `boolean` | `false` | Whether the button is in the selected state |
| `sx` | `SxProps` | — | MUI system styles passed to the underlying `ListItemButton` |
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

### `BiampHeaderMenuButton`

A self-hiding hamburger toggle for the `BiampLayout` responsive drawer. Only renders when the parent `BiampLayout` is in drawer mode (i.e. below `breakpoint` with `responsive` enabled) **and** has a `sidebar` — otherwise returns `null`. Safe to leave in the header at all viewport sizes. Clicking toggles the drawer's open/closed state. Extends MUI `ListItemButtonProps` (minus `children`).

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `icon` | `JSX.Element` | hamburger SVG | Override the default hamburger icon |
| `onClick` | `(e) => void` | — | Optional handler called in addition to the drawer toggle |
| `sx` | `SxProps` | — | MUI system styles passed to the underlying `BiampHeaderButton` |
| _...rest_ | `ListItemButtonProps` | — | All other MUI `ListItemButton` props are forwarded |

#### Usage

```tsx
import {
  BiampLayout,
  BiampHeader,
  BiampHeaderMenuButton,
  BiampHeaderTitle,
  BiampSidebar,
  BiampWrapper,
} from '@bwp-web/components';

<BiampLayout
  responsive
  header={
    <BiampHeader>
      {/* Auto-hides on md+ — visible only when drawer mode is active */}
      <BiampHeaderMenuButton />
      <BiampHeaderTitle title="My App" />
    </BiampHeader>
  }
  sidebar={<BiampSidebar>{/* ... */}</BiampSidebar>}
>
  <BiampWrapper>{/* content */}</BiampWrapper>
</BiampLayout>;
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
/>
```

### `BiampAppPopover`

A styled `Popover` with a 16px border radius, no background image, a subtle border, and a drop shadow. Uses a flex-column layout with `gap: 2` so children space themselves automatically. Anchors to the bottom-right of its trigger by default. Designed to wrap `BiampBuildAppContent` and `BiampEndUserAppContent` sections for the app-launcher popover. Extends MUI `PopoverProps`.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `React.ReactNode` | _(required)_ | Popover content — typically `Divider` headings, `BiampBuildAppContent`, and `BiampEndUserAppContent` |
| `open` | `boolean` | _(required)_ | Whether the popover is open |
| `sx` | `SxProps` | — | MUI system styles passed to the `Popover` |
| _...rest_ | `PopoverProps` | — | All other MUI `Popover` props (e.g. `anchorEl`, `onClose`) are forwarded |

### `BiampBuildAppContent`

A 2-column CSS grid container with `gap: 1.5` (12px) for laying out `BiampBuildAppContentItem` tiles. Used inside `BiampAppPopover` under a "Configure & Build" section heading. Extends MUI `BoxProps`.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `React.ReactNode` | _(required)_ | Grid content — typically `BiampBuildAppContentItem` elements |
| `sx` | `SxProps` | — | MUI system styles passed to the root `Box` |
| _...rest_ | `BoxProps` | — | All other MUI `Box` props are forwarded |

### `BiampBuildAppContentItem`

A card-style tile with a 54×54 image area, a bold name, a description, and an optional action button positioned in the top-right corner. Outlined with a subtle border and rounded corners. Extends MUI `StackProps`.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `image` | `React.ReactNode` | _(required)_ | Content rendered inside the 54×54 image area |
| `name` | `string` | _(required)_ | Bold caption label |
| `description` | `string` | _(required)_ | Secondary caption text below the name |
| `button` | `React.ReactNode` | — | Optional action element (e.g. a `Button`) positioned absolutely in the top-right |
| `sx` | `SxProps` | — | MUI system styles passed to the root `Stack` |
| _...rest_ | `StackProps` | — | All other MUI `Stack` props are forwarded |

### `BiampEndUserAppContent`

A responsive container for `BiampEndUserAppContentItem` rows with `gap: 1.5` (12px). With a single child it renders as a vertical stack; with two or more children it switches to a 2-column CSS grid (`gridTemplateColumns: '1fr 1fr'`) — matching the layout of `BiampBuildAppContent`. Used inside `BiampAppPopover` under an "End user apps" section heading. Extends MUI `StackProps`.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `React.ReactNode` | _(required)_ | List content — typically `BiampEndUserAppContentItem` elements. The layout auto-switches to a 2-column grid when more than one child is provided |
| `sx` | `SxProps` | — | MUI system styles passed to the root `Stack` |
| _...rest_ | `StackProps` | — | All other MUI `Stack` props are forwarded |

### `BiampEndUserAppContentItem`

A horizontal row with a 32×32 image, a bold name, a description, and a trailing external-link icon. Outlined with a subtle border and rounded corners. Supports optional `href` and `target` props — when `href` is provided, the item renders as an `<a>` tag with proper link semantics. Extends MUI `StackProps`.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `image` | `React.ReactNode` | _(required)_ | Content rendered inside the 32×32 image area |
| `name` | `string` | _(required)_ | Bold caption label |
| `description` | `string` | _(required)_ | Secondary caption text next to the name |
| `href` | `string` | — | Optional URL; when provided, renders the item as an `<a>` tag |
| `target` | `string` | — | Optional link target (e.g. `_blank` for new tab) |
| `sx` | `SxProps` | — | MUI system styles passed to the root element |
| _...rest_ | `StackProps` | — | All other MUI `Stack` props are forwarded |

#### App Launcher Usage

```tsx
import { useState } from 'react';
import { Box, Button, Divider } from '@mui/material';
import {
  BiampHeaderButton,
  BiampAppPopover,
  BiampBuildAppContent,
  BiampBuildAppContentItem,
  BiampEndUserAppContent,
  BiampEndUserAppContentItem,
} from '@bwp-web/components';
import { AppsIcon, AppsIconFilled, WorkplaceApp, BookingApp } from '@bwp-web/assets';

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
      <BiampAppPopover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
      >
        <Divider>Configure & Build</Divider>
        <BiampBuildAppContent>
          <BiampBuildAppContentItem
            name="Workplace"
            description="Monitor and manage your entire AV infrastructure."
            image={
              <Box component="img" src={WorkplaceApp} alt="Workplace"
                sx={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            }
          />
          <BiampBuildAppContentItem
            name="Designer"
            description="Design AV systems, specify equipment."
            image={
              <Box component="img" src={WorkplaceApp} alt="Designer"
                sx={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            }
            button={
              <Button variant="outlined" size="small">Open</Button>
            }
          />
        </BiampBuildAppContent>
        <Divider>End user apps</Divider>
        <BiampEndUserAppContent>
          <BiampEndUserAppContentItem
            name="Booking"
            description="Find & Book rooms"
            href="https://booking.example.com"
            target="_blank"
            image={
              <Box component="img" src={BookingApp} alt="Booking"
                sx={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            }
          />
        </BiampEndUserAppContent>
      </BiampAppPopover>
    </>
  );
}
```

## Exports

- `BiampHeader` — Horizontal header container with padding.
- `BiampHeaderTitle` — Title section with icon, optional title, and optional subtitle.
- `BiampHeaderSearch` — Backward-compat wrapper around `BiampGlobalSearch` for header search.
- `BiampHeaderActions` — Flex container for grouping action buttons and profile.
- `BiampHeaderButtonList` — Horizontal list with 4px gaps for header buttons.
- `BiampHeaderButton` — Selectable 40×40px icon button for header actions.
- `BiampHeaderMenuButton` — Self-hiding hamburger toggle for the responsive `BiampLayout` drawer.
- `BiampHeaderProfile` — Profile image button.
- `BiampAppPopover` — Styled popover for the app-launcher content.
- `BiampBuildAppContent` — 2-column grid container for "Configure & Build" app tiles.
- `BiampBuildAppContentItem` — App tile with image, name, description, and optional action button.
- `BiampEndUserAppContent` — Responsive container for end-user app items: vertical stack for one child, 2-column grid for multiple.
- `BiampEndUserAppContentItem` — Row-style app item with image, name, description, and external link; supports `href`.
