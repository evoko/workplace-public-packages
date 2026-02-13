import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Box } from '@mui/material';
import { BiampSidebar, BiampSidebarIcon } from '@bwp-web/components';
import { BreadcrumbIcon } from '../../../styles/src/icons/BreadcrumbIcon';

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

export const Default: Story = {
  render: () => {
    const [selectedIndex, setSelectedIndex] = useState<number | null>(0);

    return (
      <BiampSidebar>
        {Array.from({ length: 5 }, (_, i) => (
          <BiampSidebarIcon
            key={i}
            selected={selectedIndex === i}
            icon={<BreadcrumbIcon />}
            onClick={() => setSelectedIndex(i)}
          />
        ))}
      </BiampSidebar>
    );
  },
};
