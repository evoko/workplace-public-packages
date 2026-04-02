import type { Meta, StoryObj } from '@storybook/react-vite';
import { IconButton, Stack, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AlarmIcon from '@mui/icons-material/Alarm';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import FingerprintIcon from '@mui/icons-material/Fingerprint';

const meta: Meta<typeof IconButton> = {
  title: 'Styles/IconButton',
  component: IconButton,
};

export default meta;
type Story = StoryObj<typeof IconButton>;

export const Playground: Story = {
  args: { children: <DeleteIcon /> },
};

export const Colors: Story = {
  render: () => (
    <Stack direction="row" spacing={1}>
      <IconButton>
        <FingerprintIcon />
      </IconButton>
      <IconButton color="primary">
        <FingerprintIcon />
      </IconButton>
      <IconButton color="secondary">
        <FingerprintIcon />
      </IconButton>
      <IconButton color="success">
        <FingerprintIcon />
      </IconButton>
      <IconButton color="error">
        <FingerprintIcon />
      </IconButton>
      <IconButton color="info">
        <FingerprintIcon />
      </IconButton>
      <IconButton color="warning">
        <FingerprintIcon />
      </IconButton>
    </Stack>
  ),
};

export const Sizes: Story = {
  render: () => (
    <Stack direction="row" spacing={1} alignItems="center">
      <IconButton size="small">
        <DeleteIcon fontSize="small" />
      </IconButton>
      <IconButton size="medium">
        <DeleteIcon />
      </IconButton>
      <IconButton size="large">
        <DeleteIcon fontSize="large" />
      </IconButton>
    </Stack>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Stack direction="row" spacing={1}>
      <IconButton disabled>
        <DeleteIcon />
      </IconButton>
      <IconButton disabled color="primary">
        <DeleteIcon />
      </IconButton>
    </Stack>
  ),
};
