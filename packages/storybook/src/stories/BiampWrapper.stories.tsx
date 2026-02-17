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
    backgrounds: {
      default: 'grey',
      values: [{ name: 'grey', value: '#F5F5F5' }],
    },
  },
};

export default meta;
type Story = StoryObj<typeof BiampWrapper>;

/**
 * The default BiampWrapper with simple content. The wrapper provides
 * a full-height container with 8px padding, 8px border radius, and
 * a white background (dark: `grey.800`). The outer page background
 * is `grey.100` (dark: `grey.800`).
 */
export const Default: Story = {
  render: () => (
    <Stack height="100vh">
      <BiampWrapper>
        <Box>
          <Typography variant="h4" gutterBottom>
            Page Content
          </Typography>
          <Typography variant="body1">
            This is an example of content inside the BiampWrapper. The wrapper
            provides a full-height container with 8px padding, a white
            background with 8px rounded corners, and scrollable overflow.
          </Typography>
        </Box>
      </BiampWrapper>
    </Stack>
  ),
};

/**
 * The wrapper with card-based content, demonstrating how it provides
 * a content area for dashboard-style layouts.
 */
export const WithCards: Story = {
  render: () => (
    <Stack height="100vh">
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
    </Stack>
  ),
};

/**
 * The wrapper at a mobile viewport size.
 */
export const Mobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
  render: () => (
    <Stack height="100vh">
      <BiampWrapper>
        <Box sx={{ p: 2 }}>
          <Typography variant="h5" gutterBottom>
            Mobile View
          </Typography>
          <Typography variant="body2">
            The wrapper uses 8px padding around the content area at all
            breakpoints.
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
    </Stack>
  ),
};

/**
 * An empty wrapper showing the rounded white container against
 * the `grey.100` (dark: `grey.800`) page background.
 */
export const Empty: Story = {
  render: () => (
    <Box height="100vh">
      <BiampWrapper />
    </Box>
  ),
};

/**
 * Multiple BiampWrappers stacked vertically, demonstrating
 * how they share space when placed in a Stack container.
 */
export const MultipleSideBySide: Story = {
  render: () => (
    <Stack height="100vh" gap={2}>
      <BiampWrapper>
        <Box>
          <Typography variant="h5" gutterBottom>
            First Wrapper
          </Typography>
          <Typography variant="body2">
            This wrapper stretches to fill available space. With flex: 1
            built-in, it shares space equally with other wrappers in the
            container.
          </Typography>
        </Box>
      </BiampWrapper>
      <BiampWrapper>
        <Box>
          <Typography variant="h5" gutterBottom>
            Second Wrapper
          </Typography>
          <Typography variant="body2">
            Each wrapper automatically fills its share of the available height
            within the parent Stack, creating equal-sized sections.
          </Typography>
        </Box>
      </BiampWrapper>
    </Stack>
  ),
};

/**
 * Multiple BiampWrappers stacked vertically, demonstrating
 * how they share space when placed in a Stack container.
 */
export const FourSideBySide: Story = {
  render: () => (
    <Stack height="100vh" gap={2}>
      <Stack direction={'row'} gap={2} flex={1}>
        <BiampWrapper>
          <Box>
            <Typography variant="h5" gutterBottom>
              First Wrapper
            </Typography>
            <Typography variant="body2">
              This wrapper stretches to fill available space. With flex: 1
              built-in, it shares space equally with other wrappers in the
              container.
            </Typography>
          </Box>
        </BiampWrapper>
        <BiampWrapper>
          <Box>
            <Typography variant="h5" gutterBottom>
              Second Wrapper
            </Typography>
            <Typography variant="body2">
              Each wrapper automatically fills its share of the available height
              within the parent Stack, creating equal-sized sections.
            </Typography>
          </Box>
        </BiampWrapper>
      </Stack>

      <Stack direction={'row'} gap={2} flex={1}>
        <BiampWrapper>
          <Box>
            <Typography variant="h5" gutterBottom>
              Third Wrapper
            </Typography>
            <Typography variant="body2"></Typography>
          </Box>
        </BiampWrapper>
        <BiampWrapper>
          <Box>
            <Typography variant="h5" gutterBottom>
              Fourth Wrapper
            </Typography>
            <Typography variant="body2"></Typography>
          </Box>
        </BiampWrapper>
      </Stack>
    </Stack>
  ),
};
