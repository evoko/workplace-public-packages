import type { Meta, StoryObj } from '@storybook/react-vite';
import { Typography, Stack, Divider, Box } from '@mui/material';

const meta: Meta<typeof Typography> = {
  title: 'Styles/Typography',
  component: Typography,
};

export default meta;
type Story = StoryObj<typeof Typography>;

const sampleText = 'The quick brown fox jumps over the lazy dog';

export const AllVariants: Story = {
  render: () => (
    <Stack spacing={3}>
      {(
        [
          { variant: 'h1', label: 'h1 (display/lg) — Inter 3.75rem / 700' },
          { variant: 'h2', label: 'h2 (display/md) — Inter 3rem / 700' },
          { variant: 'h3', label: 'h3 (display/sm) — Inter 2.25rem / 700' },
          { variant: 'h4', label: 'h4 (title/lg) — Inter 1.875rem / 600' },
          { variant: 'h5', label: 'h5 (title/md) — Inter 1.5rem / 600' },
          { variant: 'h6', label: 'h6 (title/sm) — Inter 1.25rem / 600' },
          {
            variant: 'subtitle1',
            label: 'subtitle1 (title/xs) — Inter 1.125rem / 600',
          },
          {
            variant: 'subtitle2',
            label: 'subtitle2 (label/md) — Inter 0.875rem / 500',
          },
          { variant: 'body1', label: 'body1 (body/md) — Inter 1rem / 400' },
          { variant: 'body2', label: 'body2 (body/sm) — Inter 0.875rem / 400' },
          {
            variant: 'caption',
            label: 'caption (helper/sm) — Inter 0.75rem / 400',
          },
          {
            variant: 'overline',
            label: 'overline (label/sm) — Inter 0.75rem / 500 uppercase',
          },
          {
            variant: 'button',
            label: 'button (label/md) — Inter 0.875rem / 500',
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

export const Heading1: Story = {
  args: { variant: 'h1', children: 'Display Large' },
};

export const Heading2: Story = {
  args: { variant: 'h2', children: 'Display Medium' },
};

export const Heading3: Story = {
  args: { variant: 'h3', children: 'Display Small' },
};

export const Heading4: Story = {
  args: { variant: 'h4', children: 'Title Large' },
};

export const Heading5: Story = {
  args: { variant: 'h5', children: 'Title Medium' },
};

export const Heading6: Story = {
  args: { variant: 'h6', children: 'Title Small' },
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
