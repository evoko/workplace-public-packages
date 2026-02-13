import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Divider, Stack, Typography, Box, Chip } from '@mui/material';

const meta: Meta<typeof Divider> = {
  title: 'Styles/Divider',
  component: Divider,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Divider>;

export const Default: Story = {
  render: () => (
    <Stack spacing={3}>
      <Typography variant="h3">Divider</Typography>

      <Box>
        <Typography variant="body1" sx={{ mb: 1 }}>
          Content above the divider
        </Typography>
        <Divider />
        <Typography variant="body1" sx={{ mt: 1 }}>
          Content below the divider
        </Typography>
      </Box>
    </Stack>
  ),
};

export const WithText: Story = {
  render: () => (
    <Stack spacing={3}>
      <Typography variant="h3">Divider with Text</Typography>

      <Divider>Center</Divider>
      <Divider textAlign="left">Left</Divider>
      <Divider textAlign="right">Right</Divider>
      <Divider>
        <Chip label="Chip" size="small" />
      </Divider>
    </Stack>
  ),
};

export const InList: Story = {
  render: () => (
    <Stack spacing={3}>
      <Typography variant="h3">Dividers in a List</Typography>
      <Box>
        {['First section', 'Second section', 'Third section'].map(
          (text, index, arr) => (
            <React.Fragment key={text}>
              <Typography variant="body1" sx={{ py: 1.5 }}>
                {text}
              </Typography>
              {index < arr.length - 1 && <Divider />}
            </React.Fragment>
          )
        )}
      </Box>
    </Stack>
  ),
};
