import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Breadcrumbs, Link, Typography, Stack } from '@mui/material';

const meta: Meta<typeof Breadcrumbs> = {
  title: 'Styles/Breadcrumbs',
  component: Breadcrumbs,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Breadcrumbs>;

export const Default: Story = {
  render: () => (
    <Stack spacing={3}>
      <Typography variant="h3">Breadcrumbs</Typography>
      <Typography variant="body2" color="text.secondary">
        Uses the custom BreadcrumbIcon separator from the theme.
      </Typography>

      <Breadcrumbs>
        <Link underline="hover" color="inherit" href="#">
          Home
        </Link>
        <Link underline="hover" color="inherit" href="#">
          Settings
        </Link>
        <Typography color="text.primary">General</Typography>
      </Breadcrumbs>
    </Stack>
  ),
};

export const MultipleDepths: Story = {
  render: () => (
    <Stack spacing={3}>
      <Typography variant="h3">Multiple Depths</Typography>

      <Breadcrumbs>
        <Link underline="hover" color="inherit" href="#">
          Home
        </Link>
        <Typography color="text.primary">Dashboard</Typography>
      </Breadcrumbs>

      <Breadcrumbs>
        <Link underline="hover" color="inherit" href="#">
          Home
        </Link>
        <Link underline="hover" color="inherit" href="#">
          Users
        </Link>
        <Typography color="text.primary">John Doe</Typography>
      </Breadcrumbs>

      <Breadcrumbs>
        <Link underline="hover" color="inherit" href="#">
          Home
        </Link>
        <Link underline="hover" color="inherit" href="#">
          Settings
        </Link>
        <Link underline="hover" color="inherit" href="#">
          Advanced
        </Link>
        <Link underline="hover" color="inherit" href="#">
          Network
        </Link>
        <Typography color="text.primary">Proxy Configuration</Typography>
      </Breadcrumbs>
    </Stack>
  ),
};

export const Collapsed: Story = {
  render: () => (
    <Stack spacing={3}>
      <Typography variant="h3">Collapsed (maxItems)</Typography>
      <Breadcrumbs maxItems={3}>
        <Link underline="hover" color="inherit" href="#">
          Home
        </Link>
        <Link underline="hover" color="inherit" href="#">
          Category
        </Link>
        <Link underline="hover" color="inherit" href="#">
          Sub-category
        </Link>
        <Link underline="hover" color="inherit" href="#">
          Item Type
        </Link>
        <Typography color="text.primary">Item Detail</Typography>
      </Breadcrumbs>
    </Stack>
  ),
};
