import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Fab, Stack, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import NavigationIcon from '@mui/icons-material/Navigation';

const meta: Meta<typeof Fab> = {
  title: 'Styles/Fab',
  component: Fab,
  tags: ['autodocs'],
  argTypes: {
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'default'],
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
    },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof Fab>;

export const Playground: Story = {
  args: {
    color: 'primary',
    children: <AddIcon />,
    disabled: false,
  },
};

export const AllVariants: Story = {
  render: () => (
    <Stack spacing={4}>
      <Typography variant="h3">FAB Variants</Typography>

      <Stack direction="row" spacing={2} alignItems="center">
        <Fab color="primary" aria-label="add">
          <AddIcon />
        </Fab>
        <Fab color="primary" aria-label="edit">
          <EditIcon />
        </Fab>
        <Fab color="primary" disabled aria-label="disabled">
          <AddIcon />
        </Fab>
      </Stack>

      <Typography variant="h3">Sizes</Typography>
      <Stack direction="row" spacing={2} alignItems="center">
        <Fab color="primary" size="small" aria-label="small">
          <AddIcon />
        </Fab>
        <Fab color="primary" size="medium" aria-label="medium">
          <AddIcon />
        </Fab>
        <Fab color="primary" size="large" aria-label="large">
          <AddIcon />
        </Fab>
      </Stack>

      <Typography variant="h3">Extended</Typography>
      <Stack direction="row" spacing={2} alignItems="center">
        <Fab color="primary" variant="extended">
          <NavigationIcon sx={{ mr: 1 }} />
          Navigate
        </Fab>
        <Fab color="primary" variant="extended" disabled>
          <AddIcon sx={{ mr: 1 }} />
          Disabled
        </Fab>
      </Stack>
    </Stack>
  ),
};
