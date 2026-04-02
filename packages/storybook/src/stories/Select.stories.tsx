import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  FormHelperText,
} from '@mui/material';

const meta: Meta<typeof Select> = {
  title: 'Styles/Select',
  component: Select,
};

export default meta;
type Story = StoryObj<typeof Select>;

export const BasicSelect: Story = {
  render: () => (
    <Stack spacing={3} sx={{ minWidth: 200 }}>
      <FormControl fullWidth>
        <InputLabel>Age</InputLabel>
        <Select label="Age" defaultValue={10}>
          <MenuItem value={10}>Ten</MenuItem>
          <MenuItem value={20}>Twenty</MenuItem>
          <MenuItem value={30}>Thirty</MenuItem>
        </Select>
      </FormControl>
    </Stack>
  ),
};

export const Variants: Story = {
  render: () => (
    <Stack direction="row" spacing={2}>
      {(['outlined', 'filled', 'standard'] as const).map((variant) => (
        <FormControl key={variant} sx={{ minWidth: 140 }} variant={variant}>
          <InputLabel>{variant}</InputLabel>
          <Select label={variant} defaultValue={10}>
            <MenuItem value={10}>Ten</MenuItem>
            <MenuItem value={20}>Twenty</MenuItem>
            <MenuItem value={30}>Thirty</MenuItem>
          </Select>
        </FormControl>
      ))}
    </Stack>
  ),
};

export const WithHelperText: Story = {
  render: () => (
    <Stack direction="row" spacing={2}>
      <FormControl sx={{ minWidth: 140 }}>
        <InputLabel>Age</InputLabel>
        <Select label="Age" defaultValue="">
          <MenuItem value="">
            <em>None</em>
          </MenuItem>
          <MenuItem value={10}>Ten</MenuItem>
          <MenuItem value={20}>Twenty</MenuItem>
        </Select>
        <FormHelperText>Some helper text</FormHelperText>
      </FormControl>
      <FormControl sx={{ minWidth: 140 }} error>
        <InputLabel>Error</InputLabel>
        <Select label="Error" defaultValue="">
          <MenuItem value="">
            <em>None</em>
          </MenuItem>
          <MenuItem value={10}>Ten</MenuItem>
        </Select>
        <FormHelperText>Error message</FormHelperText>
      </FormControl>
    </Stack>
  ),
};

export const Sizes: Story = {
  render: () => (
    <Stack direction="row" spacing={2}>
      <FormControl size="small" sx={{ minWidth: 140 }}>
        <InputLabel>Small</InputLabel>
        <Select label="Small" defaultValue={10}>
          <MenuItem value={10}>Ten</MenuItem>
          <MenuItem value={20}>Twenty</MenuItem>
        </Select>
      </FormControl>
      <FormControl sx={{ minWidth: 140 }}>
        <InputLabel>Medium</InputLabel>
        <Select label="Medium" defaultValue={10}>
          <MenuItem value={10}>Ten</MenuItem>
          <MenuItem value={20}>Twenty</MenuItem>
        </Select>
      </FormControl>
    </Stack>
  ),
};

export const MultipleSelect: Story = {
  render: () => (
    <FormControl sx={{ minWidth: 200 }}>
      <InputLabel>Names</InputLabel>
      <Select label="Names" multiple defaultValue={['Alice', 'Bob']}>
        <MenuItem value="Alice">Alice</MenuItem>
        <MenuItem value="Bob">Bob</MenuItem>
        <MenuItem value="Charlie">Charlie</MenuItem>
        <MenuItem value="Diana">Diana</MenuItem>
      </Select>
    </FormControl>
  ),
};
