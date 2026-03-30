import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Skeleton,
  Stack,
  Card,
  CardContent,
  Box,
  Typography,
} from '@mui/material';

const meta: Meta<typeof Skeleton> = {
  title: 'Styles/Skeleton',
  component: Skeleton,
};

export default meta;
type Story = StoryObj<typeof Skeleton>;

export const Variants: Story = {
  render: () => (
    <Stack spacing={3} sx={{ maxWidth: 300 }}>
      <Typography variant="h6">Skeleton variants</Typography>
      <Skeleton variant="text" sx={{ fontSize: '1rem' }} />
      <Skeleton variant="circular" width={40} height={40} />
      <Skeleton variant="rectangular" width={300} height={60} />
      <Skeleton variant="rounded" width={300} height={60} />
    </Stack>
  ),
};

export const CardLoading: Story = {
  name: 'Card loading state',
  render: () => (
    <Stack direction="row" spacing={2}>
      {[0, 1].map((i) => (
        <Card key={i} sx={{ width: 280 }}>
          <CardContent>
            <Stack spacing={1}>
              <Skeleton variant="text" width="40%" />
              <Skeleton variant="text" width="80%" />
              <Skeleton variant="rectangular" height={120} />
              <Box sx={{ display: 'flex', gap: 1, pt: 1 }}>
                <Skeleton variant="rounded" width={80} height={36} />
                <Skeleton variant="rounded" width={80} height={36} />
              </Box>
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Stack>
  ),
};
