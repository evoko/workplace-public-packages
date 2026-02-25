import type { Meta, StoryObj } from '@storybook/react';
import { Chip, Stack, Typography } from '@mui/material';

const meta: Meta<typeof Chip> = {
  title: 'Styles/Chip',
  component: Chip,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['filled', 'outlined'] },
    color: { control: 'select', options: ['default', 'primary', 'secondary', 'error', 'warning', 'success', 'info'] },
    size: { control: 'select', options: ['small', 'medium'] },
    onDelete: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof Chip>;

export const AllStates: Story = {
  render: () => (
    <Stack spacing={3}>
      <Typography variant="h3">Chip States</Typography>
      <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
        <Chip label="Label" onDelete={() => {}} />
      </Stack>
    </Stack>
  ),
};