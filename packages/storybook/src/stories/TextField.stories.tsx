import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  TextField,
  Stack,
  Typography,
  InputAdornment,
  Box,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { SearchIcon } from '@bwp-web/components';

const meta: Meta<typeof TextField> = {
  title: 'Styles/TextField',
  component: TextField,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['outlined'],
    },
    disabled: { control: 'boolean' },
    error: { control: 'boolean' },
    multiline: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof TextField>;

export const Playground: Story = {
  args: {
    label: 'Label',
    placeholder: 'Enter text...',
    helperText: 'Helper text',
    disabled: false,
    error: false,
  },
};

export const AllStates: Story = {
  render: () => (
    <Stack spacing={4} sx={{ maxWidth: 400 }}>
      <Typography variant="h3">TextField States</Typography>

      <TextField label="Default" placeholder="Enter text..." />

      <TextField
        label="With value"
        defaultValue="Hello World"
      />

      <TextField
        label="With helper text"
        placeholder="Enter text..."
        helperText="This is helper text"
      />

      <TextField
        label="Error state"
        defaultValue="Invalid input"
        error
        helperText="This field is required"
      />

      <TextField
        label="Disabled"
        defaultValue="Cannot edit"
        disabled
      />

      <TextField
        label="Required"
        placeholder="Required field"
        required
      />
    </Stack>
  ),
};

export const WithAdornments: Story = {
  render: () => (
    <Stack spacing={4} sx={{ maxWidth: 400 }}>
      <Typography variant="h3">Input Adornments</Typography>

      <TextField
        label="Search"
        placeholder="Search..."
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          },
        }}
      />

      <TextField
        label="Password"
        type="password"
        placeholder="Enter password"
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <VisibilityIcon />
              </InputAdornment>
            ),
          },
        }}
      />

      <TextField
        label="Amount"
        placeholder="0.00"
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">$</InputAdornment>
            ),
          },
        }}
      />
    </Stack>
  ),
};

export const Multiline: Story = {
  render: () => (
    <Stack spacing={4} sx={{ maxWidth: 400 }}>
      <Typography variant="h3">Multiline TextField</Typography>

      <TextField
        label="Description"
        placeholder="Enter a description..."
        multiline
        rows={4}
      />

      <TextField
        label="Auto-resize"
        placeholder="Start typing..."
        multiline
        minRows={2}
        maxRows={6}
      />

      <TextField
        label="Disabled multiline"
        defaultValue="This is a disabled multiline field with some content."
        multiline
        rows={3}
        disabled
      />

      <TextField
        label="Error multiline"
        defaultValue="This has an error."
        multiline
        rows={3}
        error
        helperText="Please fix the input"
      />
    </Stack>
  ),
};

export const Sizes: Story = {
  render: () => (
    <Stack spacing={4} sx={{ maxWidth: 600 }}>
      <Typography variant="h3">Side by Side</Typography>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <TextField label="First Name" placeholder="John" sx={{ flex: 1 }} />
        <TextField label="Last Name" placeholder="Doe" sx={{ flex: 1 }} />
      </Box>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <TextField
          label="Email"
          placeholder="john@example.com"
          type="email"
          sx={{ flex: 2 }}
        />
        <TextField
          label="Phone"
          placeholder="+1 555 0123"
          sx={{ flex: 1 }}
        />
      </Box>
    </Stack>
  ),
};
