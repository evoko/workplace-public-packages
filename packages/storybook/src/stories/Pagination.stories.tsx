import type { Meta, StoryObj } from '@storybook/react-vite';
import { Pagination, Stack, Typography } from '@mui/material';

const meta: Meta<typeof Pagination> = {
  title: 'Styles/Pagination',
  component: Pagination,
};

export default meta;
type Story = StoryObj<typeof Pagination>;

export const Playground: Story = {
  args: { count: 10 },
};

export const Variants: Story = {
  render: () => (
    <Stack spacing={2}>
      <Typography variant="caption">Text (default)</Typography>
      <Pagination count={10} />
      <Typography variant="caption">Outlined</Typography>
      <Pagination count={10} variant="outlined" />
    </Stack>
  ),
};

export const Colors: Story = {
  render: () => (
    <Stack spacing={2}>
      <Pagination count={10} color="primary" />
      <Pagination count={10} color="secondary" />
    </Stack>
  ),
};

export const Sizes: Story = {
  render: () => (
    <Stack spacing={2}>
      <Pagination count={10} size="small" />
      <Pagination count={10} size="medium" />
      <Pagination count={10} size="large" />
    </Stack>
  ),
};

export const Shapes: Story = {
  render: () => (
    <Stack spacing={2}>
      <Pagination count={10} shape="circular" />
      <Pagination count={10} shape="rounded" />
    </Stack>
  ),
};

export const Disabled: Story = {
  render: () => <Pagination count={10} disabled />,
};
