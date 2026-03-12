import type { Meta, StoryObj } from '@storybook/react';
import { Badge, Stack, Typography } from '@mui/material';

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
  },
};

export const Variants: Story = {
  render: () => (
    <Stack spacing={3}>
      <Typography variant="h3">All variants</Typography>
      <Stack direction="column" spacing={4} alignItems="start" flexWrap="wrap">
        {(['primary', 'error', 'warning', 'success', 'info'] as const).map(
          (color) => (
            <Stack key={color} direction="row" alignItems="center" spacing={1}>
              <Badge color={color} badgeContent="0" />
              <Typography variant="body1">
                {color[0].toUpperCase() + color.slice(1)}
              </Typography>
            </Stack>
          ),
        )}
      </Stack>
    </Stack>
  ),
};
