import type { Meta, StoryObj } from '@storybook/react-vite';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';

import { Stack, Typography } from '@mui/material';
import { DateTime } from 'luxon';
import type { DateValidationError } from '@mui/x-date-pickers/models';

const meta: Meta<typeof DatePicker> = {
  title: 'Styles/DatePicker',
  component: DatePicker,
  decorators: [
    (Story) => (
      <LocalizationProvider dateAdapter={AdapterLuxon} adapterLocale="en-gb">
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
type Story = StoryObj<typeof DatePicker>;

export const Playground: Story = {
  args: {
    label: 'Date',
    disabled: false,
    readOnly: false,
  },
};

const errorMessages: Record<NonNullable<DateValidationError>, string> = {
  invalidDate: 'Invalid date format.',
  minDate: 'Date is before the minimum allowed date.',
  maxDate: 'Date is after the maximum allowed date.',
  disablePast: 'Past dates are not allowed.',
  disableFuture: 'Future dates are not allowed.',
  shouldDisableDate: 'This date is not available.',
  shouldDisableMonth: 'This month is not available.',
  shouldDisableYear: 'This year is not available.',
};

export const AllStates: Story = {
  render: () => (
    <Stack spacing={2} sx={{ maxWidth: 400 }}>
      <Typography variant="h3">DatePicker States</Typography>
      <DatePicker label="Default" />
      <DatePicker label="With value" defaultValue={DateTime.now()} />
      <DatePicker label="Disabled" disabled />
      <DatePicker label="Read only" readOnly />
      <DatePicker
        label="Error (max today)"
        disableFuture
        defaultValue={DateTime.now().plus({ days: 1 })}
        slotProps={{
          textField: {
            helperText: errorMessages['disableFuture'],
            error: true,
          },
        }}
      />
    </Stack>
  ),
};

export const TimePickerPlayground: StoryObj<typeof TimePicker> = {
  render: (args) => <TimePicker {...args} />,
  args: {
    label: 'Time',
    disabled: false,
    readOnly: false,
  },
  argTypes: {
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
  },
};

export const TimePickerStates: Story = {
  render: () => (
    <Stack spacing={2} sx={{ maxWidth: 400 }}>
      <Typography variant="h3">TimePicker States</Typography>
      <TimePicker label="Default" />
      <TimePicker label="With value" defaultValue={DateTime.now()} />
      <TimePicker label="Disabled" disabled />
      <TimePicker label="Read only" readOnly />
    </Stack>
  ),
};

export const DateTimePickerPlayground: StoryObj<typeof DateTimePicker> = {
  render: (args) => <DateTimePicker {...args} />,
  args: {
    label: 'Date & Time',
    disabled: false,
    readOnly: false,
  },
  argTypes: {
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
  },
};

export const DateTimePickerStates: Story = {
  render: () => (
    <Stack spacing={2} sx={{ maxWidth: 400 }}>
      <Typography variant="h3">DateTimePicker States</Typography>
      <DateTimePicker label="Default" />
      <DateTimePicker label="With value" defaultValue={DateTime.now()} />
      <DateTimePicker label="Disabled" disabled />
      <DateTimePicker label="Read only" readOnly />
    </Stack>
  ),
};
