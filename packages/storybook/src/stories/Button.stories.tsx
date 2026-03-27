import { Fragment } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button, Stack, Typography, Box } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

const meta: Meta<typeof Button> = {
  title: 'Styles/Button',
  component: Button,
  argTypes: {
    variant: {
      control: 'select',
      options: ['contained', 'outlined', 'text'],
    },
    color: {
      control: 'select',
      options: ['primary', 'error', 'secondary'],
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
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
      <Typography variant="h6">Contained Buttons</Typography>
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
      <Typography variant="h6" sx={{ pt: 2 }}>
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
      <Typography variant="h6" sx={{ pt: 2 }}>
        Large Contained
      </Typography>
      <Stack direction="row" spacing={2} alignItems="center">
        <Button variant="contained" color="primary" size="large">
          Primary Large
        </Button>
        <Button variant="contained" color="error" size="large">
          Error Large
        </Button>
        <Button variant="contained" color="primary" size="large" disabled>
          Disabled Large
        </Button>
      </Stack>
    </Stack>
  ),
};

export const OutlinedButtons: Story = {
  render: () => (
    <Stack spacing={3}>
      <Typography variant="h6">Outlined Buttons</Typography>
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
      <Typography variant="h6" sx={{ pt: 2 }}>
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

export const TextButtons: Story = {
  render: () => (
    <Stack spacing={3}>
      <Typography variant="h6">Text Buttons</Typography>
      <Stack direction="row" spacing={2} alignItems="center">
        <Button variant="text" color="primary">
          Primary
        </Button>
        <Button variant="text" color="error">
          Error
        </Button>
        <Button variant="text" color="primary" disabled>
          Disabled
        </Button>
      </Stack>
    </Stack>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <Stack spacing={4}>
      <Typography variant="h6">Contained with Icon</Typography>
      <Stack spacing={2}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Button variant="contained" color="primary" startIcon={<AddIcon />}>
            Primary
          </Button>
          <Button variant="contained" color="error" startIcon={<AddIcon />}>
            Error
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            disabled
          >
            Disabled
          </Button>
        </Stack>
        <Stack direction="row" spacing={2} alignItems="center">
          <Button variant="contained" color="primary" endIcon={<AddIcon />}>
            Primary
          </Button>
          <Button variant="contained" color="error" endIcon={<AddIcon />}>
            Error
          </Button>
          <Button
            variant="contained"
            color="primary"
            endIcon={<AddIcon />}
            disabled
          >
            Disabled
          </Button>
        </Stack>
      </Stack>

      <Typography variant="h6">Outlined with Icon</Typography>
      <Stack spacing={2}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Button variant="outlined" color="primary" startIcon={<AddIcon />}>
            Primary
          </Button>
          <Button variant="outlined" color="error" startIcon={<AddIcon />}>
            Error
          </Button>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<AddIcon />}
            disabled
          >
            Disabled
          </Button>
        </Stack>
        <Stack direction="row" spacing={2} alignItems="center">
          <Button variant="outlined" color="primary" endIcon={<AddIcon />}>
            Primary
          </Button>
          <Button variant="outlined" color="error" endIcon={<AddIcon />}>
            Error
          </Button>
          <Button
            variant="outlined"
            color="primary"
            endIcon={<AddIcon />}
            disabled
          >
            Disabled
          </Button>
        </Stack>
      </Stack>
    </Stack>
  ),
};

export const AllVariantsAndColors: Story = {
  render: () => {
    const variants = ['contained', 'outlined', 'text'] as const;
    const colors = ['primary', 'error'] as const;
    const sizes = ['small', 'medium', 'large'] as const;

    return (
      <Stack spacing={4}>
        {sizes.map((size) => (
          <Box key={size}>
            <Typography variant="h6" sx={{ mb: 2 }}>
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
                    <Fragment key={color}>
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
                    </Fragment>
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
