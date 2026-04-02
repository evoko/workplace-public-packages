import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  LinearProgress,
  CircularProgress,
  Stack,
  Typography,
  Box,
} from '@mui/material';

const meta: Meta = {
  title: 'Styles/Progress',
};

export default meta;
type Story = StoryObj;

export const CircularIndeterminate: Story = {
  render: () => (
    <Stack direction="row" spacing={3}>
      <CircularProgress />
      <CircularProgress color="secondary" />
      <CircularProgress color="success" />
      <CircularProgress color="error" />
    </Stack>
  ),
};

export const CircularDeterminate: Story = {
  render: () => (
    <Stack direction="row" spacing={3}>
      <CircularProgress variant="determinate" value={25} />
      <CircularProgress variant="determinate" value={50} />
      <CircularProgress variant="determinate" value={75} />
      <CircularProgress variant="determinate" value={100} />
    </Stack>
  ),
};

export const CircularSizes: Story = {
  render: () => (
    <Stack direction="row" spacing={3} alignItems="center">
      <CircularProgress size={20} />
      <CircularProgress size={30} />
      <CircularProgress size={40} />
      <CircularProgress size={60} />
    </Stack>
  ),
};

export const LinearIndeterminate: Story = {
  render: () => (
    <Box sx={{ width: 400 }}>
      <Stack spacing={2}>
        <LinearProgress />
        <LinearProgress color="secondary" />
        <LinearProgress color="success" />
      </Stack>
    </Box>
  ),
};

export const LinearDeterminate: Story = {
  render: () => (
    <Box sx={{ width: 400 }}>
      <Stack spacing={2}>
        <LinearProgress variant="determinate" value={25} />
        <LinearProgress variant="determinate" value={50} />
        <LinearProgress variant="determinate" value={75} />
        <LinearProgress variant="determinate" value={100} />
      </Stack>
    </Box>
  ),
};

export const LinearBuffer: Story = {
  render: () => (
    <Box sx={{ width: 400 }}>
      <LinearProgress variant="buffer" value={30} valueBuffer={60} />
    </Box>
  ),
};
