import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Alert, Stack, Typography } from '@mui/material';

const meta: Meta<typeof Alert> = {
  title: 'Styles/Alert',
  component: Alert,
  tags: ['autodocs'],
  argTypes: {
    severity: {
      control: 'select',
      options: ['success', 'info', 'warning', 'error'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Alert>;

export const Playground: Story = {
  args: {
    severity: 'info',
    children: 'This is an alert message.',
  },
};

export const AllSeverities: Story = {
  render: () => (
    <Stack spacing={2}>
      <Typography variant="h3" sx={{ mb: 1 }}>
        Standard Alerts (all severities)
      </Typography>
      <Alert severity="success">Success — This is a success alert.</Alert>
      <Alert severity="info">Info — This is an info alert.</Alert>
      <Alert severity="warning">Warning — This is a warning alert.</Alert>
      <Alert severity="error">Error — This is an error alert.</Alert>
    </Stack>
  ),
};

export const WithActions: Story = {
  render: () => (
    <Stack spacing={2}>
      <Typography variant="h3" sx={{ mb: 1 }}>
        Alerts with close actions
      </Typography>
      <Alert severity="success" onClose={() => {}}>
        Success with close action.
      </Alert>
      <Alert severity="info" onClose={() => {}}>
        Info with close action.
      </Alert>
      <Alert severity="warning" onClose={() => {}}>
        Warning with close action.
      </Alert>
      <Alert severity="error" onClose={() => {}}>
        Error with close action.
      </Alert>
    </Stack>
  ),
};

export const LongContent: Story = {
  render: () => (
    <Stack spacing={2}>
      <Alert severity="info">
        This is a longer alert message that demonstrates how the alert component
        handles content that spans multiple lines. The custom styling should
        ensure proper alignment of the icon and the text content regardless of
        how much text is displayed.
      </Alert>
    </Stack>
  ),
};
