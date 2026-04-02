import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Stack,
} from '@mui/material';

const meta: Meta<typeof Radio> = {
  title: 'Styles/Radio',
  component: Radio,
};

export default meta;
type Story = StoryObj<typeof Radio>;

export const Playground: Story = {
  args: { defaultChecked: true },
};

export const BasicRadioGroup: Story = {
  render: () => (
    <FormControl>
      <FormLabel>Gender</FormLabel>
      <RadioGroup defaultValue="female">
        <FormControlLabel value="female" control={<Radio />} label="Female" />
        <FormControlLabel value="male" control={<Radio />} label="Male" />
        <FormControlLabel value="other" control={<Radio />} label="Other" />
      </RadioGroup>
    </FormControl>
  ),
};

export const RowDirection: Story = {
  render: () => (
    <FormControl>
      <FormLabel>Gender</FormLabel>
      <RadioGroup row defaultValue="female">
        <FormControlLabel value="female" control={<Radio />} label="Female" />
        <FormControlLabel value="male" control={<Radio />} label="Male" />
        <FormControlLabel value="other" control={<Radio />} label="Other" />
      </RadioGroup>
    </FormControl>
  ),
};

export const Colors: Story = {
  render: () => (
    <Stack direction="row">
      {(
        [
          'primary',
          'secondary',
          'success',
          'error',
          'info',
          'warning',
          'default',
        ] as const
      ).map((color) => (
        <Radio key={color} checked color={color} />
      ))}
    </Stack>
  ),
};

export const Sizes: Story = {
  render: () => (
    <Stack direction="row" alignItems="center">
      <Radio checked size="small" />
      <Radio checked size="medium" />
    </Stack>
  ),
};
