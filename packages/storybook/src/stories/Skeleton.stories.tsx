import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Skeleton,
  Stack,
  Box,
  Typography,
  Avatar,
  Card,
  CardContent,
  CardHeader,
} from '@mui/material';

const meta: Meta<typeof Skeleton> = {
  title: 'Styles/Skeleton',
  component: Skeleton,
};

export default meta;
type Story = StoryObj<typeof Skeleton>;

export const Variants: Story = {
  render: () => (
    <Stack spacing={2} sx={{ width: 300 }}>
      <Skeleton variant="text" sx={{ fontSize: '1rem' }} />
      <Skeleton variant="circular" width={40} height={40} />
      <Skeleton variant="rectangular" width={300} height={60} />
      <Skeleton variant="rounded" width={300} height={60} />
    </Stack>
  ),
};

export const Animations: Story = {
  render: () => (
    <Stack spacing={2} sx={{ width: 300 }}>
      <Typography variant="caption">Pulse (default)</Typography>
      <Skeleton animation="pulse" />
      <Typography variant="caption">Wave</Typography>
      <Skeleton animation="wave" />
      <Typography variant="caption">False (no animation)</Typography>
      <Skeleton animation={false} />
    </Stack>
  ),
};

export const CardLoading: Story = {
  render: () => (
    <Card sx={{ maxWidth: 345 }}>
      <CardHeader
        avatar={<Skeleton variant="circular" width={40} height={40} />}
        title={<Skeleton width="80%" />}
        subheader={<Skeleton width="40%" />}
      />
      <Skeleton variant="rectangular" height={194} />
      <CardContent>
        <Skeleton />
        <Skeleton width="60%" />
      </CardContent>
    </Card>
  ),
};
