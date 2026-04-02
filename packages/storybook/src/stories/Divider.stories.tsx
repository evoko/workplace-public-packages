import type { Meta, StoryObj } from '@storybook/react-vite';
import { Divider, Stack, Typography, Box, Chip } from '@mui/material';

const meta: Meta<typeof Divider> = {
  title: 'Styles/Divider',
  component: Divider,
};

export default meta;
type Story = StoryObj<typeof Divider>;

export const Horizontal: Story = {
  render: () => (
    <Stack spacing={2} sx={{ width: 300 }}>
      <Typography>Item 1</Typography>
      <Divider />
      <Typography>Item 2</Typography>
      <Divider />
      <Typography>Item 3</Typography>
    </Stack>
  ),
};

export const Vertical: Story = {
  render: () => (
    <Stack
      direction="row"
      spacing={2}
      divider={<Divider orientation="vertical" flexItem />}
    >
      <Typography>Item 1</Typography>
      <Typography>Item 2</Typography>
      <Typography>Item 3</Typography>
    </Stack>
  ),
};

export const WithText: Story = {
  render: () => (
    <Stack spacing={2}>
      <Divider>CENTER</Divider>
      <Divider textAlign="left">LEFT</Divider>
      <Divider textAlign="right">RIGHT</Divider>
      <Divider>
        <Chip label="Chip" size="small" />
      </Divider>
    </Stack>
  ),
};

export const Variants: Story = {
  render: () => (
    <Box sx={{ width: 300 }}>
      <Stack spacing={2}>
        <Typography variant="caption">Full width</Typography>
        <Divider />
        <Typography variant="caption">Inset</Typography>
        <Divider variant="inset" />
        <Typography variant="caption">Middle</Typography>
        <Divider variant="middle" />
      </Stack>
    </Box>
  ),
};
