# BiampWrapper

A full-page content wrapper component that stretches to fill all available space with consistent padding, rounded corners, and scrollable overflow.

## Installation

```bash
npm install @bwp-web/components
```

### Peer Dependencies

- `@mui/material` >= 7.0.0
- `react` >= 18.0.0
- `react-dom` >= 18.0.0

## Components

### `BiampWrapper`

A flexible container component designed to wrap page content with a clean, consistent appearance. It automatically stretches to fill available space (using `flex: 1`, `width: '100%'`, and `height: '100%'`) and provides 8px padding, 8px border radius, and scrollable overflow when content exceeds the container size. The background is white in light mode and `grey.800` in dark mode. Extends MUI `StackProps`.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
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
            provides a full-height container with 8px padding, a white
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
- **Padding**: 8px on all sides
- **Border Radius**: 8px rounded corners
- **Background**: White in light mode, `grey.800` in dark mode
- **Overflow**: Scrollable (`auto`) when content exceeds container size
- **Layout**: Uses `Stack` (column direction) with `alignItems: flex-start` for content alignment

## Exports

- `BiampWrapper` — Full-page content wrapper with automatic space-filling and consistent styling.
- `BiampWrapperProps` — TypeScript type definition extending `StackProps`.
