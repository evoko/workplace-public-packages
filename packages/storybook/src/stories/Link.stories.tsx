import type { Meta, StoryObj } from '@storybook/react-vite';
import { Link, Stack, Typography, Box } from '@mui/material';

const meta: Meta<typeof Link> = {
  title: 'Styles/Link',
  component: Link,
};

export default meta;
type Story = StoryObj<typeof Link>;

export const Default: Story = {
  render: () => (
    <Stack spacing={3}>
      <Typography variant="h6">Links</Typography>
      <Stack spacing={2}>
        <Link href="#">Default link</Link>
        <Link href="#" underline="hover">
          Underline on hover
        </Link>
        <Link href="#" underline="none">
          No underline
        </Link>
      </Stack>
    </Stack>
  ),
};

export const InContext: Story = {
  render: () => (
    <Box sx={{ maxWidth: 500 }}>
      <Typography variant="body1">
        Visit the <Link href="#">documentation</Link> for more details about
        configuring the SOLAR theme. You can also check the{' '}
        <Link href="#">design tokens reference</Link> for color and typography
        values.
      </Typography>
    </Box>
  ),
};
