import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { IconButton, Stack, Typography, Box } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SettingsIcon from '@mui/icons-material/Settings';
import CloseIcon from '@mui/icons-material/Close';
import MoreVertIcon from '@mui/icons-material/MoreVert';

const meta: Meta<typeof IconButton> = {
  title: 'Styles/IconButton',
  component: IconButton,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['none', 'transparent', 'outlined'],
    },
    size: {
      control: 'select',
      options: ['small', 'medium'],
    },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof IconButton>;

export const Playground: Story = {
  args: {
    variant: 'transparent',
    size: 'small',
    children: <EditIcon />,
  },
};

export const AllVariants: Story = {
  render: () => (
    <Stack spacing={4}>
      {(['none', 'transparent', 'outlined'] as const).map((variant) => (
        <Box key={variant}>
          <Typography variant="h3" sx={{ mb: 2 }}>
            Variant: {variant}
          </Typography>
          <Stack spacing={2}>
            {(['small', 'medium'] as const).map((size) => (
              <Stack
                key={size}
                direction="row"
                spacing={2}
                alignItems="center"
              >
                <Typography
                  variant="caption"
                  sx={{ width: 60, flexShrink: 0 }}
                >
                  {size}
                </Typography>
                <IconButton variant={variant} size={size}>
                  <EditIcon />
                </IconButton>
                <IconButton variant={variant} size={size}>
                  <DeleteIcon />
                </IconButton>
                <IconButton variant={variant} size={size}>
                  <SettingsIcon />
                </IconButton>
                <IconButton variant={variant} size={size}>
                  <CloseIcon />
                </IconButton>
                <IconButton variant={variant} size={size}>
                  <MoreVertIcon />
                </IconButton>
                <IconButton variant={variant} size={size} disabled>
                  <EditIcon />
                </IconButton>
              </Stack>
            ))}
          </Stack>
        </Box>
      ))}
    </Stack>
  ),
};
