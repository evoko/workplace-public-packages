import type { Meta, StoryObj } from '@storybook/react-vite';
import { IconButton, Stack, Typography, Box } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SettingsIcon from '@mui/icons-material/Settings';
import CloseIcon from '@mui/icons-material/Close';
import MoreVertIcon from '@mui/icons-material/MoreVert';

const meta: Meta<typeof IconButton> = {
  title: 'Styles/IconButton',
  component: IconButton,
  argTypes: {
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
    },
    color: {
      control: 'select',
      options: ['default', 'primary', 'error'],
    },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof IconButton>;

export const Playground: Story = {
  args: {
    size: 'medium',
    children: <EditIcon />,
  },
};

export const AllSizes: Story = {
  render: () => (
    <Stack spacing={4}>
      {(['small', 'medium', 'large'] as const).map((size) => (
        <Box key={size}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Size: {size}
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <IconButton size={size}>
              <EditIcon />
            </IconButton>
            <IconButton size={size}>
              <DeleteIcon />
            </IconButton>
            <IconButton size={size}>
              <SettingsIcon />
            </IconButton>
            <IconButton size={size}>
              <CloseIcon />
            </IconButton>
            <IconButton size={size}>
              <MoreVertIcon />
            </IconButton>
            <IconButton size={size} disabled>
              <EditIcon />
            </IconButton>
          </Stack>
        </Box>
      ))}
    </Stack>
  ),
};

export const Colors: Story = {
  render: () => (
    <Stack spacing={4}>
      {(
        [
          { color: 'default', label: 'Default' },
          { color: 'primary', label: 'Primary' },
          { color: 'error', label: 'Error' },
        ] as const
      ).map(({ color, label }) => (
        <Box key={color}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {label}
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <IconButton color={color}>
              <EditIcon />
            </IconButton>
            <IconButton color={color}>
              <DeleteIcon />
            </IconButton>
            <IconButton color={color}>
              <SettingsIcon />
            </IconButton>
            <IconButton color={color} disabled>
              <EditIcon />
            </IconButton>
          </Stack>
        </Box>
      ))}
    </Stack>
  ),
};
