# BiampLayout

An opinionated full-page layout component that composes a header, sidebar, and content area into a standard Biamp application shell. It handles viewport sizing, responsive spacing, and slot placement so consumers only need to pass the pieces they want.

## Installation

```bash
npm install @bwp-web/components
```

### Peer Dependencies

- `@mui/material` >= 7.0.0
- `react` >= 18.0.0
- `react-dom` >= 18.0.0

## Components

### `BiampLayout`

A full-viewport (`100vh`) column layout that stacks an optional header on top and a row containing an optional sidebar alongside the main content below. Responsive gap/padding is applied automatically — `12px` on small screens (`xs`) and `20px` on medium screens and above (`md`). When no header is provided, top padding is added to compensate. Extends MUI `StackProps`.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `header` | `React.ReactNode` | — | Optional header rendered at the top of the layout (typically a `BiampHeader`) |
| `sidebar` | `React.ReactNode` | — | Optional sidebar rendered to the left of the content area (typically a `BiampSidebar`) |
| `children` | `React.ReactNode` | _(required)_ | Main content area — typically one or more `BiampWrapper` components |
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

## Design Details

- **Viewport**: Fills the full viewport height (`100vh`)
- **Responsive spacing**: `12px` gap, padding-x, and padding-bottom on `xs`; `20px` on `md` and above
- **Header-aware padding**: When a header is present, top padding is `0` (the header provides its own spacing); when absent, top padding matches the bottom padding
- **Slot-based composition**: Pass `header`, `sidebar`, and `children` — unused slots are simply omitted from the DOM

## Exports

- `BiampLayout` — Full-page layout shell with optional header and sidebar slots.
