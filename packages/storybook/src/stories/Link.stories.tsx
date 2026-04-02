import type { Meta, StoryObj } from '@storybook/react-vite';
import { Link, Stack, Typography } from '@mui/material';

const meta: Meta<typeof Link> = {
  title: 'Styles/Link',
  component: Link,
};

export default meta;
type Story = StoryObj<typeof Link>;

export const Underline: Story = {
  render: () => (
    <Stack direction="row" spacing={3}>
      <Link href="#" underline="none">
        None
      </Link>
      <Link href="#" underline="hover">
        Hover
      </Link>
      <Link href="#" underline="always">
        Always
      </Link>
    </Stack>
  ),
};

export const Colors: Story = {
  render: () => (
    <Stack direction="row" spacing={3}>
      <Link href="#" color="primary">
        Primary
      </Link>
      <Link href="#" color="secondary">
        Secondary
      </Link>
      <Link href="#" color="error">
        Error
      </Link>
      <Link href="#" color="text.primary">
        Text Primary
      </Link>
    </Stack>
  ),
};

export const Variants: Story = {
  render: () => (
    <Stack spacing={1}>
      {(['h6', 'body1', 'body2', 'caption', 'subtitle1'] as const).map(
        (variant) => (
          <Link key={variant} href="#" variant={variant}>
            {variant} link
          </Link>
        ),
      )}
    </Stack>
  ),
};
