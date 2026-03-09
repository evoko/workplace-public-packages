import type { Meta, StoryObj } from '@storybook/react';
import { Badge, Button, Stack, Typography } from '@mui/material';

const meta: Meta<typeof Badge> = {
  title: 'Styles/Badge',
  component: Badge,
  tags: ['autodocs'],
  argTypes: {
    badgeContent: { control: 'text' },
    color: {
      control: 'select',
      options: [
        'default',
        'primary',
        'secondary',
        'error',
        'warning',
        'success',
        'info',
      ],
    },
    variant: { control: 'select', options: ['standard', 'dot'] },
    max: { control: 'number' },
    invisible: { control: 'boolean' },
    anchorOrigin: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Playground: Story = {
  args: {
    badgeContent: 4,
    color: 'primary',
    max: 99,
    invisible: false,
    children: <Button variant="outlined">Notifications</Button>,
  },
};

export const Colors: Story = {
  render: () => (
    <Stack spacing={3}>
      <Typography variant="h3">Dot Variant</Typography>
      <Stack direction="row" spacing={4} alignItems="center" flexWrap="wrap">
        {(['primary', 'error', 'warning', 'success', 'info'] as const).map(
          (color, i) => (
            <Stack key={color} alignItems="center" spacing={1}>
              <Badge color={color} badgeContent="0">
                <Button variant="outlined">{color}</Button>
              </Badge>
            </Stack>
          ),
        )}
      </Stack>
    </Stack>
  ),
};

export const ExtendedContent: Story = {
  render: () => (
    <Stack spacing={3}>
      <Typography variant="h3">Max Overflow</Typography>
      <Stack direction="row" spacing={4} alignItems="center">
        <Stack alignItems="center" spacing={1}>
          <Badge badgeContent={99} color="primary">
            <Button variant="outlined">max=99</Button>
          </Badge>
        </Stack>
        <Stack alignItems="center" spacing={1}>
          <Badge badgeContent={100} color="primary">
            <Button variant="outlined">100 → 99+</Button>
          </Badge>
        </Stack>
        <Stack alignItems="center" spacing={1}>
          <Badge badgeContent={1000} color="error" max={999}>
            <Button variant="outlined">max=999</Button>
          </Badge>
        </Stack>
      </Stack>
    </Stack>
  ),
};
