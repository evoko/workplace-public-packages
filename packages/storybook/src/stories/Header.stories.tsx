import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  Stack,
  Typography,
  IconButton,
  Button,
  Avatar,
  Chip,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { Header } from '@bwp-web/components';

const meta: Meta<typeof Header> = {
  title: 'Components/Header',
  component: Header,
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof Header>;

export const Default: Story = {
  args: {
    title: 'Workplace',
  },
};

export const WithStartAndEndContent: Story = {
  args: {
    title: 'My Application',
    startContent: (
      <IconButton color="inherit" size="small">
        <MenuIcon />
      </IconButton>
    ),
    endContent: (
      <Stack direction="row" spacing={1} alignItems="center">
        <IconButton color="inherit">
          <NotificationsIcon />
        </IconButton>
        <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
          <AccountCircleIcon />
        </Avatar>
      </Stack>
    ),
  },
};

export const WithActions: Story = {
  args: {
    title: 'Dashboard',
    endContent: (
      <Stack direction="row" spacing={1}>
        <Button color="inherit" size="small">
          Help
        </Button>
        <Button color="inherit" variant="outlined" size="small">
          Sign In
        </Button>
      </Stack>
    ),
  },
};

export const CustomColor: Story = {
  args: {
    title: 'Custom Styled',
    appBarProps: {
      color: 'transparent',
      sx: { bgcolor: 'grey.900', color: 'common.white' },
    },
    endContent: (
      <Chip label="v0.1.0" size="small" color="primary" />
    ),
  },
};

export const MinimalNoTitle: Story = {
  args: {
    startContent: (
      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
        BIAMP
      </Typography>
    ),
    endContent: (
      <IconButton color="inherit">
        <AccountCircleIcon />
      </IconButton>
    ),
  },
};

export const AllVariations: Story = {
  render: () => (
    <Stack spacing={3}>
      <Typography variant="h3" sx={{ mb: 1 }}>
        Header Variations
      </Typography>

      <Header title="Default Header" />

      <Header
        title="With Navigation"
        startContent={
          <IconButton color="inherit" size="small">
            <MenuIcon />
          </IconButton>
        }
        endContent={
          <Stack direction="row" spacing={1} alignItems="center">
            <IconButton color="inherit">
              <NotificationsIcon />
            </IconButton>
            <Avatar sx={{ width: 32, height: 32 }}>
              <AccountCircleIcon />
            </Avatar>
          </Stack>
        }
      />

      <Header
        startContent={
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            BIAMP
          </Typography>
        }
        endContent={
          <Stack direction="row" spacing={1}>
            <Button color="inherit" size="small">
              Docs
            </Button>
            <Button color="inherit" variant="outlined" size="small">
              Sign In
            </Button>
          </Stack>
        }
      />
    </Stack>
  ),
};
