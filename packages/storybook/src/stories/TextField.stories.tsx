import type { Meta, StoryObj } from '@storybook/react-vite';
import { TextField, Stack, Typography, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';

const meta: Meta<typeof TextField> = {
  title: 'Styles/TextField',
  component: TextField,
  argTypes: {
    variant: { control: 'select', options: ['outlined', 'filled', 'standard'] },
    size: { control: 'select', options: ['small', 'medium'] },
  },
};

export default meta;
type Story = StoryObj<typeof TextField>;

export const Playground: Story = {
  args: {
    label: 'Label',
    variant: 'outlined',
  },
};

export const Variants: Story = {
  render: () => (
    <Stack direction="row" spacing={2}>
      <TextField label="Outlined" variant="outlined" />
      <TextField label="Filled" variant="filled" />
      <TextField label="Standard" variant="standard" />
    </Stack>
  ),
};

export const Sizes: Story = {
  render: () => (
    <Stack direction="row" spacing={2} alignItems="center">
      <TextField label="Small" size="small" />
      <TextField label="Medium" size="medium" />
    </Stack>
  ),
};

export const States: Story = {
  render: () => (
    <Stack spacing={2}>
      <Stack direction="row" spacing={2}>
        <TextField label="Default" />
        <TextField label="Disabled" disabled />
        <TextField
          label="Read Only"
          defaultValue="Read only"
          slotProps={{ input: { readOnly: true } }}
        />
      </Stack>
      <Stack direction="row" spacing={2}>
        <TextField label="Error" error />
        <TextField label="Error with helper" error helperText="Error message" />
        <TextField label="With helper text" helperText="Some helper text" />
      </Stack>
    </Stack>
  ),
};

export const Types: Story = {
  render: () => (
    <Stack spacing={2}>
      <Stack direction="row" spacing={2}>
        <TextField label="Text" type="text" />
        <TextField label="Password" type="password" defaultValue="password" />
        <TextField label="Number" type="number" />
      </Stack>
      <Stack direction="row" spacing={2}>
        <TextField label="Search" type="search" />
        <TextField label="Email" type="email" />
        <TextField label="URL" type="url" />
      </Stack>
    </Stack>
  ),
};

export const Multiline: Story = {
  render: () => (
    <Stack direction="row" spacing={2}>
      <TextField
        label="Multiline"
        multiline
        rows={4}
        defaultValue="Default value"
      />
      <TextField label="Min rows" multiline minRows={2} maxRows={6} />
    </Stack>
  ),
};

export const WithAdornments: Story = {
  render: () => (
    <Stack direction="row" spacing={2}>
      <TextField
        label="Search"
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
        slotProps={{
          input: {
            startAdornment: <InputAdornment position="start">$</InputAdornment>,
          },
        }}
      />
    </Stack>
  ),
};

export const FullWidth: Story = {
  render: () => <TextField label="Full Width" fullWidth />,
};
