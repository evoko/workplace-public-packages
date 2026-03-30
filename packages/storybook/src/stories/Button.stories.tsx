import { Fragment } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button, Stack, Typography, Box } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

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
      options: ['primary', 'error'],
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

/**
 * Maps SOLAR priority → MUI variant:
 * - **Primary** → `contained` (filled background, white text)
 * - **Secondary** → `outlined` (border, transparent background)
 * - **Tertiary** → `text` (no border, no background)
 *
 * Each priority supports a **danger** mode via `color="error"`.
 */
export const AllPriorities: Story = {
  name: 'All Priorities',
  render: () => {
    const priorities = [
      { label: 'Primary', variant: 'contained' as const },
      { label: 'Secondary', variant: 'outlined' as const },
      { label: 'Tertiary', variant: 'text' as const },
    ];

    return (
      <Stack spacing={4}>
        {priorities.map(({ label, variant }) => (
          <Box key={label}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              {label}
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <Button variant={variant} color="primary">
                Default
              </Button>
              <Button variant={variant} color="error">
                Danger
              </Button>
              <Button variant={variant} color="primary" disabled>
                Disabled
              </Button>
              <Button variant={variant} color="error" disabled>
                Danger Disabled
              </Button>
            </Stack>
          </Box>
        ))}
      </Stack>
    );
  },
};

/**
 * Three sizes: **sm** (36px), **md** (44px), **lg** (48px).
 *
 * - `sm` — Dense contexts: tables, toolbars. Pad to 4px/6px areas in code.
 * - `md` — Default. Forms, dialogs, page actions.
 * - `lg` — Reserved for future differentiation.
 */
export const Sizes: Story = {
  render: () => {
    const sizes = [
      { label: 'Small (sm)', size: 'small' as const },
      { label: 'Medium (md)', size: 'medium' as const },
      { label: 'Large (lg)', size: 'large' as const },
    ];

    return (
      <Stack spacing={4}>
        {sizes.map(({ label, size }) => (
          <Box key={label}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              {label}
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <Button variant="contained" size={size}>
                Primary
              </Button>
              <Button variant="outlined" size={size}>
                Secondary
              </Button>
              <Button variant="text" size={size}>
                Tertiary
              </Button>
            </Stack>
          </Box>
        ))}
      </Stack>
    );
  },
};

/**
 * Danger mode for destructive, irreversible actions — delete, remove, revoke.
 * Works with any priority. Never use for Cancel or Close.
 */
export const DangerButtons: Story = {
  name: 'Danger',
  render: () => (
    <Stack spacing={3}>
      <Typography variant="h6">Danger variants</Typography>
      <Stack direction="row" spacing={2} alignItems="center">
        <Button variant="contained" color="error" startIcon={<DeleteIcon />}>
          Delete project
        </Button>
        <Button variant="outlined" color="error" startIcon={<DeleteIcon />}>
          Remove access
        </Button>
        <Button variant="text" color="error">
          Revoke
        </Button>
      </Stack>
      <Stack direction="row" spacing={2} alignItems="center">
        <Button variant="contained" color="error" disabled>
          Delete project
        </Button>
        <Button variant="outlined" color="error" disabled>
          Remove access
        </Button>
        <Button variant="text" color="error" disabled>
          Revoke
        </Button>
      </Stack>
    </Stack>
  ),
};

/**
 * Leading icon → reinforces action (trash = Delete).
 * Trailing icon → indicates direction (arrow = Continue).
 * Icon is always label-paired.
 */
export const WithIcons: Story = {
  name: 'Labels & Icons',
  render: () => (
    <Stack spacing={4}>
      <Box>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Leading icon
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <Button variant="contained" startIcon={<AddIcon />}>
            Add item
          </Button>
          <Button variant="outlined" startIcon={<AddIcon />}>
            Add item
          </Button>
          <Button variant="text" startIcon={<AddIcon />}>
            Add item
          </Button>
        </Stack>
      </Box>

      <Box>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Trailing icon
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <Button variant="contained" endIcon={<AddIcon />}>
            Continue
          </Button>
          <Button variant="outlined" endIcon={<AddIcon />}>
            Continue
          </Button>
          <Button variant="text" endIcon={<AddIcon />}>
            Continue
          </Button>
        </Stack>
      </Box>

      <Box>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Danger with icon
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <Button variant="contained" color="error" startIcon={<DeleteIcon />}>
            Delete
          </Button>
          <Button variant="outlined" color="error" startIcon={<DeleteIcon />}>
            Remove
          </Button>
          <Button variant="text" color="error" startIcon={<DeleteIcon />}>
            Revoke
          </Button>
        </Stack>
      </Box>
    </Stack>
  ),
};

/**
 * Full matrix: every variant × color × size × disabled state.
 */
export const FullMatrix: Story = {
  name: 'Full Matrix',
  render: () => {
    const variants = ['contained', 'outlined', 'text'] as const;
    const colors = ['primary', 'error'] as const;
    const sizes = ['small', 'medium', 'large'] as const;

    return (
      <Stack spacing={5}>
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
