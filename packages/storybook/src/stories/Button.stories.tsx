import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button, Stack, Typography, ButtonGroup } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SendIcon from '@mui/icons-material/Send';

const meta: Meta<typeof Button> = {
  title: 'Styles/Button',
  component: Button,
  argTypes: {
    variant: { control: 'select', options: ['text', 'contained', 'outlined'] },
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'success', 'error', 'info', 'warning'],
    },
    size: { control: 'select', options: ['small', 'medium', 'large'] },
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
  },
};

export const Variants: Story = {
  render: () => (
    <Stack spacing={3}>
      <Typography variant="h6">Text</Typography>
      <Stack direction="row" spacing={2}>
        <Button variant="text">Primary</Button>
        <Button variant="text" color="secondary">
          Secondary
        </Button>
        <Button variant="text" disabled>
          Disabled
        </Button>
      </Stack>

      <Typography variant="h6">Contained</Typography>
      <Stack direction="row" spacing={2}>
        <Button variant="contained">Primary</Button>
        <Button variant="contained" color="secondary">
          Secondary
        </Button>
        <Button variant="contained" disabled>
          Disabled
        </Button>
      </Stack>

      <Typography variant="h6">Outlined</Typography>
      <Stack direction="row" spacing={2}>
        <Button variant="outlined">Primary</Button>
        <Button variant="outlined" color="secondary">
          Secondary
        </Button>
        <Button variant="outlined" disabled>
          Disabled
        </Button>
      </Stack>
    </Stack>
  ),
};

export const Colors: Story = {
  render: () => (
    <Stack spacing={2}>
      {(
        ['primary', 'secondary', 'success', 'error', 'info', 'warning'] as const
      ).map((color) => (
        <Stack key={color} direction="row" spacing={2} alignItems="center">
          <Typography variant="caption" sx={{ width: 80 }}>
            {color}
          </Typography>
          <Button variant="text" color={color}>
            Text
          </Button>
          <Button variant="contained" color={color}>
            Contained
          </Button>
          <Button variant="outlined" color={color}>
            Outlined
          </Button>
        </Stack>
      ))}
    </Stack>
  ),
};

export const Sizes: Story = {
  render: () => (
    <Stack spacing={2}>
      {(['small', 'medium', 'large'] as const).map((size) => (
        <Stack key={size} direction="row" spacing={2} alignItems="center">
          <Typography variant="caption" sx={{ width: 80 }}>
            {size}
          </Typography>
          <Button variant="text" size={size}>
            Text
          </Button>
          <Button variant="contained" size={size}>
            Contained
          </Button>
          <Button variant="outlined" size={size}>
            Outlined
          </Button>
        </Stack>
      ))}
    </Stack>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <Stack spacing={2}>
      <Stack direction="row" spacing={2}>
        <Button variant="contained" startIcon={<AddIcon />}>
          Add
        </Button>
        <Button variant="contained" endIcon={<SendIcon />}>
          Send
        </Button>
        <Button variant="outlined" startIcon={<DeleteIcon />} color="error">
          Delete
        </Button>
      </Stack>
    </Stack>
  ),
};

export const ButtonGroups: Story = {
  render: () => (
    <Stack spacing={3}>
      <Typography variant="h6">Contained</Typography>
      <ButtonGroup variant="contained">
        <Button>One</Button>
        <Button>Two</Button>
        <Button>Three</Button>
      </ButtonGroup>

      <Typography variant="h6">Outlined</Typography>
      <ButtonGroup variant="outlined">
        <Button>One</Button>
        <Button>Two</Button>
        <Button>Three</Button>
      </ButtonGroup>

      <Typography variant="h6">Text</Typography>
      <ButtonGroup variant="text">
        <Button>One</Button>
        <Button>Two</Button>
        <Button>Three</Button>
      </ButtonGroup>

      <Typography variant="h6">Vertical</Typography>
      <ButtonGroup orientation="vertical" variant="contained">
        <Button>One</Button>
        <Button>Two</Button>
        <Button>Three</Button>
      </ButtonGroup>
    </Stack>
  ),
};
