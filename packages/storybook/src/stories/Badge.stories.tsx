import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge, Stack, IconButton } from '@mui/material';
import MailIcon from '@mui/icons-material/Mail';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

const meta: Meta<typeof Badge> = {
  title: 'Styles/Badge',
  component: Badge,
  argTypes: {
    color: {
      control: 'select',
      options: [
        'default',
        'primary',
        'secondary',
        'success',
        'error',
        'info',
        'warning',
      ],
    },
    variant: { control: 'select', options: ['standard', 'dot'] },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Playground: Story = {
  args: { badgeContent: 4, color: 'primary', children: <MailIcon /> },
};

export const BasicBadges: Story = {
  render: () => (
    <Stack direction="row" spacing={4}>
      <Badge badgeContent={4} color="primary">
        <MailIcon />
      </Badge>
      <Badge badgeContent={99} color="secondary">
        <MailIcon />
      </Badge>
      <Badge badgeContent={1000} max={999} color="error">
        <MailIcon />
      </Badge>
    </Stack>
  ),
};

export const Colors: Story = {
  render: () => (
    <Stack direction="row" spacing={4}>
      {(
        ['primary', 'secondary', 'success', 'error', 'info', 'warning'] as const
      ).map((color) => (
        <Badge key={color} badgeContent={4} color={color}>
          <MailIcon />
        </Badge>
      ))}
    </Stack>
  ),
};

export const DotVariant: Story = {
  render: () => (
    <Stack direction="row" spacing={4}>
      <Badge variant="dot" color="primary">
        <MailIcon />
      </Badge>
      <Badge variant="dot" color="secondary">
        <MailIcon />
      </Badge>
    </Stack>
  ),
};

export const ShowZero: Story = {
  render: () => (
    <Stack direction="row" spacing={4}>
      <Badge badgeContent={0} color="primary">
        <MailIcon />
      </Badge>
      <Badge badgeContent={0} color="primary" showZero>
        <MailIcon />
      </Badge>
    </Stack>
  ),
};

export const Invisible: Story = {
  render: () => (
    <Stack direction="row" spacing={4}>
      <Badge badgeContent={4} color="primary" invisible>
        <MailIcon />
      </Badge>
      <Badge badgeContent={4} color="primary">
        <MailIcon />
      </Badge>
    </Stack>
  ),
};
