# BiampWrapper

A full-page content wrapper component that stretches to fill all available space with consistent padding, rounded corners, and scrollable overflow.

## Installation

```bash
npm install @bwp-web/components
```

### Peer Dependencies

- `@bwp-web/styles` >= 1.0.5
- `@bwp-web/assets` >= 1.0.2
- `@mui/material` >= 7.0.0
- `react` >= 18.0.0
- `react-dom` >= 18.0.0

## Components

### `BiampWrapper`

A flexible container component designed to wrap page content with a clean, consistent appearance. It automatically stretches to fill available space (using `flex: 1`, `width: '100%'`, and `height: '100%'`) and provides 16px padding, 8px border radius, and scrollable overflow when content exceeds the container size. The background is white in light mode and `grey.800` in dark mode. Extends MUI `StackProps`.

The wrapper also supports rendering a debounced `LinearProgress` indicator at the top of the wrapper while a page is loading, and an optional `stickyTop` slot for header content that stays pinned to the wrapper's top edge while the rest scrolls.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `loading` | `boolean` | `false` | When `true`, shows a `LinearProgress` bar pinned to the top of the wrapper. The indicator is debounced via `useLoadingDelay` — it appears after 150ms and stays visible for at least 500ms once shown, so fast loads don't cause a flicker |
| `stickyTop` | `React.ReactNode` | — | Optional content pinned to the top of the wrapper. Extends edge-to-edge (ignores the wrapper's 16px padding) and stays visible while the rest of the content scrolls underneath it |
| `children` | `React.ReactNode` | — | Content to render inside the wrapper |
| `sx` | `SxProps` | — | MUI system styles passed to the root `Stack` |
| _...rest_ | `StackProps` | — | All other MUI `Stack` props are forwarded |

#### Basic Usage

```tsx
import { BiampWrapper } from '@bwp-web/components';
import { Typography, Box } from '@mui/material';

function MyPage() {
  return (
    <Box height="100vh">
      <BiampWrapper>
        <Box>
          <Typography variant="h4" gutterBottom>
            Page Content
          </Typography>
          <Typography variant="body1">
            This is an example of content inside the BiampWrapper. The wrapper
            provides a full-height container with 16px padding, a white
            background with 8px rounded corners, and scrollable overflow.
          </Typography>
        </Box>
      </BiampWrapper>
    </Box>
  );
}
```

#### Dashboard Layout

The wrapper works well for dashboard-style layouts with cards and structured content:

```tsx
import { BiampWrapper } from '@bwp-web/components';
import { Box, Card, CardContent, Stack, Typography } from '@mui/material';

function Dashboard() {
  return (
    <Stack height="100vh">
      <BiampWrapper>
        <Box sx={{ p: 3 }}>
          <Typography variant="h4" gutterBottom>
            Dashboard
          </Typography>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            {['Devices', 'Rooms', 'Users'].map((title) => (
              <Card key={title} sx={{ flex: 1 }}>
                <CardContent>
                  <Typography variant="h6">{title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Manage your {title.toLowerCase()} here.
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </Box>
      </BiampWrapper>
    </Stack>
  );
}
```

#### Multiple Wrappers

Multiple wrappers can be stacked or arranged in a container, with each wrapper automatically filling its share of available space:

```tsx
import { BiampWrapper } from '@bwp-web/components';
import { Box, Stack, Typography } from '@mui/material';

function MultipleWrappers() {
  return (
    <Stack height="100vh" gap={2}>
      <BiampWrapper>
        <Box>
          <Typography variant="h5" gutterBottom>
            First Section
          </Typography>
          <Typography variant="body2">
            This wrapper stretches to fill available space. With flex: 1
            built-in, it shares space equally with other wrappers in the
            container.
          </Typography>
        </Box>
      </BiampWrapper>
      <BiampWrapper>
        <Box>
          <Typography variant="h5" gutterBottom>
            Second Section
          </Typography>
          <Typography variant="body2">
            Each wrapper automatically fills its share of the available height
            within the parent Stack, creating equal-sized sections.
          </Typography>
        </Box>
      </BiampWrapper>
    </Stack>
  );
}
```

#### Sticky Header

Pass `stickyTop` to pin header content to the wrapper's top edge while the rest of the content scrolls. The slot extends edge-to-edge — it negates the wrapper's 16px padding so the header sits flush against the rounded corners — and the rest of the content scrolls underneath it.

```tsx
import { BiampWrapper } from '@bwp-web/components';
import { Box, Stack, Typography } from '@mui/material';

function Devices() {
  return (
    <BiampWrapper
      stickyTop={
        <Box sx={{ p: 2, borderBottom: '0.6px solid', borderColor: 'divider' }}>
          <Typography variant="h5">Devices</Typography>
        </Box>
      }
    >
      <Stack spacing={2}>{/* scrollable content */}</Stack>
    </BiampWrapper>
  );
}
```

#### Loading State

Pass `loading` to show a debounced progress bar at the top of the wrapper while data is being fetched:

```tsx
import { BiampWrapper } from '@bwp-web/components';
import { Typography } from '@mui/material';

function Devices() {
  const { data, isLoading } = useDevicesQuery();

  return (
    <BiampWrapper loading={isLoading}>
      <Typography variant="h4">Devices</Typography>
      {/* render data */}
    </BiampWrapper>
  );
}
```

#### Styling and Customization

Override default styles using the `sx` prop:

```tsx
import { BiampWrapper } from '@bwp-web/components';
import { Typography, Box } from '@mui/material';

function CustomWrapper() {
  return (
    <Box height="100vh">
      <BiampWrapper
        sx={{
          backgroundColor: 'primary.main',
          padding: '16px',
          borderRadius: '16px',
        }}
      >
        <Box>
          <Typography variant="h5" color="primary.contrastText">
            Custom Styled Wrapper
          </Typography>
        </Box>
      </BiampWrapper>
    </Box>
  );
}
```

## Design Details

- **Dimensions**: Automatically stretches to fill available space using `flex: 1`, `width: '100%'`, and `height: '100%'`
- **Padding**: 16px on all sides
- **Border Radius**: 8px rounded corners
- **Background**: White in light mode, `grey.800` in dark mode
- **Overflow**: Scrollable (`auto`) when content exceeds container size, with `overscrollBehavior: 'none'` to suppress the bounce on macOS/iOS
- **Layout**: Uses `Stack` (column direction); children stretch to the wrapper's width by default. Pass `alignItems` if you need a different alignment.
- **Loading indicator**: Debounced via `useLoadingDelay` (150ms appear delay, 500ms minimum visible duration) and pinned to the top of the wrapper at `zIndex.appBar + 1`
- **Sticky top slot**: Negates the wrapper's 16px padding (`mt: -2`, `mx: -2`, `top: -16`) so the header extends edge-to-edge against the rounded corners, with a 16px bottom margin separating it from the scrollable content. Uses `background.paper` so the header stays opaque as content scrolls underneath

## Exports

- `BiampWrapper` — Full-page content wrapper with automatic space-filling and consistent styling.
- `BiampWrapperProps` — TypeScript type definition extending `StackProps`.
