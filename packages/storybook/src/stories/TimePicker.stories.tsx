import type { Meta, StoryObj } from '@storybook/react';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { Stack, Typography } from '@mui/material';
import { DateTime } from 'luxon';

const meta: Meta<typeof TimePicker> = {
  title: 'Styles/TimePicker',
  component: TimePicker,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <LocalizationProvider dateAdapter={AdapterLuxon}>
        <Story />
      </LocalizationProvider>
    ),
  ],
  argTypes: {
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof TimePicker>;

export const AllStates: Story = {
  render: () => (
    <Stack spacing={4} sx={{ maxWidth: 115 }}>
      <Typography variant="h3">TimePicker States</Typography>
      <TimePicker
        label="Default"
        defaultValue={DateTime.now().startOf('day')}
      />
      <TimePicker
        label="With value"
        defaultValue={DateTime.now().startOf('day')}
      />
      <TimePicker
        label="Disabled"
        defaultValue={DateTime.now().startOf('day')}
        disabled
      />
      <TimePicker
        label="Read only"
        defaultValue={DateTime.now().startOf('day')}
        readOnly
      />
    </Stack>
  ),
};
