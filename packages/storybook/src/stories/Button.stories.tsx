import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Button, Stack, Typography, Box } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

const meta: Meta<typeof Button> = {
  title: 'Styles/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['contained', 'outlined', 'overlay'],
    },
    color: {
      control: 'select',
      options: ['primary', 'error', 'secondary'],
    },
    size: {
      control: 'select',
      options: ['small', 'medium'],
    },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Playground: Story = {
  args: {
    children: 'Button',
    variant: 'contained',
    color: 'primary',
    size: 'medium',
    disabled: false,
  },
};

export const ContainedButtons: Story = {
  render: () => (
    <Stack spacing={3}>
      <Typography variant="h3">Contained Buttons</Typography>
      <Stack direction="row" spacing={2} alignItems="center">
        <Button variant="contained" color="primary">
          Primary
        </Button>
        <Button variant="contained" color="error">
          Error
        </Button>
        <Button variant="contained" color="primary" disabled>
          Disabled
        </Button>
      </Stack>
      <Typography variant="h3" sx={{ pt: 2 }}>
        Small Contained
      </Typography>
      <Stack direction="row" spacing={2} alignItems="center">
        <Button variant="contained" color="primary" size="small">
          Primary Small
        </Button>
        <Button variant="contained" color="error" size="small">
          Error Small
        </Button>
        <Button variant="contained" color="primary" size="small" disabled>
          Disabled Small
        </Button>
      </Stack>
    </Stack>
  ),
};

export const OutlinedButtons: Story = {
  render: () => (
    <Stack spacing={3}>
      <Typography variant="h3">Outlined Buttons</Typography>
      <Stack direction="row" spacing={2} alignItems="center">
        <Button variant="outlined" color="primary">
          Primary
        </Button>
        <Button variant="outlined" color="error">
          Error
        </Button>
        <Button variant="outlined" color="primary" disabled>
          Disabled
        </Button>
      </Stack>
      <Typography variant="h3" sx={{ pt: 2 }}>
        Small Outlined
      </Typography>
      <Stack direction="row" spacing={2} alignItems="center">
        <Button variant="outlined" color="primary" size="small">
          Primary Small
        </Button>
        <Button variant="outlined" color="error" size="small">
          Error Small
        </Button>
        <Button variant="outlined" color="primary" size="small" disabled>
          Disabled Small
        </Button>
      </Stack>
    </Stack>
  ),
};

export const OverlayButtons: Story = {
  render: () => (
    <Stack spacing={3}>
      <Typography variant="h3">Overlay Buttons</Typography>
      <Box sx={{ width: 400 }}>
        <Stack spacing={0}>
          <Button variant="overlay" color="primary" fullWidth>
            Primary Overlay
          </Button>
          <Button variant="overlay" color="error" fullWidth>
            Error Overlay
          </Button>
          <Button variant="overlay" color="secondary" fullWidth>
            Secondary Overlay
          </Button>
          <Button variant="overlay" color="primary" fullWidth disabled>
            Disabled Overlay
          </Button>
        </Stack>
      </Box>
    </Stack>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <Stack spacing={3}>
      <Typography variant="h3">Buttons with Icons</Typography>
      <Stack direction="row" spacing={2} alignItems="center">
        <Button variant="contained" color="primary" startIcon={<AddIcon />}>
          Add Item
        </Button>
        <Button variant="contained" color="error" startIcon={<DeleteIcon />}>
          Delete
        </Button>
        <Button variant="outlined" color="primary" endIcon={<AddIcon />}>
          Add Item
        </Button>
      </Stack>
      <Typography variant="h3" sx={{ pt: 2 }}>
        Small with Icons
      </Typography>
      <Stack direction="row" spacing={2} alignItems="center">
        <Button
          variant="contained"
          color="primary"
          size="small"
          startIcon={<AddIcon />}
        >
          Add
        </Button>
        <Button
          variant="outlined"
          color="primary"
          size="small"
          endIcon={<AddIcon />}
        >
          Add
        </Button>
      </Stack>
    </Stack>
  ),
};

export const AllVariantsAndColors: Story = {
  render: () => {
    const variants = ['contained', 'outlined'] as const;
    const colors = ['primary', 'error'] as const;
    const sizes = ['medium', 'small'] as const;

    return (
      <Stack spacing={4}>
        {sizes.map((size) => (
          <Box key={size}>
            <Typography variant="h3" sx={{ mb: 2 }}>
              Size: {size}
            </Typography>
            <Stack spacing={2}>
              {variants.map((variant) => (
                <Stack
                  key={variant}
                  direction="row"
                  spacing={2}
                  alignItems="center"
                >
                  <Typography
                    variant="caption"
                    sx={{ width: 80, flexShrink: 0 }}
                  >
                    {variant}
                  </Typography>
                  {colors.map((color) => (
                    <React.Fragment key={color}>
                      <Button variant={variant} color={color} size={size}>
                        {color}
                      </Button>
                      <Button
                        variant={variant}
                        color={color}
                        size={size}
                        disabled
                      >
                        {color} disabled
                      </Button>
                    </React.Fragment>
                  ))}
                </Stack>
              ))}
            </Stack>
          </Box>
        ))}
      </Stack>
    );
  },
};
