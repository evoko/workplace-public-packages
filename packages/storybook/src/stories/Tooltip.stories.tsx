import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Tooltip, Button, IconButton, Stack, Typography, Box } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import HelpIcon from '@mui/icons-material/Help';

const meta: Meta<typeof Tooltip> = {
  title: 'Styles/Tooltip',
  component: Tooltip,
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    placement: {
      control: 'select',
      options: [
        'top',
        'bottom',
        'left',
        'right',
        'top-start',
        'top-end',
        'bottom-start',
        'bottom-end',
      ],
    },
    arrow: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof Tooltip>;

export const Playground: Story = {
  args: {
    title: 'Tooltip text',
    arrow: true,
    placement: 'top',
    children: <Button variant="outlined">Hover me</Button>,
  },
};

export const Placements: Story = {
  render: () => (
    <Stack spacing={3}>
      <Typography variant="h3">Tooltip Placements</Typography>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
          justifyContent: 'center',
          py: 4,
        }}
      >
        {(
          [
            'top-start',
            'top',
            'top-end',
            'left',
            'right',
            'bottom-start',
            'bottom',
            'bottom-end',
          ] as const
        ).map((placement) => (
          <Tooltip key={placement} title={`Placement: ${placement}`} placement={placement} arrow>
            <Button variant="outlined" size="small">
              {placement}
            </Button>
          </Tooltip>
        ))}
      </Box>
    </Stack>
  ),
};

export const WithArrow: Story = {
  render: () => (
    <Stack spacing={3}>
      <Typography variant="h3">With Arrow</Typography>
      <Stack direction="row" spacing={2}>
        <Tooltip title="With arrow" arrow>
          <Button variant="outlined">With Arrow</Button>
        </Tooltip>
        <Tooltip title="Without arrow">
          <Button variant="outlined">Without Arrow</Button>
        </Tooltip>
      </Stack>
    </Stack>
  ),
};

export const OnIcons: Story = {
  render: () => (
    <Stack spacing={3}>
      <Typography variant="h3">On Icon Buttons</Typography>
      <Stack direction="row" spacing={2}>
        <Tooltip title="More information" arrow>
          <IconButton>
            <InfoIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Get help" arrow>
          <IconButton>
            <HelpIcon />
          </IconButton>
        </Tooltip>
      </Stack>
    </Stack>
  ),
};
