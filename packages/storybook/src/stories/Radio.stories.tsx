import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Stack,
  Typography,
} from '@mui/material';

const meta: Meta<typeof Radio> = {
  title: 'Styles/Radio',
  component: Radio,
  tags: ['autodocs'],
  argTypes: {
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof Radio>;

export const Playground: Story = {
  args: {
    checked: true,
    disabled: false,
  },
};

export const RadioGroupExample: Story = {
  render: () => (
    <Stack spacing={3}>
      <Typography variant="h3">Radio Group</Typography>
      <FormControl>
        <FormLabel>Select an option</FormLabel>
        <RadioGroup defaultValue="option1">
          <FormControlLabel
            value="option1"
            control={<Radio />}
            label="Option 1"
          />
          <FormControlLabel
            value="option2"
            control={<Radio />}
            label="Option 2"
          />
          <FormControlLabel
            value="option3"
            control={<Radio />}
            label="Option 3"
          />
          <FormControlLabel
            value="disabled"
            control={<Radio disabled />}
            label="Disabled option"
          />
        </RadioGroup>
      </FormControl>

      <Typography variant="h3" sx={{ pt: 2 }}>
        Horizontal Layout
      </Typography>
      <FormControl>
        <FormLabel>Pick a size</FormLabel>
        <RadioGroup defaultValue="medium" row>
          <FormControlLabel
            value="small"
            control={<Radio />}
            label="Small"
          />
          <FormControlLabel
            value="medium"
            control={<Radio />}
            label="Medium"
          />
          <FormControlLabel
            value="large"
            control={<Radio />}
            label="Large"
          />
        </RadioGroup>
      </FormControl>
    </Stack>
  ),
};

export const AllStates: Story = {
  render: () => (
    <Stack spacing={2}>
      <Typography variant="h3">Radio States</Typography>
      <Stack direction="row" spacing={2} alignItems="center">
        <FormControlLabel
          control={<Radio checked={false} />}
          label="Unchecked"
        />
        <FormControlLabel
          control={<Radio checked />}
          label="Checked"
        />
        <FormControlLabel
          control={<Radio disabled />}
          label="Disabled"
        />
        <FormControlLabel
          control={<Radio disabled checked />}
          label="Disabled checked"
        />
      </Stack>
    </Stack>
  ),
};
