import type { Meta, StoryObj } from '@storybook/react-vite';
import { Box, Stack, Typography, Paper } from '@mui/material';
import {
  BiampRedLogo,
  BookingApp,
  WorkplaceApp,
  CommandApp,
  DesignerApp,
  ConnectApp,
} from '@bwp-web/assets';

const images: [string, string][] = [
  ['BiampRedLogo', BiampRedLogo],
  ['BookingApp', BookingApp],
  ['WorkplaceApp', WorkplaceApp],
  ['CommandApp', CommandApp],
  ['DesignerApp', DesignerApp],
  ['ConnectApp', ConnectApp],
];

const meta: Meta = {
  title: 'Assets/Images',
};

export default meta;
type Story = StoryObj;

export const AllImages: Story = {
  render: () => (
    <Stack spacing={2}>
      <Typography variant="h5">{images.length} Images (PNG)</Typography>
      <Stack direction="row" flexWrap="wrap" gap={3}>
        {images.map(([name, src]) => (
          <Paper
            key={name}
            variant="outlined"
            sx={{ p: 2, textAlign: 'center' }}
          >
            <Box
              component="img"
              src={src}
              alt={name}
              sx={{
                maxWidth: 200,
                maxHeight: 200,
                objectFit: 'contain',
                display: 'block',
                mx: 'auto',
                mb: 1,
              }}
            />
            <Typography variant="caption" fontWeight={600}>
              {name}
            </Typography>
          </Paper>
        ))}
      </Stack>
    </Stack>
  ),
};
