import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  Switch,
  FormControlLabel,
  FormGroup,
  Stack,
  Typography,
} from '@mui/material';

const meta: Meta<typeof Switch> = {
  title: 'Styles/Switch',
  component: Switch,
  tags: ['autodocs'],
  argTypes: {
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof Switch>;

export const Playground: Story = {
  args: {
    checked: false,
    disabled: false,
  },
};

export const AllStates: Story = {
  render: () => (
    <Stack spacing={3}>
      <Typography variant="h3">Switch States</Typography>

      <FormGroup>
        <FormControlLabel
          control={<Switch defaultChecked={false} />}
          label="Off"
        />
        <FormControlLabel control={<Switch defaultChecked />} label="On" />
        <FormControlLabel control={<Switch disabled />} label="Disabled off" />
        <FormControlLabel
          control={<Switch disabled checked />}
          label="Disabled on"
        />
      </FormGroup>

      <Typography variant="h3" sx={{ pt: 2 }}>
        Label Placement
      </Typography>
      <FormGroup>
        <FormControlLabel
          control={<Switch defaultChecked />}
          label="End (default)"
          labelPlacement="end"
        />
        <FormControlLabel
          control={<Switch defaultChecked />}
          label="Start"
          labelPlacement="start"
        />
      </FormGroup>
    </Stack>
  ),
};
