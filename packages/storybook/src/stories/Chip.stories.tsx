import type { Meta, StoryObj } from '@storybook/react-vite';
import { Chip, Stack, Avatar } from '@mui/material';
import FaceIcon from '@mui/icons-material/Face';
import DoneIcon from '@mui/icons-material/Done';

const meta: Meta<typeof Chip> = {
  title: 'Styles/Chip',
  component: Chip,
  argTypes: {
    variant: { control: 'select', options: ['filled', 'outlined'] },
    size: { control: 'select', options: ['small', 'medium'] },
    color: {
      control: 'select',
      options: [
        'default',
        'primary',
        'secondary',
        'success',
        'error',
        'info',
        'warning',
      ],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Chip>;

export const Playground: Story = {
  args: { label: 'Chip' },
};

export const Variants: Story = {
  render: () => (
    <Stack direction="row" spacing={1}>
      <Chip label="Filled" />
      <Chip label="Outlined" variant="outlined" />
    </Stack>
  ),
};

export const Colors: Story = {
  render: () => (
    <Stack spacing={2}>
      <Stack direction="row" spacing={1}>
        {(
          [
            'default',
            'primary',
            'secondary',
            'success',
            'error',
            'info',
            'warning',
          ] as const
        ).map((color) => (
          <Chip key={color} label={color} color={color} />
        ))}
      </Stack>
      <Stack direction="row" spacing={1}>
        {(
          [
            'default',
            'primary',
            'secondary',
            'success',
            'error',
            'info',
            'warning',
          ] as const
        ).map((color) => (
          <Chip key={color} label={color} color={color} variant="outlined" />
        ))}
      </Stack>
    </Stack>
  ),
};

export const Sizes: Story = {
  render: () => (
    <Stack direction="row" spacing={1} alignItems="center">
      <Chip label="Small" size="small" />
      <Chip label="Medium" size="medium" />
    </Stack>
  ),
};

export const Clickable: Story = {
  render: () => (
    <Stack direction="row" spacing={1}>
      <Chip label="Clickable" onClick={() => {}} />
      <Chip label="Clickable" variant="outlined" onClick={() => {}} />
    </Stack>
  ),
};

export const Deletable: Story = {
  render: () => (
    <Stack direction="row" spacing={1}>
      <Chip label="Deletable" onDelete={() => {}} />
      <Chip label="Custom icon" onDelete={() => {}} deleteIcon={<DoneIcon />} />
    </Stack>
  ),
};

export const WithIcon: Story = {
  render: () => (
    <Stack direction="row" spacing={1}>
      <Chip icon={<FaceIcon />} label="With Icon" />
      <Chip icon={<FaceIcon />} label="With Icon" variant="outlined" />
    </Stack>
  ),
};

export const WithAvatar: Story = {
  render: () => (
    <Stack direction="row" spacing={1}>
      <Chip avatar={<Avatar>M</Avatar>} label="Avatar" />
      <Chip avatar={<Avatar>M</Avatar>} label="Avatar" variant="outlined" />
    </Stack>
  ),
};
