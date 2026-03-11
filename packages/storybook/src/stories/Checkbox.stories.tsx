import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  Checkbox,
  FormControlLabel,
  FormGroup,
  Stack,
  Typography,
} from '@mui/material';

const meta: Meta<typeof Checkbox> = {
  title: 'Styles/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
  argTypes: {
    checked: { control: 'boolean' },
    indeterminate: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Playground: Story = {
  args: {
    checked: false,
    indeterminate: false,
    disabled: false,
  },
};

export const AllStates: Story = {
  render: () => (
    <Stack spacing={3}>
      <Typography variant="h3">Checkbox States</Typography>

      <FormGroup>
        <FormControlLabel
          control={<Checkbox defaultChecked={false} />}
          label="Unchecked"
        />
        <FormControlLabel
          control={<Checkbox defaultChecked />}
          label="Checked"
        />
        <FormControlLabel
          control={<Checkbox indeterminate />}
          label="Indeterminate"
        />
        <FormControlLabel
          control={<Checkbox disabled />}
          label="Disabled unchecked"
        />
        <FormControlLabel
          control={<Checkbox disabled checked />}
          label="Disabled checked"
        />
        <FormControlLabel
          control={<Checkbox disabled indeterminate />}
          label="Disabled indeterminate"
        />
      </FormGroup>

      <Typography variant="h3" sx={{ pt: 2 }}>
        Label Placement
      </Typography>
      <FormGroup row>
        <FormControlLabel
          control={<Checkbox defaultChecked />}
          label="End (default)"
          labelPlacement="end"
        />
        <FormControlLabel
          control={<Checkbox defaultChecked />}
          label="Start"
          labelPlacement="start"
        />
        <FormControlLabel
          control={<Checkbox defaultChecked />}
          label="Top"
          labelPlacement="top"
        />
        <FormControlLabel
          control={<Checkbox defaultChecked />}
          label="Bottom"
          labelPlacement="bottom"
        />
      </FormGroup>
    </Stack>
  ),
};
