import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge, Box, Stack, Typography } from '@mui/material';
import MailIcon from '@mui/icons-material/Mail';
import NotificationsIcon from '@mui/icons-material/Notifications';

const meta: Meta<typeof Badge> = {
  title: 'Styles/Badge',
  component: Badge,
  argTypes: {
    badgeContent: { control: 'text' },
    color: {
      control: 'select',
      options: ['default', 'primary', 'error', 'warning', 'success', 'info'],
    },
    variant: {
      control: 'select',
      options: ['standard', 'dot'],
    },
    invisible: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Playground: Story = {
  args: {
    badgeContent: 4,
    color: 'primary',
    variant: 'standard',
    invisible: false,
    children: <MailIcon />,
  },
};

const COLORS = ['primary', 'error', 'warning', 'success', 'info'] as const;

export const Dot: Story = {
  name: 'Dot variant',
  render: () => (
    <Stack spacing={3}>
      <Typography variant="h6">Badge dot — status indicator</Typography>
      <Stack direction="row" spacing={3} alignItems="center">
        {COLORS.map((color) => (
          <Badge key={color} color={color} variant="dot">
            <NotificationsIcon />
          </Badge>
        ))}
      </Stack>
    </Stack>
  ),
};

export const Standard: Story = {
  name: 'Standard variant',
  render: () => (
    <Stack spacing={3}>
      <Typography variant="h6">Badge standard — with count</Typography>
      <Stack direction="row" spacing={3} alignItems="center">
        {COLORS.map((color) => (
          <Badge key={color} color={color} badgeContent={5}>
            <MailIcon />
          </Badge>
        ))}
      </Stack>
    </Stack>
  ),
};
