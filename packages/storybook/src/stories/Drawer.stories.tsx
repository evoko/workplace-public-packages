import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  Drawer,
  Button,
  Stack,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
} from '@mui/material';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import MailIcon from '@mui/icons-material/Mail';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SettingsIcon from '@mui/icons-material/Settings';
import PeopleIcon from '@mui/icons-material/People';
import BarChartIcon from '@mui/icons-material/BarChart';

const meta: Meta<typeof Drawer> = {
  title: 'Styles/Drawer',
  component: Drawer,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Drawer>;

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <Stack spacing={2}>
        <Typography variant="h3">Drawer</Typography>
        <Button variant="contained" onClick={() => setOpen(true)}>
          Open Drawer
        </Button>
        <Drawer
          anchor="left"
          open={open}
          onClose={() => setOpen(false)}
          PaperProps={{
            sx: { bgcolor: 'grey.900' },
          }}
        >
          <Box sx={{ pt: 2 }}>
            <Typography
              variant="h2"
              sx={{ px: 2, pb: 2, color: 'common.white' }}
            >
              Navigation
            </Typography>
            <Divider />
            <List>
              {[
                { text: 'Dashboard', icon: <DashboardIcon /> },
                { text: 'Users', icon: <PeopleIcon /> },
                { text: 'Analytics', icon: <BarChartIcon /> },
                { text: 'Settings', icon: <SettingsIcon /> },
              ].map((item, index) => (
                <ListItemButton key={item.text} selected={index === 0}>
                  <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              ))}
            </List>
            <Divider />
            <List>
              {[
                { text: 'Inbox', icon: <InboxIcon /> },
                { text: 'Mail', icon: <MailIcon /> },
              ].map((item) => (
                <ListItemButton key={item.text}>
                  <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              ))}
            </List>
          </Box>
        </Drawer>
      </Stack>
    );
  },
};
