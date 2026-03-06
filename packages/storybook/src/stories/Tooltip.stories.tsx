import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  Tooltip,
  Button,
  IconButton,
  Stack,
  Typography,
  Box,
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import HelpIcon from '@mui/icons-material/Help';
import { ClockIcon, PinLocationIcon } from '@bwp-web/assets';

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

export const CustomContent: Story = {
  render: () => (
    <Stack spacing={3}>
      <Typography variant="h3">With custom content</Typography>
      <Stack direction="row" spacing={2}>
        <Tooltip title={<CustomTooltipContent />} arrow>
          <Button variant="outlined">Hover over</Button>
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

function CustomTooltipContent() {
  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      <span style={{ display: 'flex', alignItems: "center", gap: '4px' }}>
        <PinLocationIcon variant="xxs" sx={{ fontSize: '12px' }} /> 1380 W
        Elliot Rd, Tempe, AZ 85284, US
      </span>
      <span style={{ display: 'flex', alignItems: "center", gap: '4px' }}>
        <ClockIcon sx={{ fontSize: '12px' }} /> 11:45PM PST
      </span>
    </div>
  );
}
