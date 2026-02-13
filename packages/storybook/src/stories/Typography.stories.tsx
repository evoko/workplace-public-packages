import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Typography, Stack, Divider, Box } from '@mui/material';

const meta: Meta<typeof Typography> = {
  title: 'Styles/Typography',
  component: Typography,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Typography>;

const sampleText = 'The quick brown fox jumps over the lazy dog';

export const AllVariants: Story = {
  render: () => (
    <Stack spacing={3}>
      {(
        [
          { variant: 'h0', label: 'h0 — Montserrat 3.5rem / 500' },
          { variant: 'h1', label: 'h1 — Montserrat 1.75rem / 500' },
          { variant: 'h2', label: 'h2 — Montserrat 1.25rem / 600' },
          { variant: 'h3', label: 'h3 — Open Sans 1rem / 600' },
          { variant: 'h4', label: 'h4 — Montserrat 1rem / 600' },
          { variant: 'body1', label: 'body1 — Open Sans 1rem / 400' },
          { variant: 'body2', label: 'body2 — Open Sans 0.875rem / 400' },
          { variant: 'caption', label: 'caption — Open Sans 0.75rem / 400' },
          {
            variant: 'subtitle1',
            label: 'subtitle1 — Open Sans 0.875rem',
          },
          {
            variant: 'subtitle2',
            label: 'subtitle2 — Open Sans 0.75rem',
          },
          { variant: 'button', label: 'button — Open Sans 0.875rem / 600' },
          {
            variant: 'sidebar',
            label: 'sidebar — Open Sans 0.563rem / 700',
          },
        ] as const
      ).map(({ variant, label }) => (
        <Box key={variant}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mb: 0.5, display: 'block' }}
          >
            {label}
          </Typography>
          <Typography variant={variant}>{sampleText}</Typography>
          <Divider sx={{ mt: 2 }} />
        </Box>
      ))}
    </Stack>
  ),
};

export const Heading0: Story = {
  args: { variant: 'h0', children: 'Heading 0' },
};

export const Heading1: Story = {
  args: { variant: 'h1', children: 'Heading 1' },
};

export const Heading2: Story = {
  args: { variant: 'h2', children: 'Heading 2' },
};

export const Heading3: Story = {
  args: { variant: 'h3', children: 'Heading 3' },
};

export const Heading4: Story = {
  args: { variant: 'h4', children: 'Heading 4' },
};

export const Body1: Story = {
  args: { variant: 'body1', children: sampleText },
};

export const Body2: Story = {
  args: { variant: 'body2', children: sampleText },
};

export const Caption: Story = {
  args: { variant: 'caption', children: sampleText },
};

export const Sidebar: Story = {
  args: { variant: 'sidebar', children: 'Sidebar Label' },
};
