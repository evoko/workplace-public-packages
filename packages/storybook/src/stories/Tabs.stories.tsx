import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Tabs, Tab, Stack, Typography, Box, Badge } from '@mui/material';

const meta: Meta<typeof Tabs> = {
  title: 'Styles/Tabs',
  component: Tabs,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Tabs>;

function TabPanel({
  children,
  value,
  index,
}: {
  children: React.ReactNode;
  value: number;
  index: number;
}) {
  return value === index ? <Box sx={{ p: 2 }}>{children}</Box> : null;
}

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState(0);
    return (
      <Stack spacing={2}>
        <Typography variant="h3">Tabs</Typography>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={value} onChange={(_, v) => setValue(v)}>
            <Tab label="Overview" />
            <Tab label="Details" />
            <Tab label="Settings" />
          </Tabs>
        </Box>
        <TabPanel value={value} index={0}>
          <Typography>Overview content goes here.</Typography>
        </TabPanel>
        <TabPanel value={value} index={1}>
          <Typography>Details content goes here.</Typography>
        </TabPanel>
        <TabPanel value={value} index={2}>
          <Typography>Settings content goes here.</Typography>
        </TabPanel>
      </Stack>
    );
  },
};

export const WithBadge: Story = {
  render: () => {
    const [value, setValue] = useState(0);
    const [notifications, setNotifications] = useState(1);
    return (
      <Stack spacing={2}>
        <Typography variant="h3">Many Tabs with badge</Typography>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={value} onChange={(_, v) => setValue(v)}>
            <Tab label="Dashboard" />
            <Tab label="Analytics" />
            <Tab
              label="Users"
              icon={<Badge color="primary" badgeContent={notifications} />}
              iconPosition="end"
            />
          </Tabs>
        </Box>
      </Stack>
    );
  },
};

export const DisabledTab: Story = {
  render: () => {
    const [value, setValue] = useState(0);
    const [notifications, setNotifications] = useState(0);
    return (
      <Stack spacing={2}>
        <Typography variant="h3">With Disabled Tab</Typography>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={value} onChange={(_, v) => setValue(v)}>
            <Tab label="Active" />
            <Tab label="Disabled" disabled />
            <Tab
              label="Disabled with badge"
              icon={<Badge color="primary" badgeContent={notifications} />}
              iconPosition="end"
              disabled
            />
          </Tabs>
        </Box>
      </Stack>
    );
  },
};
