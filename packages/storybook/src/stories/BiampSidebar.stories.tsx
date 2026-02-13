import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Box } from '@mui/material';
import { BiampSidebar } from '@bwp-web/components';

const meta: Meta<typeof BiampSidebar> = {
  title: 'Components/BiampSidebar',
  component: BiampSidebar,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <Box sx={{ height: '100vh' }}>
        <Story />
      </Box>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof BiampSidebar>;

export const Default: Story = {};
