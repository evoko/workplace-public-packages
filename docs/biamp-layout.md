# BiampLayout

An opinionated full-page layout component that composes a header, sidebar, and content area into a standard Biamp application shell. It handles viewport sizing, responsive spacing, and slot placement so consumers only need to pass the pieces they want.

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

### `BiampLayout`

A full-viewport (`100vh`) column layout that stacks an optional header on top and a row containing an optional sidebar alongside the main content below. Responsive gap/padding is applied automatically — `12px` on small screens (`xs`) and `20px` on medium screens and above (`md`). When no header is provided, top padding is added to compensate. The background is `grey.100` in light mode and `grey.900` in dark mode. Extends MUI `StackProps`.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `header` | `React.ReactNode` | — | Optional header rendered at the top of the layout (typically a `BiampHeader`) |
| `sidebar` | `React.ReactNode` | — | Optional sidebar rendered to the left of the content area (typically a `BiampSidebar`) |
| `children` | `React.ReactNode` | _(required)_ | Main content area — typically one or more `BiampWrapper` components |
| `responsive` | `boolean` | `false` | Collapses the sidebar into a left-anchored drawer below `breakpoint` |
| `breakpoint` | `Breakpoint` | `'md'` | MUI breakpoint at which the sidebar becomes a drawer |
| `drawerHeader` | `React.ReactNode` | — | Content rendered next to the auto-rendered close button at the top of the drawer (typically a `BiampHeaderTitle`) |
| `mobileSidebarOnly` | `boolean` | `false` | When combined with `responsive`, the sidebar is never rendered inline — only as the mobile drawer. Has no effect when `responsive` is false |
| `sx` | `SxProps` | — | MUI system styles passed to the root `Stack` |
| _...rest_ | `StackProps` | — | All other MUI `Stack` props are forwarded |

#### Full Layout (Header + Sidebar + Wrapper)

The most common configuration for a standard Biamp application page:

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
        <Typography variant="body1">
          This layout includes a header, sidebar, and wrapper.
        </Typography>
      </BiampWrapper>
    </BiampLayout>
  );
}
```

#### Header + Wrapper (No Sidebar)

Useful for pages that don't require navigation:

```tsx
import {
  BiampLayout,
  BiampHeader,
  BiampHeaderTitle,
  BiampHeaderSearch,
  BiampWrapper,
} from '@bwp-web/components';
import { Typography } from '@mui/material';

function SettingsPage() {
  return (
    <BiampLayout
      header={
        <BiampHeader>
          <BiampHeaderTitle title="Settings" />
          <BiampHeaderSearch />
        </BiampHeader>
      }
    >
      <BiampWrapper>
        <Typography variant="h4" gutterBottom>
          Settings
        </Typography>
      </BiampWrapper>
    </BiampLayout>
  );
}
```

#### Wrapper Only

The simplest configuration, providing just the content area with responsive padding:

```tsx
import { BiampLayout, BiampWrapper } from '@bwp-web/components';
import { Typography } from '@mui/material';

function SimplePage() {
  return (
    <BiampLayout>
      <BiampWrapper>
        <Typography variant="h4" gutterBottom>
          Page Content
        </Typography>
      </BiampWrapper>
    </BiampLayout>
  );
}
```

#### Responsive Drawer (Sidebar Collapses on Mobile)

Add `responsive` to collapse the sidebar into a left-anchored drawer below `breakpoint`. Pair with `<BiampHeaderMenuButton />` in the header — it auto-renders a hamburger toggle only when the layout is in drawer mode. The drawer's paper is capped at `min(calc(100vw - 50px), 350px)` so there is always a tap-zone to dismiss it. A close button is rendered at the top of the drawer automatically; pass `drawerHeader` for any content (e.g. a title) next to it.

When `BiampSidebarIcon` is clicked inside the drawer, it auto-closes — opt out per item with `closeDrawerOnClick={false}` (useful for items that open menus or popovers anchored to themselves).

```tsx
import {
  BiampLayout,
  BiampHeader,
  BiampHeaderTitle,
  BiampHeaderMenuButton,
  BiampSidebar,
  BiampSidebarIconList,
  BiampSidebarIcon,
  BiampWrapper,
} from '@bwp-web/components';

<BiampLayout
  responsive
  drawerHeader={<BiampHeaderTitle title="My App" />}
  header={
    <BiampHeader>
      <BiampHeaderMenuButton />
      <BiampHeaderTitle title="My App" />
    </BiampHeader>
  }
  sidebar={
    <BiampSidebar>
      <BiampSidebarIconList>{/* nav items */}</BiampSidebarIconList>
    </BiampSidebar>
  }
>
  <BiampWrapper>{/* content */}</BiampWrapper>
</BiampLayout>;
```

#### Header-Only Desktop (Mobile Drawer Only)

For apps that have everything in the header on desktop but want to collapse some controls into a drawer on mobile, add `mobileSidebarOnly` alongside `responsive`. The sidebar prop is treated as drawer content only — never rendered inline. Use `display: { xs, md }` (or `useBiampLayoutDrawer()`) inside the header to control what shows where.

```tsx
<BiampLayout
  responsive
  mobileSidebarOnly
  header={
    <BiampHeader>
      <BiampHeaderMenuButton />
      <BiampHeaderTitle title="App" />
      <BiampHeaderSearch sx={{ display: { xs: 'none', md: 'flex' } }} />
      {/* desktop-only header actions */}
    </BiampHeader>
  }
  sidebar={
    <BiampSidebar expandable={false}>
      {/* same controls re-rendered as drawer items */}
    </BiampSidebar>
  }
>
  {/* content */}
</BiampLayout>;
```

### `useBiampLayoutDrawer`

Hook for reading and controlling the responsive drawer from descendants. Returns `null` when called outside a `BiampLayout`, so it is always safe to call. Used internally by `BiampHeaderMenuButton` and `BiampSidebarIcon`'s drawer auto-close behavior — exposed publicly so consumers can drive the drawer from custom UI.

```tsx
import { useBiampLayoutDrawer } from '@bwp-web/components';

function CustomTrigger() {
  const drawer = useBiampLayoutDrawer();
  if (!drawer?.isDrawer) return null;
  return (
    <button onClick={() => drawer.setOpen(true)}>Open drawer</button>
  );
}
```

| Field | Type | Description |
|-------|------|-------------|
| `isDrawer` | `boolean` | True when the layout is below `breakpoint` and has a sidebar |
| `open` | `boolean` | Current open state of the drawer |
| `setOpen` | `(open: boolean) => void` | Setter for the drawer's open state |
| `hasSidebar` | `boolean` | Whether the layout was given a `sidebar` prop |

## Design Details

- **Viewport**: Fills the full viewport height (`100vh`)
- **Responsive spacing**: `12px` gap, padding-x, and padding-bottom on `xs`; `20px` on `md` and above
- **Header-aware padding**: When a header is present, top padding is `0` (the header provides its own spacing); when absent, top padding matches the bottom padding
- **Background**: `grey.100` in light mode, `grey.900` in dark mode
- **Slot-based composition**: Pass `header`, `sidebar`, and `children` — unused slots are simply omitted from the DOM
- **Drawer paper**: `min(calc(100vw - 50px), 350px)` wide so there's always a tap-zone to dismiss it; anchored left

## Exports

- `BiampLayout` — Full-page layout shell with optional header and sidebar slots.
- `useBiampLayoutDrawer` — Hook for reading and controlling the responsive drawer state.
