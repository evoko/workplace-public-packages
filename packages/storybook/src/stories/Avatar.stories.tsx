import type { Meta, StoryObj } from '@storybook/react-vite';
import { Avatar, AvatarGroup, Stack } from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import AssignmentIcon from '@mui/icons-material/Assignment';

const meta: Meta<typeof Avatar> = {
  title: 'Styles/Avatar',
  component: Avatar,
};

export default meta;
type Story = StoryObj<typeof Avatar>;

export const Playground: Story = {
  args: { children: 'AB' },
};

export const Letters: Story = {
  render: () => (
    <Stack direction="row" spacing={2}>
      <Avatar>H</Avatar>
      <Avatar sx={{ bgcolor: 'orange' }}>N</Avatar>
      <Avatar sx={{ bgcolor: 'purple' }}>OP</Avatar>
    </Stack>
  ),
};

export const Sizes: Story = {
  render: () => (
    <Stack direction="row" spacing={2} alignItems="center">
      <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>S</Avatar>
      <Avatar>M</Avatar>
      <Avatar sx={{ width: 56, height: 56 }}>L</Avatar>
    </Stack>
  ),
};

export const Icons: Story = {
  render: () => (
    <Stack direction="row" spacing={2}>
      <Avatar>
        <FolderIcon />
      </Avatar>
      <Avatar sx={{ bgcolor: 'green' }}>
        <AssignmentIcon />
      </Avatar>
    </Stack>
  ),
};

export const Grouped: Story = {
  render: () => (
    <AvatarGroup max={4}>
      <Avatar>A</Avatar>
      <Avatar>B</Avatar>
      <Avatar>C</Avatar>
      <Avatar>D</Avatar>
      <Avatar>E</Avatar>
    </AvatarGroup>
  ),
};

export const Variants: Story = {
  render: () => (
    <Stack direction="row" spacing={2}>
      <Avatar variant="circular">A</Avatar>
      <Avatar variant="rounded">B</Avatar>
      <Avatar variant="square">C</Avatar>
    </Stack>
  ),
};
