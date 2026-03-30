import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  Typography,
  FormHelperText,
  Box,
} from '@mui/material';

const meta: Meta<typeof Select> = {
  title: 'Styles/Select',
  component: Select,
};

export default meta;
type Story = StoryObj<typeof Select>;

function SelectDemo() {
  const [value, setValue] = useState('');
  return (
    <FormControl sx={{ minWidth: 200 }}>
      <InputLabel>Option</InputLabel>
      <Select
        value={value}
        label="Option"
        onChange={(e) => setValue(e.target.value as string)}
      >
        <MenuItem value="alpha">Alpha</MenuItem>
        <MenuItem value="beta">Beta</MenuItem>
        <MenuItem value="gamma">Gamma</MenuItem>
        <MenuItem value="delta">Delta</MenuItem>
      </Select>
    </FormControl>
  );
}

export const Default: Story = {
  render: () => <SelectDemo />,
};

export const States: Story = {
  render: () => (
    <Stack spacing={3}>
      <Typography variant="h6">Select states</Typography>
      <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
        <FormControl sx={{ minWidth: 180 }}>
          <InputLabel>Default</InputLabel>
          <Select label="Default" defaultValue="">
            <MenuItem value="one">Option one</MenuItem>
            <MenuItem value="two">Option two</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 180 }} disabled>
          <InputLabel>Disabled</InputLabel>
          <Select label="Disabled" defaultValue="">
            <MenuItem value="one">Option one</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 180 }} error>
          <InputLabel>Error</InputLabel>
          <Select label="Error" defaultValue="">
            <MenuItem value="one">Option one</MenuItem>
          </Select>
          <FormHelperText>Required field</FormHelperText>
        </FormControl>

        <FormControl sx={{ minWidth: 180 }}>
          <InputLabel>With value</InputLabel>
          <Select label="With value" defaultValue="one">
            <MenuItem value="one">Option one</MenuItem>
            <MenuItem value="two">Option two</MenuItem>
          </Select>
          <FormHelperText>Helper text</FormHelperText>
        </FormControl>
      </Stack>
    </Stack>
  ),
};
