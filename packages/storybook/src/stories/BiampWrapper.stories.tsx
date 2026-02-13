import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Box, Card, CardContent, Stack, Typography } from '@mui/material';
import { BiampWrapper } from '@bwp-web/components';

const meta: Meta<typeof BiampWrapper> = {
  title: 'Components/BiampWrapper',
  component: BiampWrapper,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <Box
        sx={{
          height: '100vh',
          backgroundColor: 'grey.100',
        }}
      >
        <Story />
      </Box>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof BiampWrapper>;

export const Default: Story = {
  render: () => (
    <BiampWrapper>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Page Content
        </Typography>
        <Typography variant="body1">
          This is an example of content inside the BiampWrapper. The wrapper
          provides a full-height container with responsive padding (16px on
          mobile, 20px on desktop) and a white background with rounded corners.
        </Typography>
      </Box>
    </BiampWrapper>
  ),
};

export const WithCards: Story = {
  render: () => (
    <BiampWrapper>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          {['Devices', 'Rooms', 'Users'].map((title) => (
            <Card key={title} sx={{ flex: 1 }}>
              <CardContent>
                <Typography variant="h6">{title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Manage your {title.toLowerCase()} here.
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Stack>
      </Box>
    </BiampWrapper>
  ),
};

export const Mobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
  render: () => (
    <BiampWrapper>
      <Box sx={{ p: 2 }}>
        <Typography variant="h5" gutterBottom>
          Mobile View
        </Typography>
        <Typography variant="body2">
          On mobile the wrapper uses 16px padding around the content area. Resize
          the viewport to see the padding change to 20px at the md breakpoint.
        </Typography>
        <Stack spacing={2} sx={{ mt: 2 }}>
          {['Devices', 'Rooms', 'Users'].map((title) => (
            <Card key={title}>
              <CardContent>
                <Typography variant="h6">{title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Manage your {title.toLowerCase()} here.
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Stack>
      </Box>
    </BiampWrapper>
  ),
};

export const Empty: Story = {
  render: () => <BiampWrapper />,
};
