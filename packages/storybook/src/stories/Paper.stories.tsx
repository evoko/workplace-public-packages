import type { Meta, StoryObj } from '@storybook/react-vite';
import { Paper, Stack, Typography, Box } from '@mui/material';

const meta: Meta<typeof Paper> = {
  title: 'Styles/Paper',
  component: Paper,
};

export default meta;
type Story = StoryObj<typeof Paper>;

export const Elevations: Story = {
  render: () => (
    <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
      {[0, 1, 2, 3, 4, 6, 8, 12, 16, 24].map((elevation) => (
        <Paper
          key={elevation}
          elevation={elevation}
          sx={{
            width: 100,
            height: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography variant="caption">elev={elevation}</Typography>
        </Paper>
      ))}
    </Stack>
  ),
};

export const Variants: Story = {
  render: () => (
    <Stack direction="row" spacing={2}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography>Elevation (default)</Typography>
      </Paper>
      <Paper variant="outlined" sx={{ p: 3 }}>
        <Typography>Outlined</Typography>
      </Paper>
    </Stack>
  ),
};

export const Square: Story = {
  render: () => (
    <Stack direction="row" spacing={2}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography>Rounded (default)</Typography>
      </Paper>
      <Paper elevation={3} square sx={{ p: 3 }}>
        <Typography>Square</Typography>
      </Paper>
    </Stack>
  ),
};
