# @bwp-web/components

Shared React components for Biamp Workplace applications. Provides the full application shell — layout, header, sidebar, wrapper, banner, and table — built on MUI and styled to match the Biamp Workplace design system.

## Installation

```bash
npm install @bwp-web/components
```

### Peer Dependencies

- `@bwp-web/styles` >= 1.0.1
- `@bwp-web/assets` >= 1.0.0
- `@mui/material` >= 7.0.0
- `react` >= 18.0.0
- `react-dom` >= 18.0.0

For `BiampTable` only:

- `@tanstack/react-table` >= 8.0.0

## Components

| Component               | Description                                                                      |
| ----------------------- | -------------------------------------------------------------------------------- |
| `BiampLayout`           | Full-page layout shell with optional header and sidebar slots                    |
| `BiampWrapper`          | Full-page content wrapper with padding, rounded corners, and scrollable overflow |
| `BiampSidebar`          | Fixed-width vertical sidebar with Biamp logo                                     |
| `BiampSidebarIconList`  | Vertical list with 4px gaps for sidebar items                                    |
| `BiampSidebarIcon`      | Selectable 48×48px icon button for sidebar navigation                            |
| `BiampSidebarComponent` | 48×48px rounded box for arbitrary sidebar content                                |
| `BiampHeader`           | Horizontal header container with padding                                         |
| `BiampHeaderTitle`      | Title section with icon, optional title, and optional subtitle                   |
| `BiampHeaderSearch`     | Search input with leading search icon                                            |
| `BiampHeaderActions`    | Flex container for grouping action buttons and profile                           |
| `BiampHeaderButtonList` | Horizontal list with 4px gaps for header buttons                                 |
| `BiampHeaderButton`     | Selectable 40×40px icon button for header actions                                |
| `BiampHeaderProfile`    | Profile image button                                                             |
| `BiampAppPopover`       | Styled popover for the app-launcher dialog                                       |
| `BiampAppDialog`        | Rounded dialog container for app-launcher grid                                   |
| `BiampAppDialogItem`    | Clickable app tile with children content and label                               |
| `BiampBanner`           | Full-width animated notification banner                                          |
| `BiampBannerIcon`       | Leading icon slot for `BiampBanner`                                              |
| `BiampBannerContent`    | Center message slot for `BiampBanner`                                            |
| `BiampBannerActions`    | Trailing actions slot for `BiampBanner`                                          |
| `BiampTable`            | Composable data table with sorting, selection, pagination, and more              |

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

| Prop       | Type                                           | Description                                                               |
| ---------- | ---------------------------------------------- | ------------------------------------------------------------------------- |
| `show`     | `boolean`                                      | Controls visibility; animates in/out via `Collapse`                       |
| `severity` | `'error' \| 'warning' \| 'success' \| 'info'` | Sets the background color and border color                                |
| `children` | `React.ReactNode`                              | Compose with `BiampBannerIcon`, `BiampBannerContent`, `BiampBannerActions` |

### BiampLayout

Full-viewport (`100vh`) layout with optional `header` and `sidebar` slots. Applies responsive gap and padding automatically (12px on `xs`, 20px on `md`+).

#### BiampLayout Props

| Prop       | Type              | Description                                                         |
| ---------- | ----------------- | ------------------------------------------------------------------- |
| `header`   | `React.ReactNode` | Optional header (typically a `BiampHeader`)                         |
| `sidebar`  | `React.ReactNode` | Optional sidebar (typically a `BiampSidebar`)                       |
| `children` | `React.ReactNode` | Main content area — typically one or more `BiampWrapper` components |

### BiampWrapper

Full-page content wrapper with 16px padding, 8px border-radius, scrollable overflow, and a white (light mode) or `grey.800` (dark mode) background.

```tsx
<BiampWrapper>
  {/* page content */}
</BiampWrapper>
```

### BiampSidebar

Fixed 48px-wide vertical sidebar with the Biamp logo at the top.

#### BiampSidebarIcon Props

| Prop           | Type              | Description                           |
| -------------- | ----------------- | ------------------------------------- |
| `icon`         | `React.ReactNode` | Icon shown when not selected          |
| `selectedIcon` | `React.ReactNode` | Icon shown when selected              |
| `selected`     | `boolean`         | Whether this item is currently active |
| `label`        | `string`          | Accessible label                      |
| `onClick`      | `() => void`      | Click handler                         |

### BiampHeader

Horizontal header container. Compose with `BiampHeaderTitle`, `BiampHeaderSearch`, `BiampHeaderActions`, `BiampHeaderButtonList`, `BiampHeaderButton`, and `BiampHeaderProfile`.

#### BiampHeaderTitle Props

| Prop       | Type              | Description            |
| ---------- | ----------------- | ---------------------- |
| `icon`     | `React.ReactNode` | Optional leading icon  |
| `title`    | `string`          | Optional title text    |
| `subtitle` | `string`          | Optional subtitle text |

### BiampTable

A composable data table built on TanStack React Table v8 with support for sorting, row selection, pagination, column visibility, global search, column filters, and CSV export.

Requires `@tanstack/react-table` >= 8.0.0 as a peer dependency.

## Full Documentation

Detailed per-component docs are available in the repository's [`/docs`](../../docs) folder (GitHub links):

| Document | Contents |
| --- | --- |
| [biamp-layout.md](../../docs/biamp-layout.md) | `BiampLayout` — props, examples, design details |
| [biamp-wrapper.md](../../docs/biamp-wrapper.md) | `BiampWrapper` — props, examples, design details |
| [biamp-sidebar.md](../../docs/biamp-sidebar.md) | `BiampSidebar`, `BiampSidebarIconList`, `BiampSidebarIcon`, `BiampSidebarComponent` |
| [biamp-header.md](../../docs/biamp-header.md) | `BiampHeader` family + app-launcher components |
| [biamp-banner.md](../../docs/biamp-banner.md) | `BiampBanner` family — props, examples, design details |
| [biamp-table.md](../../docs/biamp-table.md) | `BiampTable` — columns, sorting, selection, pagination, filters, export |
